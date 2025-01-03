export interface AudioFile {
  id: string;
  file: File;
  name: string;
  currentTime: number;
  isLoading: boolean;
  isCompressing: boolean; // New state for compression status
  duration: number;
  progress: number;
  isExpanded: boolean;
  transcription: string | null;
  originalSize: number;
  compressedSize: number;
}