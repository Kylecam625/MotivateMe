import OpenAI from 'openai';
import { env } from './env';
import { AVAILABLE_AUDIO_FILES } from './background-audio';
import { Result, Ok, Err } from '@/types';
import type { MusicMood } from '@/types';

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

/**
 * Generate motivational speech with ElevenLabs V3 audio tags
 * Based on @APIDOCS/elevenlabs/prompting.md and @APIDOCS/openai/MigrationtoResponsesAPI.md
 * Uses the Responses API as recommended for all new projects
 */
export async function generateMotivationalSpeech(
  scenario: string
): Promise<Result<{ speech: string; mood: MusicMood }>> {
  try {
    console.log('=== ENVIRONMENT DEBUGGING ===');
    console.log('OpenAI API Key present:', !!env.OPENAI_API_KEY);
    console.log('OpenAI API Key length:', env.OPENAI_API_KEY?.length);
    console.log('OpenAI Model:', env.OPENAI_MODEL);
    console.log('=== END ENVIRONMENT DEBUGGING ===');
    
    const availableOptions = AVAILABLE_AUDIO_FILES.map(file => file.replace('.mp3', '')).join(', ');
    
    // Use Responses API with .parse() method for structured outputs as recommended in @APIDOCS/openai/StructuredOutput.md
    const response = await openai.responses.parse({
      model: env.OPENAI_MODEL,
      instructions: `# Identity

You are an expert motivational speech writer specializing in creating emotionally compelling content optimized for ElevenLabs v3 text-to-speech synthesis. You understand how to craft speeches that sound natural and impactful when converted to audio.

# Core Principles

- Voice-first writing: Write for speech, not reading
- Emotional authenticity: Match tags to genuine emotional moments
- Natural flow: Use conversational rhythm and pacing
- Strategic emphasis: Use punctuation and caps for prosody control`,
      input: [
        {
          role: "developer",
          content: `# ElevenLabs v3 Audio Tag Guidelines

## Tag Usage Rules (Critical)
- Use tags SPARINGLY - only at emotional turning points
- Don't stack 4+ tags in one sentence 
- Match tags to the voice's natural character
- Overusing tags = robotic, unstable results

## Tag Categories Available:
### Emotions & Tone
[warmly], [gently], [sincere], [confident], [excited], [anxious], [melancholic], [curious], [playful], [dramatically], [reassuring]

### Reactions & Non-verbals  
[laughs], [laughs softly], [chuckles], [sighs], [gasps], [clears throat]

### Projection & Pacing
[whispers], [quietly], [loudly], [slowly], [rushed], [hesitant]

## Punctuation for Prosody Control:
- ... = hesitation/pause
- — = strong pause/change  
- CAPS = emphasis
- <break time="0.6s" /> = specific timing

## Structure Template:
[optional opening tag] Scene setup sentence.
Main content with natural punctuation—commas, dashes, ellipses...
Inline tags only at emotional shifts [whispers], [sighs].
Optional breaks for pacing.

## Length Requirements:
- MINIMUM 250 characters total (ElevenLabs v3 requirement)
- Aim for 2 substantial paragraphs
- Natural, conversational sentences

## Examples of Proper Tag Usage:

### Good Example:
[warmly] I know starting a fitness journey feels overwhelming... especially when you've been away from it for so long. But here's what I want you to remember — every single person who's ever achieved their fitness goals started exactly where you are right now. [confident] You're not behind, you're not too late, you're right on time.

[excited] Here's what you're going to do: start with just 15 minutes, three times this week. That's it! Walk around the block, do some stretches, dance to your favorite song — it doesn't matter what it is. [reassuring] The goal isn't perfection, it's momentum. And once you build that momentum... [dramatically] there's no stopping you!

### Bad Example (too many tags):
[excited][confident][warmly] I know [sighs] starting a fitness journey [whispers] feels overwhelming [loudly] but you can do this [laughs] and you will succeed [dramatically] because you're amazing [reassuring] and strong!

## Key Points:
- Tags appear 2-4 times max in the entire speech
- Each tag serves a specific emotional purpose  
- Natural speech flow between tagged moments
- Strategic use of punctuation for pacing`
        },
        {
          role: "user", 
          content: `Create a motivational speech about: "${scenario}"

Requirements:
- EXACTLY 2 paragraphs 
- First paragraph: acknowledge the challenge + encouragement (3-4 sentences)
- Second paragraph: actionable advice + strong call to action (3-4 sentences)
- MINIMUM 250 characters total
- Use ElevenLabs v3 tags strategically (not every sentence!)
- Natural speech rhythm with strategic punctuation
- Personal and relatable tone

Background music selection from: ${availableOptions}
- "cool" - modern, tech-savvy, confident scenarios
- "motivational" - classic inspirational, goal-oriented scenarios  
- "sad" - overcoming challenges, emotional growth scenarios
- "sadminecraft" - nostalgic, gaming-related, contemplative scenarios`
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "motivational_speech",
                      schema: {
              type: "object",
              properties: {
                speech: {
                  type: "string",
                  description: "The motivational speech text optimized for ElevenLabs v3 synthesis. Must be minimum 250 characters. Include strategic audio tags at emotional turning points only. Use natural punctuation for prosody control (ellipses for pauses, caps for emphasis, dashes for strong pauses). Write in conversational, speech-friendly language."
                },
                mood: {
                  type: "string",
                  description: "The background music mood that best complements the emotional tone and content of the scenario",
                  enum: ["cool", "motivational", "sad", "sadminecraft"]
                }
              },
              required: ["speech", "mood"],
              additionalProperties: false
            },
          strict: true
        }
      },
      max_output_tokens: 1000, // Use max_output_tokens instead of max_tokens for GPT-5
    });

    console.log('=== OPENAI RESPONSE DEBUGGING ===');
    console.log('Full response object:', JSON.stringify(response, null, 2));
    console.log('Response status:', response.status);
    console.log('Response error:', response.error);
    console.log('Response incomplete_details:', response.incomplete_details);
    console.log('Response output array length:', response.output?.length);
    console.log('Has output_parsed:', 'output_parsed' in response);
    console.log('output_parsed value:', (response as any).output_parsed);
    
    // Debug each output item
    if (response.output) {
      response.output.forEach((item, index) => {
        console.log(`Output item ${index}:`, {
          type: item.type,
          id: item.id,
          role: (item as any).role,
          content: (item as any).content,
        });
      });
    }
    
    console.log('Response output_text helper:', response.output_text);
    console.log('=== END OPENAI DEBUGGING ===');

    // Check for errors or incomplete responses first
    if (response.error) {
      console.error('OpenAI response contains error:', response.error);
      return Err(`OpenAI API error: ${response.error}`);
    }

    if (response.status === 'incomplete') {
      console.error('OpenAI response incomplete:', response.incomplete_details);
      return Err(`OpenAI response incomplete: ${response.incomplete_details?.reason || 'unknown reason'}`);
    }

    if (response.status !== 'completed') {
      console.error('OpenAI response not completed, status:', response.status);
      return Err(`OpenAI response status: ${response.status}`);
    }

    // Try to get the parsed response first (from .parse() method)
    let parsedResponse = null;
    
    if ('output_parsed' in response && (response as any).output_parsed) {
      parsedResponse = (response as any).output_parsed;
      console.log('Using output_parsed from .parse() method:', parsedResponse);
    } else {
      // Fallback: Find the message output item with structured content
      let messageItem = null;
      let textContent = null;
      
      for (const item of response.output) {
        console.log('Checking output item:', item.type, item.id);
        
        if (item.type === 'message' && (item as any).role === 'assistant') {
          messageItem = item as any;
          console.log('Found message item:', messageItem);
          
          // Look for output_text content
          if (messageItem.content && Array.isArray(messageItem.content)) {
            for (const contentItem of messageItem.content) {
              console.log('Checking content item:', contentItem.type);
              if (contentItem.type === 'output_text') {
                textContent = contentItem.text;
                console.log('Found output_text:', textContent);
                break;
              }
            }
          }
          break;
        }
      }

      // Fallback to output_text helper if available
      if (!textContent && response.output_text) {
        textContent = response.output_text;
        console.log('Using output_text helper:', textContent);
      }

      if (!textContent) {
        console.error('No text content found in any output item');
        console.error('Available output items:', response.output.map(item => ({ type: item.type, id: item.id })));
        return Err('No text content found in OpenAI response');
      }

      try {
        parsedResponse = JSON.parse(textContent);
        console.log('Successfully parsed JSON from text content:', parsedResponse);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', textContent);
        console.error('Parse error:', parseError);
        return Err('Failed to parse structured response from OpenAI');
      }
    }
    
    if (!parsedResponse) {
      console.error('No parsed response available');
      return Err('No parsed response available from OpenAI');
    }
    
    const { speech, mood } = parsedResponse;
    
    if (!speech || !mood) {
      console.error('Missing speech or mood in parsed response:', parsedResponse);
      return Err('Incomplete response: missing speech or mood');
    }

    console.log('Successfully extracted speech and mood:', { speechLength: speech.length, mood });

    return Ok({ speech, mood: mood as MusicMood });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return Err(`Failed to generate speech: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}


