import React from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from '@/i18n';
import { useOnboarding } from '../hooks/useOnboarding';
import { OnboardingStackParamList } from '../types';
import { Button } from '@/components/Button';
import {
  Container,
  Content,
  IconContainer,
  Icon,
  Title,
  Body,
  ButtonContainer,
} from './styles';

type NavigationProp = NativeStackNavigationProp<OnboardingStackParamList, 'Intro'>;

export function IntroScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { skipOnboarding } = useOnboarding();

  const handleContinue = () => {
    navigation.navigate('WorkModelSelection');
  };

  const handleSkip = () => {
    Alert.alert(
      t('onboarding.skipConfirmTitle'),
      t('onboarding.skipConfirmMessage'),
      [
        {
          text: t('onboarding.cancelSkip'),
          style: 'cancel',
        },
        {
          text: t('onboarding.skipConfirmButton'),
          onPress: async () => {
            try {
              await skipOnboarding();
            } catch (error) {
              console.error('Error skipping onboarding:', error);
              Alert.alert(
                t('common.error'),
                t('onboarding.error.skipFailed')
              );
            }
          },
        },
      ]
    );
  };

  return (
    <Container>
      <Content>
        <IconContainer>
          <Icon>⏰</Icon>
        </IconContainer>

        <Title>{t('onboarding.intro.title')}</Title>
        <Body>{t('onboarding.intro.body')}</Body>

        <ButtonContainer>
          <Button 
            title={t('onboarding.intro.primaryCta')}
            onPress={handleContinue}
          />

          <Button 
            title={t('onboarding.intro.secondaryCta')}
            variant="secondary"
            onPress={handleSkip}
          />
        </ButtonContainer>
      </Content>
    </Container>
  );
}
