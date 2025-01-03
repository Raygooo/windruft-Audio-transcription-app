import { createFFmpeg } from '@ffmpeg/ffmpeg';

const ffmpeg = createFFmpeg({
  log: false,
  corePath: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js'
});

let loaded = false;

export const initFFmpeg = async () => {
  if (loaded) return;
  await ffmpeg.load();
  loaded = true;
};

interface CompressionResult {
  compressedFile: File;
  originalSize: number;
  compressedSize: number;
}

export const MAX_COMPRESSED_SIZE = 24 * 1024 * 1024; // 24MB in bytes

const calculateTargetBitrate = (fileSize: number, duration: number): number => {
  // Target size is 20MB (leaving more buffer)
  const targetSize = 20 * 1024 * 1024;
  const targetBitrate = (targetSize * 8) / duration;
  
  // Ensure minimum quality
  return Math.max(targetBitrate, 64000); // Minimum 64kbps
};

export const compressAudioFile = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<CompressionResult> => {
  try {
    if (!loaded) {
      await initFFmpeg();
      onProgress?.(0.1); // 10% - Loading FFmpeg
    }

    const inputFileName = 'input' + file.name.substring(file.name.lastIndexOf('.'));
    const outputFileName = 'output.mp3';
    const metadataFileName = 'metadata.txt';

    // Convert File to ArrayBuffer
    const fileData = await file.arrayBuffer();
    ffmpeg.FS('writeFile', inputFileName, new Uint8Array(fileData));
    onProgress?.(0.2); // 20% - File loaded

    // Extract duration using ffprobe-style command
    await ffmpeg.run(
      '-i', inputFileName,
      '-f', 'null',
      '-v', 'quiet',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      metadataFileName
    );
    onProgress?.(0.3); // 30% - Duration extracted

    // Read duration from metadata file
    let duration = 0;
    try {
      const metadataContent = ffmpeg.FS('readFile', metadataFileName);
      duration = parseFloat(new TextDecoder().decode(metadataContent)) || 1;
      ffmpeg.FS('unlink', metadataFileName);
    } catch {
      console.warn('Could not determine audio duration, using default duration of 1 second');
      duration = 1;
    }
    onProgress?.(0.4); // 40% - Metadata processed

    // Calculate target bitrate based on file size and duration
    const targetBitrate = calculateTargetBitrate(file.size, duration);
    
    // Set up FFmpeg with more aggressive compression
    await ffmpeg.run(
      '-i', inputFileName,
      '-c:a', 'libmp3lame',
      '-b:a', `${Math.round(targetBitrate / 1000)}k`,
      '-compression_level', '9', // Maximum compression
      '-q:a', '9', // Highest quality compression
      '-map_metadata', '-1', // Remove metadata to reduce size
      outputFileName
    );
    onProgress?.(0.8); // 80% - Compression complete

    // Read the compressed file
    const data = ffmpeg.FS('readFile', outputFileName);
    const compressedBlob = new Blob([new Uint8Array(data.buffer)], { type: 'audio/mp3' });
    const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, '.mp3'), {
      type: 'audio/mp3'
    });
    onProgress?.(0.9); // 90% - File created

    // Clean up files in FFmpeg's file system
    try {
      ffmpeg.FS('unlink', inputFileName);
      ffmpeg.FS('unlink', outputFileName);
    } catch {
      console.warn('Error cleaning up FFmpeg files:');
    }

    // Check if compression was successful
    if (compressedFile.size > MAX_COMPRESSED_SIZE) {
      throw new Error(`Compressed file size (${Math.round(compressedFile.size / 1024 / 1024)}MB) still exceeds 24MB limit`);
    }

    onProgress?.(1); // 100% - Process complete

    return {
      compressedFile,
      originalSize: file.size,
      compressedSize: compressedFile.size,
    };
  } catch {
    // Clean up any remaining files
    try {
      ffmpeg.FS('unlink', 'input' + file.name.substring(file.name.lastIndexOf('.')));
      ffmpeg.FS('unlink', 'output.mp3');
      ffmpeg.FS('unlink', 'metadata.txt');
    } catch { /* Ignore cleanup errors */ }

    throw new Error('Audio compression failed');
  }
};
