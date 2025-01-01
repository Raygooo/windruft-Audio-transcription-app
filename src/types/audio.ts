export interface AudioFile {
  id: string;
  file: File;
  name: string;
  size: number;
  duration: number;
  transcription?: string;
  isLoading?: boolean;
  isExpanded?: boolean;
  isPlaying?: boolean;
  currentTime?: number;
}

export interface AudioProgress {
  currentTime: number;
  duration: number;
}
