import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/theme';

type FeedbackType = 'success' | 'error' | 'info';

interface FeedbackContextData {
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
    showInfo: (message: string) => void;
}

const FeedbackContext = createContext<FeedbackContextData | undefined>(undefined);

interface FeedbackProviderProps {
    children: ReactNode;
}

export function FeedbackProvider({ children }: FeedbackProviderProps) {
    const [message, setMessage] = useState<string | null>(null);
    const [type, setType] = useState<FeedbackType>('success');
    const [fadeAnim] = useState(new Animated.Value(0));
    const [translateY] = useState(new Animated.Value(100));

    const showFeedback = useCallback((msg: string, feedbackType: FeedbackType) => {
        setMessage(msg);
        setType(feedbackType);

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

    const showSuccess = useCallback((msg: string) => {
        showFeedback(msg, 'success');
    }, [showFeedback]);

    const showError = useCallback((msg: string) => {
        showFeedback(msg, 'error');
    }, [showFeedback]);

    const showInfo = useCallback((msg: string) => {
        showFeedback(msg, 'info');
    }, [showFeedback]);

    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return colors.status.success;
            case 'error':
                return colors.status.error;
            case 'info':
                return colors.primary;
            default:
                return colors.status.success;
        }
    };

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
                    <View style={[styles.toast, { backgroundColor: getBackgroundColor() }]}>
                        <Text style={styles.message}>{message}</Text>
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
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    message: {
        color: colors.text.inverse,
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.medium,
        textAlign: 'center',
    },
});

