/**
 * API de Login com Apple
 * 
 * Contém tipos de request/response e funções para chamar endpoints de autenticação com Apple
 */

import { apiClient } from '@/config/api';
import { User } from '@/features/auth/types';

// ==================== Types ====================

/**
 * Request para login com Apple
 */
export interface SignInWithAppleRequest {
  token: string; // identityToken do Apple
  email?: string | null; // Email do usuário (disponível apenas na primeira vez)
  name?: string | null; // Nome completo do usuário (disponível apenas na primeira vez)
}

/**
 * Response do login com Apple
 */
export interface SignInWithAppleResponse {
  access_token: string; // JWT token
  expired_at: number; // Timestamp de expiração
}

// ==================== API Functions ====================

/**
 * Faz login com Apple
 * POST /auth/login/apple
 */
export const signInWithApple = async (
  data: SignInWithAppleRequest
): Promise<SignInWithAppleResponse> => {
  const response = await apiClient.post<SignInWithAppleResponse>(
    '/auth/login/apple',
    data
  );
  return response.data;
};

