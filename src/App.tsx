import React, { useState } from 'react';
import { VideoUploader } from './components/VideoUploader';
import { TranscriptionViewer } from './components/TranscriptionViewer';
import { ProcessingStatus } from './components/ProcessingStatus';
import { extractAudioFromVideo } from './services/audioExtractor';
import { transcribeAudio } from './services/transcriber';
export function App() {
  const [file, setFile] = useState<File | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  const [status, setStatus] = useState<string>('idle'); // idle, extracting, transcribing, done, error
  const [error, setError] = useState<string>('');
  const [progressMessage, setProgressMessage] = useState<string>('');
  const handleFileUpload = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setStatus('extracting');
    setError('');
    setProgressMessage('Initializing FFmpeg...');
    
    try {
      const audio = await extractAudioFromVideo(uploadedFile, (progress) => {
        setProgressMessage(`Extracting audio: ${progress}%`);
      });
      
      setAudioBlob(audio);
      setStatus('transcribing');
      
      const text = await transcribeAudio(audio, (statusMsg) => {
        setProgressMessage(statusMsg);
      });
      
      setTranscription(text);
      setStatus('done');
      setProgressMessage('');
    } catch (err) {
      console.error('Error processing video:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during processing');
      setStatus('error');
      setProgressMessage('');
    }
  };
  const handleReset = () => {
    setFile(null);
    setAudioBlob(null);
    setTranscription('');
    setStatus('idle');
    setError('');
  };
  return <div className="flex flex-col w-full h-screen bg-background text-foreground overflow-hidden">
      <main className="flex-1 p-2 overflow-auto">
        <div className="max-w-xl mx-auto">
          {status !== 'idle' && status !== 'error' && <div className="flex justify-end mb-1">
              <button onClick={handleReset} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                ↺
              </button>
            </div>}
          {(status === 'idle' || status === 'error') && <VideoUploader onFileUpload={handleFileUpload} error={error} />}
          {(status === 'extracting' || status === 'transcribing') && <ProcessingStatus status={status} fileName={file?.name} progressMessage={progressMessage} />}
          {status === 'done' && <TranscriptionViewer fileName={file?.name || ''} transcription={transcription} onReset={handleReset} />}
        </div>
      </main>
      <footer className="w-full py-1 border-t text-center text-[10px] text-muted-foreground shrink-0">
        Локально • Local
      </footer>
    </div>;
}
