import React from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from '@/i18n';
import { useOnboarding } from '../hooks/useOnboarding';
import { OnboardingStackParamList } from '../types';
import {
  Container,
  Content,
  IconContainer,
  Icon,
  Title,
  Body,
  ButtonContainer,
  PrimaryButton,
  PrimaryButtonText,
  SecondaryButton,
  SecondaryButtonText,
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
          <PrimaryButton onPress={handleContinue} activeOpacity={0.8}>
            <PrimaryButtonText>{t('onboarding.intro.primaryCta')}</PrimaryButtonText>
          </PrimaryButton>

          <SecondaryButton onPress={handleSkip} activeOpacity={0.6}>
            <SecondaryButtonText>{t('onboarding.intro.secondaryCta')}</SecondaryButtonText>
          </SecondaryButton>
        </ButtonContainer>
      </Content>
    </Container>
  );
}
