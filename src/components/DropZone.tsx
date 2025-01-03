'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { AudioFile } from '@/types/audio';
import { UploadIcon } from './icons';
import { compressAudioFile } from '@/lib/audioCompression';

interface DropZoneProps {
  onFilesAdded: (files: AudioFile[] | ((prevFiles: AudioFile[]) => AudioFile[])) => void;
  onError: (error: string) => void;
}

const ACCEPTED_FILE_TYPES = {
  'audio/mp3': ['.mp3'],
  'audio/wav': ['.wav'],
  'audio/x-m4a': ['.m4a'],
  'audio/aac': ['.aac'],
};

const MAX_FILE_SIZE = 100 * 1024 * 1024; // Allow larger initial files (100MB) since we'll check compressed size

const DropZone = ({ onFilesAdded, onError }: DropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Create initial files with unique IDs
      const initialFiles: AudioFile[] = acceptedFiles.map(file => ({
        id: crypto.randomUUID(),
        file,
        name: file.name,
        currentTime: 0,
        isLoading: false,
        isCompressing: true,
        duration: 0,
        progress: 0,
        isExpanded: false,
        transcription: null,
        originalSize: file.size,
        compressedSize: 0
      }));

      // Add initial files
      onFilesAdded(prevFiles => {
        const filesMap = new Map(prevFiles.map(file => [file.id, file]));
        initialFiles.forEach(file => filesMap.set(file.id, file));
        return Array.from(filesMap.values());
      });

      // Process files in background
      for (const [index, file] of acceptedFiles.entries()) {
        if (file.size > MAX_FILE_SIZE) {
          onError(`File ${file.name} exceeds 100MB limit.`);
          continue;
        }

        const currentFile = initialFiles[index];
        
        try {
          // Update initial state to show compression starting
          onFilesAdded(prevFiles =>
            prevFiles.map(f =>
              f.id === currentFile.id
                ? { ...f, isCompressing: true, progress: 0 }
                : f
            )
          );

          const { compressedFile, compressedSize } = await compressAudioFile(
            file,
            (progress) => {
              onFilesAdded(prevFiles =>
                prevFiles.map(f =>
                  f.id === currentFile.id
                    ? { ...f, progress: Math.round(progress * 100) }
                    : f
                )
              );
            }
          );

          // Create an audio element to get duration
          const audio = new Audio();
          const objectUrl = URL.createObjectURL(compressedFile);
          audio.src = objectUrl;

          await new Promise<void>((resolve, reject) => {
            const timeoutId = setTimeout(() => {
              URL.revokeObjectURL(objectUrl);
              reject(new Error('Timeout while loading audio metadata'));
            }, 5000);

            audio.addEventListener('loadedmetadata', () => {
              clearTimeout(timeoutId);
              URL.revokeObjectURL(objectUrl);
              
              // Update file with compression results
              onFilesAdded(prevFiles =>
                prevFiles.map(f =>
                  f.id === currentFile.id
                    ? {
                        ...f,
                        file: compressedFile,
                        duration: audio.duration,
                        isCompressing: false,
                        progress: 100,
                        compressedSize
                      }
                    : f
                )
              );
              resolve();
            });

            audio.addEventListener('error', () => {
              clearTimeout(timeoutId);
              URL.revokeObjectURL(objectUrl);
              reject(new Error('Error loading audio metadata'));
            });
          });

        } catch (error) {
          console.error('Error processing file:', error);
          onError(`Error processing ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          
          // Remove the failed file from the list
          onFilesAdded(prevFiles => prevFiles.filter(f => f.id !== currentFile.id));
        }
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
    <div className="relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-4 top-1/4 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl dark:bg-blue-600/10" />
        <div className="absolute -right-4 bottom-1/4 h-72 w-72 rounded-full bg-purple-400/10 blur-3xl dark:bg-purple-600/10" />
      </div>
      
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ease-in-out backdrop-blur-sm',
          {
            'border-gray-300 dark:border-gray-600 bg-gray-50/90 dark:bg-gray-800/50 hover:border-gray-400 dark:hover:border-gray-500': !isDragActive && !isDragReject,
            'border-blue-400 dark:border-blue-500 bg-blue-50/90 dark:bg-blue-950/30': isDragActive && !isDragReject,
            'border-red-400 dark:border-red-500 bg-red-50/90 dark:bg-red-950/30': isDragReject,
            'ring-2 ring-blue-400 dark:ring-blue-500 ring-opacity-50': isDragging,
          }
        )}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="flex justify-center">
            <UploadIcon
              className={cn('h-12 w-12 transition-colors duration-200', {
                'text-gray-400 dark:text-gray-500': !isDragActive && !isDragReject,
                'text-blue-400 dark:text-blue-500': isDragActive && !isDragReject,
                'text-red-400 dark:text-red-500': isDragReject,
              })}
            />
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            <p className="text-sm font-medium">
              {isDragReject
                ? 'Invalid file type'
                : isDragActive
                ? 'Drop the files here'
                : 'Drop audio files here or click to browse'}
            </p>
            <p className="text-xs mt-1">
              Supported formats: MP3, WAV, M4A, AAC (max 100MB)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DropZone;
