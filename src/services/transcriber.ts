import { pipeline, AutomaticSpeechRecognitionPipeline, env } from '@xenova/transformers';

env.allowLocalModels = false;
env.allowRemoteModels = true;
env.useBrowserCache = true;

let transcriber: AutomaticSpeechRecognitionPipeline | null = null;

export async function initializeTranscriber(
  onProgress?: (status: string) => void
): Promise<AutomaticSpeechRecognitionPipeline> {
  if (transcriber) {
    return transcriber;
  }

  if (onProgress) {
    onProgress('Loading Whisper model (this may take a minute on first use)...');
  }

  try {
    console.log('Attempting to load Whisper model from HuggingFace...');
    
    transcriber = await pipeline(
      'automatic-speech-recognition',
      'Xenova/whisper-tiny',
      {
        quantized: false,
        progress_callback: (progress: { status?: string; loaded?: number; total?: number; file?: string }) => {
          if (onProgress && progress.status) {
            if (progress.file) {
              console.log(`Loading file: ${progress.file}`);
            }
            const status = progress.status === 'progress' && progress.loaded && progress.total
              ? `Loading model: ${Math.round((progress.loaded / progress.total) * 100)}%`
              : progress.status === 'done' 
              ? 'Model loaded successfully'
              : progress.status === 'initiate'
              ? 'Starting model download...'
              : progress.status;
            onProgress(status);
          }
        }
      }
    );
    
    console.log('Whisper model loaded successfully');
  } catch (error) {
    console.error('Failed to load Whisper model:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('JSON') || error.message.includes('doctype')) {
        throw new Error('Failed to download the transcription model from HuggingFace. The CDN may be temporarily unavailable or blocked by your network. Please check:\n1. Can you access huggingface.co in your browser?\n2. Are you behind a firewall or VPN?\n3. Try clearing your browser cache and reloading.');
      }
      throw new Error(`Failed to load transcription model: ${error.message}`);
    }
    
    throw new Error('Failed to load the transcription model. Please check your internet connection and try again.');
  }

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
