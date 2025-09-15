export type UserRole = 'parent' | 'community' | 'admin';

export interface User {
  id: string;
  email:string;
  phone: string;
  name: string;
  role: UserRole;
  tokens: number;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
}