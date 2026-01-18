import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from '@/i18n';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useOnboarding } from '../context/OnboardingContext';
import { WorkModel, OnboardingStackParamList } from '../types';
import {
  Container,
  Header,
  CloseButton,
  CloseButtonText,
  Content,
  Title,
  Subtitle,
  OptionsContainer,
  OptionCard,
  OptionTitle,
  OptionDescription,
  ButtonContainer,
  ContinueButton,
  ContinueButtonText,
} from './styles';

type NavigationProp = NativeStackNavigationProp<OnboardingStackParamList, 'WorkModelSelection'>;

interface WorkModelOption {
  id: WorkModel;
  titleKey: string;
  descriptionKey: string;
}

export function WorkModelSelectionScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { skipOnboarding, completeOnboarding } = useOnboarding();
  const [selectedModel, setSelectedModel] = useState<WorkModel | null>(null);

  const workModelOptions: WorkModelOption[] = [
    {
      id: 'onsite',
      titleKey: 'onboarding.workModel.onsite',
      descriptionKey: 'onboarding.workModel.onsiteDescription',
    },
    {
      id: 'hybrid',
      titleKey: 'onboarding.workModel.hybrid',
      descriptionKey: 'onboarding.workModel.hybridDescription',
    },
    {
      id: 'remote',
      titleKey: 'onboarding.workModel.remote',
      descriptionKey: 'onboarding.workModel.remoteDescription',
    },
  ];

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

  const handleContinue = async () => {
    if (!selectedModel) return;

    try {
      // Se o usuário escolheu híbrido ou presencial (onsite), perguntar localização
      if (selectedModel === 'hybrid' || selectedModel === 'onsite') {
        navigation.navigate('WorkLocation', { workModel: selectedModel });
      } else {
        // Para remoto, completar onboarding diretamente
        await completeOnboarding(selectedModel);
      }
    } catch (error) {
      console.error('Error navigating to location screen:', error);
      Alert.alert(
        t('common.error'),
        t('onboarding.error.completeFailed')
      );
    }
  };

  return (
    <Container>
      <Header>
        <CloseButton onPress={handleSkip} activeOpacity={0.6}>
          <CloseButtonText>×</CloseButtonText>
        </CloseButton>
      </Header>

      <Content>
        <Title>{t('onboarding.workModel.title')}</Title>
        <Subtitle>{t('onboarding.workModel.subtitle')}</Subtitle>

        <OptionsContainer>
          {workModelOptions.map((option) => (
            <OptionCard
              key={option.id}
              selected={selectedModel === option.id}
              onPress={() => setSelectedModel(option.id)}
              activeOpacity={0.8}
            >
              <OptionTitle selected={selectedModel === option.id}>
                {t(option.titleKey)}
              </OptionTitle>
              <OptionDescription>{t(option.descriptionKey)}</OptionDescription>
            </OptionCard>
          ))}
        </OptionsContainer>
      </Content>

      <ButtonContainer>
        <ContinueButton
          onPress={handleContinue}
          disabled={!selectedModel}
          activeOpacity={0.8}
        >
          <ContinueButtonText disabled={!selectedModel}>
            {t('onboarding.workModel.continue')}
          </ContinueButtonText>
        </ContinueButton>
      </ButtonContainer>
    </Container>
  );
}
