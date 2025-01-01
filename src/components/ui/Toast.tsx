'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

const Toast = ({ message, type = 'success', duration = 3000, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 transform transition-all duration-300 ease-in-out',
        {
          'translate-y-0 opacity-100': isVisible,
          'translate-y-2 opacity-0': !isVisible,
        }
      )}
    >
      <div
        className={cn(
          'rounded-lg px-4 py-3 shadow-lg flex items-center space-x-2',
          {
            'bg-green-50 text-green-800 border border-green-100': type === 'success',
            'bg-red-50 text-red-800 border border-red-100': type === 'error',
            'bg-blue-50 text-blue-800 border border-blue-100': type === 'info',
          }
        )}
      >
        {type === 'success' && (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        )}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
};

export default Toast;
