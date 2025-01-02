import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: 'org-LXk6bAwJXBRCHkelVrrUzI8x',
  project: 'proj_sXW6WfhORRn3hVRB4RM6RzJs',
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const response = await openai.audio.transcriptions.create({
      file: new File([buffer], file.name, { type: file.type }),
      model: 'whisper-1',
    });

    return NextResponse.json({ text: response.text });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
