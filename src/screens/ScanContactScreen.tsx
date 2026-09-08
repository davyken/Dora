import React, {useCallback, useRef, useState} from 'react';
import {View, Text, StyleSheet, Alert} from 'react-native';
import {Camera} from 'react-native-camera-kit';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/RootNavigator';
import {parseContactLink} from '../services/contactLink';
import {upsertContact} from '../services/storage';
import {colors, spacing, typography} from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ScanContact'>;

export default function ScanContactScreen({navigation}: Props) {
  const [scanned, setScanned] = useState(false);
  const handledRef = useRef(false);

  const handleCode = useCallback(
    async (value: string) => {
      if (handledRef.current) return;
      const invite = parseContactLink(value);
      if (!invite) return; // not a Dora code — ignore and keep scanning

      handledRef.current = true;
      setScanned(true);

      await upsertContact({
        id: invite.publicKey,
        publicKey: invite.publicKey,
        displayName: invite.displayName,
        addedVia: 'qr-live',
        addedAt: Date.now(),
      });

      Alert.alert('Contact added', `${invite.displayName} is now in your contacts.`, [
        {text: 'OK', onPress: () => navigation.popToTop()},
      ]);
    },
    [navigation],
  );

  return (
    <View style={styles.screen}>
      <Camera
        style={StyleSheet.absoluteFill}
        scanBarcode
        onReadCode={event => handleCode(event.nativeEvent.codeStringValue)}
        showFrame
        laserColor={colors.accent}
        frameColor={colors.surface}
      />
      <View style={styles.overlay}>
        <Text style={styles.hint}>
          {scanned ? 'Got it…' : "Point the camera at your contact's Dora code"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#000'},
  overlay: {
    position: 'absolute',
    bottom: 48,
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
  },
  hint: {
    ...typography.body,
    color: '#fff',
    backgroundColor: 'rgba(22,50,63,0.75)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    overflow: 'hidden',
  },
});
