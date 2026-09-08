import AsyncStorage from '@react-native-async-storage/async-storage';
import type {Contact, DoraMessage} from '../types';

/**
 * Local persistence for contacts and messages.
 *
 * This uses AsyncStorage with the whole list read/written per call, which
 * is fine at the scale of one person's contact list and message history.
 * If that ever becomes a bottleneck, swap this file for a SQLite-backed
 * version (e.g. react-native-sqlite-storage) -- nothing outside this file
 * needs to change, since screens only ever import the functions below.
 */

const CONTACTS_KEY = 'dora:contacts';
const MESSAGES_KEY = 'dora:messages';

// ---- Contacts ----------------------------------------------------------

export async function listContacts(): Promise<Contact[]> {
  const raw = await AsyncStorage.getItem(CONTACTS_KEY);
  return raw ? (JSON.parse(raw) as Contact[]) : [];
}

export async function upsertContact(contact: Contact): Promise<void> {
  const contacts = await listContacts();
  const idx = contacts.findIndex(c => c.id === contact.id);
  if (idx >= 0) {
    contacts[idx] = contact;
  } else {
    contacts.push(contact);
  }
  await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
}

export async function getContact(id: string): Promise<Contact | undefined> {
  const contacts = await listContacts();
  return contacts.find(c => c.id === id);
}

export async function removeContact(id: string): Promise<void> {
  const contacts = await listContacts();
  await AsyncStorage.setItem(
    CONTACTS_KEY,
    JSON.stringify(contacts.filter(c => c.id !== id)),
  );
}

// ---- Messages ------------------------------------------------------------

export async function listMessagesForContact(contactId: string): Promise<DoraMessage[]> {
  const all = await listAllMessages();
  return all
    .filter(m => m.contactId === contactId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export async function listAllMessages(): Promise<DoraMessage[]> {
  const raw = await AsyncStorage.getItem(MESSAGES_KEY);
  return raw ? (JSON.parse(raw) as DoraMessage[]) : [];
}

export async function saveMessage(message: DoraMessage): Promise<void> {
  const all = await listAllMessages();
  const idx = all.findIndex(m => m.id === message.id);
  if (idx >= 0) {
    all[idx] = message;
  } else {
    all.push(message);
  }
  await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(all));
}

export async function updateMessageStatus(
  id: string,
  status: DoraMessage['status'],
): Promise<void> {
  const all = await listAllMessages();
  const idx = all.findIndex(m => m.id === id);
  if (idx === -1) return;
  all[idx] = {...all[idx], status};
  await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(all));
}
