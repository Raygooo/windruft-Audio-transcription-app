'use client';

import { useState } from 'react';
import DropZone from '@/components/DropZone';
import AudioFileList from '@/components/AudioFileList';
import { AudioFile } from '@/types/audio';

export default function Home() {
  const [files, setFiles] = useState<AudioFile[]>([]);

  const handleFilesAdded = (newFiles: AudioFile[]) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const handleError = (error: string) => {
    // You can implement a proper error notification system here
    alert(error);
  };

  const handleTranscribe = async (id: string) => {
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.id === id ? { ...file, isLoading: true } : file
      )
    );

    const fileToTranscribe = files.find((file) => file.id === id);
    if (!fileToTranscribe) return;

    try {
      const formData = new FormData();
      formData.append('file', fileToTranscribe.file);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json();

      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.id === id
            ? { ...file, transcription: data.text, isLoading: false }
            : file
        )
      );
    } catch {
      handleError('Failed to transcribe audio. Please try again.');
      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.id === id ? { ...file, isLoading: false } : file
        )
      );
    }
  };

  const handleToggleExpand = (id: string) => {
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.id === id ? { ...file, isExpanded: !file.isExpanded } : file
      )
    );
  };

  const handleUpdateProgress = (id: string, currentTime: number) => {
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.id === id ? { ...file, currentTime } : file
      )
    );
  };

  const handleDelete = (id: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Audio Transcription
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Upload your audio files and get accurate transcriptions powered by OpenAI.
            </p>
          </div>

          <DropZone onFilesAdded={handleFilesAdded} onError={handleError} />

          <AudioFileList
            files={files}
            onTranscribe={handleTranscribe}
            onToggleExpand={handleToggleExpand}
            onUpdateProgress={handleUpdateProgress}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </main>
  );
}
