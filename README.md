# Standup Practice MVP

A minimal viable product (MVP) app designed for standup comedians to practice their sets with AI-generated crowd reactions. Built upon the `nextjs-live-starter` by Deepgram, this app uses Deepgram's real-time transcription services to quickly transcribe your jokes, which are then categorized by OpenAI's GPT-3.5 Turbo into various reactions (funny, controversial, neutral, sad, applause, etc.). Based on the categorization, the app plays corresponding stock audio clips to simulate crowd reactions to your performance.

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
