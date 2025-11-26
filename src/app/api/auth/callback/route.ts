import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { ensureUserBySupabase } from '@/lib/user-supabase'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        try {
          // Extract comprehensive profile information from Google OAuth
          const fullName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? null
          const nameParts = fullName ? fullName.split(' ') : []
          
          const profile = {
            // Name fields
            firstName: nameParts[0] ?? null,
            lastName: nameParts.slice(1).join(' ') || null,
            
            // Profile picture from Google
            imageUrl: user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null,
            
            // Phone number if provided
            phone: user.user_metadata?.phone ?? user.phone ?? null,
            
            // Additional metadata that might be available
            // Google may provide: given_name, family_name, picture, locale, etc.
          }
          
          // Log what we received for debugging
          console.log('[auth/callback] Google OAuth profile data:', {
            email: user.email,
            firstName: profile.firstName,
            lastName: profile.lastName,
            hasImage: !!profile.imageUrl,
            hasPhone: !!profile.phone,
          })
          
          // Ensure the user exists in the database with all available profile data
          await ensureUserBySupabase(user.id, user.email ?? null, profile)
        } catch (dbError) {
          console.error('[auth/callback] Failed to create database user:', dbError)
          // Continue anyway - the user is authenticated in Supabase
          // The database user will be created on the next API call via api-middleware
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
