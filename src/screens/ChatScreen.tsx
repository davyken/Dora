import React, {useCallback, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/RootNavigator';
import type {DoraMessage} from '../types';
import {listMessagesForContact} from '../services/storage';
import {sendTextMessage, sendVoiceMessage, sendStickerMessage} from '../services/messageService';
import {startRecording, stopRecording} from '../services/voice';
import {STICKERS} from '../services/stickers';
import MessageBubble from '../components/MessageBubble';
import {colors, spacing, radii} from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export default function ChatScreen({route}: Props) {
  const {contact} = route.params;
  const [messages, setMessages] = useState<DoraMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [recording, setRecording] = useState(false);
  const [stickerPickerOpen, setStickerPickerOpen] = useState(false);
  const listRef = useRef<FlatList<DoraMessage>>(null);

  const reload = useCallback(() => {
    listMessagesForContact(contact.id).then(setMessages);
  }, [contact.id]);

  useFocusEffect(reload);

  const onSendText = async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    await sendTextMessage(contact, text);
    reload();
  };

  const onSendSticker = async (sticker: string) => {
    setStickerPickerOpen(false);
    await sendStickerMessage(contact, sticker);
    reload();
  };

  const onHoldMic = async () => {
    setRecording(true);
    await startRecording();
  };

  const onReleaseMic = async () => {
    setRecording(false);
    const result = await stopRecording();
    if (result) {
      await sendVoiceMessage(contact, result.uri, result.durationMs);
      reload();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={m => m.id}
        contentContainerStyle={{padding: spacing.lg}}
        renderItem={({item}) => <MessageBubble message={item} />}
        onContentSizeChange={() => listRef.current?.scrollToEnd({animated: true})}
      />

      <View style={styles.inputBar}>
        <Pressable onPress={() => setStickerPickerOpen(true)} style={styles.iconButton}>
          <Text style={styles.iconText}>🙂</Text>
        </Pressable>

        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Message"
          placeholderTextColor={colors.inkMuted}
          style={styles.input}
          multiline
        />

        {draft.trim() ? (
          <Pressable onPress={onSendText} style={styles.sendButton}>
            <Text style={styles.sendText}>Send</Text>
          </Pressable>
        ) : (
          <Pressable
            onPressIn={onHoldMic}
            onPressOut={onReleaseMic}
            style={[styles.iconButton, recording && styles.iconButtonActive]}>
            <Text style={styles.iconText}>{recording ? '●' : '🎙'}</Text>
          </Pressable>
        )}
      </View>

      <Modal visible={stickerPickerOpen} transparent animationType="slide">
        <Pressable style={styles.modalBackdrop} onPress={() => setStickerPickerOpen(false)}>
          <View style={styles.stickerSheet}>
            <View style={styles.stickerGrid}>
              {STICKERS.map(sticker => (
                <Pressable key={sticker} onPress={() => onSendSticker(sticker)} style={styles.stickerCell}>
                  <Text style={styles.stickerEmoji}>{sticker}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.bg},
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    backgroundColor: colors.bg,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    maxHeight: 100,
    color: colors.ink,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonActive: {backgroundColor: colors.accentSoft},
  iconText: {fontSize: 20},
  sendButton: {
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: {color: '#fff', fontWeight: '700'},
  modalBackdrop: {flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(22,50,63,0.4)'},
  stickerSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing.lg,
  },
  stickerGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm},
  stickerCell: {
    width: '22%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    borderRadius: radii.md,
  },
  stickerEmoji: {fontSize: 30},
});
