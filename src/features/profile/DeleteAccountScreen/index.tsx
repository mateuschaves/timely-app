import React, { useState } from 'react';
import { Alert, Keyboard, ScrollView } from 'react-native';
import { useTranslation } from '@/i18n';
import { useNavigation } from '@react-navigation/native';
import { useAuthContext } from '@/features/auth';
import { deleteUserMe, DeleteUserMeRequest } from '@/api/delete-user-me';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/context/ThemeContext';
import { Button } from '@/components';
import {
    Container,
    Content,
    Header,
    HeaderTitle,
    BackButton,
    ScrollContent,
    Section,
    SectionTitle,
    SectionDescription,
    ReasonOption,
    ReasonOptionContent,
    ReasonOptionText,
    RadioButton,
    RadioButtonSelected,
    CustomReasonContainer,
    CustomReasonInput,
    WarningText,
} from './styles';

type DeleteReason = 
    | 'no_longer_need'
    | 'found_better_app'
    | 'too_expensive'
    | 'privacy_concerns'
    | 'too_complicated'
    | 'other';

export function DeleteAccountScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const { signOut } = useAuthContext();
    const { theme } = useTheme();
    const [selectedReason, setSelectedReason] = useState<DeleteReason | null>(null);
    const [customReason, setCustomReason] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const reasons: { key: DeleteReason; label: string }[] = [
        { key: 'no_longer_need', label: t('profile.deleteAccountReasonNoLongerNeed') },
        { key: 'found_better_app', label: t('profile.deleteAccountReasonFoundBetterApp') },
        { key: 'too_expensive', label: t('profile.deleteAccountReasonTooExpensive') },
        { key: 'privacy_concerns', label: t('profile.deleteAccountReasonPrivacyConcerns') },
        { key: 'too_complicated', label: t('profile.deleteAccountReasonTooComplicated') },
        { key: 'other', label: t('profile.deleteAccountReasonOther') },
    ];

    const handleDelete = async () => {
        if (!selectedReason) {
            Alert.alert(t('common.error'), t('profile.deleteAccountReasonRequired'));
            return;
        }

        if (selectedReason === 'other' && !customReason.trim()) {
            Alert.alert(t('common.error'), t('profile.deleteAccountCustomReasonRequired'));
            return;
        }

        Alert.alert(
            t('profile.deleteAccountConfirmTitle'),
            t('profile.deleteAccountConfirmMessage'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('profile.deleteAccountConfirmButton'),
                    style: 'destructive',
                    onPress: async () => {
                        setIsDeleting(true);
                        Keyboard.dismiss();

                        try {
                            const requestData: DeleteUserMeRequest = {
                                reason: selectedReason === 'other' ? 'other' : selectedReason,
                                ...(selectedReason === 'other' && { customReason: customReason.trim() }),
                            };

                            await deleteUserMe(requestData);
                            
                            // Fazer logout após deletar a conta
                            await signOut();
                        } catch (error: any) {
                            console.error('Erro ao deletar conta:', error);
                            
                            const errorMessage =
                                error.response?.data?.message ||
                                error.message ||
                                t('profile.deleteAccountError');

                            Alert.alert(t('common.error'), errorMessage);
                        } finally {
                            setIsDeleting(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <Container>
            <Header>
                <BackButton onPress={() => navigation.goBack()} disabled={isDeleting}>
                    <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
                </BackButton>
                <HeaderTitle>{t('profile.deleteAccount')}</HeaderTitle>
            </Header>
            <Content>
                <ScrollContent showsVerticalScrollIndicator={false}>
                    <Section>
                        <SectionTitle>{t('profile.deleteAccountTitle')}</SectionTitle>
                        <SectionDescription>{t('profile.deleteAccountDescription')}</SectionDescription>
                    </Section>

                    <Section>
                        <SectionTitle>{t('profile.deleteAccountReasonTitle')}</SectionTitle>
                        
                        {reasons.map((reason) => (
                            <ReasonOption
                                key={reason.key}
                                onPress={() => {
                                    if (!isDeleting) {
                                        setSelectedReason(reason.key);
                                        if (reason.key !== 'other') {
                                            setCustomReason('');
                                        }
                                    }
                                }}
                                activeOpacity={0.7}
                                disabled={isDeleting}
                            >
                                <ReasonOptionContent>
                                    <RadioButton>
                                        {selectedReason === reason.key && <RadioButtonSelected />}
                                    </RadioButton>
                                    <ReasonOptionText>{reason.label}</ReasonOptionText>
                                </ReasonOptionContent>
                            </ReasonOption>
                        ))}

                        {selectedReason === 'other' && (
                            <CustomReasonContainer>
                                <CustomReasonInput
                                    value={customReason}
                                    onChangeText={setCustomReason}
                                    placeholder={t('profile.deleteAccountCustomReasonPlaceholder')}
                                    placeholderTextColor={theme.text.tertiary}
                                    multiline
                                    numberOfLines={4}
                                    editable={!isDeleting}
                                    textAlignVertical="top"
                                />
                            </CustomReasonContainer>
                        )}
                    </Section>

                    <WarningText>{t('profile.deleteAccountWarning')}</WarningText>

                    <Button
                        destructive
                        onPress={handleDelete}
                        disabled={!selectedReason || (selectedReason === 'other' && !customReason.trim())}
                        isLoading={isDeleting}
                        style={{ marginBottom: 40 }}
                    >
                        {t('profile.deleteAccountButton')}
                    </Button>
                </ScrollContent>
            </Content>
        </Container>
    );
}

