# Motivate Me, Or Not?

An AI-powered motivational speech generator that creates personalized speeches with synchronized audio and visual highlighting using OpenAI GPT and ElevenLabs V3.

## Features

- **AI Speech Generation**: Uses OpenAI GPT-4 to create personalized motivational speeches with ElevenLabs V3 audio tags
- **Advanced Audio Synthesis**: ElevenLabs V3 with character-level timestamps for precise synchronization
- **Real-time Text Highlighting**: Words highlight in sync with the audio playback
- **Background Music**: AI-selected background music based on speech mood
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technology Stack

- **Frontend**: Next.js 15 with TypeScript
- **UI**: Tailwind CSS + Radix UI components
- **AI APIs**: 
  - OpenAI GPT-4 for text generation
  - ElevenLabs V3 for audio synthesis with timestamps
- **Audio**: Background music integration with fade effects

## Setup Instructions

### Prerequisites

- Node.js 18+ and pnpm
- OpenAI API key
- ElevenLabs API key

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd motivate-me-app
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and add your API keys:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Run the development server:**
   ```bash
   pnpm dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## Usage

1. **Enter a Scenario**: Describe what you need motivation for (e.g., "Getting back into shape after years of being inactive")

2. **Generate Speech**: Click "Generate Motivation" to create your personalized speech

3. **Experience the Speech**: 
   - Watch words highlight in real-time as they're spoken
   - Background music automatically matches the mood
   - Use audio controls to play, pause, or restart

## API Integration

### OpenAI Integration
- **Model**: GPT-4 for high-quality speech generation
- **Prompting**: Optimized for ElevenLabs V3 audio tags
- **Mood Detection**: Secondary API call for background music selection

### ElevenLabs V3 Integration  
- **Endpoint**: `/v1/text-to-speech/:voice_id/with-timestamps`
- **Features**: Character-level timing for precise word highlighting
- **Audio Tags**: Full support for V3 emotional tags like `[excited]`, `[confident]`, `[whispers]`

## Project Structure

```
motivate-me-app/
├── app/
│   ├── api/
│   │   ├── generate-speech/    # Main speech generation endpoint
│   │   └── voices/            # Voice selection endpoint
│   ├── globals.css           # Global styles with animations
│   ├── layout.tsx           # Root layout
│   └── page.tsx            # Main application page
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── AudioPlayer.tsx     # Audio playback with controls
│   ├── BackgroundAudio.tsx # Background music management
│   ├── MotivationForm.tsx  # Input form for scenarios
│   └── TextDisplay.tsx     # Synchronized text display
├── hooks/
│   └── useAudioSync.ts     # Audio synchronization logic
├── lib/
│   ├── elevenlabs.ts       # ElevenLabs API integration
│   ├── openai.ts          # OpenAI API integration
│   ├── background-audio.ts # Background music utilities
│   ├── env.ts             # Environment validation
│   └── utils.ts           # Utility functions
├── public/
│   └── audio/             # Background music files
└── types/
    └── index.ts          # TypeScript type definitions
```

## Key Features Implementation

### Speech Generation with V3 Tags
The app uses OpenAI to generate motivational speeches with embedded ElevenLabs V3 audio tags:

```typescript
// Example generated speech
"[excited] You've got this! [confident] Every step you take brings you closer to your goal. [whispers] Believe in yourself..."
```

### Character-Level Synchronization
ElevenLabs V3 provides character-level timestamps that enable precise word highlighting:

```typescript
{
  "characters": ["H", "e", "l", "l", "o"],
  "character_start_times_seconds": [0, 0.1, 0.2, 0.3, 0.4],
  "character_end_times_seconds": [0.1, 0.2, 0.3, 0.4, 0.5]
}
```

### Background Music Selection
AI analyzes the scenario and selects appropriate background music:

```typescript
// Mood detection for scenario: "Training for my first marathon"
// Result: "energetic" -> plays energetic.mp3
```

## Audio Files

The app includes placeholder background music files for different moods:
- `happy.mp3` - Upbeat, joyful scenarios
- `sad.mp3` - Melancholic, reflective scenarios  
- `motivational.mp3` - Inspiring, goal-oriented scenarios
- `energetic.mp3` - High-energy, action scenarios
- `calm.mp3` - Peaceful, meditative scenarios
- `confident.mp3` - Assertive, leadership scenarios
- `inspiring.mp3` - Uplifting, transformational scenarios

## Customization

### Voice Selection
Modify the default voice in `lib/elevenlabs.ts`:
```typescript
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel - American accent
```

### Audio Tags
Customize the OpenAI prompt in `lib/openai.ts` to use different ElevenLabs V3 tags:
```typescript
// Available V3 tags:
// Voice: [excited], [confident], [whispers], [laughs], [sighs], [curious]
// Effects: [applause], [clapping], [explosion]
// Experimental: [strong X accent], [sings]
```

### Background Music
Replace audio files in `public/audio/` with your own music tracks.

## Troubleshooting

### Common Issues

1. **API Key Errors**: Ensure your `.env.local` file has valid API keys
2. **Audio Not Playing**: Check browser audio permissions and file paths
3. **Slow Generation**: ElevenLabs V3 can take 10-30 seconds for long speeches
4. **Highlighting Not Syncing**: Verify timestamps are being received from ElevenLabs

### Debug Mode
Enable detailed logging by adding to your `.env.local`:
```env
NODE_ENV=development
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project as a foundation for your own applications.

## Acknowledgments

- **OpenAI** for GPT-4 text generation
- **ElevenLabs** for advanced voice synthesis with V3 tags
- **Next.js** team for the excellent framework
- **Radix UI** for accessible components
