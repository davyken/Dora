/**
 * Stickers are single emoji for the MVP -- one character, so an encrypted
 * envelope for a sticker is smaller than almost any text message, which
 * matters once these travel over a LoRa link. Swap this list, or replace
 * it with real image assets, once the Dora logo/art direction exists;
 * nothing else in the app needs to change since a sticker is just stored
 * as message.text with kind === 'sticker'.
 */
export const STICKERS: string[] = [
  '👋', '🙏', '❤️', '😂', '😢', '😮', '👍', '👎',
  '🔥', '🎉', '📍', '⏰', '☀️', '🌧️', '🔋', '📶',
];
