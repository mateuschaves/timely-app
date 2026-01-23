import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../index';
import { createTestWrapper } from '@/utils/test-helpers';

describe('Button Component', () => {
  const TestWrapper = createTestWrapper();

  it('should render button with text', () => {
    const { getByText } = render(
      <TestWrapper>
        <Button>Click me</Button>
      </TestWrapper>
    );

    expect(getByText('Click me')).toBeTruthy();
  });

  it('should call onPress when button is pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <TestWrapper>
        <Button onPress={onPressMock}>Click me</Button>
      </TestWrapper>
    );

    fireEvent.press(getByText('Click me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('should not call onPress when button is disabled', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <TestWrapper>
        <Button onPress={onPressMock} disabled>Click me</Button>
      </TestWrapper>
    );

    fireEvent.press(getByText('Click me'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('should show loading indicator when isLoading is true', () => {
    const { queryByText, UNSAFE_getByType } = render(
      <TestWrapper>
        <Button isLoading>Click me</Button>
      </TestWrapper>
    );

    // Text should not be visible when loading
    expect(queryByText('Click me')).toBeNull();
    
    // ActivityIndicator should be rendered
    const activityIndicator = UNSAFE_getByType('ActivityIndicator' as any);
    expect(activityIndicator).toBeTruthy();
  });

  it('should disable button when isLoading is true', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <TestWrapper>
        <Button onPress={onPressMock} isLoading testID="test-button">Click me</Button>
      </TestWrapper>
    );

    const button = getByTestId('test-button');
    fireEvent.press(button);
    
    // Should not call onPress when loading
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('should render destructive button variant', () => {
    const { getByText } = render(
      <TestWrapper>
        <Button destructive>Delete</Button>
      </TestWrapper>
    );

    expect(getByText('Delete')).toBeTruthy();
  });

  it('should render destructive button with loading state', () => {
    const { queryByText, UNSAFE_getByType } = render(
      <TestWrapper>
        <Button destructive isLoading>Delete</Button>
      </TestWrapper>
    );

    // Text should not be visible when loading
    expect(queryByText('Delete')).toBeNull();
    
    // ActivityIndicator should be rendered
    const activityIndicator = UNSAFE_getByType('ActivityIndicator' as any);
    expect(activityIndicator).toBeTruthy();
  });

  it('should pass through additional TouchableOpacity props', () => {
    const onLongPressMock = jest.fn();
    const { getByTestId } = render(
      <TestWrapper>
        <Button onLongPress={onLongPressMock} testID="test-button">
          Click me
        </Button>
      </TestWrapper>
    );

    const button = getByTestId('test-button');
    fireEvent(button, 'longPress');
    
    expect(onLongPressMock).toHaveBeenCalledTimes(1);
  });

  it('should keep button disabled when both disabled and isLoading are true', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <TestWrapper>
        <Button onPress={onPressMock} disabled isLoading testID="test-button">
          Click me
        </Button>
      </TestWrapper>
    );

    const button = getByTestId('test-button');
    fireEvent.press(button);
    
    expect(onPressMock).not.toHaveBeenCalled();
  });
});
