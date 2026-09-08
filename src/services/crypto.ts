import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';

/**
 * End-to-end encryption for message payloads, using NaCl's box
 * (Curve25519-XSalsa20-Poly1305). A gateway node only ever sees this
 * ciphertext plus the recipient's public key -- it cannot read content.
 */

export interface EncryptedEnvelope {
  ciphertext: string; // base64
  nonce: string; // base64
  senderPublicKey: string; // base64, so the recipient knows which key to decrypt with
}

export function encryptForRecipient(
  plaintext: string,
  recipientPublicKeyB64: string,
  mySecretKeyB64: string,
  myPublicKeyB64: string,
): EncryptedEnvelope {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const message = naclUtil.decodeUTF8(plaintext);
  const recipientPublicKey = naclUtil.decodeBase64(recipientPublicKeyB64);
  const mySecretKey = naclUtil.decodeBase64(mySecretKeyB64);

  const ciphertext = nacl.box(message, nonce, recipientPublicKey, mySecretKey);

  return {
    ciphertext: naclUtil.encodeBase64(ciphertext),
    nonce: naclUtil.encodeBase64(nonce),
    senderPublicKey: myPublicKeyB64,
  };
}

export function decryptFromSender(
  envelope: EncryptedEnvelope,
  mySecretKeyB64: string,
): string | null {
  const ciphertext = naclUtil.decodeBase64(envelope.ciphertext);
  const nonce = naclUtil.decodeBase64(envelope.nonce);
  const senderPublicKey = naclUtil.decodeBase64(envelope.senderPublicKey);
  const mySecretKey = naclUtil.decodeBase64(mySecretKeyB64);

  const plaintext = nacl.box.open(ciphertext, nonce, senderPublicKey, mySecretKey);
  if (!plaintext) return null; // tampered, wrong key, or corrupted in transit

  return naclUtil.encodeUTF8(plaintext);
}

/** Encrypts raw bytes (used for voice note files) the same way as text. */
export function encryptBytesForRecipient(
  bytes: Uint8Array,
  recipientPublicKeyB64: string,
  mySecretKeyB64: string,
  myPublicKeyB64: string,
): EncryptedEnvelope {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const recipientPublicKey = naclUtil.decodeBase64(recipientPublicKeyB64);
  const mySecretKey = naclUtil.decodeBase64(mySecretKeyB64);

  const ciphertext = nacl.box(bytes, nonce, recipientPublicKey, mySecretKey);

  return {
    ciphertext: naclUtil.encodeBase64(ciphertext),
    nonce: naclUtil.encodeBase64(nonce),
    senderPublicKey: myPublicKeyB64,
  };
}

export function decryptBytesFromSender(
  envelope: EncryptedEnvelope,
  mySecretKeyB64: string,
): Uint8Array | null {
  const ciphertext = naclUtil.decodeBase64(envelope.ciphertext);
  const nonce = naclUtil.decodeBase64(envelope.nonce);
  const senderPublicKey = naclUtil.decodeBase64(envelope.senderPublicKey);
  const mySecretKey = naclUtil.decodeBase64(mySecretKeyB64);

  return nacl.box.open(ciphertext, nonce, senderPublicKey, mySecretKey);
}
