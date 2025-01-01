'use client';

import { useState } from 'react';
import DropZone from '@/components/DropZone';
import TranscriptionResult from '@/components/TranscriptionResult';

export default function Home() {
  const [transcription, setTranscription] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleTranscriptionComplete = (result: string) => {
    setTranscription(result);
    setError('');
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setTranscription('');
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
              <svg
                className="h-6 w-6 text-gray-500"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Audio Transcription
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Convert your audio files to text using AI-powered transcription
          </p>
        </div>

        <div className="mt-10">
          <DropZone
            onTranscriptionComplete={handleTranscriptionComplete}
            onError={handleError}
            setIsLoading={setIsLoading}
          />

          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {isLoading && (
            <div className="mt-4 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600" />
              <p className="mt-2 text-sm text-gray-600">Processing your audio...</p>
            </div>
          )}

          {transcription && <TranscriptionResult text={transcription} />}
        </div>
      </div>
    </main>
  );
}
