/**
 * Core domain types shared across Dora.
 *
 * Dora's addressing has no phone number and no server account: a user's
 * "address" is their public key, generated on-device at first install.
 * See src/services/identity.ts.
 */

export interface Identity {
  publicKey: string; // base64, this device's address
  secretKey: string; // base64, NEVER leaves the device
  displayName: string;
  createdAt: number;
}

export interface Contact {
  id: string; // == publicKey, used as the stable identifier
  publicKey: string;
  displayName: string;
  addedVia: 'qr-live' | 'qr-image' | 'link' | 'nearby';
  addedAt: number;
  lastKnownGatewayId?: string;
  lastSeenAt?: number;
}

export type MessageKind = 'text' | 'voice' | 'sticker';

export type MessageStatus =
  | 'draft'
  | 'queued' // waiting for a gateway connection
  | 'sent-to-gateway' // handed off, in the mesh
  | 'delivered' // recipient's device confirmed receipt
  | 'failed';

export interface DoraMessage {
  id: string;
  contactId: string; // conversation this belongs to
  direction: 'outgoing' | 'incoming';
  kind: MessageKind;
  text?: string; // also used for sticker id when kind === 'sticker'
  voiceUri?: string; // local file path to the recorded/received audio
  voiceDurationMs?: number;
  createdAt: number;
  status: MessageStatus;
}

/** A device advertising the Dora BLE service nearby right now. */
export interface NearbyPeer {
  deviceId: string;
  rssi: number | null;
  kind: 'gateway' | 'phone' | 'unknown';
  lastSeenAt: number;
}

/** Decoded payload of a dora://add link or profile QR code. */
export interface ContactInvite {
  publicKey: string;
  displayName: string;
}
