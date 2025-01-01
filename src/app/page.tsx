'use client';

import { useState } from 'react';
import DropZone from '@/components/DropZone';
import AudioFileList from '@/components/AudioFileList';
import { AudioFile } from '@/types/audio';
import Toast from '@/components/ui/Toast';

export default function Home() {
  const [files, setFiles] = useState<AudioFile[]>([]);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFilesAdded = (newFiles: AudioFile[]) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const handleError = (error: string) => {
    setErrorMessage(error);
    setShowErrorToast(true);
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
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Audio Transcription
            </h1>
            <p className="mt-3 text-lg text-gray-500 max-w-2xl mx-auto">
              Transform your audio into text with AI-powered transcription. 
              Upload your files and get accurate results in seconds.
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

          {showErrorToast && (
            <Toast
              message={errorMessage}
              type="error"
              onClose={() => setShowErrorToast(false)}
            />
          )}
        </div>
      </div>
    </main>
  );
}
