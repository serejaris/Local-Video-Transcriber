import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, AlertCircle } from 'lucide-react';
interface VideoUploaderProps {
  onFileUpload: (file: File) => void;
  error?: string;
}
export function VideoUploader({
  onFileUpload,
  error
}: VideoUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type.startsWith('video/')) {
        onFileUpload(file);
      } else {
        // Handle non-video file
        console.error('Please upload a video file');
      }
    }
  }, [onFileUpload]);
  const {
    getRootProps,
    getInputProps,
    isDragActive
  } = useDropzone({
    onDrop,
    accept: {
      'video/*': []
    },
    maxFiles: 1
  });
  return <div className="space-y-2">
      <div {...getRootProps()} className={`border border-dashed rounded-md p-4 text-center transition-colors duration-200 cursor-pointer ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/20 hover:border-primary/50'}`}>
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-1">
          <Upload size={24} className={isDragActive ? 'text-primary' : 'text-muted-foreground'} />
          <p className="text-xs">
            {isDragActive ? 'Отпустите' : 'Видео → Текст'}
          </p>
        </div>
      </div>
      {error && <div className="bg-destructive/10 text-destructive p-2 rounded-md flex items-start gap-2 text-xs">
          <AlertCircle size={12} className="shrink-0 mt-0.5" />
          <div>
            <p>{error}</p>
          </div>
        </div>}
    </div>;
}