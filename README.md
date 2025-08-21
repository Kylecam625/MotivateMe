# Motivate Me App

![MotivateMe - AI Motivational Speech Generator](readmeimage.png)

<p align="center">
  An AI-powered motivational speech generator that creates personalized speeches with synchronized audio and visual highlighting
</p>

## 🎯 Overview

An AI-powered motivational speech generator that transforms your scenarios into personalized, emotionally-rich speeches with real-time synchronized audio and visual effects. Built with OpenAI GPT-4 and ElevenLabs V3 for the ultimate motivational experience.

## ✨ Key Features

- 🤖 **AI Speech Generation**: Uses OpenAI GPT-4o to create personalized motivational speeches
- 🎵 **Advanced Audio Synthesis**: ElevenLabs V3 with character-level timestamps for precise synchronization
- ✨ **Real-time Text Highlighting**: Words highlight in sync with the audio playback
- 🎶 **Smart Background Music**: AI-selected background music based on speech mood
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🎯 **Personalized Content**: Tailored motivational content based on your specific scenario

## 🚀 How It Works

1. **📝 Enter Your Scenario**: Describe what you need motivation for (e.g., "Getting back into shape after years of being inactive")

2. **🤖 AI Generation**: OpenAI GPT-4 creates a personalized motivational speech with ElevenLabs V3 audio tags

3. **🎵 Audio Synthesis**: ElevenLabs V3 converts the speech to lifelike audio with character-level timing

4. **🎶 Smart Music Selection**: AI analyzes the mood and selects appropriate background music

5. **✨ Synchronized Experience**: Watch words highlight in real-time as they're spoken with background music

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- ElevenLabs API key ([Get one here](https://elevenlabs.io/app/settings/api-keys))

### Installation

```bash
cd motivate-me-app
pnpm install
cp env.example .env
# Add your API keys to .env
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎮 Demo

Try these example scenarios to see the app in action:

1. **"Learning JavaScript programming"** → Selects upbeat tech music
2. **"Training for my first marathon"** → Selects motivational workout music  
3. **"Overcoming depression and anxiety"** → Selects gentle, supportive music
4. **"Getting back into gaming after years"** → Selects nostalgic, contemplative music

The AI automatically analyzes your scenario and chooses the perfect background music! 🎯

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS + Radix UI components
- **AI APIs**: 
  - OpenAI GPT-4/GPT-5 for text generation
  - ElevenLabs V3 for audio synthesis
- **Audio**: Advanced audio processing and synchronization
- **State Management**: React hooks and context

## 🎨 What You'll Experience

- **🌆 Futuristic cityscape background** with dynamic lighting effects
- **✨ Floating particles** and animated visual elements  
- **🔮 Glass morphism UI** with neon borders and modern design
- **💫 Synchronized text highlighting** that follows the speech
- **🎵 Intelligent background music** that matches your scenario's mood
- **🎪 Smooth loading animations** with progress indicators

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the `motivate-me-app` directory:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o

# ElevenLabs Configuration  
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_MODEL=eleven_v3
ELEVENLABS_VOICE_ID=TX3LPaxmHKxFdv7VOQHJ

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Model Recommendations
- **ElevenLabs**: `eleven_v3` for the most expressive and emotional speech
- **OpenAI**: `gpt-4o` for intelligent text generation
- **Voice**: Use the provided voice IDs or explore the voice library

## 🏗️ Project Structure

```
motivate-me-app/
├── app/
│   ├── api/
│   │   ├── generate-speech/    # Main speech generation endpoint
│   │   └── audio-files/       # Audio file management
│   ├── globals.css           # Global styles with animations
│   ├── layout.tsx           # Root layout
│   └── page.tsx            # Main application page
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── AudioPlayer.tsx     # Audio playback with controls
│   ├── MotivationForm.tsx  # Input form for scenarios
│   ├── TextDisplay.tsx     # Synchronized text display
│   └── VoiceSelector.tsx   # Voice selection interface
├── hooks/
│   └── useAudioSync.ts     # Audio synchronization logic
├── lib/
│   ├── elevenlabs.ts       # ElevenLabs API integration
│   ├── openai.ts          # OpenAI API integration
│   ├── background-audio.ts # Background music utilities
│   └── env.ts             # Environment validation
├── public/
│   ├── audio/             # Background music files
│   └── voicesamples/      # Voice preview samples
└── styles/               # Component-specific styles
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the individual project LICENSE files for details.

## 🔗 Links

- [ElevenLabs Platform](https://elevenlabs.io)
- [ElevenLabs Documentation](https://elevenlabs.io/docs)
- [OpenAI Platform](https://platform.openai.com)
- [Next.js Documentation](https://nextjs.org/docs)

---

<p align="center">
  Built with ❤️ using ElevenLabs and OpenAI APIs
</p>
