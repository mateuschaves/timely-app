import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/theme/context/ThemeContext';
import { ThemeWrapper } from '@/theme/ThemeWrapper';
import { FeedbackProvider } from './feedback';
import { SafeAreaProvider } from 'react-native-safe-area-context';

interface TestWrapperProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
}

/**
 * Helper component to wrap tests with all necessary providers
 */
export function TestWrapper({ children, queryClient }: TestWrapperProps) {
  const testQueryClient = queryClient || new QueryClient({
    defaultOptions: {
      queries: { retry: false, cacheTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ThemeWrapper>
          <QueryClientProvider client={testQueryClient}>
            <FeedbackProvider>
              {children}
            </FeedbackProvider>
          </QueryClientProvider>
        </ThemeWrapper>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

/**
 * Helper function to create a test wrapper
 */
export function createTestWrapper(queryClient?: QueryClient) {
  return ({ children }: { children: React.ReactNode }) => (
    <TestWrapper queryClient={queryClient}>{children}</TestWrapper>
  );
}
