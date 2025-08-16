export interface Feedback {
  id: string;
  rating: number;
  feedback: string;
  userId?: string;
  createdAt: Date;
  page?: string;
} 