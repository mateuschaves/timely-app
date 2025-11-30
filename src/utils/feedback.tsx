import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Animated, View, Text, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { spacing, typography, borderRadius } from '@/theme';
import { useTheme } from '@/theme/context/ThemeContext';

type FeedbackType = 'success' | 'error' | 'info';

interface FeedbackContextData {
    showSuccess: (message: string, enableHaptics?: boolean) => void;
    showError: (message: string, enableHaptics?: boolean) => void;
    showInfo: (message: string, enableHaptics?: boolean) => void;
}

const FeedbackContext = createContext<FeedbackContextData | undefined>(undefined);

interface FeedbackProviderProps {
    children: ReactNode;
}

export function FeedbackProvider({ children }: FeedbackProviderProps) {
    const { theme } = useTheme();
    const [message, setMessage] = useState<string | null>(null);
    const [type, setType] = useState<FeedbackType>('success');
    const [fadeAnim] = useState(new Animated.Value(0));
    const [translateY] = useState(new Animated.Value(100));

    const showFeedback = useCallback((msg: string, feedbackType: FeedbackType, enableHaptics: boolean = true) => {
        setMessage(msg);
        setType(feedbackType);

        // Trigger haptics for success by default
        if (enableHaptics && feedbackType === 'success' && Platform.OS !== 'web') {
            try {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
                // Haptics might not be available on all devices
                console.warn('Haptics not available:', error);
            }
        }

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(translateY, {
                toValue: 0,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();

        setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 100,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setMessage(null);
            });
        }, 3000);
    }, [fadeAnim, translateY]);

    const showSuccess = useCallback((msg: string, enableHaptics: boolean = true) => {
        showFeedback(msg, 'success', enableHaptics);
    }, [showFeedback]);

    const showError = useCallback((msg: string, enableHaptics: boolean = false) => {
        showFeedback(msg, 'error', enableHaptics);
    }, [showFeedback]);

    const showInfo = useCallback((msg: string, enableHaptics: boolean = false) => {
        showFeedback(msg, 'info', enableHaptics);
    }, [showFeedback]);

    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return theme.status.success;
            case 'error':
                return theme.status.error;
            case 'info':
                return theme.primary;
            default:
                return theme.status.success;
        }
    };

    const styles = StyleSheet.create({
        container: {
            position: 'absolute',
            bottom: 100,
            left: 0,
            right: 0,
            alignItems: 'center',
            zIndex: 9999,
            pointerEvents: 'none',
        },
        toast: {
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            borderRadius: borderRadius.lg,
            maxWidth: '90%',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        },
        message: {
            fontSize: typography.sizes.md,
            fontWeight: typography.weights.medium,
            textAlign: 'center',
        },
    });

    return (
        <FeedbackContext.Provider value={{ showSuccess, showError, showInfo }}>
            {children}
            {message && (
                <Animated.View
                    style={[
                        styles.container,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY }],
                        },
                    ]}
                >
                    <View style={[
                        styles.toast, 
                        { 
                            backgroundColor: getBackgroundColor(),
                            shadowColor: theme.primary,
                        }
                    ]}>
                        <Text style={[styles.message, { color: theme.text.inverse }]}>{message}</Text>
                    </View>
                </Animated.View>
            )}
        </FeedbackContext.Provider>
    );
}

export function useFeedback() {
    const context = useContext(FeedbackContext);
    if (!context) {
        throw new Error('useFeedback must be used within a FeedbackProvider');
    }
    return context;
}

