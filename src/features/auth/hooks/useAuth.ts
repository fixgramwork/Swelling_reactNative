import { useState } from 'react';
import type { LoginCredentials, User } from '@/features/auth/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      // TODO: Implement actual login API call
      console.log('Logging in with:', credentials);
      // Mock success
      setUser({
        id: '1',
        email: credentials.email,
        name: 'User',
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}
