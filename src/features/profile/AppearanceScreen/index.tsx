import React from 'react';
import { useTranslation } from '@/i18n';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeMode } from '@/theme/context/ThemeContext';
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

export function AppearanceScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const { theme, themeMode, setThemeMode } = useTheme();
    const { showSuccess } = useFeedback();

    const themes: { value: ThemeMode; label: string }[] = [
        { value: 'system', label: t('profile.appearanceSystem') },
        { value: 'light', label: t('profile.appearanceLight') },
        { value: 'dark', label: t('profile.appearanceDark') },
    ];

    const handleThemeChange = async (mode: ThemeMode) => {
        if (mode !== themeMode) {
            await setThemeMode(mode);
            showSuccess(t('profile.appearanceChangedSuccess'));
        }
    };

    return (
        <Container>
            <Header>
                <BackButton onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
                </BackButton>
                <HeaderTitle>{t('profile.appearance')}</HeaderTitle>
            </Header>
            <Content>
                <Section>
                    <InfoCard>
                        {themes.map((themeOption, index) => (
                            <SettingsRow
                                key={themeOption.value}
                                onPress={() => handleThemeChange(themeOption.value)}
                                activeOpacity={0.7}
                                style={{
                                    borderBottomWidth: index < themes.length - 1 ? 1 : 0,
                                    borderBottomColor: theme.border.light,
                                }}
                            >
                                <InfoLeft>
                                    <InfoLabel>{themeOption.label}</InfoLabel>
                                </InfoLeft>
                                <InfoValueContainer>
                                    {themeMode === themeOption.value && (
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
