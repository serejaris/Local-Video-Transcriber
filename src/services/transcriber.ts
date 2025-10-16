import { pipeline, AutomaticSpeechRecognitionPipeline } from '@xenova/transformers';

let transcriber: AutomaticSpeechRecognitionPipeline | null = null;

export async function initializeTranscriber(
  onProgress?: (status: string) => void
): Promise<AutomaticSpeechRecognitionPipeline> {
  if (transcriber) {
    return transcriber;
  }

  if (onProgress) {
    onProgress('Loading Whisper model...');
  }

  transcriber = await pipeline(
    'automatic-speech-recognition',
    'Xenova/whisper-tiny',
    {
      progress_callback: (progress: { status?: string; loaded?: number; total?: number }) => {
        if (onProgress && progress.status) {
          const status = progress.status === 'progress' && progress.loaded && progress.total
            ? `Loading model: ${Math.round((progress.loaded / progress.total) * 100)}%`
            : progress.status;
          onProgress(status);
        }
      }
    }
  );

  return transcriber;
}

async function decodeWavAudio(audioBlob: Blob): Promise<Float32Array> {
  const arrayBuffer = await audioBlob.arrayBuffer();
  const audioContext = new AudioContext({ sampleRate: 16000 });
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  return audioBuffer.getChannelData(0);
}

export async function transcribeAudio(
  audioBlob: Blob,
  onProgress?: (status: string) => void
): Promise<string> {
  const transcriber = await initializeTranscriber(onProgress);

  if (onProgress) {
    onProgress('Transcribing audio...');
  }

  const audioData = await decodeWavAudio(audioBlob);

  const result = await transcriber(audioData, {
    chunk_length_s: 30,
    stride_length_s: 5,
    return_timestamps: false,
  });

  return result.text;
}
