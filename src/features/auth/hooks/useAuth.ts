import { useState, useEffect, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import * as AppleAuthentication from 'expo-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { User, AuthState } from '../types';
import { saveToken, removeToken } from '@/config/token';
import { STORAGE_KEYS } from '@/config/storage';
import { signInWithApple } from '@/api/signin-with-apple';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Mutation para chamada à API de login com Apple (apenas a chamada HTTP)
  const signInWithAppleApiMutation = useMutation({
    mutationFn: signInWithApple,
    onSuccess: async (response) => {
      // Salva o token de acesso retornado pela API
      if (response.access_token) {
        await saveToken(response.access_token);
      } else {
        throw new Error('Não foi possível completar o login. Tente novamente.');
      }
    },
  });

  // Carrega usuário salvo ao iniciar
  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const handleSignInWithApple = useCallback(async () => {
    try {
      // Verifica se o Apple Authentication está disponível
      if (Platform.OS !== 'ios') {
        throw new Error('Apple Sign In está disponível apenas no iOS');
      }

      // 1. Chama o prompt nativo do Apple (sem React Query)
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Verifica se temos o identityToken (necessário para autenticar na API)
      if (!credential.identityToken) {
        throw new Error('Não foi possível obter as informações de autenticação. Tente novamente.');
      }

      // Extrai nome do credential (pode ser null se não for a primeira vez)
      const nameFromCredential = credential.fullName
        ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim()
        : null;

      // 2. Chama a API usando React Query mutation (apenas a chamada HTTP)
      // Envia email e nome quando disponíveis para garantir que o backend tenha essas informações
      await signInWithAppleApiMutation.mutateAsync({
        token: credential.identityToken,
        email: credential.email || null,
        name: nameFromCredential || null,
      });

      // Tenta recuperar dados salvos anteriormente (Apple só retorna nome/email na primeira vez)
      let savedUser: User | null = null;
      try {
        const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
        if (storedUser) {
          savedUser = JSON.parse(storedUser);
        }
      } catch (error) {
        console.warn('Erro ao recuperar usuário salvo:', error);
      }

      // Cria objeto do usuário priorizando dados do credential (primeira vez) ou dados salvos
      const user: User = {
        id: credential.user,
        // Email: usa do credential se disponível, senão usa o salvo
        email: credential.email || savedUser?.email || null,
        // Nome: usa do credential se disponível, senão usa o salvo
        name: nameFromCredential || savedUser?.name || null,
        appleUserId: credential.user,
      };

      // Salva no AsyncStorage (preserva nome/email mesmo se não vierem no credential)
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      // Solicita permissão de localização após login bem-sucedido (de forma assíncrona, não bloqueia)
      // A localização será solicitada quando o usuário tentar bater ponto pela primeira vez
      // Isso evita erros de carregamento do módulo nativo durante o login

      return user;
    } catch (error: any) {
      if (error.code === 'ERR_CANCELED') {
        // Usuário cancelou o login - não é um erro, apenas retorna null
        console.log('Login cancelado pelo usuário');
        return null;
      }
      
      // Trata erros de rede/API com mensagens amigáveis
      // Erros do Axios vêm dentro do error original do React Query
      const axiosError = error.response || error;
      
      if (axiosError?.response) {
        const status = axiosError.response.status;
        if (status === 401) {
          throw new Error('Credenciais inválidas. Tente fazer login novamente.');
        } else if (status === 500) {
          throw new Error('Erro no servidor. Tente novamente em alguns instantes.');
        } else if (status >= 400 && status < 500) {
          throw new Error('Não foi possível fazer login. Verifique suas credenciais e tente novamente.');
        } else {
          throw new Error('Erro ao conectar com o servidor. Verifique sua conexão e tente novamente.');
        }
      } else if (axiosError?.request || error.request) {
        throw new Error('Sem conexão com o servidor. Verifique sua internet e tente novamente.');
      }
      
      // Se já for uma mensagem amigável, apenas repassa
      if (error.message && !error.message.includes('JWT') && !error.message.includes('token') && !error.message.includes('Token')) {
        throw error;
      }
      
      // Mensagem genérica amigável
      throw new Error('Não foi possível fazer login. Tente novamente.');
    }
  }, [signInWithAppleApiMutation]);

  const signOut = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
      await removeToken(); // Remove o token JWT também
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  }, []);

  return {
    ...authState,
    signInWithApple: handleSignInWithApple,
    signOut,
  };
}


