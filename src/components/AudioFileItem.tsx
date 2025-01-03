'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AudioFile } from '@/types/audio';
import { cn } from '@/lib/utils';
import Toast from './ui/Toast';
import { scaleUp } from '@/lib/animations';
import { PlayIcon, PauseIcon, ChevronDownIcon, ChevronUpIcon, WaveformIcon, CopyIcon } from './icons';

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

const contentAnimation = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
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

  const toggleExpand = () => {
    onToggleExpand(file.id);
  };

  return (
    <motion.div
      variants={scaleUp}
      layout="position"
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg shadow-sm border transition-all duration-200",
        {
          "border-gray-200 dark:border-gray-700": !file.isExpanded,
          "border-blue-200 dark:border-blue-800 shadow-md": file.isExpanded,
        }
      )}
    >
      <motion.div layout="preserve-aspect" className="p-4">
        <motion.div layout="position" className="flex items-center w-full">
          <div className="flex items-center space-x-4 flex-1">
            <button
              onClick={handlePlayPause}
              className={cn(
                'p-2 rounded-full transition-colors duration-200',
                isPlaying
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {isPlaying ? (
                <PauseIcon className="h-5 w-5" />
              ) : (
                <PlayIcon className="h-5 w-5" />
              )}
            </button>

            <div className="flex-1 space-y-1">
              <div 
                className="flex items-center cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                onClick={file.transcription ? toggleExpand : undefined}
              >
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {file.name}
                  </span>
                  {file.isCompressing && (
                    <span className="ml-2 text-xs text-blue-500 animate-pulse flex items-center">
                      <WaveformIcon className="w-3 h-3 mr-1" />
                      Compressing...
                    </span>
                  )}
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    {file.isCompressing ? (
                      `(${formatFileSize(file.originalSize)})`
                    ) : (
                      <>
                        (original: {formatFileSize(file.originalSize)}, 
                        compressed: {formatFileSize(file.compressedSize)})
                      </>
                    )}
                  </span>
                  {file.transcription && (file.isExpanded ? (
                    <ChevronUpIcon className="h-4 w-4 ml-1" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4 ml-1" />
                  ))}
                </div>
              </div>

              <div className="relative flex items-center flex-1">
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={handleProgressClick}
                >
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-100"
                      style={{ width: `${((file.currentTime || 0) / file.duration) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="ml-2 text-xs tabular-nums text-gray-500 dark:text-gray-400 min-w-[4ch] whitespace-nowrap">
                  {formatTime(file.currentTime || 0)}/{formatTime(file.duration)}
                </span>
              </div>
            </div>
          </div>

          <motion.div layout="position" className="flex items-center space-x-2">
            {!file.transcription && !file.isLoading && (
              <motion.button
                layout="position"
                onClick={handleTranscribe}
                disabled={file.isCompressing}
                className={cn(
                  "px-3 py-1.5 text-sm ml-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200",
                  file.isCompressing
                    ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                    : "text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600"
                )}
                whileHover={file.isCompressing ? {} : { scale: 1.1 }}
                whileTap={file.isCompressing ? {} : { scale: 0.9 }}
              >
                {file.isCompressing ? "Compressing..." : "Transcribe"}
              </motion.button>
            )}
            <motion.button
              layout="position"
              onClick={() => onDelete(file.id)}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-500 transition-colors duration-200"
              title="Delete"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </motion.button>
          </motion.div>
        </motion.div>

        <motion.div
          animate={{
            height: file.isExpanded ? "auto" : 0,
            opacity: file.isExpanded ? 1 : 0
          }}
          initial={{ height: 0, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
          className="overflow-hidden"
        >
          {file.isLoading && !file.transcription && (
            <motion.div
              variants={contentAnimation}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex items-center justify-center py-8"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="rounded-full h-8 w-8 border-2 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400"
              />
            </motion.div>
          )}

          {file.transcription && (
            <motion.div
              variants={contentAnimation}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative pt-4"
            >
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 whitespace-pre-wrap">{file.transcription}</div>
                  <div className="flex flex-col items-center gap-2 ml-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCopyTranscription}
                      className=" text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                      title="Copy transcription"
                    >
                      <CopyIcon className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

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
      </motion.div>
    </motion.div>
  );
};

export default AudioFileItem;
