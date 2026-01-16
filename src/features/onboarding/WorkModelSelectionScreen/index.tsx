import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from '@/i18n';
import { useOnboarding } from '../hooks/useOnboarding';
import { WorkModel } from '../types';
import {
  Container,
  Header,
  SkipButton,
  SkipButtonText,
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

interface WorkModelOption {
  id: WorkModel;
  titleKey: string;
  descriptionKey: string;
}

export function WorkModelSelectionScreen() {
  const { t } = useTranslation();
  const { completeOnboarding, skipOnboarding } = useOnboarding();
  const [selectedModel, setSelectedModel] = useState<WorkModel | null>(null);

  const workModelOptions: WorkModelOption[] = [
    {
      id: 'office',
      titleKey: 'onboarding.workModel.office',
      descriptionKey: 'onboarding.workModel.officeDescription',
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
    {
      id: 'flexible',
      titleKey: 'onboarding.workModel.flexible',
      descriptionKey: 'onboarding.workModel.flexibleDescription',
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
            await skipOnboarding();
          },
        },
      ]
    );
  };

  const handleContinue = async () => {
    if (!selectedModel) return;

    // Here you would typically save the selected work model
    // For now, we'll just complete the onboarding
    await completeOnboarding();
  };

  return (
    <Container>
      <Header>
        <SkipButton onPress={handleSkip} activeOpacity={0.6}>
          <SkipButtonText>{t('onboarding.skip')}</SkipButtonText>
        </SkipButton>
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
