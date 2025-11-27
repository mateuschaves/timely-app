import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { WorkSchedule, WorkScheduleDay } from '@/api/update-user-settings';
import { parse, addMinutes } from 'date-fns';

let isScheduling = false;

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    // Se estamos agendando notificações, não mostra nenhuma
    if (isScheduling) {
      return {
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: false,
        shouldShowList: false,
      };
    }

    console.log('Notificação recebida:', notification.request.content.title);
    return {
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permissão de notificação negada');
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return true;
  } catch (error) {
    console.error('Erro ao solicitar permissão de notificação:', error);
    return false;
  }
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getScheduledNotificationsCount(): Promise<number> {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  return notifications.length;
}

export async function scheduleTestNotification(): Promise<void> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    console.log('Permissão de notificação não concedida');
    return;
  }

  const oneMinuteFromNow = new Date();
  oneMinuteFromNow.setMinutes(oneMinuteFromNow.getMinutes() + 1);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🧪 Notificação de Teste',
      body: 'Esta é uma notificação de teste agendada para 1 minuto!',
      sound: true,
    },
    trigger: {
      type: 'date',
      date: oneMinuteFromNow,
    } as any,
  });

  console.log(`Notificação de teste agendada para ${oneMinuteFromNow.toLocaleTimeString()}`);
}

export interface NotificationMessages {
  entryTitle: string;
  entryBody: string;
  lunchTitle: string;
  lunchBody: string;
  exitTitle: string;
  exitBody: string;
}

const DAY_INDEX_MAP: Record<keyof WorkSchedule, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 0,
};

const BASE_DATE = new Date(2024, 0, 1);

interface ReminderTimes {
  entry: Date;
  lunch: Date;
  exit: Date;
}

function calculateReminderTimes(schedule: WorkScheduleDay): ReminderTimes {
  const startTime = parse(schedule.start, 'HH:mm', BASE_DATE);
  const endTime = parse(schedule.end, 'HH:mm', BASE_DATE);

  const workDuration = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
  const lunchTime = addMinutes(startTime, workDuration / 2);

  return {
    entry: addMinutes(startTime, -5),
    lunch: addMinutes(lunchTime, -15),
    exit: addMinutes(endTime, -5),
  };
}

function createNotification(
  title: string,
  body: string,
  weekday: number,
  hour: number,
  minute: number
) {
  // Usa um trigger de calendário que só dispara no futuro
  // O weekday com repeats: true garante que só dispare no próximo dia da semana
  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: {
      type: 'calendar',
      weekday,
      hour,
      minute,
      repeats: true,
    } as any,
  });
}

export async function scheduleClockReminders(
  workSchedule: WorkSchedule,
  messages: NotificationMessages
): Promise<void> {
  const existingCount = await getScheduledNotificationsCount();
  console.log(`Notificações existentes antes de cancelar: ${existingCount}`);
  
  // Marca que estamos agendando para evitar que o handler mostre notificações
  isScheduling = true;
  
  try {
    await cancelAllNotifications();
    
    // Pequeno delay para garantir que o cancelamento foi processado
    await new Promise(resolve => setTimeout(resolve, 200));

    const schedules = Object.entries(workSchedule).filter(
      ([_, schedule]) => schedule !== undefined
    ) as Array<[keyof WorkSchedule, WorkScheduleDay]>;

    if (schedules.length === 0) {
      console.log('Nenhum horário configurado, não há notificações para agendar');
      return;
    }

    console.log(`Agendando notificações para ${schedules.length} dia(s) da semana...`);

    const notificationPromises = schedules.flatMap(([day, schedule]) => {
      const dayIndex = DAY_INDEX_MAP[day];
      const times = calculateReminderTimes(schedule);

      return [
        createNotification(
          messages.entryTitle,
          messages.entryBody,
          dayIndex,
          times.entry.getHours(),
          times.entry.getMinutes()
        ),
        createNotification(
          messages.lunchTitle,
          messages.lunchBody,
          dayIndex,
          times.lunch.getHours(),
          times.lunch.getMinutes()
        ),
        createNotification(
          messages.exitTitle,
          messages.exitBody,
          dayIndex,
          times.exit.getHours(),
          times.exit.getMinutes()
        ),
      ];
    });

    await Promise.all(notificationPromises);
    
    // Aguarda um pouco mais para garantir que todas as notificações foram processadas
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newCount = await getScheduledNotificationsCount();
    console.log(`Total de ${notificationPromises.length} notificações criadas, ${newCount} agendadas no sistema`);
  } finally {
    // Libera o flag após agendar
    isScheduling = false;
  }
}

