import RNFS from 'react-native-fs';

/**
 * Silent JS-only updates. On every push to main, CI bundles the JS and
 * publishes it (plus a manifest) to the `ota-latest` branch. On launch, the
 * app compares the manifest's commit against what it last applied and, if
 * newer, downloads the bundle in the background for next launch -- no APK,
 * no install prompt.
 *
 * This only ever replaces JS. A change that touches native code (new native
 * module, permission, RN/Gradle upgrade) still needs a real APK from a
 * tagged release; the manifest carries no signal for that, so it's a
 * judgment call left to whoever cuts the release.
 */

const MANIFEST_URL =
  'https://raw.githubusercontent.com/davyken/Dora/ota-latest/manifest.json';

const OTA_DIR = `${RNFS.DocumentDirectoryPath}/ota`;
const BUNDLE_PATH = `${OTA_DIR}/index.android.bundle`;
const BUNDLE_TMP_PATH = `${OTA_DIR}/index.android.bundle.tmp`;
const APPLIED_COMMIT_PATH = `${OTA_DIR}/applied_commit.txt`;
// Mirrors the marker MainApplication.kt writes before handing the OTA
// bundle to React Native, and clears once the JS side confirms it booted.
const BOOT_PENDING_PATH = `${OTA_DIR}/boot_pending`;

type Manifest = {
  commit: string;
  bundleUrl: string;
};

/** Call once the app has rendered successfully, so a bad update doesn't get re-applied after a crash. */
export async function confirmBoot(): Promise<void> {
  try {
    if (await RNFS.exists(BOOT_PENDING_PATH)) {
      await RNFS.unlink(BOOT_PENDING_PATH);
    }
  } catch (e) {
    console.warn('[ota] confirmBoot failed', e);
  }
}

/** Fire-and-forget: check for a newer JS bundle and download it for next launch. */
export async function checkForUpdate(): Promise<void> {
  try {
    const res = await fetch(`${MANIFEST_URL}?t=${Date.now()}`);
    if (!res.ok) return;
    const manifest: Manifest = await res.json();
    if (!manifest?.commit || !manifest?.bundleUrl) return;

    const appliedCommit = (await RNFS.exists(APPLIED_COMMIT_PATH))
      ? (await RNFS.readFile(APPLIED_COMMIT_PATH, 'utf8')).trim()
      : null;
    if (manifest.commit === appliedCommit) return;

    await RNFS.mkdir(OTA_DIR);

    const {statusCode} = await RNFS.downloadFile({
      fromUrl: manifest.bundleUrl,
      toFile: BUNDLE_TMP_PATH,
    }).promise;
    if (statusCode !== 200) throw new Error(`download failed: HTTP ${statusCode}`);

    const stat = await RNFS.stat(BUNDLE_TMP_PATH);
    if (stat.size < 1000) throw new Error(`downloaded bundle looks too small (${stat.size} bytes)`);

    if (await RNFS.exists(BUNDLE_PATH)) await RNFS.unlink(BUNDLE_PATH);
    await RNFS.moveFile(BUNDLE_TMP_PATH, BUNDLE_PATH);
    await RNFS.writeFile(APPLIED_COMMIT_PATH, manifest.commit, 'utf8');
    // Takes effect on next app launch -- MainApplication.kt picks up
    // BUNDLE_PATH if present.
  } catch (e) {
    console.warn('[ota] update check failed', e);
  }
}
