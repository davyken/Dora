import React, {useEffect, useState} from 'react';
import {View, Text, TextInput, Pressable, StyleSheet, ScrollView} from 'react-native';
import {getOrCreateIdentity, updateDisplayName} from '../services/identity';
import {colors, spacing, radii, typography} from '../theme';

export default function SettingsScreen() {
  const [name, setName] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    getOrCreateIdentity().then(identity => setName(identity.displayName));
  }, []);

  const onSave = async () => {
    await updateDisplayName(name.trim());
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 1500);
  };

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.label}>Display name</Text>
      <TextInput value={name} onChangeText={setName} style={styles.input} />
      <Pressable onPress={onSave} style={({pressed}) => [styles.button, pressed && {opacity: 0.85}]}>
        <Text style={styles.buttonText}>{savedNotice ? 'Saved' : 'Save'}</Text>
      </Pressable>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>About Dora</Text>
      <Text style={styles.about}>
        Dora relays text, voice notes, and stickers between phones without a SIM card, mobile
        internet, or airtime credit — hopping over Bluetooth to nearby gateway nodes, then across
        town over long-range LoRa radio. Version 0.0.1 ships the identity, contacts, and chat
        experience; the gateway network itself is still being built. See
        docs/lora-mesh-architecture.pdf in this repo for the full design.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {flexGrow: 1, backgroundColor: colors.bg, padding: spacing.lg},
  label: {...typography.body, fontWeight: '600', marginBottom: spacing.sm},
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.ink,
    marginBottom: spacing.md,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: 13,
    alignItems: 'center',
  },
  buttonText: {color: '#fff', fontWeight: '700'},
  divider: {height: 1, backgroundColor: colors.line, marginVertical: spacing.xl},
  sectionTitle: {...typography.body, fontWeight: '700', marginBottom: spacing.sm},
  about: {...typography.subtitle, lineHeight: 20},
});
