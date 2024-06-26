# Standup Comedy Practice with AI

![Cover Image](./public/cover.webp)

A simple app to practice your standup routine with AI-generated crowd reactions. 

Built upon the `nextjs-live-starter` by Deepgram, this app uses Deepgram's real-time transcription services to quickly transcribe your jokes, which are then categorized by OpenAI's gpt-3.5-turbo into various reactions (funny, controversial, neutral, sad, applause, etc.). Based on the categorization, the app plays corresponding stock audio clips to simulate crowd reactions to your performance.

You can see a demo of this app working [here]([http://your-placeholder-link.com](https://www.loom.com/share/2a8e84ba72a84bbe88f7f06b8ce69b31?sid=db1b35e5-5f96-4a7c-8fc8-58398e712232)).

## Quick Setup

### Prerequisites

- An API key from [Deepgram](https://deepgram.com/)
- An API key from [OpenAI](https://openai.com/)

### Configuration

Create a `.env.local` file in the root directory of your project and add your API keys:

```plaintext
OPENAI_API_KEY=<your-openai-api-key>
DEEPGRAM_API_KEY=<your-deepgram-api-key>
```

## Installation

Install the project dependencies.

```bash
pnpm install
```

#### Running the App

To start the application, run:

```bash
pnpm run dev
```

#### Run the application

Once running, you can [access the application in your browser](http://localhost:3000).

```bash
npm run dev
```

Access it via http://localhost:3000 in your browser.

## Deployment

You can deploy this app on Vercel or another platform of your choice.

## Feedback and Contributions

We appreciate feedback and ideas on improving the app further. Notably, we're working on adjusting the timing of reactions to make them appear more natural and adding more granular categories for crowd responses.

## License

This project is licensed under the MIT license. See the [LICENSE](./LICENSE) file for more info.
