import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, FlatList, Switch} from 'react-native';
import type {NearbyPeer} from '../types';
import {requestBlePermissions, startNearbyScan} from '../services/ble';
import {colors, spacing, radii, typography} from '../theme';

export default function NearbyScreen() {
  const [discoverable, setDiscoverable] = useState(false);
  const [peers, setPeers] = useState<Record<string, NearbyPeer>>({});
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    if (!discoverable) return;

    let stopScan: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      const granted = await requestBlePermissions();
      if (cancelled) return;
      if (!granted) {
        setPermissionDenied(true);
        return;
      }
      setPermissionDenied(false);
      stopScan = startNearbyScan(peer => {
        setPeers(prev => ({...prev, [peer.deviceId]: peer}));
      });
    })();

    return () => {
      cancelled = true;
      stopScan?.();
      setPeers({});
    };
  }, [discoverable]);

  const peerList = Object.values(peers).sort((a, b) => b.lastSeenAt - a.lastSeenAt);

  return (
    <View style={styles.screen}>
      <View style={styles.toggleRow}>
        <View style={{flex: 1}}>
          <Text style={styles.toggleTitle}>Discoverable</Text>
          <Text style={styles.toggleSubtitle}>
            Off by default. Turning this on lets nearby Dora phones see you, and lets you see them.
          </Text>
        </View>
        <Switch value={discoverable} onValueChange={setDiscoverable} trackColor={{true: colors.accent}} />
      </View>

      {permissionDenied && (
        <Text style={styles.notice}>Bluetooth permission is required to see nearby devices.</Text>
      )}

      {discoverable && peerList.length === 0 && !permissionDenied && (
        <Text style={styles.notice}>
          Scanning… nothing found yet. This finds devices advertising the Dora Bluetooth
          service — gateway nodes, or other phones once peer-to-peer advertising ships.
        </Text>
      )}

      <FlatList
        data={peerList}
        keyExtractor={p => p.deviceId}
        contentContainerStyle={{padding: spacing.lg}}
        renderItem={({item}) => (
          <View style={styles.peerRow}>
            <View>
              <Text style={styles.peerId}>{item.deviceId}</Text>
              <Text style={styles.peerMeta}>
                {item.kind === 'unknown' ? 'Unidentified Dora device' : item.kind} · RSSI {item.rssi ?? '—'}
              </Text>
            </View>
          </View>
        )}
      />

      <Text style={styles.footnote}>
        Resolving a nearby device into an addable contact requires the gateway hand-off protocol,
        which needs real hardware to finish — see docs/lora-mesh-architecture.pdf. For now, this
        list shows raw detections only.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.bg},
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: colors.surface,
  },
  toggleTitle: {...typography.body, fontWeight: '700'},
  toggleSubtitle: {...typography.subtitle, fontSize: 13, marginTop: 2},
  notice: {...typography.subtitle, padding: spacing.lg, fontSize: 13, lineHeight: 19},
  peerRow: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  peerId: {...typography.body, fontFamily: 'monospace', fontSize: 13},
  peerMeta: {...typography.subtitle, fontSize: 12, marginTop: 2},
  footnote: {
    ...typography.subtitle,
    fontSize: 11,
    padding: spacing.lg,
    lineHeight: 16,
  },
});
