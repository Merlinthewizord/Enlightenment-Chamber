# Multi-Model Infinite Backrooms

This Python script facilitates a conversation between two AI models, simulating a virtual CLI environment where the models can engage in an open-ended dialogue. The script supports interaction between OpenAI's GPT models and Anthropic's Claude models.

## Credits

This script was forked and adapted from Andy Ayrey's original experiment:

- Code: [https://www.codedump.xyz/py/ZfkQmMk8I7ecLbIk](https://www.codedump.xyz/py/ZfkQmMk8I7ecLbIk)
- Live: [https://dreams-of-an-electric-mind.webflow.io/](https://dreams-of-an-electric-mind.webflow.io/)

Follow Andy on X/Twitter: [https://twitter.com/AndyAyrey](https://twitter.com/AndyAyrey)

## Purpose

The purpose of this experiment is to explore the boundaries of AI-to-AI interaction and push the limits of what's possible when two different AI models communicate with each other. By providing a safe and controlled environment, the script allows for curious and bold exchanges between the models, guided by a human supervisor.

## Dependencies

```
pip install anthropic openai python-dotenv
```

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

Start the web app:

```
$ python run.py
```

Then open `http://127.0.0.1:5000` in your browser to run a dialogue between two AI
instances about enlightenment. Each run writes a timestamped transcript file to
the project folder.

## Customization

You can change the models by setting environment variables:

- `MODEL_1` (default `gpt-4`)
- `MODEL_2` (default `claude-3-opus-20240229`)
