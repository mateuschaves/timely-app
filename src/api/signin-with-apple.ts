import { apiClient } from '@/config/api';

export interface SignInWithAppleRequest {
  token: string;
  email?: string | null;
  name?: string | null;
}

export interface SignInWithAppleResponse {
  access_token: string;
  expired_at: number;
}
export const signInWithApple = async (
  data: SignInWithAppleRequest
): Promise<SignInWithAppleResponse> => {
  const response = await apiClient.post<SignInWithAppleResponse>(
    '/auth/login/apple',
    data
  );
  return response.data;
};

