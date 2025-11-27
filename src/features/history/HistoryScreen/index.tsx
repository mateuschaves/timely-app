import React from 'react';
import { ListRenderItem } from 'react-native';
import { useTranslation } from '@/i18n';
import { useTimeClock } from '@/features/time-clock/hooks/useTimeClock';
import { TimeClockEntry } from '@/features/time-clock/types';
import {
    Container,
    List,
    EntryCard,
    EntryTime,
    EntryDate,
    EntryType,
    EmptyState,
    EmptyStateText,
} from './styles';

export function HistoryScreen() {
    const { t, i18n } = useTranslation();
    const { entries, isLoading } = useTimeClock();

    const renderItem: ListRenderItem<TimeClockEntry> = ({ item }) => (
        <EntryCard>
            <EntryType type={item.type}>
                {item.type === 'entry' ? t('history.entry') : t('history.exit')}
            </EntryType>
            <EntryTime>{new Date(item.time).toLocaleTimeString(i18n.language === 'pt-BR' ? 'pt-BR' : 'en-US')}</EntryTime>
            <EntryDate>{new Date(item.date).toLocaleDateString(i18n.language === 'pt-BR' ? 'pt-BR' : 'en-US')}</EntryDate>
        </EntryCard>
    );

    if (isLoading) {
        return (
            <Container>
                <EmptyState>
                    <EmptyStateText>{t('common.loading')}</EmptyStateText>
                </EmptyState>
            </Container>
        );
    }

    if (entries.length === 0) {
        return (
            <Container>
                <EmptyState>
                    <EmptyStateText>{t('history.empty')}</EmptyStateText>
                </EmptyState>
            </Container>
        );
    }

    return (
        <Container>
            <List
                data={entries}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
            />
        </Container>
    );
}


