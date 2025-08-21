import { NextResponse } from 'next/server';
import { AVAILABLE_AUDIO_FILES } from '@/lib/background-audio';

export async function GET() {
  try {
    const audioFiles = AVAILABLE_AUDIO_FILES.map(filename => ({
      filename,
      name: filename.replace('.mp3', ''),
      path: `/audio/${filename}`,
      description: getAudioDescription(filename.replace('.mp3', '')),
    }));

    return NextResponse.json(audioFiles);
  } catch (error) {
    console.error('Audio files fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audio files' },
      { status: 500 }
    );
  }
}

function getAudioDescription(name: string): string {
  const descriptions: Record<string, string> = {
    cool: 'Modern, tech-savvy, confident vibes',
    motivational: 'Classic inspirational and empowering',
    sad: 'Emotional, reflective, overcoming challenges',
    sadminecraft: 'Nostalgic, gaming-inspired, contemplative',
  };
  
  return descriptions[name] || 'Background music';
}
