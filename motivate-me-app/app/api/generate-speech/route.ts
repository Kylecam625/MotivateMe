import { NextRequest, NextResponse } from 'next/server';
import { generateMotivationalSpeech } from '@/lib/openai';
import { generateSpeechWithTimestamps } from '@/lib/elevenlabs';
import { stripAudioTags, generateId, timestampsToText } from '@/lib/utils';
import type { GeneratedSpeech } from '@/types';

export async function POST(request: NextRequest) {
  try {
    console.log('=== API ROUTE DEBUGGING ===');
    console.log('Request received at:', new Date().toISOString());
    
    const requestBody = await request.json();
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const { scenario, voiceId } = requestBody;

    if (!scenario) {
      console.error('Missing scenario in request');
      return NextResponse.json(
        { error: 'Scenario is required' },
        { status: 400 }
      );
    }

    console.log('Processing scenario:', scenario);
    console.log('Using voice ID:', voiceId || 'default');

    // Generate speech text with OpenAI
    console.log('=== STEP 1: GENERATING SPEECH TEXT ===');
    const speechResult = await generateMotivationalSpeech(scenario);
    
    console.log('Speech generation result:', {
      success: speechResult.ok,
      error: speechResult.ok ? null : speechResult.error,
    });
    
    if (!speechResult.ok) {
      console.error('Speech generation failed:', speechResult.error);
      return NextResponse.json(
        { error: speechResult.error },
        { status: 500 }
      );
    }

    const { speech: rawText, mood } = speechResult.value;
    
    console.log('Speech generation successful:', {
      rawTextLength: rawText.length,
      mood: mood,
      rawTextPreview: rawText.substring(0, 100) + '...',
    });

    // Generate audio with ElevenLabs
    console.log('=== STEP 2: GENERATING AUDIO ===');
    const audioResult = await generateSpeechWithTimestamps(rawText, voiceId);
    
    console.log('Audio generation result:', {
      success: audioResult.ok,
      error: audioResult.ok ? null : audioResult.error,
    });
    
    if (!audioResult.ok) {
      console.error('Audio generation failed:', audioResult.error);
      return NextResponse.json(
        { error: audioResult.error },
        { status: 500 }
      );
    }

    const { audio_base64, alignment, normalized_alignment } = audioResult.value;
    
    console.log('Audio generation successful:', {
      audioBase64Length: audio_base64.length,
      alignmentCharacters: alignment.characters?.length,
      alignmentStartTimes: alignment.character_start_times_seconds?.length,
      alignmentEndTimes: alignment.character_end_times_seconds?.length,
    });

    // Prefer normalized alignment from ElevenLabs when available per @APIDOCS/elevenlabs/createspeechtimestamps.md
    const timestamps = normalized_alignment || alignment;
    // Build display text directly from timestamps to guarantee 1:1 mapping
    const displayText = timestampsToText(timestamps) || stripAudioTags(rawText);
    console.log('Display text built from timestamps:', {
      displayTextLength: displayText.length,
      usesNormalized: !!normalized_alignment,
    });

    const generatedSpeech: GeneratedSpeech = {
      id: generateId(),
      scenario,
      rawText,
      displayText,
      audioBase64: audio_base64,
      timestamps,
      backgroundMusic: mood,
      createdAt: new Date(),
      status: 'complete',
    };

    console.log('=== FINAL RESPONSE ===');
    console.log('Generated speech object:', {
      id: generatedSpeech.id,
      scenario: generatedSpeech.scenario,
      rawTextLength: generatedSpeech.rawText.length,
      displayTextLength: generatedSpeech.displayText.length,
      audioBase64Length: generatedSpeech.audioBase64?.length || 0,
      timestampsLength: generatedSpeech.timestamps?.characters?.length || 0,
      backgroundMusic: generatedSpeech.backgroundMusic,
      status: generatedSpeech.status,
    });
    console.log('=== END API ROUTE DEBUGGING ===');

    return NextResponse.json(generatedSpeech);
  } catch (error) {
    console.error('=== API ROUTE ERROR ===');
    console.error('Speech generation error:', error);
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('=== END API ROUTE ERROR ===');
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
}
