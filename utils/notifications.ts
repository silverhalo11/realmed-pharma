import Constants from 'expo-constants';
import { Platform } from 'react-native';

// expo-notifications throws (and logs console.error) in Expo Go on Android SDK 53+.
// We skip the import entirely when running inside Expo Go to avoid the red overlay.
// Notifications will work correctly in a standalone APK / development build.

let Notifications: typeof import('expo-notifications') | null = null;

const isExpoGo = Constants.appOwnership === 'expo';

if (!isExpoGo && Platform.OS !== 'web') {
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

const CHANNEL_ID = 'realmed-visits';

export function setupNotificationHandler(): void {
  if (!Notifications) return;
  try {
    // Must set handler before anything else
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    // Android 8+ requires a notification channel — without this notifications are silent
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Visit Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 300, 200, 300],
        lightColor: '#0ea5e9',
        sound: 'default',
        enableLights: true,
        enableVibrate: true,
        showBadge: true,
      });
    }
  } catch {
    // ignore
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
        body: `Visit with Dr. ${doctorName}${doctorClinic ? ` at ${doctorClinic}` : ''} is scheduled now.`,
        sound: 'default',
        data: { doctorName },
        // Android: link to the channel so it plays sound + vibrates
        ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: trigger,
      },
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
