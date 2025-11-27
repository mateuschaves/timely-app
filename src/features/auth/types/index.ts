export interface User {
  id: string;
  email: string | null;
  name: string | null;
  appleUserId?: string;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}


