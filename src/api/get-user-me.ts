import { apiClient } from '@/config/api';

export interface UserMeResponse {
  id: string;
  name: string;
  email: string;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

export const getUserMe = async (): Promise<UserMeResponse> => {
  const response = await apiClient.get<UserMeResponse>('/users/me');
  return response.data;
};

