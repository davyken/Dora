import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {colors} from '../theme';

import OnboardingScreen from '../screens/OnboardingScreen';
import ContactsScreen from '../screens/ContactsScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddContactScreen from '../screens/AddContactScreen';
import ScanContactScreen from '../screens/ScanContactScreen';
import NearbyScreen from '../screens/NearbyScreen';
import SettingsScreen from '../screens/SettingsScreen';
import type {Contact} from '../types';

export type RootStackParamList = {
  Onboarding: undefined;
  Contacts: undefined;
  Chat: {contact: Contact};
  Profile: undefined;
  AddContact: undefined;
  ScanContact: undefined;
  Nearby: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator({initialRoute}: {initialRoute: keyof RootStackParamList}) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: {backgroundColor: colors.surface},
          headerTintColor: colors.ink,
          headerTitleStyle: {fontWeight: '700'},
          contentStyle: {backgroundColor: colors.bg},
        }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{headerShown: false}} />
        <Stack.Screen name="Contacts" component={ContactsScreen} options={{title: 'Dora'}} />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={({route}) => ({title: route.params.contact.displayName})}
        />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{title: 'My Code'}} />
        <Stack.Screen name="AddContact" component={AddContactScreen} options={{title: 'Add Contact'}} />
        <Stack.Screen name="ScanContact" component={ScanContactScreen} options={{title: 'Scan Code'}} />
        <Stack.Screen name="Nearby" component={NearbyScreen} options={{title: 'Nearby'}} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{title: 'Settings'}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
