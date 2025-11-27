/**
 * Debug script for Content Vault and AI Generation
 * 
 * This script helps diagnose why AI generation returns 0 results
 * by checking:
 * 1. User's BrandProfile from onboarding
 * 2. Existing ContentIdea records (for deduplication)
 * 3. Database table structure
 * 4. Gemini API key configuration
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function debugVaultGeneration() {
  try {
    console.log('🔍 Starting Content Vault Generation Debug...\n')

    // 1. Check database connection
    console.log('1️⃣ Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connected\n')

    // 2. Find users
    console.log('2️⃣ Finding users in database...')
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        clerkId: true,
        createdAt: true,
      },
      take: 5,
    })
    console.log(`Found ${users.length} users:`)
    users.forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.email} (${user.clerkId?.substring(0, 20)}...)`)
    })
    console.log()

    if (users.length === 0) {
      console.log('❌ No users found. Please sign up first.')
      return
    }

    // Use first user for testing
    const testUser = users[0]
    console.log(`📋 Using test user: ${testUser.email}\n`)

    // 3. Check BrandProfile (required for AI generation)
    console.log('3️⃣ Checking BrandProfile (onboarding data)...')
    const brandProfile = await prisma.brandProfile.findUnique({
      where: { userId: testUser.id },
    })

    if (!brandProfile) {
      console.log('❌ NO BRAND PROFILE FOUND!')
      console.log('   This is why AI generation returns 0 results.')
      console.log('   User must complete onboarding at /onboarding')
      console.log()
      console.log('   Required fields:')
      console.log('   - brandName')
      console.log('   - industry')
      console.log('   - brandDescription')
      console.log('   - brandVoiceDescription')
      console.log('   - primaryGoal')
      console.log()
    } else {
      console.log('✅ Brand Profile exists!')
      console.log('   Brand Name:', brandProfile.brandName || '(empty)')
      console.log('   Industry:', brandProfile.industry || '(empty)')
      console.log('   Description:', (brandProfile.brandDescription || '(empty)').substring(0, 100))
      console.log('   Voice:', (brandProfile.brandVoiceDescription || '(empty)').substring(0, 100))
      console.log('   Primary Goal:', brandProfile.primaryGoal || '(empty)')
      console.log('   Target Audience:', brandProfile.targetAudience || '(empty)')
      console.log('   Created:', brandProfile.createdAt)
      console.log()

      // Check if required fields are populated
      const requiredFields = ['brandName', 'industry', 'brandDescription', 'brandVoiceDescription', 'primaryGoal']
      const missingFields = requiredFields.filter(field => !brandProfile[field])
      
      if (missingFields.length > 0) {
        console.log(`⚠️  Warning: Missing required fields: ${missingFields.join(', ')}`)
        console.log('   AI generation may fail or produce poor results.')
        console.log()
      }
    }

    // 4. Check existing ContentIdea records (affects deduplication)
    console.log('4️⃣ Checking existing Content Ideas...')
    const existingIdeas = await prisma.contentIdea.findMany({
      where: { userId: testUser.id },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    console.log(`Found ${existingIdeas.length} existing ideas:`)
    if (existingIdeas.length === 0) {
      console.log('   (none - good for testing generation)')
    } else {
      existingIdeas.forEach((idea, i) => {
        console.log(`   ${i + 1}. "${idea.title}" (${idea.status})`)
      })
      console.log()
      console.log('⚠️  Note: AI generation deduplicates against these titles.')
      console.log('   If Gemini generates titles matching these (case-insensitive),')
      console.log('   they will be filtered out, resulting in 0 added ideas.')
    }
    console.log()

    // 5. Check ContentTemplate records
    console.log('5️⃣ Checking existing Content Templates...')
    const existingTemplates = await prisma.contentTemplate.findMany({
      where: { userId: testUser.id },
      select: {
        id: true,
        title: true,
        category: true,
        createdAt: true,
      },
      take: 10,
    })

    console.log(`Found ${existingTemplates.length} existing templates:`)
    if (existingTemplates.length === 0) {
      console.log('   (none)')
    } else {
      existingTemplates.forEach((tpl, i) => {
        console.log(`   ${i + 1}. "${tpl.title}" (${tpl.category})`)
      })
    }
    console.log()

    // 6. Check environment variables
    console.log('6️⃣ Checking API Key configuration...')
    const geminiKey = process.env.GEMINI_API_KEY
    const openaiKey = process.env.OPENAI_API_KEY

    if (geminiKey) {
      console.log(`✅ GEMINI_API_KEY: ${geminiKey.substring(0, 20)}...${geminiKey.slice(-4)}`)
    } else {
      console.log('❌ GEMINI_API_KEY not configured')
    }

    if (openaiKey) {
      console.log(`✅ OPENAI_API_KEY: ${openaiKey.substring(0, 10)}...${openaiKey.slice(-4)}`)
    } else {
      console.log('⚠️  OPENAI_API_KEY not configured (optional - Gemini is primary)')
    }
    console.log()

    // 7. Summary
    console.log('📊 DIAGNOSIS SUMMARY')
    console.log('=' .repeat(60))
    
    if (!brandProfile) {
      console.log('🔴 ROOT CAUSE: No BrandProfile found')
      console.log('   Solution: User must complete onboarding at /onboarding')
      console.log('   This creates BrandProfile with brand information needed for AI generation')
    } else if (!geminiKey) {
      console.log('🔴 ROOT CAUSE: No Gemini API key configured')
      console.log('   Solution: Add GEMINI_API_KEY to .env file')
    } else if (existingIdeas.length > 0) {
      console.log('🟡 POSSIBLE CAUSE: Title deduplication')
      console.log(`   You have ${existingIdeas.length} existing ideas. If Gemini generates matching titles,`)
      console.log('   they will be filtered out as duplicates.')
      console.log()
      console.log('   To test: Delete existing ideas or temporarily disable deduplication')
    } else {
      console.log('🟢 Configuration looks good!')
      console.log('   - BrandProfile exists with brand information')
      console.log('   - Gemini API key configured')
      console.log('   - No existing ideas to cause deduplication conflicts')
      console.log()
      console.log('   Next steps:')
      console.log('   1. Check server console for [Gemini] logs showing API responses')
      console.log('   2. Verify Gemini API key is valid and has quota')
      console.log('   3. Check [AI Service] logs for deduplication counts')
    }
    console.log()

    // 8. Test Gemini API (optional - requires API key)
    if (geminiKey && brandProfile) {
      console.log('8️⃣ Testing Gemini API call...')
      console.log('   (This would make an actual API call to verify the key works)')
      console.log('   Run this manually to avoid quota usage:')
      console.log(`   curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}" \\`)
      console.log('     -H "Content-Type: application/json" \\')
      console.log('     -d \'{"contents":[{"parts":[{"text":"Hello, test"}]}]}\'')
      console.log()
    }

  } catch (error) {
    console.error('❌ Error during debug:')
    console.error(error)
    
    if (error.code === 'P2021') {
      console.log('\n⚠️  Database table does not exist.')
      console.log('   Run migrations: npm run prisma:migrate:deploy')
      console.log('   Or apply: scripts/COMPLETE_DATABASE_MIGRATION.sql')
    }
  } finally {
    await prisma.$disconnect()
  }
}

debugVaultGeneration()
  .then(() => {
    console.log('✅ Debug complete')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
