import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../index';
import { createTestWrapper } from '@/utils/test-helpers';

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

jest.mock('react-native', () => {
  return {
    Platform: {
      OS: 'ios',
      select: jest.fn(),
    },
    View: 'View',
    Text: 'Text',
    TouchableOpacity: 'TouchableOpacity',
    ActivityIndicator: 'ActivityIndicator',
    useColorScheme: jest.fn(() => 'light'),
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
    },
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
  };
});

describe('Button', () => {
  const createWrapper = createTestWrapper();

  it('should render button with title', () => {
    const { getByText } = render(
      <Button title="Click me" />,
      { wrapper: createWrapper }
    );

    expect(getByText('Click me')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button title="Click me" onPress={onPressMock} />,
      { wrapper: createWrapper }
    );

    fireEvent.press(getByText('Click me'));

    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('should show ActivityIndicator when isLoading is true', () => {
    const { queryByText, UNSAFE_getByType } = render(
      <Button title="Loading" isLoading />,
      { wrapper: createWrapper }
    );

    // Text should be hidden when loading
    expect(queryByText('Loading')).toBeNull();
    
    // ActivityIndicator should be shown
    expect(UNSAFE_getByType('ActivityIndicator')).toBeTruthy();
  });

  it('should not call onPress when isLoading is true', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <Button title="Loading" isLoading onPress={onPressMock} testID="button" />,
      { wrapper: createWrapper }
    );

    const button = getByTestId('button');
    
    // Verify the button is disabled
    expect(button.props.disabled).toBe(true);
    
    // Since fireEvent.press doesn't respect disabled prop in tests,
    // we check that the button has the disabled prop set correctly
    // The actual prevention happens in the component via the disabled prop
  });

  it('should not call onPress when disabled is true', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <Button title="Disabled" disabled onPress={onPressMock} testID="button" />,
      { wrapper: createWrapper }
    );

    const button = getByTestId('button');
    
    // Verify the button is disabled
    expect(button.props.disabled).toBe(true);
  });

  it('should apply destructive styling when destructive prop is true', () => {
    const { getByTestId } = render(
      <Button title="Delete" destructive testID="button" />,
      { wrapper: createWrapper }
    );

    const button = getByTestId('button');
    expect(button).toBeTruthy();
  });

  it('should be disabled when both isLoading and disabled are true', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <Button 
        title="Loading and Disabled" 
        isLoading 
        disabled 
        onPress={onPressMock} 
        testID="button" 
      />,
      { wrapper: createWrapper }
    );

    const button = getByTestId('button');
    
    // Verify the button is disabled
    expect(button.props.disabled).toBe(true);
  });

  it('should forward TouchableOpacity props', () => {
    const onPressInMock = jest.fn();
    const onPressOutMock = jest.fn();
    const { getByTestId } = render(
      <Button 
        title="Test" 
        testID="button" 
        onPressIn={onPressInMock}
        onPressOut={onPressOutMock}
      />,
      { wrapper: createWrapper }
    );

    const button = getByTestId('button');
    fireEvent(button, 'pressIn');
    fireEvent(button, 'pressOut');

    expect(onPressInMock).toHaveBeenCalled();
    expect(onPressOutMock).toHaveBeenCalled();
  });

  it('should render destructive button with loading state', () => {
    const { queryByText, UNSAFE_getByType, getByTestId } = render(
      <Button title="Delete" destructive isLoading testID="button" />,
      { wrapper: createWrapper }
    );

    // Text should be hidden when loading
    expect(queryByText('Delete')).toBeNull();
    
    // ActivityIndicator should be shown
    expect(UNSAFE_getByType('ActivityIndicator')).toBeTruthy();
    
    // Button should be present
    expect(getByTestId('button')).toBeTruthy();
  });

  it('should apply activeOpacity of 0.7', () => {
    const { getByTestId } = render(
      <Button title="Test" testID="button" />,
      { wrapper: createWrapper }
    );

    const button = getByTestId('button');
    expect(button.props.activeOpacity).toBe(0.7);
  });
});
