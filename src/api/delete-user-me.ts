import { apiClient } from '@/config/api';

export interface DeleteUserMeRequest {
  reason?: string;
  customReason?: string;
}

export interface DeleteUserMeResponse {
  message: string;
}

export const deleteUserMe = async (data?: DeleteUserMeRequest): Promise<DeleteUserMeResponse> => {
  const config = data ? { data } : undefined;
  const response = await apiClient.delete<DeleteUserMeResponse>('/users/me', config);
  return response.data;
};

