import React, { useState } from 'react';
import { Platform, Alert } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuthContext } from '../context/AuthContext';
import { useTranslation } from '@/i18n';
import {
  Container,
  Content,
  Logo,
  Title,
  Subtitle,
  AppleButton,
  ButtonText,
  ErrorText,
  LoadingIndicator,
} from './styles';

export function LoginScreen() {
  const { t } = useTranslation();
  const { signInWithApple } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAppleSignIn = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert(
        t('auth.appleNotAvailableTitle'),
        t('auth.appleNotAvailable')
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await signInWithApple();
    } catch (err: any) {
      setError(err.message || t('auth.loginError'));
      console.error('Erro no login:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Content>
        <Logo>⏰</Logo>
        <Title>{t('auth.title')}</Title>
        <Subtitle>{t('auth.subtitle')}</Subtitle>

        {error && <ErrorText>{error}</ErrorText>}

        {Platform.OS === 'ios' && (
          <AppleButton
            onPress={handleAppleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <LoadingIndicator />
            ) : (
              <ButtonText>{t('auth.continueWithApple')}</ButtonText>
            )}
          </AppleButton>
        )}

        {Platform.OS !== 'ios' && (
          <Subtitle style={{ marginTop: 20, textAlign: 'center' }}>
            {t('auth.appleNotAvailable')}
          </Subtitle>
        )}
      </Content>
    </Container>
  );
}


