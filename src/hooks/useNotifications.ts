import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/i18n';
import { getUserSettings } from '@/api/get-user-settings';
import { requestNotificationPermissions, scheduleClockReminders, cancelAllNotifications } from '@/utils/notifications';

export function useNotifications() {
  const { t } = useTranslation();

  const { data: settings } = useQuery({
    queryKey: ['userSettings'],
    queryFn: getUserSettings,
  });

  useEffect(() => {
    const setupNotifications = async () => {
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        console.log('Permissão de notificação não concedida');
        return;
      }

      if (settings?.workSchedule) {
        const hasAnySchedule = Object.values(settings.workSchedule).some(Boolean);
        if (hasAnySchedule) {
          await scheduleClockReminders(settings.workSchedule, {
            entryTitle: t('notifications.entryTitle'),
            entryBody: t('notifications.entryBody'),
            lunchTitle: t('notifications.lunchTitle'),
            lunchBody: t('notifications.lunchBody'),
            exitTitle: t('notifications.exitTitle'),
            exitBody: t('notifications.exitBody'),
          });
        } else {
          await cancelAllNotifications();
        }
      }
    };

    if (settings) {
      setupNotifications();
    }
  }, [settings, t]);
}

