import React, { useState, useEffect } from 'react';
import { Alert, Keyboard } from 'react-native';
import { useTranslation } from '@/i18n';
import { useNavigation } from '@react-navigation/native';
import { useAuthContext } from '@/features/auth';
import { updateUserMe } from '@/api/update-user-me';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme';
import { useFeedback } from '@/utils/feedback';
import {
    Container,
    Content,
    Header,
    HeaderTitle,
    BackButton,
    InputContainer,
    Input,
    SaveButton,
    SaveButtonText,
} from './styles';

export function EditNameScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const { user, fetchUserMe } = useAuthContext();
    const { showSuccess } = useFeedback();
    const [name, setName] = useState(user?.name || '');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user?.name) {
            setName(user.name);
        }
    }, [user?.name]);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert(t('common.error'), t('profile.nameRequired'));
            return;
        }

        if (name.trim() === user?.name) {
            navigation.goBack();
            return;
        }

        setIsSaving(true);
        Keyboard.dismiss();

        try {
            await updateUserMe({ name: name.trim() });
            await fetchUserMe();
            showSuccess(t('profile.updateNameSuccess'));
            navigation.goBack();
        } catch (error: any) {
            console.error('Erro ao atualizar nome:', error);

            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                t('profile.updateNameError');

            Alert.alert(t('common.error'), errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Container>
            <Header>
                <BackButton onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </BackButton>
                <HeaderTitle>{t('profile.editName')}</HeaderTitle>
            </Header>
            <Content>
                <InputContainer>
                    <Input
                        value={name}
                        onChangeText={setName}
                        placeholder={t('profile.name')}
                        placeholderTextColor={colors.text.tertiary}
                        autoFocus
                        editable={!isSaving}
                    />
                </InputContainer>
                <SaveButton onPress={handleSave} disabled={isSaving} activeOpacity={0.7}>
                    <SaveButtonText>{isSaving ? t('common.loading') : t('common.save')}</SaveButtonText>
                </SaveButton>
            </Content>
        </Container>
    );
}

