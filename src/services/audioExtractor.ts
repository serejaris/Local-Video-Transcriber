export async function extractAudioFromVideo(
  videoFile: File,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  try {
    if (onProgress) {
      onProgress(10);
    }

    const audioContext = new AudioContext({ sampleRate: 16000 });
    const arrayBuffer = await videoFile.arrayBuffer();
    
    if (onProgress) {
      onProgress(40);
    }

    let audioBuffer: AudioBuffer;
    try {
      audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
    } catch (error) {
      throw new Error('Failed to extract audio from video. The video might not contain an audio track or the format is not supported by your browser.');
    }
    
    if (onProgress) {
      onProgress(60);
    }

    const offlineContext = new OfflineAudioContext(
      1,
      audioBuffer.duration * 16000,
      16000
    );

    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineContext.destination);
    source.start();

    const renderedBuffer = await offlineContext.startRendering();
    
    if (onProgress) {
      onProgress(80);
    }

    const wavBlob = audioBufferToWav(renderedBuffer);
    
    if (onProgress) {
      onProgress(100);
    }
    
    return wavBlob;
  } catch (error) {
    console.error('Audio extraction error:', error);
    throw error;
  }
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const length = buffer.length * buffer.numberOfChannels * 2 + 44;
  const arrayBuffer = new ArrayBuffer(length);
  const view = new DataView(arrayBuffer);
  const channels = [];
  let offset = 0;
  let pos = 0;

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }

  setUint32(0x46464952);
  setUint32(length - 8);
  setUint32(0x45564157);
  setUint32(0x20746d66);
  setUint32(16);
  setUint16(1);
  setUint16(buffer.numberOfChannels);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels);
  setUint16(buffer.numberOfChannels * 2);
  setUint16(16);
  setUint32(0x61746164);
  setUint32(length - pos - 4);

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < length) {
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      const sample = Math.max(-1, Math.min(1, channels[i][offset]));
      view.setInt16(pos, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}
