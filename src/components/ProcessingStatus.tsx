import React from 'react';
import { Headphones, FileText } from 'lucide-react';
interface ProcessingStatusProps {
  status: string;
  fileName?: string;
}
export function ProcessingStatus({
  status,
  fileName
}: ProcessingStatusProps) {
  return <div className="space-y-3">
      {fileName && <p className="text-xs truncate opacity-70">{fileName}</p>}
      <div className="w-full h-1 bg-secondary relative overflow-hidden rounded-full">
        <div className="absolute top-0 left-0 h-full bg-primary w-3/4 animate-pulse rounded-full"></div>
      </div>
      <div className="flex gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${status === 'extracting' ? 'bg-primary' : 'bg-primary/10'}`}>
            <Headphones size={10} className={status === 'extracting' ? 'text-primary-foreground' : 'text-primary'} />
          </div>
          <p className="text-[10px]">
            {status === 'extracting' ? 'Извлечение...' : ''}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${status === 'transcribing' ? 'bg-primary' : 'bg-primary/10'}`}>
            <FileText size={10} className={status === 'transcribing' ? 'text-primary-foreground' : 'text-primary'} />
          </div>
          <p className="text-[10px]">
            {status === 'transcribing' ? 'Транскрибирование...' : ''}
          </p>
        </div>
      </div>
    </div>;
}