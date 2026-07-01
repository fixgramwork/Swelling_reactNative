import type { Post } from '@/features/feed/types';

export const feedApi = {
  getPosts: async (): Promise<Post[]> => {
    // TODO: Replace with actual API endpoint
    const response = await fetch('/api/posts');

    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }

    return response.json();
  },

  createPost: async (post: Omit<Post, 'id' | 'createdAt'>): Promise<Post> => {
    // TODO: Replace with actual API endpoint
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    });

    if (!response.ok) {
      throw new Error('Failed to create post');
    }

    return response.json();
  },
};
