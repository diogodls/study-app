import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const STUDY_REMINDER_ID = 5101;
const CHANNEL_ID = 'study-reminders';
let routingInitialized = false;

export type NotificationPermissionResult = 'granted' | 'denied' | 'unsupported';

function parseTime(time: string) {
  const [hour, minute] = time.split(':').map(Number);
  return {
    hour: Number.isFinite(hour) ? hour : 19,
    minute: Number.isFinite(minute) ? minute : 0,
  };
}

function nextReminderDate(time: string) {
  const { hour, minute } = parseTime(time);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  if (date.getTime() <= Date.now()) date.setDate(date.getDate() + 1);
  return date;
}

function reminderBody(streak: number, lastStudyDate: string | null) {
  const today = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  if (lastStudyDate === today) return 'Seu Daily Challenge está esperando. Volte amanhã para manter o ritmo.';
  if (streak > 0) return `Seu streak de ${streak} dia${streak === 1 ? '' : 's'} está em jogo. Complete uma sessão hoje.`;
  return 'Uma sessão curta hoje já coloca sua jornada de volta nos trilhos.';
}

export async function requestNotificationPermission(): Promise<NotificationPermissionResult> {
  try {
    const current = await LocalNotifications.checkPermissions();
    if (current.display === 'granted') return 'granted';
    const requested = await LocalNotifications.requestPermissions();
    return requested.display === 'granted' ? 'granted' : 'denied';
  } catch {
    return 'unsupported';
  }
}

export async function scheduleStudyReminder(
  time: string,
  streak: number,
  lastStudyDate: string | null,
): Promise<void> {
  await cancelStudyReminder();

  if (Capacitor.getPlatform() === 'android') {
    await LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: 'Lembretes de estudo',
      description: 'Lembretes diários para manter seu streak no DevQuest',
      importance: 4,
      visibility: 1,
      vibration: true,
    });
  }

  const { hour, minute } = parseTime(time);
  const nativeSchedule = {
    on: { hour, minute },
    repeats: true,
    allowWhileIdle: true,
  };
  const webSchedule = {
    at: nextReminderDate(time),
  };

  await LocalNotifications.schedule({
    notifications: [{
      id: STUDY_REMINDER_ID,
      title: 'Hora da sua quest diária ⚔️',
      body: reminderBody(streak, lastStudyDate),
      schedule: Capacitor.isNativePlatform() ? nativeSchedule : webSchedule,
      channelId: Capacitor.getPlatform() === 'android' ? CHANNEL_ID : undefined,
      autoCancel: true,
      extra: { route: '/practice' },
    }],
  });
}

export async function cancelStudyReminder(): Promise<void> {
  try {
    await LocalNotifications.cancel({
      notifications: [{ id: STUDY_REMINDER_ID }],
    });
  } catch {
    // Cancellation is best-effort when notifications are unavailable.
  }
}

export function initializeNotificationRouting(): void {
  if (routingInitialized) return;
  routingInitialized = true;
  void LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
    if (action.notification.extra?.route === '/practice') {
      window.location.hash = '/practice';
    }
  });
}

