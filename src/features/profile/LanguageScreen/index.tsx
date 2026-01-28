import React from 'react';
import { useTranslation, useLanguage, LanguageOption } from '@/i18n';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/context/ThemeContext';
import { useFeedback } from '@/utils/feedback';
import {
  Container,
  Content,
  Header,
  HeaderTitle,
  BackButton,
  Section,
  InfoCard,
  SettingsRow,
  InfoLeft,
  InfoLabel,
  InfoValueContainer,
  InfoValue,
  CheckIcon,
} from './styles';

export function LanguageScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { currentLanguage, changeLanguage } = useLanguage();
  const { showSuccess } = useFeedback();
  const { theme } = useTheme();

  const languages: { value: LanguageOption; label: string }[] = [
    { value: 'system', label: t('profile.languageSystem') },
    { value: 'pt-BR', label: t('profile.languagePortuguese') },
    { value: 'en-US', label: t('profile.languageEnglish') },
    { value: 'fr-FR', label: t('profile.languageFrench') },
    { value: 'de-DE', label: t('profile.languageGerman') },
    { value: 'es-ES', label: t('profile.languageSpanish') },
  ];

  const handleLanguageChange = (language: LanguageOption) => {
    if (language !== currentLanguage) {
      changeLanguage(language);
      showSuccess(t('profile.languageChangedSuccess'));
    }
  };

  return (
    <Container>
      <Header>
        <BackButton onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
        </BackButton>
        <HeaderTitle>{t('profile.language')}</HeaderTitle>
      </Header>
      <Content>
        <Section>
          <InfoCard>
            {languages.map((lang, index) => (
              <SettingsRow
                key={lang.value}
                onPress={() => handleLanguageChange(lang.value)}
                activeOpacity={0.7}
                style={{
                  borderBottomWidth: index < languages.length - 1 ? 1 : 0,
                  borderBottomColor: theme.border.light,
                }}
              >
                <InfoLeft>
                  <InfoLabel>{lang.label}</InfoLabel>
                </InfoLeft>
                <InfoValueContainer>
                  {currentLanguage === lang.value && (
                    <CheckIcon>
                      <Ionicons name="checkmark" size={20} color={theme.primary} />
                    </CheckIcon>
                  )}
                </InfoValueContainer>
              </SettingsRow>
            ))}
          </InfoCard>
        </Section>
      </Content>
    </Container>
  );
}

