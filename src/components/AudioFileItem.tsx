'use client';

import { useRef, useState, useEffect } from 'react';
import { AudioFile } from '@/types/audio';
import { cn } from '@/lib/utils';
import Toast from './ui/Toast';

interface AudioFileItemProps {
  file: AudioFile;
  onTranscribe: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onUpdateProgress: (id: string, currentTime: number) => void;
  onDelete: (id: string) => void;
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const AudioFileItem = ({ file, onTranscribe, onToggleExpand, onUpdateProgress, onDelete }: AudioFileItemProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const url = URL.createObjectURL(file.file);
    setAudioUrl(url);

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [file.file]);

  const handlePlayPause = async () => {
    if (audioRef.current) {
      try {
        if (isPlaying) {
          await audioRef.current.pause();
        } else {
          await audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      onUpdateProgress(file.id, audioRef.current.currentTime);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const progressBar = e.currentTarget;
      const rect = progressBar.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      const newTime = percentage * file.duration;
      audioRef.current.currentTime = newTime;
      onUpdateProgress(file.id, newTime);
    }
  };

  const handleTranscribe = () => {
    onTranscribe(file.id);
    onToggleExpand(file.id); // Auto expand when transcribing
  };

  const handleCopyTranscription = () => {
    if (file.transcription) {
      navigator.clipboard.writeText(file.transcription);
      setShowToast(true);
    }
  };

  return (
    <div className={cn(
      "bg-white rounded-lg shadow-sm border transition-all duration-200",
      {
        "border-gray-200": !file.isExpanded,
        "border-blue-200 shadow-md": file.isExpanded,
      }
    )}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePlayPause}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-full text-white transition-all duration-200",
                {
                  'bg-blue-500 hover:bg-blue-600 scale-100': !isPlaying,
                  'bg-green-500 hover:bg-green-600 scale-95': isPlaying,
                  'opacity-50 cursor-not-allowed': !audioUrl,
                }
              )}
              disabled={!audioUrl}
            >
              {isPlaying ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            <div>
              <h3 className="text-sm font-medium text-gray-900">{file.name}</h3>
              <p className="text-xs text-gray-500">
                {formatFileSize(file.size)} • {formatTime(file.duration)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!file.transcription && !file.isLoading && (
              <button
                onClick={handleTranscribe}
                className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Transcribe
              </button>
            )}
            {(file.transcription || file.isLoading) && (
              <button
                onClick={() => onToggleExpand(file.id)}
                className={cn(
                  "p-2 text-gray-400 hover:text-gray-600 transition-transform duration-200",
                  { "rotate-180": file.isExpanded }
                )}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
            <button
              onClick={() => onDelete(file.id)}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
              title="Delete"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="mt-3">
          <div
            className="h-2 bg-gray-100 rounded-full cursor-pointer overflow-hidden"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-200"
              style={{
                width: `${((file.currentTime || 0) / file.duration) * 100}%`,
              }}
            />
          </div>
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>{formatTime(file.currentTime || 0)}</span>
            <span>{formatTime(file.duration)}</span>
          </div>
        </div>
      </div>

      {file.isExpanded && (
        <div className={cn(
          "px-4 pb-4 transition-all duration-300",
          { "opacity-50": file.isLoading }
        )}>
          {file.isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600" />
            </div>
          )}

          {file.transcription && (
            <div className="relative mt-2 bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 whitespace-pre-wrap pr-12">
                {file.transcription}
              </div>
              <button
                onClick={handleCopyTranscription}
                className="absolute bottom-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                title="Copy transcription"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}

      {showToast && (
        <Toast
          message="Transcription copied to clipboard!"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default AudioFileItem;
