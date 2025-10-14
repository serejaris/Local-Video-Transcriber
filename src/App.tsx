import React, { useState } from 'react';
import { VideoUploader } from './components/VideoUploader';
import { TranscriptionViewer } from './components/TranscriptionViewer';
import { ProcessingStatus } from './components/ProcessingStatus';
export function App() {
  const [file, setFile] = useState<File | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  const [status, setStatus] = useState<string>('idle'); // idle, extracting, transcribing, done, error
  const [error, setError] = useState<string>('');
  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    setStatus('extracting');
    setError('');
    // Simulate audio extraction
    setTimeout(() => {
      setStatus('transcribing');
      // Create a dummy audio blob for demonstration
      const dummyAudioBlob = new Blob([], {
        type: 'audio/mp3'
      });
      setAudioBlob(dummyAudioBlob);
      // Simulate transcription
      setTimeout(() => {
        setStatus('done');
        setTranscription('Это пример транскрипции аудио из вашего видео. В реальном приложении здесь будет отображаться настоящая расшифровка речи из загруженного видео.\n\nThis is an example transcription of the audio from your video. In a real application, this would display the actual speech transcription from the uploaded video.');
      }, 2000);
    }, 2000);
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
          {(status === 'extracting' || status === 'transcribing') && <ProcessingStatus status={status} fileName={file?.name} />}
          {status === 'done' && <TranscriptionViewer fileName={file?.name || ''} transcription={transcription} onReset={handleReset} />}
        </div>
      </main>
      <footer className="w-full py-1 border-t text-center text-[10px] text-muted-foreground shrink-0">
        Локально • Local
      </footer>
    </div>;
}