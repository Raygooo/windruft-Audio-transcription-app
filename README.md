# Audio Transcription App

A modern web application that converts audio files to text using OpenAI's Whisper API. Built with Next.js, TypeScript, and Tailwind CSS.

![Audio Transcription App](https://github.com/your-username/your-repo/raw/main/public/screenshot.png)

## Features

- 🎯 Drag & drop interface for file uploads
- 🎵 Support for multiple audio formats (MP3, WAV, M4A, AAC)
- ⚡ Real-time transcription using OpenAI's Whisper API
- 📋 Copy-to-clipboard functionality
- 🎨 Modern, responsive UI with Tailwind CSS
- ⚠️ Error handling and loading states
- 📱 Mobile-friendly design

## Tech Stack

- [Next.js 14](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [OpenAI API](https://openai.com/) - Audio transcription
- [React Dropzone](https://react-dropzone.js.org/) - File upload

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/audio-transcription-app.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Open the application in your browser
2. Drag and drop an audio file or click to select one
3. Wait for the transcription to complete
4. View the transcribed text
5. Copy the text to clipboard using the "Copy" button

## Deployment

The app can be easily deployed to Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add your `OPENAI_API_KEY` to the environment variables
4. Deploy!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [OpenAI](https://openai.com/) for the Whisper API
- [Vercel](https://vercel.com/) for hosting
- [Next.js](https://nextjs.org/) team for the amazing framework
