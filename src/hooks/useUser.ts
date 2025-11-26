"use client";

import { useEffect, useState } from 'react';

export type UserRole = 'USER' | 'ADMIN' | 'OWNER';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'INACTIVE' | 'DELETED';

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  role: UserRole;
  status: UserStatus;
  plan: string;
  allowedNavigation: string[];
  navigation?: {
    allowed: string[];
    lookup: Record<string, boolean>;
  };
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true);
        const response = await fetch('/api/user/profile');
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'OWNER';
  const isOwner = user?.role === 'OWNER';
  const isActive = user?.status === 'ACTIVE';

  return {
    user,
    loading,
    error,
    isAdmin,
    isOwner,
    isActive,
  };
}
