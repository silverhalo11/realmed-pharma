import Constants from 'expo-constants';
import { Platform } from 'react-native';

// expo-notifications throws (and logs console.error) in Expo Go on Android SDK 53+.
// We skip the import entirely when running inside Expo Go to avoid the red overlay.
// Notifications will work correctly in a standalone APK / development build.

let Notifications: typeof import('expo-notifications') | null = null;

const isExpoGo = Constants.appOwnership === 'expo';

if (!isExpoGo && Platform.OS !== 'web') {
  // Suppress any internal console.error from the module init
  const _err = console.error;
  console.error = () => {};
  try {
    Notifications = require('expo-notifications');
  } catch {
    Notifications = null;
  } finally {
    console.error = _err;
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Notifications) return false;
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function scheduleVisitNotification(
  _visitId: string,
  doctorName: string,
  doctorClinic: string,
  date: string,
  time: string,
): Promise<string | null> {
  if (!Notifications || !time) return null;
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return null;

    const [h, m] = time.split(':').map(Number);
    const [year, month, day] = date.split('-').map(Number);
    const trigger = new Date(year, month - 1, day, h, m, 0, 0);
    if (trigger <= new Date()) return null;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🏥 Visit Reminder',
        body: `You have a visit with Dr. ${doctorName}${doctorClinic ? ` at ${doctorClinic}` : ''}`,
        sound: true,
        data: { doctorName },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: trigger },
    });
    return id;
  } catch {
    return null;
  }
}

export async function cancelVisitNotification(notificationId?: string): Promise<void> {
  if (!Notifications || !notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // ignore
  }
}

export function setupNotificationHandler(): void {
  if (!Notifications) return;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch {
    // ignore
  }
}
