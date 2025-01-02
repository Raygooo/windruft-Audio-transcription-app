'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import DropZone from '@/components/DropZone';
import AudioFileList from '@/components/AudioFileList';
import { AudioFile } from '@/types/audio';
import Toast from '@/components/ui/Toast';
import { slideUp, staggerContainer } from '@/lib/animations';

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
    <motion.main
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"
    >
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.div variants={slideUp} className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300"
            >
              Audio Transcription
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mt-3 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto"
            >
              Transform your audio into text with AI-powered transcription.
              Upload your files and get accurate results in seconds.
            </motion.p>
          </motion.div>

          <motion.div
            variants={slideUp}
            className="relative"
          >
            <AudioFileList
              files={files}
              onTranscribe={handleTranscribe}
              onToggleExpand={handleToggleExpand}
              onUpdateProgress={handleUpdateProgress}
              onDelete={handleDelete}
            />
          </motion.div>

          <motion.div
            variants={slideUp}
            className="relative"
          >
            <DropZone onFilesAdded={handleFilesAdded} onError={handleError} />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-100/0 via-blue-100/50 to-blue-100/0 dark:from-blue-900/0 dark:via-blue-900/30 dark:to-blue-900/0 blur-xl"
            />
          </motion.div>

          {showErrorToast && (
            <Toast
              message={errorMessage}
              type="error"
              onClose={() => setShowErrorToast(false)}
            />
          )}
        </motion.div>
      </div>
    </motion.main>
  );
}
