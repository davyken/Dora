module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(' +
      [
        '@react-native',
        'react-native',
        'react-native-gesture-handler',
        'react-native-screens',
        'react-native-safe-area-context',
        'react-native-svg',
        'react-native-qrcode-svg',
        'react-native-camera-kit',
        'react-native-ble-plx',
        'react-native-nitro-sound',
        'react-native-nitro-modules',
        'react-native-fs',
        'react-native-uuid',
        'react-native-get-random-values',
        '@react-native-async-storage',
        '@notifee/react-native',
        '@react-navigation',
      ].join('|') +
      ')/)',
  ],
};
