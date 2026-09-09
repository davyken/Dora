/**
 * Dora -- messaging with no SIM, no internet, no airtime credit.
 * @format
 */

import 'react-native-gesture-handler';
import React, {useEffect, useState} from 'react';
import {StatusBar, useColorScheme, ActivityIndicator, View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RootNavigator from './src/navigation/RootNavigator';
import {colors} from './src/theme';
import {
  ensureNotificationChannels,
  isBackgroundListeningEnabled,
  startBackgroundListening,
} from './src/services/notifications';
import {checkForUpdate, confirmBoot} from './src/services/otaUpdate';

export default function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [initialRoute, setInitialRoute] = useState<'Onboarding' | 'Contacts' | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('dora:identity').then(raw => {
      setInitialRoute(raw ? 'Contacts' : 'Onboarding');
    });

    ensureNotificationChannels();
    // The foreground service notification doesn't survive an app process
    // restart on its own -- if the user had background listening on, put
    // it back up now.
    isBackgroundListeningEnabled().then(enabled => {
      if (enabled) startBackgroundListening();
    });

    // This launch rendered fine, so any OTA bundle it booted with is good.
    confirmBoot();
    // Pull down the next update in the background, if any; applies on next launch.
    checkForUpdate();
  }, []);

  if (!initialRoute) {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg}}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <RootNavigator initialRoute={initialRoute} />
    </SafeAreaProvider>
  );
}
