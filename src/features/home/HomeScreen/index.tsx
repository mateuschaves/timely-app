import React, { useEffect, useState } from 'react';
import * as Linking from 'expo-linking';
import { useTranslation } from '@/i18n';
import { useTimeClock } from '@/features/time-clock/hooks/useTimeClock';
import { Container, Title, Subtitle, Button, ButtonText, DeeplinkMessage } from './styles';

export function HomeScreen() {
  const { t } = useTranslation();
  const { handleDeeplink, clockIn, clockOut, isClocking } = useTimeClock();


  const handleClockIn = async () => {
    const now = new Date().toISOString();
    await clockIn({
      hour: now,
    });
  };

  const handleClockOut = async () => {
    const now = new Date().toISOString();
    await clockOut({
      hour: now,
    });
  };

  return (
    <Container>
      <Title>{t('auth.title')}</Title>
      <Subtitle>{t('auth.subtitle')}</Subtitle>

      <Button onPress={handleClockIn} disabled={isClocking}>
        <ButtonText>{isClocking ? t('home.clocking') : t('home.clockIn')}</ButtonText>
      </Button>

      <Button onPress={handleClockOut} disabled={isClocking} variant="outline">
        <ButtonText variant="outline">{isClocking ? t('home.clocking') : t('home.clockOut')}</ButtonText>
      </Button>
    </Container>
  );
}

