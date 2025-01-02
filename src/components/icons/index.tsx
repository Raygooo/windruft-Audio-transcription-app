import { SVGProps } from 'react';

export const UploadIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
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
);

export const PlayIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg 
    {...props}
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M8 5v14l11-7z" />
  </svg>
);

export const PauseIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg 
    {...props}
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

export const ChevronDownIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg 
    {...props}
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

export const ChevronUpIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg 
    {...props}
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 15l7-7 7 7"
    />
  </svg>
);

export const WaveformIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg 
    {...props}
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M7 18h2V6H7v12zm4 4h2V2h-2v20zm-8-8h2V10H3v4zm12 4h2V6h-2v12zm4-8v4h2v-4h-2z" />
  </svg>
);

export const CopyIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
    />
  </svg>
);

export const LogoIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg 
    {...props}
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 18H7a2 2 0 01-2-2V8a2 2 0 012-2h5a2 2 0 012 2v8a2 2 0 01-2 2z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 20h.01"
    />
  </svg>
);

