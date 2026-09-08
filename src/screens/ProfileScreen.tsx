import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Pressable, Share, ScrollView} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {getOrCreateIdentity} from '../services/identity';
import {buildQrValue, buildShareLink} from '../services/contactLink';
import type {Identity} from '../types';
import {colors, spacing, radii, typography} from '../theme';

export default function ProfileScreen() {
  const [identity, setIdentity] = useState<Identity | null>(null);

  useEffect(() => {
    getOrCreateIdentity().then(setIdentity);
  }, []);

  if (!identity) return null;

  const qrValue = buildQrValue({publicKey: identity.publicKey, displayName: identity.displayName});
  const shortAddress = `${identity.publicKey.slice(0, 8)}…${identity.publicKey.slice(-6)}`;

  const onShareLink = () => {
    const link = buildShareLink({publicKey: identity.publicKey, displayName: identity.displayName});
    Share.share({
      message: `Add me on Dora — ${identity.displayName}\n${link}`,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.name}>{identity.displayName}</Text>
      <Text style={styles.address}>{shortAddress}</Text>

      <View style={styles.qrCard}>
        <QRCode value={qrValue} size={220} color={colors.ink} backgroundColor={colors.surface} />
      </View>

      <Text style={styles.hint}>
        Someone can scan this live, or you can send it as an image or link through any app you
        already have — they'll be able to add you from that, no internet needed afterward.
      </Text>

      <Pressable
        onPress={onShareLink}
        style={({pressed}) => [styles.button, pressed && styles.buttonPressed]}>
        <Text style={styles.buttonText}>Share my code as a link</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {flexGrow: 1, backgroundColor: colors.bg, alignItems: 'center', padding: spacing.lg},
  name: {...typography.title, marginTop: spacing.md},
  address: {...typography.subtitle, fontFamily: 'monospace', marginBottom: spacing.lg},
  qrCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: spacing.lg,
  },
  hint: {
    ...typography.subtitle,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  buttonPressed: {opacity: 0.85},
  buttonText: {color: '#FFFFFF', fontWeight: '700', fontSize: 15},
});
