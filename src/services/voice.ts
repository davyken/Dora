import Sound, {
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  AVEncoderAudioQualityIOSType,
} from 'react-native-nitro-sound';
import RNFS from 'react-native-fs';

/**
 * Voice note recording and playback. Recordings are kept short and
 * low-bitrate on purpose: once real gateway hardware exists, every voice
 * note has to fit through a LoRa link that measures throughput in a
 * handful of kbps, so file size matters a lot more here than in a normal
 * chat app. AAC at a low quality setting keeps a 10s note to a few KB.
 */

const RECORDING_DIR = `${RNFS.CachesDirectoryPath}/dora-voice-notes`;

let currentRecordingPath: string | null = null;
let currentDurationMs = 0;

async function ensureDir() {
  const exists = await RNFS.exists(RECORDING_DIR);
  if (!exists) await RNFS.mkdir(RECORDING_DIR);
}

export async function startRecording(): Promise<void> {
  await ensureDir();
  const path = `${RECORDING_DIR}/${Date.now()}.aac`;
  currentDurationMs = 0;

  await Sound.startRecorder(path, {
    AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
    AudioSourceAndroid: AudioSourceAndroidType.MIC,
    AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.low,
    AVNumberOfChannelsKeyIOS: 1,
  });
  currentRecordingPath = path;

  Sound.addRecordBackListener(meta => {
    currentDurationMs = meta.currentPosition;
  });
}

export async function stopRecording(): Promise<{uri: string; durationMs: number} | null> {
  if (!currentRecordingPath) return null;

  await Sound.stopRecorder();
  Sound.removeRecordBackListener();

  const uri = currentRecordingPath;
  const durationMs = currentDurationMs;
  currentRecordingPath = null;
  currentDurationMs = 0;

  return {uri, durationMs};
}

export async function playVoiceNote(uri: string, onFinished?: () => void): Promise<void> {
  await Sound.startPlayer(uri);
  if (onFinished) {
    Sound.addPlaybackEndListener(() => {
      onFinished();
      Sound.removePlaybackEndListener();
    });
  }
}

export async function stopPlayback(): Promise<void> {
  await Sound.stopPlayer();
  Sound.removePlaybackEndListener();
}
