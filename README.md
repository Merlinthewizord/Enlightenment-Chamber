# The Enlightenment Chamber

This Next.js web app facilitates a conversation between two AI models as they explore
what enlightenment is and how to achieve it. The UI presents their exchange in a
cosmic chamber theme.

## Credits

This script was forked and adapted from Andy Ayrey's original experiment:

- Code: [https://www.codedump.xyz/py/ZfkQmMk8I7ecLbIk](https://www.codedump.xyz/py/ZfkQmMk8I7ecLbIk)
- Live: [https://dreams-of-an-electric-mind.webflow.io/](https://dreams-of-an-electric-mind.webflow.io/)

Follow Andy on X/Twitter: [https://twitter.com/AndyAyrey](https://twitter.com/AndyAyrey)

## Purpose

The purpose of this experiment is to explore the boundaries of AI-to-AI interaction and push the limits of what's possible when two different AI models communicate with each other. By providing a safe and controlled environment, the script allows for curious and bold exchanges between the models, guided by a human supervisor.

## Setup

1. Clone the repo

```
$ git clone
```

2. Create a `.env` file in the project directory and add your API keys for OpenAI and Anthropic:

```
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENAI_API_KEY=your_openai_api_key
```

## Usage

Install dependencies and start the web app:

```
$ npm install
$ npm run dev
```

Then open `http://localhost:3000` in your browser to run a dialogue between two AI
instances about enlightenment.

## Customization

You can change the models by setting environment variables:

- `MODEL_1` (default `gpt-4`)
- `MODEL_2` (default `claude-3-opus-20240229`)
