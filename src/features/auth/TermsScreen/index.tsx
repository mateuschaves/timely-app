import React from 'react';
import { Linking, ScrollView } from 'react-native';
import { useTranslation } from '@/i18n';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/context/ThemeContext';
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import {
  Container,
  Header,
  HeaderTitle,
  BackButton,
  Content,
  ScrollContent,
  TermsText,
  LinkText,
  LinkTextContent,
  Section,
  SectionTitle,
  SectionText,
} from './styles';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const APPLE_EULA_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';

export function TermsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  const handleOpenAppleEULA = async () => {
    try {
      const canOpen = await Linking.canOpenURL(APPLE_EULA_URL);
      if (canOpen) {
        await Linking.openURL(APPLE_EULA_URL);
      }
    } catch (error) {
      console.error('Erro ao abrir EULA da Apple:', error);
    }
  };

  return (
    <Container>
      <Header>
        <BackButton onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
        </BackButton>
        <HeaderTitle>{t('auth.termsOfService')}</HeaderTitle>
      </Header>
      <Content>
        <ScrollContent showsVerticalScrollIndicator={false}>
          <Section>
            <SectionTitle>{t('auth.termsTitle')}</SectionTitle>
            <SectionText>{t('auth.termsIntro')}</SectionText>
          </Section>

          <Section>
            <SectionTitle>{t('auth.termsAcceptance')}</SectionTitle>
            <SectionText>{t('auth.termsAcceptanceText')}</SectionText>
          </Section>

          <Section>
            <SectionTitle>{t('auth.termsAppleEULA')}</SectionTitle>
            <SectionText>{t('auth.termsAppleEULAText')}</SectionText>
            <LinkText onPress={handleOpenAppleEULA} activeOpacity={0.7}>
              <LinkTextContent>{t('auth.termsViewAppleEULA')}</LinkTextContent>
            </LinkText>
          </Section>

          <Section>
            <SectionTitle>{t('auth.termsService')}</SectionTitle>
            <SectionText>{t('auth.termsServiceText')}</SectionText>
          </Section>

          <Section>
            <SectionTitle>{t('auth.termsPrivacy')}</SectionTitle>
            <SectionText>{t('auth.termsPrivacyText')}</SectionText>
          </Section>

          <Section>
            <SectionTitle>{t('auth.termsContact')}</SectionTitle>
            <SectionText>{t('auth.termsContactText')}</SectionText>
          </Section>

          <TermsText style={{ marginTop: 24, marginBottom: 24 }}>
            {t('auth.termsLastUpdated')}
          </TermsText>
        </ScrollContent>
      </Content>
    </Container>
  );
}

