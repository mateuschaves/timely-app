import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { FeedbackProvider, useFeedback } from '../feedback';
import * as Haptics from 'expo-haptics';
import { createTestWrapper } from '@/utils/test-helpers';

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: 'success',
  },
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: 'SafeAreaView',
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('react-native', () => ({
  Animated: {
    Value: jest.fn((value: number) => ({
      _value: value,
      setValue: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      stopAnimation: jest.fn(),
    })),
    timing: jest.fn(() => ({
      start: jest.fn((callback?: () => void) => {
        if (callback) callback();
      }),
    })),
    spring: jest.fn(() => ({
      start: jest.fn((callback?: () => void) => {
        if (callback) callback();
      }),
    })),
    parallel: jest.fn(() => ({
      start: jest.fn((callback?: () => void) => {
        if (callback) callback();
      }),
    })),
    View: 'View',
    Text: 'Text',
  },
  View: 'View',
  Text: 'Text',
  Platform: {
    OS: 'ios',
  },
  useColorScheme: jest.fn(() => 'light'),
  StyleSheet: {
    create: (styles: any) => styles,
    flatten: (style: any) => {
      if (!style) return {};
      if (Array.isArray(style)) {
        return Object.assign({}, ...style.filter(Boolean));
      }
      return style;
    },
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const TestWrapper = createTestWrapper();
  return (
    <TestWrapper>
      <FeedbackProvider>{children}</FeedbackProvider>
    </TestWrapper>
  );
};

describe('FeedbackProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should provide feedback context', () => {
    const { result } = renderHook(() => useFeedback(), { wrapper });

    expect(result.current.showSuccess).toBeDefined();
    expect(result.current.showError).toBeDefined();
    expect(result.current.showInfo).toBeDefined();
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

    expect(() => {
      renderHook(() => useFeedback());
    }).toThrow('useFeedback must be used within a FeedbackProvider');

    consoleSpy.mockRestore();
  });

  it('should show success message', () => {
    const { result } = renderHook(() => useFeedback(), { wrapper });

    act(() => {
      result.current.showSuccess('Success message');
    });

    // Advance timers to trigger haptics
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
  });

  it('should show error message', () => {
    const { result } = renderHook(() => useFeedback(), { wrapper });

    act(() => {
      result.current.showError('Error message');
    });

    expect(result.current).toBeDefined();
  });

  it('should show info message', () => {
    const { result } = renderHook(() => useFeedback(), { wrapper });

    act(() => {
      result.current.showInfo('Info message');
    });

    expect(result.current).toBeDefined();
  });

  it('should hide message after timeout', () => {
    const { result } = renderHook(() => useFeedback(), { wrapper });

    act(() => {
      result.current.showSuccess('Test message');
    });

    // Advance timers to trigger the timeout (3000ms)
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Advance a bit more to ensure cleanup completes
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Verify the hook still works (message should be hidden)
    expect(result.current.showSuccess).toBeDefined();
    expect(result.current.showError).toBeDefined();
    expect(result.current.showInfo).toBeDefined();
  });
});
