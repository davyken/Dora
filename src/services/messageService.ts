import uuid from 'react-native-uuid';
import type {Contact, DoraMessage} from '../types';
import {getOrCreateIdentity} from './identity';
import {encryptForRecipient} from './crypto';
import {saveMessage, updateMessageStatus} from './storage';
import {sendToNearestGateway} from './ble';

/**
 * Ties together identity, encryption, local storage, and the (currently
 * stubbed) gateway hand-off into the six-step lifecycle described in
 * docs/lora-mesh-architecture.pdf:
 *
 *   1. compose & encrypt  2. hand off over Bluetooth  3. flood the mesh
 *   4. buffer if offline  5. deliver over Bluetooth    6. ack (optional)
 *
 * Steps 1 and the local half of the lifecycle are real. Steps 2-6 depend
 * on gateway hardware that doesn't exist yet (see src/services/ble.ts),
 * so a sent message will currently sit at "queued" -- that's expected
 * and correctly reflects the real state of the system, not a bug.
 */

async function attemptHandoff(message: DoraMessage, envelopeJson: string) {
  const result = await sendToNearestGateway(envelopeJson);
  await updateMessageStatus(message.id, result.ok ? 'sent-to-gateway' : 'queued');
}

export async function sendTextMessage(contact: Contact, text: string): Promise<DoraMessage> {
  const me = await getOrCreateIdentity();
  const envelope = encryptForRecipient(text, contact.publicKey, me.secretKey, me.publicKey);

  const message: DoraMessage = {
    id: uuid.v4() as string,
    contactId: contact.id,
    direction: 'outgoing',
    kind: 'text',
    text,
    createdAt: Date.now(),
    status: 'queued',
  };

  await saveMessage(message);
  void attemptHandoff(message, JSON.stringify(envelope));
  return message;
}

export async function sendStickerMessage(contact: Contact, stickerId: string): Promise<DoraMessage> {
  const me = await getOrCreateIdentity();
  const envelope = encryptForRecipient(stickerId, contact.publicKey, me.secretKey, me.publicKey);

  const message: DoraMessage = {
    id: uuid.v4() as string,
    contactId: contact.id,
    direction: 'outgoing',
    kind: 'sticker',
    text: stickerId,
    createdAt: Date.now(),
    status: 'queued',
  };

  await saveMessage(message);
  void attemptHandoff(message, JSON.stringify(envelope));
  return message;
}

export async function sendVoiceMessage(
  contact: Contact,
  voiceUri: string,
  voiceDurationMs: number,
): Promise<DoraMessage> {
  const message: DoraMessage = {
    id: uuid.v4() as string,
    contactId: contact.id,
    direction: 'outgoing',
    kind: 'voice',
    voiceUri,
    voiceDurationMs,
    createdAt: Date.now(),
    status: 'queued',
  };

  await saveMessage(message);
  // TODO(gateway-protocol): once the gateway hand-off exists, encrypt and
  // chunk the audio file the same way text envelopes are handled above --
  // voice notes need fragmentation given LoRa's tiny packet size.
  void attemptHandoff(message, '');
  return message;
}
