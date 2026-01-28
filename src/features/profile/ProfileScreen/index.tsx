import React, { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation, LanguageOption } from '@/i18n';
import { useAuthContext } from '@/features/auth';
import { AppStackParamList } from '@/navigation/AppNavigator';
import { STORAGE_KEYS } from '@/config/storage';
import { useWorkSettings } from '@/features/profile/hooks/useWorkSettings';
import { useTheme } from '@/theme/context/ThemeContext';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/Button';
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
  InfoLeft,
  InfoLabel,
  InfoValueContainer,
  InfoValue,
  EmptyState,
  EmptyStateText,
  SettingsRow,
  ChevronIcon,
  Badge,
  BadgeIcon,
  BadgeText,
  BetaBadge,
  BetaBadgeText,
} from './styles';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

export function ProfileScreen() {
  const { t } = useTranslation();
  const { user, signOut, fetchUserMe } = useAuthContext();
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  const { hasWorkSettings, canShowCard } = useWorkSettings();
  const { theme, themeMode } = useTheme();
  const [currentLanguage, setCurrentLanguage] = useState<LanguageOption>('system');

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          await fetchUserMe();

          const savedLanguage = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
          if (savedLanguage === 'system' || (savedLanguage && ['pt-BR', 'en-US', 'fr-FR', 'de-DE', 'es-ES'].includes(savedLanguage))) {
            setCurrentLanguage(savedLanguage as LanguageOption);
          } else {
            setCurrentLanguage('system');
          }
        } catch (error) {
          console.error('Erro ao carregar dados:', error);
        }
      };
      loadData();

      // Invalidar queries de userSettings quando a tela recebe foco para atualizar o badge
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
    }, [fetchUserMe, queryClient])
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
      case 'es-ES':
        return t('profile.languageSpanish');
      default:
        return t('profile.languageSystem');
    }
  };

  const getAppearanceDisplayName = (): string => {
    switch (themeMode) {
      case 'system':
        return t('profile.appearanceSystem');
      case 'light':
        return t('profile.appearanceLight');
      case 'dark':
        return t('profile.appearanceDark');
      default:
        return t('profile.appearanceSystem');
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
                    <Ionicons name="person" size={48} color={theme.text.inverse} />
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
              {/* Informações da Conta */}
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
                          <Ionicons name="chevron-forward" size={20} color={theme.text.tertiary} />
                        </ChevronIcon>
                      </InfoValueContainer>
                    </SettingsRow>
                  )}
                </InfoCard>
              </Section>

              {/* Configurações do Aplicativo */}
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
                        <Ionicons name="chevron-forward" size={20} color={theme.text.tertiary} />
                      </ChevronIcon>
                    </InfoValueContainer>
                  </SettingsRow>
                  <SettingsRow
                    onPress={() => navigation.navigate('Appearance')}
                    activeOpacity={0.7}
                  >
                    <InfoLeft>
                      <InfoLabel>{t('profile.appearance')}</InfoLabel>
                    </InfoLeft>
                    <InfoValueContainer>
                      <InfoValue>{getAppearanceDisplayName()}</InfoValue>
                      <ChevronIcon>
                        <Ionicons name="chevron-forward" size={20} color={theme.text.tertiary} />
                      </ChevronIcon>
                    </InfoValueContainer>
                  </SettingsRow>
                </InfoCard>
              </Section>

              {/* Configurações de Trabalho */}
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
                      {canShowCard && !hasWorkSettings && (
                        <Badge>
                          <BadgeIcon>
                            <Ionicons name="alert-circle" size={12} color={theme.status.warning} />
                          </BadgeIcon>
                          <BadgeText>{t('profile.workSettingsNotConfigured')}</BadgeText>
                        </Badge>
                      )}
                      <ChevronIcon>
                        <Ionicons name="chevron-forward" size={20} color={theme.text.tertiary} />
                      </ChevronIcon>
                    </InfoValueContainer>
                  </SettingsRow>
                  <SettingsRow
                    onPress={() => navigation.navigate('WorkplaceLocation')}
                    activeOpacity={0.7}
                  >
                    <InfoLeft>
                      <InfoLabel>{t('profile.workplaceLocation')}</InfoLabel>
                      <BetaBadge>
                        <BetaBadgeText>{t('common.beta')}</BetaBadgeText>
                      </BetaBadge>
                    </InfoLeft>
                    <InfoValueContainer>
                      <ChevronIcon>
                        <Ionicons name="chevron-forward" size={20} color={theme.text.tertiary} />
                      </ChevronIcon>
                    </InfoValueContainer>
                  </SettingsRow>
                </InfoCard>
              </Section>

              {/* Justificativas de Ausência */}
              <Section>
                <InfoCard>
                  <SettingsRow
                    onPress={() => navigation.navigate('AbsencesList')}
                    activeOpacity={0.7}
                  >
                    <InfoLeft>
                      <InfoLabel>{t('profile.absences')}</InfoLabel>
                      <BetaBadge>
                        <BetaBadgeText>{t('common.beta')}</BetaBadgeText>
                      </BetaBadge>
                    </InfoLeft>
                    <ChevronIcon>
                      <Ionicons name="chevron-forward" size={20} color={theme.text.tertiary} />
                    </ChevronIcon>
                  </SettingsRow>
                </InfoCard>
              </Section>

              {/* Privacidade e Segurança */}
              <Section>
                <InfoCard>
                  <SettingsRow
                    onPress={() => navigation.navigate('PrivacyAndSecurity')}
                    activeOpacity={0.7}
                  >
                    <InfoLeft>
                      <InfoLabel>{t('profile.privacyAndSecurity')}</InfoLabel>
                    </InfoLeft>
                    <ChevronIcon>
                      <Ionicons name="chevron-forward" size={20} color={theme.text.tertiary} />
                    </ChevronIcon>
                  </SettingsRow>
                </InfoCard>
              </Section>

              <Button 
                title={t('profile.logout')}
                destructive
                onPress={handleSignOut}
              />
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

