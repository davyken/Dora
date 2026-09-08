import naclUtil from 'tweetnacl-util';
import type {ContactInvite} from '../types';

/**
 * The three "add a contact" paths (live QR scan, a screenshot of the QR
 * sent through any app, or a plain-text link) all carry the exact same
 * payload -- a public key + display name. This is the single place that
 * encodes/decodes it, so all three stay in sync.
 */

const LINK_SCHEME = 'dora://add';

export function encodeContactPayload(invite: ContactInvite): string {
  const json = JSON.stringify(invite);
  return naclUtil.encodeBase64(naclUtil.decodeUTF8(json));
}

export function decodeContactPayload(payload: string): ContactInvite | null {
  try {
    const json = naclUtil.encodeUTF8(naclUtil.decodeBase64(payload));
    const parsed = JSON.parse(json);
    if (typeof parsed.publicKey === 'string' && typeof parsed.displayName === 'string') {
      return parsed as ContactInvite;
    }
    return null;
  } catch {
    return null;
  }
}

/** What the QR code itself encodes. */
export function buildQrValue(invite: ContactInvite): string {
  return `${LINK_SCHEME}?p=${encodeContactPayload(invite)}`;
}

/** A plain-text-safe link, forwardable through any chat app. */
export function buildShareLink(invite: ContactInvite): string {
  return buildQrValue(invite);
}

/** Parses either a scanned QR value or a tapped dora:// link. */
export function parseContactLink(value: string): ContactInvite | null {
  const trimmed = value.trim();
  if (!trimmed.startsWith(LINK_SCHEME)) return null;

  const queryIndex = trimmed.indexOf('?p=');
  if (queryIndex === -1) return null;

  const payload = trimmed.slice(queryIndex + 3);
  return decodeContactPayload(decodeURIComponent(payload));
}
