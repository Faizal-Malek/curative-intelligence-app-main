import { prisma } from './prisma';

export const AUTH_SESSION_CACHE_KEY = 'ci-auth-session-cache';

/**
 * Get the current authenticated user from session
 * This is a placeholder implementation during the Clerk->Supabase migration
 * Returns null if user is not authenticated
 */
export async function getCurrentUser(): Promise<{ id: string; email?: string } | null> {
  try {
    // TODO: Implement proper Supabase authentication check
    // For now, we'll need to get the user ID from the request context
    // This is a placeholder that will need to be updated with proper auth
    console.warn('getCurrentUser: Placeholder implementation - proper auth needed');
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Get the current authenticated user ID
 * Throws an error if user is not authenticated
 */
export async function getCurrentUserId(): Promise<string> {
  const user = await getCurrentUser();
  
  if (!user || !user.id) {
    throw new Error('User not authenticated');
  }
  
  return user.id;
}

/**
 * Get user by ID from database
 */
export async function getUserById(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        email: true, 
        firstName: true,
        lastName: true,
        onboardingComplete: true 
      },
    });
    return user;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}