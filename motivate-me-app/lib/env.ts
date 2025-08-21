import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required'),
    OPENAI_MODEL: z.string().default('gpt-5'),
    OPENAI_MOOD_MODEL: z.string().default('gpt-5-nano'),
    ELEVENLABS_API_KEY: z.string().min(1, 'ElevenLabs API key is required'),
    ELEVENLABS_MODEL: z.string().default('eleven_flash_v2_5'),
    ELEVENLABS_VOICE_ID: z.string().default('FGY2WhTYpPnrIDTdsKH5'),
    ELEVENLABS_VOICE_ID_FEMALE: z.string().default('FGY2WhTYpPnrIDTdsKH5'),
    ELEVENLABS_VOICE_ID_MALE: z.string().default('TX3LPaxmHKxFdv7VOQHJ'),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  },
  runtimeEnv: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
    OPENAI_MOOD_MODEL: process.env.OPENAI_MOOD_MODEL,
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
    ELEVENLABS_MODEL: process.env.ELEVENLABS_MODEL,
    ELEVENLABS_VOICE_ID: process.env.ELEVENLABS_VOICE_ID,
    ELEVENLABS_VOICE_ID_FEMALE: process.env.ELEVENLABS_VOICE_ID_FEMALE,
    ELEVENLABS_VOICE_ID_MALE: process.env.ELEVENLABS_VOICE_ID_MALE,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
});
