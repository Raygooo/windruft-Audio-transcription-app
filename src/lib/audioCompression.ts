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

const calculateTargetBitrate = (fileSize: number, duration: number): number => {
  // Calculate current bitrate (bits per second)
  const currentBitrate = (fileSize * 8) / duration;
  
  // If current bitrate is already low, don't compress too much
  if (currentBitrate < 128000) { // Less than 128kbps
    return Math.max(currentBitrate * 0.9, 64000); // Don't go below 64kbps
  }
  
  // For high bitrate files, compress more aggressively
  return Math.max(currentBitrate * 0.75, 96000); // Don't go below 96kbps
};

export const compressAudioFile = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<CompressionResult> => {
  try {
    if (!loaded) {
      await initFFmpeg();
    }

    const inputFileName = 'input' + file.name.substring(file.name.lastIndexOf('.'));
    const outputFileName = 'output.mp3';
    const metadataFileName = 'metadata.txt';

    // Convert File to ArrayBuffer
    const fileData = await file.arrayBuffer();
    // Write the file to FFmpeg's file system
    ffmpeg.FS('writeFile', inputFileName, new Uint8Array(fileData));

    // Extract duration using ffprobe-style command
    await ffmpeg.run(
      '-i', inputFileName,
      '-f', 'null',
      '-v', 'quiet',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      metadataFileName
    );

    // Read duration from metadata file
    let duration = 0;
    try {
      const metadataContent = ffmpeg.FS('readFile', metadataFileName);
      duration = parseFloat(new TextDecoder().decode(metadataContent)) || 1;
      ffmpeg.FS('unlink', metadataFileName);
    } catch (error) {
      console.warn('Could not determine audio duration, using default compression settings');
      duration = 1;
    }

    // Calculate target bitrate based on file size and duration
    const targetBitrate = calculateTargetBitrate(file.size, duration);
    
    // Compress audio with FFmpeg using calculated bitrate
    await ffmpeg.run(
      '-i', inputFileName,
      '-c:a', 'libmp3lame',
      '-b:a', `${Math.round(targetBitrate / 1000)}k`,
      '-compression_level', '5', // Higher compression level
      outputFileName
    );

    // Read the compressed file
    const data = ffmpeg.FS('readFile', outputFileName);
    const compressedBlob = new Blob([data.buffer], { type: 'audio/mp3' });
    const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, '.mp3'), {
      type: 'audio/mp3'
    });

    // If compressed size is larger, return original file
    if (compressedFile.size >= file.size) {
      return {
        compressedFile: file,
        originalSize: file.size,
        compressedSize: file.size,
      };
    }

    // Clean up files in FFmpeg's file system
    ffmpeg.FS('unlink', inputFileName);
    ffmpeg.FS('unlink', outputFileName);

    return {
      compressedFile,
      originalSize: file.size,
      compressedSize: compressedFile.size
    };
  } catch (error) {
    console.error('Error compressing audio:', error);
    throw new Error('Failed to compress audio file');
  }
};
