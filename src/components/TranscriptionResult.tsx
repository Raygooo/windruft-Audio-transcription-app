'use client';

import { useState } from 'react';

interface TranscriptionResultProps {
  text: string;
}

const TranscriptionResult = ({ text }: TranscriptionResultProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-6 bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Transcription Result
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p className="whitespace-pre-wrap">{text}</p>
        </div>
        <div className="mt-3">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TranscriptionResult;
