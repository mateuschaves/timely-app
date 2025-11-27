import { apiClient } from '@/config/api';

export interface UpdateUserMeRequest {
  name?: string;
}

export interface UpdateUserMeResponse {
  id: string;
  name: string;
  email: string;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

export const updateUserMe = async (data: UpdateUserMeRequest): Promise<UpdateUserMeResponse> => {
  const response = await apiClient.put<UpdateUserMeResponse>('/users/me', data);
  return response.data;
};

