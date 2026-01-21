import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import { useAuth } from '../useAuth';
import { saveToken, removeToken, getToken } from '@/config/token';
import { STORAGE_KEYS } from '@/config/storage';
import { signInWithApple } from '@/api/signin-with-apple';
import { getUserMe } from '@/api/get-user-me';

jest.mock('@react-native-async-storage/async-storage');
jest.mock('expo-apple-authentication');
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));
jest.mock('@/config/token');
jest.mock('@/api/signin-with-apple');
jest.mock('@/api/get-user-me');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockSignInWithApple = signInWithApple as jest.MockedFunction<typeof signInWithApple>;
const mockGetUserMe = getUserMe as jest.MockedFunction<typeof getUserMe>;
const mockSignInAsync = AppleAuthentication.signInAsync as jest.MockedFunction<typeof AppleAuthentication.signInAsync>;
const mockGetToken = getToken as jest.MockedFunction<typeof getToken>;

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
    (saveToken as jest.Mock).mockResolvedValue(undefined);
    (removeToken as jest.Mock).mockResolvedValue(undefined);
    (getToken as jest.Mock).mockResolvedValue(null);
    mockGetUserMe.mockClear();
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('should load stored user on mount', async () => {
    const storedUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      appleUserId: 'apple123',
    };

    const apiUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
    };

    // Mock token e usuário do servidor
    (getToken as jest.Mock).mockResolvedValue('valid-token');
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(storedUser));
    mockGetUserMe.mockResolvedValue(apiUser);

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetUserMe).toHaveBeenCalled();
    expect(result.current.user).toEqual({
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      appleUserId: 'apple123',
      onboardingCompleted: false,
    });
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle no stored user', async () => {
    (getToken as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle error loading stored user', async () => {
    (getToken as jest.Mock).mockRejectedValue(new Error('Storage error'));

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should sign in with Apple successfully', async () => {
    Platform.OS = 'ios';
    const credential = {
      user: 'apple123',
      identityToken: 'token123',
      email: 'test@example.com',
      fullName: {
        givenName: 'Test',
        familyName: 'User',
      },
    };

    const apiResponse = {
      access_token: 'access_token_123',
    };

    mockSignInAsync.mockResolvedValue(credential as any);
    mockSignInWithApple.mockResolvedValue(apiResponse);
    (getToken as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let user: any;
    await act(async () => {
      user = await result.current.signInWithApple();
    });

    expect(mockSignInAsync).toHaveBeenCalled();
    expect(mockSignInWithApple).toHaveBeenCalled();
    const callArgs = (mockSignInWithApple as jest.Mock).mock.calls[0][0];
    expect(callArgs.token).toBe('token123');
    expect(callArgs.email).toBe('test@example.com');
    expect(callArgs.name).toBe('Test User');
    expect(saveToken).toHaveBeenCalledWith('access_token_123');
    expect(AsyncStorage.setItem).toHaveBeenCalled();
    expect(user).toEqual({
      id: 'apple123',
      email: 'test@example.com',
      name: 'Test User',
      appleUserId: 'apple123',
      onboardingCompleted: false,
    });
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle Apple sign in cancellation', async () => {
    Platform.OS = 'ios';
    const error = { code: 'ERR_CANCELED' };
    mockSignInAsync.mockRejectedValue(error);

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let user: any;
    await act(async () => {
      user = await result.current.signInWithApple();
    });

    expect(user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should throw error on non-iOS platform', async () => {
    Platform.OS = 'android';

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(async () => {
      await act(async () => {
        await result.current.signInWithApple();
      });
    }).rejects.toThrow('Apple Sign In está disponível apenas no iOS');
  });

  it('should handle sign in API error', async () => {
    Platform.OS = 'ios';
    const credential = {
      user: 'apple123',
      identityToken: 'token123',
      email: 'test@example.com',
      fullName: null,
    };

    mockSignInAsync.mockResolvedValue(credential as any);
    mockSignInWithApple.mockRejectedValue({
      response: { status: 401 },
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(async () => {
      await act(async () => {
        await result.current.signInWithApple();
      });
    }).rejects.toThrow();
  });

  it('should sign out successfully', async () => {
    const storedUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      appleUserId: 'apple123',
    };

    const apiUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
    };

    (getToken as jest.Mock).mockResolvedValue('valid-token');
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(storedUser));
    mockGetUserMe.mockResolvedValue(apiUser);

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.signOut();
    });

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.USER);
    expect(removeToken).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle sign out error', async () => {
    const storedUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      appleUserId: 'apple123',
    };

    const apiUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
    };

    (getToken as jest.Mock).mockResolvedValue('valid-token');
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(storedUser));
    mockGetUserMe.mockResolvedValue(apiUser);
    (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(async () => {
      await act(async () => {
        await result.current.signOut();
      });
    }).rejects.toThrow();
  });

  it('should fetch user me successfully', async () => {
    const storedUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      appleUserId: 'apple123',
    };

    const apiUser = {
      id: '123',
      email: 'updated@example.com',
      name: 'Updated User',
    };

    (getToken as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(storedUser));
    mockGetUserMe.mockResolvedValue(apiUser);

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let user: any;
    await act(async () => {
      user = await result.current.fetchUserMe();
    });

    expect(mockGetUserMe).toHaveBeenCalled();
    expect(AsyncStorage.setItem).toHaveBeenCalled();
    expect(user).toEqual({
      id: '123',
      email: 'updated@example.com',
      name: 'Updated User',
      appleUserId: 'apple123',
      onboardingCompleted: false,
    });
    expect(result.current.user).toEqual(user);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle fetch user me error', async () => {
    const storedUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      appleUserId: 'apple123',
    };

    (getToken as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(storedUser));
    mockGetUserMe.mockRejectedValue(new Error('API error'));

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let user: any;
    await act(async () => {
      user = await result.current.fetchUserMe();
    });

    expect(user).toBeNull();
  });

  it('should handle sign in without access_token', async () => {
    Platform.OS = 'ios';
    const credential = {
      user: 'apple123',
      identityToken: 'token123',
      email: 'test@example.com',
      fullName: {
        givenName: 'Test',
        familyName: 'User',
      },
    };

    const apiResponse = {
      // No access_token
    };

    mockSignInAsync.mockResolvedValue(credential as any);
    mockSignInWithApple.mockResolvedValue(apiResponse as any);

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(async () => {
      await act(async () => {
        await result.current.signInWithApple();
      });
    }).rejects.toThrow('Não foi possível completar o login. Tente novamente.');
  });

  it('should handle sign in without identityToken', async () => {
    Platform.OS = 'ios';
    const credential = {
      user: 'apple123',
      identityToken: null,
      email: 'test@example.com',
      fullName: {
        givenName: 'Test',
        familyName: 'User',
      },
    };

    mockSignInAsync.mockResolvedValue(credential as any);

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(async () => {
      await act(async () => {
        await result.current.signInWithApple();
      });
    }).rejects.toThrow('Não foi possível obter as informações de autenticação. Tente novamente.');
  });

  it('should use saved user data when credential lacks email/name', async () => {
    Platform.OS = 'ios';
    const savedUser = {
      id: '123',
      email: 'saved@example.com',
      name: 'Saved User',
      appleUserId: 'apple123',
    };

    const credential = {
      user: 'apple123',
      identityToken: 'token123',
      email: null,
      fullName: null,
    };

    const apiResponse = {
      access_token: 'access_token_123',
    };

    mockSignInAsync.mockResolvedValue(credential as any);
    mockSignInWithApple.mockResolvedValue(apiResponse);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(savedUser));

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let user: any;
    await act(async () => {
      user = await result.current.signInWithApple();
    });

    expect(user.email).toBe('saved@example.com');
    expect(user.name).toBe('Saved User');
  });

  it('should handle error retrieving saved user during sign in', async () => {
    Platform.OS = 'ios';
    const credential = {
      user: 'apple123',
      identityToken: 'token123',
      email: 'test@example.com',
      fullName: {
        givenName: 'Test',
        familyName: 'User',
      },
    };

    const apiResponse = {
      access_token: 'access_token_123',
    };

    mockSignInAsync.mockResolvedValue(credential as any);
    mockSignInWithApple.mockResolvedValue(apiResponse);
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(null) // First call in loadStoredUser
      .mockRejectedValueOnce(new Error('Storage error')); // Second call in signIn

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let user: any;
    await act(async () => {
      user = await result.current.signInWithApple();
    });

    expect(user).toBeDefined();
    expect(user.email).toBe('test@example.com');
  });

  it('should handle API error with 500 status', async () => {
    Platform.OS = 'ios';
    const credential = {
      user: 'apple123',
      identityToken: 'token123',
      email: 'test@example.com',
      fullName: null,
    };

    mockSignInAsync.mockResolvedValue(credential as any);
    // The code does: const axiosError = error.response || error; then checks axiosError?.response
    // So we need error.response.response.status
    const error = {
      response: {
        response: { status: 500 },
      },
    };
    mockSignInWithApple.mockRejectedValue(error);

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(async () => {
      await act(async () => {
        await result.current.signInWithApple();
      });
    }).rejects.toThrow('Erro no servidor. Tente novamente em alguns instantes.');
  });

  it('should handle API error with 400-499 status', async () => {
    Platform.OS = 'ios';
    const credential = {
      user: 'apple123',
      identityToken: 'token123',
      email: 'test@example.com',
      fullName: null,
    };

    mockSignInAsync.mockResolvedValue(credential as any);
    const error = {
      response: {
        response: { status: 403 },
      },
    };
    mockSignInWithApple.mockRejectedValue(error);

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(async () => {
      await act(async () => {
        await result.current.signInWithApple();
      });
    }).rejects.toThrow('Não foi possível fazer login. Verifique suas credenciais e tente novamente.');
  });

  it('should handle API error with 500+ status', async () => {
    Platform.OS = 'ios';
    const credential = {
      user: 'apple123',
      identityToken: 'token123',
      email: 'test@example.com',
      fullName: null,
    };

    mockSignInAsync.mockResolvedValue(credential as any);
    const error = {
      response: {
        response: { status: 503 },
      },
    };
    mockSignInWithApple.mockRejectedValue(error);

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(async () => {
      await act(async () => {
        await result.current.signInWithApple();
      });
    }).rejects.toThrow('Erro ao conectar com o servidor. Verifique sua conexão e tente novamente.');
  });

  it('should handle network request error', async () => {
    Platform.OS = 'ios';
    const credential = {
      user: 'apple123',
      identityToken: 'token123',
      email: 'test@example.com',
      fullName: null,
    };

    mockSignInAsync.mockResolvedValue(credential as any);
    mockSignInWithApple.mockRejectedValue({
      request: {},
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(async () => {
      await act(async () => {
        await result.current.signInWithApple();
      });
    }).rejects.toThrow('Sem conexão com o servidor. Verifique sua internet e tente novamente.');
  });

  it('should handle generic error without JWT/token message', async () => {
    Platform.OS = 'ios';
    const credential = {
      user: 'apple123',
      identityToken: 'token123',
      email: 'test@example.com',
      fullName: null,
    };

    mockSignInAsync.mockResolvedValue(credential as any);
    mockSignInWithApple.mockRejectedValue(new Error('Generic error'));

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(async () => {
      await act(async () => {
        await result.current.signInWithApple();
      });
    }).rejects.toThrow('Generic error');
  });

  it('should handle error with JWT message', async () => {
    Platform.OS = 'ios';
    const credential = {
      user: 'apple123',
      identityToken: 'token123',
      email: 'test@example.com',
      fullName: null,
    };

    mockSignInAsync.mockResolvedValue(credential as any);
    mockSignInWithApple.mockRejectedValue(new Error('JWT invalid'));

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(async () => {
      await act(async () => {
        await result.current.signInWithApple();
      });
    }).rejects.toThrow('Não foi possível fazer login. Tente novamente.');
  });

  it('should handle fetch user me with no existing user', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const apiUser = {
      id: '123',
      email: 'new@example.com',
      name: 'New User',
    };

    mockGetUserMe.mockResolvedValue(apiUser);

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let user: any;
    await act(async () => {
      user = await result.current.fetchUserMe();
    });

    expect(user.appleUserId).toBe('123'); // Uses response.id when no existing user
  });

  it('should handle error retrieving existing user in fetchUserMe', async () => {
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(null) // First call in loadStoredUser
      .mockRejectedValueOnce(new Error('Storage error')); // Second call in fetchUserMe

    const apiUser = {
      id: '123',
      email: 'new@example.com',
      name: 'New User',
    };

    mockGetUserMe.mockResolvedValue(apiUser);

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let user: any;
    await act(async () => {
      user = await result.current.fetchUserMe();
    });

    expect(user).toBeDefined();
    expect(user.appleUserId).toBe('123');
  });
});
