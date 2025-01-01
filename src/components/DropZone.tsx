'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';

interface DropZoneProps {
  onTranscriptionComplete: (result: string) => void;
  onError: (error: string) => void;
  setIsLoading: (loading: boolean) => void;
}

const ACCEPTED_FILE_TYPES = {
  'audio/mp3': ['.mp3'],
  'audio/wav': ['.wav'],
  'audio/x-m4a': ['.m4a'],
  'audio/aac': ['.aac'],
};

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

const DropZone = ({
  onTranscriptionComplete,
  onError,
  setIsLoading,
}: DropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      if (!file) {
        onError('Please select a valid audio file.');
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        onError('File size exceeds 25MB limit.');
        return;
      }

      try {
        setIsLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Transcription failed');
        }

        const data = await response.json();
        onTranscriptionComplete(data.text);
      } catch {
        onError('Failed to transcribe audio. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [onTranscriptionComplete, onError, setIsLoading]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ease-in-out',
        {
          'border-gray-300 bg-gray-50 hover:border-gray-400': !isDragActive && !isDragReject,
          'border-blue-400 bg-blue-50': isDragActive && !isDragReject,
          'border-red-400 bg-red-50': isDragReject,
          'ring-2 ring-blue-400 ring-opacity-50': isDragging,
        }
      )}
    >
      <input {...getInputProps()} />
      <div className="space-y-4">
        <div className="flex justify-center">
          <svg
            className={cn('h-12 w-12 transition-colors duration-200', {
              'text-gray-400': !isDragActive && !isDragReject,
              'text-blue-400': isDragActive && !isDragReject,
              'text-red-400': isDragReject,
            })}
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="text-gray-600">
          <p className="text-sm font-medium">
            {isDragReject
              ? 'Invalid file type'
              : isDragActive
              ? 'Drop the file here'
              : 'Drag & drop an audio file here, or click to select'}
          </p>
          <p className="text-xs mt-2">
            Supports MP3, WAV, M4A, and AAC (max 25MB)
          </p>
        </div>
      </div>
    </div>
  );
};

export default DropZone;
