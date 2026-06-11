export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: Date;
}

export interface FeedState {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
}
