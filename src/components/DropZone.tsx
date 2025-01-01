'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { AudioFile } from '@/types/audio';

interface DropZoneProps {
  onFilesAdded: (files: AudioFile[]) => void;
  onError: (error: string) => void;
}

const ACCEPTED_FILE_TYPES = {
  'audio/mp3': ['.mp3'],
  'audio/wav': ['.wav'],
  'audio/x-m4a': ['.m4a'],
  'audio/aac': ['.aac'],
};

const MAX_FILE_SIZE = 64 * 1024 * 1024; // 64MB

const DropZone = ({ onFilesAdded, onError }: DropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const processedFiles: AudioFile[] = [];

      for (const file of acceptedFiles) {
        if (file.size > MAX_FILE_SIZE) {
          onError(`File ${file.name} exceeds 64MB limit.`);
          continue;
        }

        // Create an audio element to get duration
        const audio = new Audio();
        const objectUrl = URL.createObjectURL(file);

        try {
          await new Promise((resolve, reject) => {
            audio.addEventListener('loadedmetadata', () => {
              URL.revokeObjectURL(objectUrl);
              resolve(audio.duration);
            });
            audio.addEventListener('error', reject);
            audio.src = objectUrl;
          });

          processedFiles.push({
            id: crypto.randomUUID(),
            file,
            name: file.name,
            size: file.size,
            duration: audio.duration,
            currentTime: 0,
            isExpanded: false,
            isPlaying: false,
          });
        } catch {
          onError(`Failed to process file ${file.name}`);
        }
      }

      if (processedFiles.length > 0) {
        onFilesAdded(processedFiles);
      }
    },
    [onFilesAdded, onError]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
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
              ? 'Drop the files here'
              : 'Drag & drop audio files here, or click to select'}
          </p>
          <p className="text-xs mt-2">
            Supports MP3, WAV, M4A, and AAC (max 64MB)
          </p>
        </div>
      </div>
    </div>
  );
};

export default DropZone;
