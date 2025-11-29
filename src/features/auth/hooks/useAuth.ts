import { useState, useEffect, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import * as AppleAuthentication from 'expo-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { User, AuthState } from '../types';
import { saveToken, removeToken, getToken } from '@/config/token';
import { STORAGE_KEYS } from '@/config/storage';
import { signInWithApple } from '@/api/signin-with-apple';
import { getUserMe } from '@/api/get-user-me';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const signInWithAppleApiMutation = useMutation({
    mutationFn: signInWithApple,
    onSuccess: async (response) => {
      if (response.access_token) {
        await saveToken(response.access_token);
      } else {
        throw new Error('Não foi possível completar o login. Tente novamente.');
      }
    },
  });

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const token = await getToken();
      
      // Se não há token, usuário não está autenticado
      if (!token) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }

      // Se há token, tenta buscar os dados atualizados do servidor
      try {
        const response = await getUserMe();
        
        // Get existing user from storage to preserve appleUserId
        let existingUser: User | null = null;
        try {
          const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
          if (storedUser) {
            existingUser = JSON.parse(storedUser);
          }
        } catch (error) {
          console.warn('Erro ao recuperar usuário salvo:', error);
        }
        
        // Map API response to User type, preserving appleUserId from existing user
        const user: User = {
          id: response.id,
          email: response.email || null,
          name: response.name || null,
          appleUserId: existingUser?.appleUserId || response.id,
        };

        // Save updated user to storage
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

        // Update auth state with fetched user
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error: any) {
        // Se falhar ao buscar do servidor (ex: token inválido, sem conexão)
        console.error('Erro ao buscar dados do usuário:', error);
        
        // Se o erro for 401 (não autorizado), limpa o token e usuário
        if (error?.response?.status === 401) {
          await removeToken();
          await AsyncStorage.removeItem(STORAGE_KEYS.USER);
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } else {
          // Para outros erros (ex: sem conexão), usa dados salvos localmente como fallback
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
        }
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
      if (Platform.OS !== 'ios') {
        throw new Error('Apple Sign In está disponível apenas no iOS');
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error('Não foi possível obter as informações de autenticação. Tente novamente.');
      }

      const nameFromCredential = credential.fullName
        ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim()
        : null;

      await signInWithAppleApiMutation.mutateAsync({
        token: credential.identityToken,
        email: credential.email || null,
        name: nameFromCredential || null,
      });

      let savedUser: User | null = null;
      try {
        const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
        if (storedUser) {
          savedUser = JSON.parse(storedUser);
        }
      } catch (error) {
        console.warn('Erro ao recuperar usuário salvo:', error);
      }

      const user: User = {
        id: credential.user,
        email: credential.email || savedUser?.email || null,
        name: nameFromCredential || savedUser?.name || null,
        appleUserId: credential.user,
      };

      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      return user;
    } catch (error: any) {
      if (error.code === 'ERR_CANCELED') {
        console.log('Login cancelado pelo usuário');
        return null;
      }
      
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
      
      if (error.message && !error.message.includes('JWT') && !error.message.includes('token') && !error.message.includes('Token')) {
        throw error;
      }
      
      throw new Error('Não foi possível fazer login. Tente novamente.');
    }
  }, [signInWithAppleApiMutation]);

  const signOut = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
      await removeToken();
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

  const fetchUserMe = useCallback(async (): Promise<User | null> => {
    try {
      // Get existing user from storage to preserve appleUserId
      let existingUser: User | null = null;
      try {
        const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
        if (storedUser) {
          existingUser = JSON.parse(storedUser);
        }
      } catch (error) {
        console.warn('Erro ao recuperar usuário salvo:', error);
      }

      const response = await getUserMe();
      
      // Map API response to User type, preserving appleUserId from existing user
      const user: User = {
        id: response.id,
        email: response.email || null,
        name: response.name || null,
        appleUserId: existingUser?.appleUserId || response.id,
      };

      // Save updated user to storage
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      // Update auth state
      setAuthState((prev) => ({
        ...prev,
        user,
        isAuthenticated: true,
      }));

      return user;
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      // If the request fails (e.g., 401), we might want to sign out
      // But for now, just return null
      return null;
    }
  }, []);

  return {
    ...authState,
    signInWithApple: handleSignInWithApple,
    signOut,
    fetchUserMe,
  };
}


