import {Platform, PermissionsAndroid} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, {
  AndroidImportance,
  AndroidVisibility,
  AndroidForegroundServiceType,
} from '@notifee/react-native';

const BACKGROUND_LISTENING_KEY = 'dora:backgroundListening';

/**
 * Local notifications -- NOT push notifications. There is no cloud server
 * in Dora's design that a sender's message passes through, so there is
 * nothing for Firebase/APNs to relay; a notification can only come from
 * this phone noticing, on-device, that a message arrived over Bluetooth.
 * See the README's "background notifications" note for the full reasoning.
 *
 * Two independent pieces live here:
 *  1. displayMessageNotification -- fires the moment an incoming message
 *     is saved (wired from messageService.receiveMessage). Real today.
 *  2. The foreground service -- keeps the app process alive in the
 *     background on Android so there's something running to eventually
 *     notice a gateway connection and call (1). The persistent
 *     notification is required by Android for any foreground service;
 *     it cannot be hidden, by OS policy, since Android 8.
 *
 * iOS has no equivalent to an indefinite foreground service -- background
 * BLE central scanning there is short, throttled, and OS-controlled. This
 * file's foreground-service half is Android-only for that reason.
 */

const MESSAGES_CHANNEL_ID = 'dora-messages';
const LISTENING_CHANNEL_ID = 'dora-listening';

export async function ensureNotificationChannels() {
  if (Platform.OS !== 'android') return;

  await notifee.createChannel({
    id: MESSAGES_CHANNEL_ID,
    name: 'New messages',
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PRIVATE,
  });

  await notifee.createChannel({
    id: LISTENING_CHANNEL_ID,
    name: 'Listening for messages',
    importance: AndroidImportance.LOW, // quiet, no sound -- this one is persistent
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }
  if (Platform.OS === 'ios') {
    const settings = await notifee.requestPermission();
    return settings.authorizationStatus >= 1; // AUTHORIZED or PROVISIONAL
  }
  return true;
}

/**
 * Called wherever an incoming message actually gets saved. Today that's
 * only reachable via messageService.receiveMessage, which nothing calls
 * yet -- there's no gateway hardware producing real incoming messages.
 * The moment that exists, wiring it here is a one-line call, not a
 * redesign.
 */
export async function displayMessageNotification(params: {
  senderName: string;
  preview: string;
}) {
  await notifee.displayNotification({
    title: params.senderName,
    body: params.preview,
    android: {
      channelId: MESSAGES_CHANNEL_ID,
      pressAction: {id: 'default'},
    },
    ios: {
      sound: 'default',
    },
  });
}

let listeningNotificationId: string | null = null;

notifee.registerForegroundService(
  () =>
    new Promise(() => {
      // Intentionally never resolves -- the service runs until
      // stopForegroundService() explicitly calls notifee.stopForegroundService().
      // There is no real listening work to do yet (see ble.ts's stubbed
      // gateway hand-off); this keeps the process alive so that work has
      // somewhere to run once it exists.
    }),
);

export async function startBackgroundListening() {
  if (Platform.OS !== 'android') return; // no iOS equivalent, see file header
  await ensureNotificationChannels();

  listeningNotificationId = await notifee.displayNotification({
    title: 'Dora is listening',
    body: 'Watching for nearby gateways in the background',
    android: {
      channelId: LISTENING_CHANNEL_ID,
      asForegroundService: true,
      foregroundServiceTypes: [AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_CONNECTED_DEVICE],
      ongoing: true,
      colorized: true,
      pressAction: {id: 'default'},
    },
  });
}

export async function stopBackgroundListening() {
  if (Platform.OS !== 'android' || !listeningNotificationId) return;
  await notifee.stopForegroundService();
  listeningNotificationId = null;
}

/** Persisted so the service auto-restarts after the app is force-quit and reopened. */
export async function isBackgroundListeningEnabled(): Promise<boolean> {
  return (await AsyncStorage.getItem(BACKGROUND_LISTENING_KEY)) === 'true';
}

export async function setBackgroundListeningEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(BACKGROUND_LISTENING_KEY, enabled ? 'true' : 'false');
  if (enabled) {
    await startBackgroundListening();
  } else {
    await stopBackgroundListening();
  }
}
