import React from 'react';
import { useTranslation } from '@/i18n';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme';
import { AppStackParamList } from '@/navigation/AppNavigator';
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
  ChevronIcon,
} from './styles';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

export function PrivacyAndSecurityScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();

  return (
    <Container>
      <Header>
        <BackButton onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </BackButton>
        <HeaderTitle>{t('profile.privacyAndSecurity')}</HeaderTitle>
      </Header>
      <Content>
        <Section>
          <InfoCard>
            <SettingsRow
              onPress={() => navigation.navigate('DeleteAccount')}
              activeOpacity={0.7}
            >
              <InfoLeft>
                <InfoLabel style={{ color: colors.status.error }}>
                  {t('profile.deleteAccount')}
                </InfoLabel>
              </InfoLeft>
              <ChevronIcon>
                <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
              </ChevronIcon>
            </SettingsRow>
          </InfoCard>
        </Section>
      </Content>
    </Container>
  );
}

