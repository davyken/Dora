import {Platform, PermissionsAndroid} from 'react-native';
import {BleManager, type Device} from 'react-native-ble-plx';
import type {NearbyPeer} from '../types';

/**
 * ============================================================================
 * WHAT'S REAL HERE, AND WHAT ISN'T YET
 * ============================================================================
 * This file has two halves with very different maturity:
 *
 * 1. NEARBY SCANNING (real, works today): uses react-native-ble-plx, which
 *    implements the BLE *central* role. Point a phone with this code at any
 *    BLE peripheral advertising DORA_SERVICE_UUID -- a gateway node once
 *    that firmware exists, or a test peripheral -- and it will show up in
 *    the nearby list.
 *
 * 2. PHONE-AS-PERIPHERAL / GATEWAY PROTOCOL (stubbed): for two phones to
 *    see each other directly (no gateway between them), at least one side
 *    must *advertise* as a BLE peripheral, which react-native-ble-plx does
 *    not support. Android can do this via a separate library
 *    (react-native-ble-advertiser); iOS background peripheral advertising
 *    is heavily restricted by the OS. The actual gateway hand-off protocol
 *    (handshake, message framing, store-and-forward ack) also doesn't
 *    exist yet -- it has to be designed jointly with the gateway firmware,
 *    which needs real ESP32 + LoRa hardware to iterate against.
 *
 * Everything in section 2 is left as a clearly-marked stub so the rest of
 * the app (contacts, chat UI, encryption) can be built and demoed now,
 * and this file is the one place to fill in once gateway hardware exists.
 * ============================================================================
 */

export const DORA_SERVICE_UUID = 'd0ra0000-1234-4a5b-8c9d-0123456789ab';

const manager = new BleManager();

export async function requestBlePermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return true; // iOS prompts automatically

  if (Platform.Version >= 31) {
    const results = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
    ]);
    return Object.values(results).every(r => r === PermissionsAndroid.RESULTS.GRANTED);
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

/**
 * Starts scanning for anything advertising the Dora service UUID.
 * Calls `onPeerFound` every time a peer is seen (including repeat
 * sightings, so the caller can refresh a "last seen" timestamp).
 */
export function startNearbyScan(onPeerFound: (peer: NearbyPeer) => void): () => void {
  manager.startDeviceScan([DORA_SERVICE_UUID], {allowDuplicates: true}, (error, device) => {
    if (error) {
      console.warn('[ble] scan error', error);
      return;
    }
    if (!device) return;
    onPeerFound(deviceToPeer(device));
  });

  return () => manager.stopDeviceScan();
}

function deviceToPeer(device: Device): NearbyPeer {
  return {
    deviceId: device.id,
    rssi: device.rssi,
    // TODO(gateway-protocol): once gateway firmware exists, distinguish
    // gateways from phones via a manufacturer-data byte in the
    // advertisement instead of guessing.
    kind: 'unknown',
    lastSeenAt: Date.now(),
  };
}

// ---- Stubbed: gateway hand-off (needs real hardware to build against) -----

export interface GatewaySendResult {
  ok: boolean;
  reason?: string;
}

/**
 * TODO(gateway-protocol): connect to a gateway node over BLE and hand off
 * an encrypted envelope for mesh relay. Not implemented -- there is no
 * gateway firmware yet to connect to. See docs/lora-mesh-architecture.pdf
 * for the intended protocol (Bluetooth hand-off -> LoRa flood -> Bluetooth
 * delivery).
 */
export async function sendToNearestGateway(
  _envelopeJson: string,
): Promise<GatewaySendResult> {
  return {
    ok: false,
    reason: 'No gateway hardware connected yet -- this is a stub. See src/services/ble.ts.',
  };
}

export function destroyBleManager() {
  manager.destroy();
}
