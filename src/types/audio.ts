export interface AudioFile {
  id: string;
  file: File;
  name: string;
  currentTime: number;
  isLoading: boolean;
  duration: number;
  progress: number;
  isExpanded: boolean;
  transcription: string | null;
  originalSize: number;
  compressedSize: number;
}