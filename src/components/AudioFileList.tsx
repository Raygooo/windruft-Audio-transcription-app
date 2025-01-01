'use client';

import { AudioFile } from '@/types/audio';
import AudioFileItem from './AudioFileItem';

interface AudioFileListProps {
  files: AudioFile[];
  onTranscribe: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onUpdateProgress: (id: string, currentTime: number) => void;
  onDelete: (id: string) => void;
}

const AudioFileList = ({
  files,
  onTranscribe,
  onToggleExpand,
  onUpdateProgress,
  onDelete,
}: AudioFileListProps) => {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {files.map((file) => (
        <AudioFileItem
          key={file.id}
          file={file}
          onTranscribe={onTranscribe}
          onToggleExpand={onToggleExpand}
          onUpdateProgress={onUpdateProgress}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default AudioFileList;
