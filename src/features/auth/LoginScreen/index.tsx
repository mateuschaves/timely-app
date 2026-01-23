import React, { useState } from 'react';
import { Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuthContext } from '../context/AuthContext';
import { useTranslation } from '@/i18n';
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import { Button } from '@/components';
import {
  Container,
  Content,
  Logo,
  Title,
  Subtitle,
  ErrorText,
  TermsText,
  TermsLink,
} from './styles';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export function LoginScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
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
          <Button
            onPress={handleAppleSignIn}
            isLoading={isLoading}
            style={{ marginTop: 20 }}
          >
            {t('auth.continueWithApple')}
          </Button>
        )}

        <TermsText>
          {t('auth.termsAgreement')}{' '}
          <TermsLink onPress={() => navigation.navigate('Terms')}>
            {t('auth.termsOfService')}
          </TermsLink>
        </TermsText>

        {Platform.OS !== 'ios' && (
          <Subtitle style={{ marginTop: 20, textAlign: 'center' }}>
            {t('auth.appleNotAvailable')}
          </Subtitle>
        )}
      </Content>
    </Container>
  );
}


