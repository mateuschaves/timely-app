import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation, LanguageOption } from '@/i18n';
import { useAuthContext } from '@/features/auth';
import { AppStackParamList } from '@/navigation/AppNavigator';
import { STORAGE_KEYS } from '@/config/storage';
import { colors } from '@/theme/colors';
import {
  Container,
  Content,
  ScrollContent,
  ProfileHeader,
  AvatarContainer,
  Avatar,
  AvatarText,
  AvatarIcon,
  UserName,
  UserEmail,
  Section,
  InfoCard,
  InfoRow,
  InfoLeft,
  InfoLabel,
  InfoValueContainer,
  InfoValue,
  Button,
  ButtonText,
  EmptyState,
  EmptyStateText,
  SettingsRow,
  ChevronIcon,
} from './styles';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

export function ProfileScreen() {
  const { t } = useTranslation();
  const { user, signOut, fetchUserMe } = useAuthContext();
  const navigation = useNavigation<NavigationProp>();
  const [currentLanguage, setCurrentLanguage] = useState<LanguageOption>('system');

  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        try {
          await fetchUserMe();

          const savedLanguage = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
          if (savedLanguage === 'system' || (savedLanguage && ['pt-BR', 'en-US', 'fr-FR', 'de-DE'].includes(savedLanguage))) {
            setCurrentLanguage(savedLanguage as LanguageOption);
          } else {
            setCurrentLanguage('system');
          }
        } catch (error) {
          console.error('Erro ao carregar dados:', error);
        }
      };
      loadData();
    }, [fetchUserMe])
  );

  const handleSignOut = () => {
    Alert.alert(
      t('profile.logoutConfirmTitle'),
      t('profile.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('profile.logout'), onPress: signOut, style: 'destructive' },
      ]
    );
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const getLanguageDisplayName = (language: LanguageOption): string => {
    switch (language) {
      case 'system':
        return t('profile.languageSystem');
      case 'pt-BR':
        return t('profile.languagePortuguese');
      case 'en-US':
        return t('profile.languageEnglish');
      case 'fr-FR':
        return t('profile.languageFrench');
      case 'de-DE':
        return t('profile.languageGerman');
      default:
        return t('profile.languageSystem');
    }
  };

  return (
    <Container>
      <ScrollContent>
        <Content>
          <ProfileHeader>
            <AvatarContainer>
              <Avatar>
                {user?.name ? (
                  <AvatarText>{getInitials(user.name)}</AvatarText>
                ) : (
                  <AvatarIcon>
                    <Ionicons name="person" size={48} color={colors.text.inverse} />
                  </AvatarIcon>
                )}
              </Avatar>
            </AvatarContainer>
            <UserName numberOfLines={1} ellipsizeMode="tail">
              {user?.name || user?.email || t('profile.user')}
            </UserName>
            {user?.email && user?.name && (
              <UserEmail numberOfLines={1} ellipsizeMode="tail">
                {user.email}
              </UserEmail>
            )}
            {!user?.name && user?.email && (
              <UserEmail numberOfLines={1} ellipsizeMode="tail" style={{ marginTop: 2 }}>
                {user.email}
              </UserEmail>
            )}
          </ProfileHeader>

          {user ? (
            <>
              <Section>
                <InfoCard>
                  {user.name && (
                    <SettingsRow
                      onPress={() => navigation.navigate('EditName')}
                      activeOpacity={0.7}
                    >
                      <InfoLeft>
                        <InfoLabel>{t('profile.name')}</InfoLabel>
                      </InfoLeft>
                      <InfoValueContainer>
                        <InfoValue>{user.name}</InfoValue>
                        <ChevronIcon>
                          <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
                        </ChevronIcon>
                      </InfoValueContainer>
                    </SettingsRow>
                  )}
                </InfoCard>
              </Section>

              <Section>
                <InfoCard>
                  <SettingsRow
                    onPress={() => navigation.navigate('Language')}
                    activeOpacity={0.7}
                  >
                    <InfoLeft>
                      <InfoLabel>{t('profile.language')}</InfoLabel>
                    </InfoLeft>
                    <InfoValueContainer>
                      <InfoValue>{getLanguageDisplayName(currentLanguage)}</InfoValue>
                      <ChevronIcon>
                        <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
                      </ChevronIcon>
                    </InfoValueContainer>
                  </SettingsRow>
                </InfoCard>
              </Section>

              <Section>
                <InfoCard>
                  <SettingsRow
                    onPress={() => navigation.navigate('WorkSettings')}
                    activeOpacity={0.7}
                  >
                    <InfoLeft>
                      <InfoLabel>{t('profile.workSettings')}</InfoLabel>
                    </InfoLeft>
                    <InfoValueContainer>
                      <ChevronIcon>
                        <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
                      </ChevronIcon>
                    </InfoValueContainer>
                  </SettingsRow>
                </InfoCard>
              </Section>

              <Button onPress={handleSignOut}>
                <ButtonText>{t('profile.logout')}</ButtonText>
              </Button>
            </>
          ) : (
            <EmptyState>
              <EmptyStateText>{t('profile.noName')}</EmptyStateText>
            </EmptyState>
          )}
        </Content>
      </ScrollContent>
    </Container>
  );
}

