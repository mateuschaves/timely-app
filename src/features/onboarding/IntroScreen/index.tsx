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
  const { isExistingUser, skipOnboarding } = useOnboarding();

  const handleContinue = () => {
    navigation.navigate('WorkModelSelection');
  };

  const handleSkip = () => {
    if (isExistingUser) {
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
              await skipOnboarding();
            },
          },
        ]
      );
    }
  };

  const translations = isExistingUser
    ? {
        title: t('onboarding.intro.existing.title'),
        body: t('onboarding.intro.existing.body'),
        primaryCta: t('onboarding.intro.existing.primaryCta'),
        secondaryCta: t('onboarding.intro.existing.secondaryCta'),
      }
    : {
        title: t('onboarding.intro.new.title'),
        body: t('onboarding.intro.new.body'),
        primaryCta: t('onboarding.intro.new.cta'),
      };

  return (
    <Container>
      <Content>
        <IconContainer>
          <Icon>⏰</Icon>
        </IconContainer>

        <Title>{translations.title}</Title>
        <Body>{translations.body}</Body>

        <ButtonContainer>
          <PrimaryButton onPress={handleContinue} activeOpacity={0.8}>
            <PrimaryButtonText>{translations.primaryCta}</PrimaryButtonText>
          </PrimaryButton>

          {isExistingUser && translations.secondaryCta && (
            <SecondaryButton onPress={handleSkip} activeOpacity={0.6}>
              <SecondaryButtonText>{translations.secondaryCta}</SecondaryButtonText>
            </SecondaryButton>
          )}
        </ButtonContainer>
      </Content>
    </Container>
  );
}
