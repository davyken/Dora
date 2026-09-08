import React, {useState} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import type {DoraMessage} from '../types';
import {playVoiceNote, stopPlayback} from '../services/voice';
import {colors, spacing, radii} from '../theme';

const STATUS_LABEL: Record<DoraMessage['status'], string> = {
  draft: '',
  queued: 'Queued',
  'sent-to-gateway': 'Sent',
  delivered: 'Delivered',
  failed: 'Failed',
};

export default function MessageBubble({message}: {message: DoraMessage}) {
  const [playing, setPlaying] = useState(false);
  const mine = message.direction === 'outgoing';

  const onTogglePlay = async () => {
    if (!message.voiceUri) return;
    if (playing) {
      await stopPlayback();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    await playVoiceNote(message.voiceUri, () => setPlaying(false));
  };

  return (
    <View style={[styles.row, mine ? styles.rowMine : styles.rowTheirs]}>
      <View
        style={[
          styles.bubble,
          mine ? styles.bubbleMine : styles.bubbleTheirs,
          message.kind === 'sticker' && styles.bubbleSticker,
        ]}>
        {message.kind === 'text' && (
          <Text style={[styles.text, mine && styles.textMine]}>{message.text}</Text>
        )}

        {message.kind === 'sticker' && <Text style={styles.sticker}>{message.text}</Text>}

        {message.kind === 'voice' && (
          <Pressable onPress={onTogglePlay} style={styles.voiceRow}>
            <Text style={[styles.playIcon, mine && styles.textMine]}>{playing ? '⏸' : '▶'}</Text>
            <View style={[styles.waveform, mine && styles.waveformMine]} />
            <Text style={[styles.duration, mine && styles.textMine]}>
              {Math.round((message.voiceDurationMs ?? 0) / 1000)}s
            </Text>
          </Pressable>
        )}

        {mine && message.kind !== 'sticker' && (
          <Text style={styles.status}>{STATUS_LABEL[message.status]}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {marginBottom: spacing.sm, flexDirection: 'row'},
  rowMine: {justifyContent: 'flex-end'},
  rowTheirs: {justifyContent: 'flex-start'},
  bubble: {
    maxWidth: '78%',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  bubbleMine: {backgroundColor: colors.accent, borderBottomRightRadius: 4},
  bubbleTheirs: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderBottomLeftRadius: 4,
  },
  bubbleSticker: {backgroundColor: 'transparent', borderWidth: 0, paddingHorizontal: 0},
  text: {color: colors.ink, fontSize: 15},
  textMine: {color: '#FFFFFF'},
  sticker: {fontSize: 44},
  status: {fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 4, alignSelf: 'flex-end'},
  voiceRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minWidth: 140},
  playIcon: {fontSize: 16, color: colors.ink},
  waveform: {flex: 1, height: 3, borderRadius: 2, backgroundColor: colors.line},
  waveformMine: {backgroundColor: 'rgba(255,255,255,0.5)'},
  duration: {fontSize: 12, color: colors.inkMuted},
});
