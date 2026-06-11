import type { LoginCredentials, User } from '../types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<User> => {
    // TODO: Replace with actual API endpoint
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return response.json();
  },

  logout: async (): Promise<void> => {
    // TODO: Replace with actual API endpoint
    await fetch('/api/auth/logout', { method: 'POST' });
  },
};
