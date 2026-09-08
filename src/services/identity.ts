import 'react-native-get-random-values';
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {Identity} from '../types';

const IDENTITY_KEY = 'dora:identity';

let cached: Identity | null = null;

/**
 * Every Dora install generates its own Curve25519 keypair on first launch.
 * The public key IS the user's address -- there is no phone number, no
 * account, no server that issues one. The secret key never leaves the
 * device and is never transmitted anywhere.
 *
 * NOTE: for the scaffold this is stored in AsyncStorage (plaintext on
 * disk). Before shipping, move the secret key into Keychain (iOS) /
 * Keystore (Android) via a library like react-native-keychain -- that is
 * a drop-in replacement for this one function.
 */
export async function getOrCreateIdentity(defaultName = 'New Dora user'): Promise<Identity> {
  if (cached) return cached;

  const raw = await AsyncStorage.getItem(IDENTITY_KEY);
  if (raw) {
    cached = JSON.parse(raw) as Identity;
    return cached;
  }

  const keyPair = nacl.box.keyPair();
  const identity: Identity = {
    publicKey: naclUtil.encodeBase64(keyPair.publicKey),
    secretKey: naclUtil.encodeBase64(keyPair.secretKey),
    displayName: defaultName,
    createdAt: Date.now(),
  };

  await AsyncStorage.setItem(IDENTITY_KEY, JSON.stringify(identity));
  cached = identity;
  return identity;
}

export async function updateDisplayName(displayName: string): Promise<Identity> {
  const identity = await getOrCreateIdentity();
  const updated: Identity = {...identity, displayName};
  await AsyncStorage.setItem(IDENTITY_KEY, JSON.stringify(updated));
  cached = updated;
  return updated;
}

/** Test-only escape hatch; not used by the app itself. */
export function _resetIdentityCache() {
  cached = null;
}
