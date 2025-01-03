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

    // Convert File to ArrayBuffer
    const fileData = await file.arrayBuffer();
    // Write the file to FFmpeg's file system
    ffmpeg.FS('writeFile', inputFileName, new Uint8Array(fileData));

    // Compress audio with FFmpeg
    await ffmpeg.run(
      '-i', inputFileName,
      '-c:a', 'libmp3lame',
      '-b:a', '96k',
      outputFileName
    );

    // Read the compressed file
    const data = ffmpeg.FS('readFile', outputFileName);
    const compressedBlob = new Blob([data.buffer], { type: 'audio/mp3' });
    const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, '.mp3'), {
      type: 'audio/mp3'
    });

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
