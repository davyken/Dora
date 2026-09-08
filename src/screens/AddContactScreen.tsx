import React, {useState} from 'react';
import {View, Text, StyleSheet, Pressable, TextInput, Alert} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/RootNavigator';
import {parseContactLink} from '../services/contactLink';
import {upsertContact} from '../services/storage';
import {colors, spacing, radii, typography} from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AddContact'>;

export default function AddContactScreen({navigation}: Props) {
  const [pasted, setPasted] = useState('');

  const onAddFromPaste = async () => {
    const invite = parseContactLink(pasted);
    if (!invite) {
      Alert.alert('Not a Dora code', "That doesn't look like a valid Dora contact link.");
      return;
    }
    await upsertContact({
      id: invite.publicKey,
      publicKey: invite.publicKey,
      displayName: invite.displayName,
      addedVia: 'link',
      addedAt: Date.now(),
    });
    Alert.alert('Contact added', `${invite.displayName} is now in your contacts.`, [
      {text: 'OK', onPress: () => navigation.popToTop()},
    ]);
  };

  return (
    <View style={styles.screen}>
      <Option
        title="Scan a QR code"
        subtitle="Live, in person — the most direct way"
        onPress={() => navigation.navigate('ScanContact')}
      />
      <Option
        title="Show my QR code"
        subtitle="Let someone else scan you instead"
        onPress={() => navigation.navigate('Profile')}
      />
      <Option
        title="People nearby"
        subtitle="See who else is running Dora around you right now"
        onPress={() => navigation.navigate('Nearby')}
      />

      <Text style={styles.orLabel}>OR PASTE A CODE THEY SENT YOU</Text>
      <TextInput
        value={pasted}
        onChangeText={setPasted}
        placeholder="dora://add?p=…"
        placeholderTextColor={colors.inkMuted}
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Pressable
        onPress={onAddFromPaste}
        disabled={!pasted.trim()}
        style={({pressed}) => [
          styles.button,
          !pasted.trim() && styles.buttonDisabled,
          pressed && styles.buttonPressed,
        ]}>
        <Text style={styles.buttonText}>Add from pasted code</Text>
      </Pressable>
    </View>
  );
}

function Option({title, subtitle, onPress}: {title: string; subtitle: string; onPress: () => void}) {
  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [styles.option, pressed && styles.buttonPressed]}>
      <Text style={styles.optionTitle}>{title}</Text>
      <Text style={styles.optionSubtitle}>{subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.bg, padding: spacing.lg},
  option: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  optionTitle: {...typography.body, fontWeight: '700', marginBottom: 2},
  optionSubtitle: {...typography.subtitle, fontSize: 13},
  orLabel: {...typography.label, marginTop: spacing.lg, marginBottom: spacing.sm},
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {opacity: 0.4},
  buttonPressed: {opacity: 0.85},
  buttonText: {color: '#FFFFFF', fontWeight: '700'},
});
