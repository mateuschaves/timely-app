import React from 'react';
import { useTranslation, useLanguage, LanguageOption } from '@/i18n';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme';
import {
  Container,
  Content,
  Header,
  HeaderTitle,
  BackButton,
  LanguageList,
  LanguageItem,
  LanguageItemText,
  LanguageItemCheck,
  LanguageItemCheckInner,
  Divider,
} from './styles';

export function LanguageScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { currentLanguage, changeLanguage } = useLanguage();

  const languages: { value: LanguageOption; label: string }[] = [
    { value: 'system', label: t('profile.languageSystem') },
    { value: 'pt-BR', label: t('profile.languagePortuguese') },
    { value: 'en-US', label: t('profile.languageEnglish') },
    { value: 'fr-FR', label: t('profile.languageFrench') },
    { value: 'de-DE', label: t('profile.languageGerman') },
  ];

  const handleLanguageChange = (language: LanguageOption) => {
    changeLanguage(language);
  };

  return (
    <Container>
      <Header>
        <BackButton onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </BackButton>
        <HeaderTitle>{t('profile.language')}</HeaderTitle>
      </Header>
      <Content>
        <LanguageList>
          {languages.map((lang, index) => (
            <React.Fragment key={lang.value}>
              <LanguageItem
                onPress={() => handleLanguageChange(lang.value)}
                activeOpacity={0.7}
              >
                <LanguageItemText>{lang.label}</LanguageItemText>
                {currentLanguage === lang.value && (
                  <LanguageItemCheck>
                    <LanguageItemCheckInner />
                  </LanguageItemCheck>
                )}
              </LanguageItem>
              {index < languages.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </LanguageList>
      </Content>
    </Container>
  );
}

