import React from 'react';
import { Copy } from 'lucide-react';
interface TranscriptionViewerProps {
  fileName: string;
  transcription: string;
  onReset: () => void;
}
export function TranscriptionViewer({
  fileName,
  transcription,
  onReset
}: TranscriptionViewerProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(transcription);
  };
  return <div className="space-y-2">
      <div className="flex justify-between items-center">
        <p className="text-xs truncate opacity-70 max-w-[70%]">{fileName}</p>
        <button onClick={handleCopy} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
          <Copy size={10} />
        </button>
      </div>
      <div className="border border-border rounded-md p-2 whitespace-pre-line text-xs max-h-[calc(100vh-80px)] overflow-y-auto">
        {transcription}
      </div>
    </div>;
}