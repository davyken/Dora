import React, {useCallback, useState} from 'react';
import {View, Text, StyleSheet, FlatList, Pressable} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/RootNavigator';
import type {Contact} from '../types';
import {listContacts} from '../services/storage';
import {colors, spacing, radii, typography} from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Contacts'>;

export default function ContactsScreen({navigation}: Props) {
  const [contacts, setContacts] = useState<Contact[]>([]);

  useFocusEffect(
    useCallback(() => {
      listContacts().then(setContacts);
    }, []),
  );

  return (
    <View style={styles.screen}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.navigate('Profile')} hitSlop={8}>
          <Text style={styles.headerLink}>My code</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Settings')} hitSlop={8}>
          <Text style={styles.headerLink}>Settings</Text>
        </Pressable>
      </View>

      {contacts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No contacts yet</Text>
          <Text style={styles.emptySubtitle}>
            Add someone by scanning their code, sharing yours, or checking who's nearby.
          </Text>
        </View>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={c => c.id}
          contentContainerStyle={{padding: spacing.lg}}
          renderItem={({item}) => (
            <Pressable
              onPress={() => navigation.navigate('Chat', {contact: item})}
              style={({pressed}) => [styles.row, pressed && {opacity: 0.7}]}>
              <View style={styles.avatar}>
                <Text style={styles.avatarLetter}>{item.displayName.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.rowName}>{item.displayName}</Text>
                <Text style={styles.rowMeta}>
                  {item.publicKey.slice(0, 10)}… · added via {item.addedVia}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}

      <Pressable
        onPress={() => navigation.navigate('AddContact')}
        style={({pressed}) => [styles.fab, pressed && {opacity: 0.85}]}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.bg},
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  headerLink: {color: colors.accent, fontWeight: '600'},
  empty: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl},
  emptyTitle: {...typography.body, fontWeight: '700', marginBottom: spacing.xs},
  emptySubtitle: {...typography.subtitle, textAlign: 'center', lineHeight: 20},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {color: colors.accent, fontWeight: '800'},
  rowName: {...typography.body, fontWeight: '700'},
  rowMeta: {...typography.subtitle, fontSize: 12, fontFamily: 'monospace'},
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
  },
  fabText: {color: '#fff', fontSize: 28, fontWeight: '600', marginTop: -2},
});
