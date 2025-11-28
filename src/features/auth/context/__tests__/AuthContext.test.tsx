import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { AuthProvider, useAuthContext } from '../AuthContext';
import { useAuth } from '../../hooks/useAuth';

jest.mock('../../hooks/useAuth');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide auth context values', () => {
    const mockAuth = {
      user: { id: '123', name: 'John Doe', email: 'john@example.com', appleUserId: 'apple123' },
      isAuthenticated: true,
      isLoading: false,
      signInWithApple: jest.fn(),
      signOut: jest.fn(),
      fetchUserMe: jest.fn(),
    };

    mockUseAuth.mockReturnValue(mockAuth);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuthContext(), { wrapper });

    expect(result.current).toEqual(mockAuth);
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      renderHook(() => useAuthContext());
    }).toThrow('useAuthContext deve ser usado dentro de um AuthProvider');
    
    consoleSpy.mockRestore();
  });
});
