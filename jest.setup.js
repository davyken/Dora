import 'react-native-gesture-handler/jestSetup';

// A minimal in-memory stand-in for AsyncStorage. The package's own bundled
// mock has moved paths across major versions; this tiny version covers the
// handful of methods Dora actually calls (see src/services/storage.ts and
// src/services/identity.ts) without depending on that internal path.
jest.mock('@react-native-async-storage/async-storage', () => {
  let store = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(key => Promise.resolve(store[key] ?? null)),
      setItem: jest.fn((key, value) => {
        store[key] = value;
        return Promise.resolve();
      }),
      removeItem: jest.fn(key => {
        delete store[key];
        return Promise.resolve();
      }),
      clear: jest.fn(() => {
        store = {};
        return Promise.resolve();
      }),
    },
  };
});

jest.mock('react-native-ble-plx', () => ({
  BleManager: jest.fn().mockImplementation(() => ({
    startDeviceScan: jest.fn(),
    stopDeviceScan: jest.fn(),
    destroy: jest.fn(),
  })),
}));

jest.mock('react-native-camera-kit', () => ({
  Camera: 'Camera',
}));

jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    createChannel: jest.fn().mockResolvedValue('channel-id'),
    displayNotification: jest.fn().mockResolvedValue('notification-id'),
    requestPermission: jest.fn().mockResolvedValue({authorizationStatus: 1}),
    registerForegroundService: jest.fn(),
    stopForegroundService: jest.fn().mockResolvedValue(undefined),
  },
  AndroidImportance: {HIGH: 4, LOW: 2, DEFAULT: 3},
  AndroidVisibility: {PRIVATE: 0, PUBLIC: 1, SECRET: -1},
  AndroidForegroundServiceType: {FOREGROUND_SERVICE_TYPE_CONNECTED_DEVICE: 16},
}));

jest.mock('react-native-fs', () => ({
  CachesDirectoryPath: '/tmp',
  exists: jest.fn().mockResolvedValue(true),
  mkdir: jest.fn().mockResolvedValue(undefined),
  stat: jest.fn().mockResolvedValue({size: 0}),
}));

jest.mock('react-native-nitro-sound', () => ({
  __esModule: true,
  default: {
    startRecorder: jest.fn(),
    stopRecorder: jest.fn(),
    startPlayer: jest.fn(),
    stopPlayer: jest.fn(),
    addRecordBackListener: jest.fn(),
    removeRecordBackListener: jest.fn(),
    addPlaybackEndListener: jest.fn(),
    removePlaybackEndListener: jest.fn(),
  },
  AudioEncoderAndroidType: {AAC: 3},
  AudioSourceAndroidType: {MIC: 1},
  AVEncoderAudioQualityIOSType: {low: 32},
}));
