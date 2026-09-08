import React, {useState} from 'react';
import {View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/RootNavigator';
import {getOrCreateIdentity, updateDisplayName} from '../services/identity';
import {colors, spacing, radii, typography} from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export default function OnboardingScreen({navigation}: Props) {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  const onContinue = async () => {
    if (!name.trim()) return;
    setBusy(true);
    await getOrCreateIdentity(name.trim());
    await updateDisplayName(name.trim());
    setBusy(false);
    navigation.reset({index: 0, routes: [{name: 'Contacts'}]});
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>WELCOME TO</Text>
        <Text style={styles.title}>Dora</Text>
        <Text style={styles.dek}>
          Messaging that doesn't need a SIM card, mobile internet, or airtime credit.
          Your identity lives only on this phone — there's no account to create.
        </Text>

        <Text style={styles.label}>What should people call you?</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Aïcha"
          placeholderTextColor={colors.inkMuted}
          style={styles.input}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={onContinue}
        />

        <Pressable
          onPress={onContinue}
          disabled={!name.trim() || busy}
          style={({pressed}) => [
            styles.button,
            (!name.trim() || busy) && styles.buttonDisabled,
            pressed && styles.buttonPressed,
          ]}>
          <Text style={styles.buttonText}>{busy ? 'Setting up…' : 'Get started'}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.bg, justifyContent: 'center'},
  content: {paddingHorizontal: spacing.lg},
  eyebrow: {...typography.label, marginBottom: spacing.xs},
  title: {fontSize: 40, fontWeight: '800', color: colors.ink, marginBottom: spacing.sm},
  dek: {...typography.subtitle, marginBottom: spacing.xl, lineHeight: 21},
  label: {...typography.body, fontWeight: '600', marginBottom: spacing.sm},
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.ink,
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonDisabled: {opacity: 0.4},
  buttonPressed: {opacity: 0.85},
  buttonText: {color: '#FFFFFF', fontSize: 16, fontWeight: '700'},
});
