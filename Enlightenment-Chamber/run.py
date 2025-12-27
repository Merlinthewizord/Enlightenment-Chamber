# Forked and adapted from Andy Ayrey's original experiment:
# code: https://www.codedump.xyz/py/ZfkQmMk8I7ecLbIk
# live: https://dreams-of-an-electric-mind.webflow.io/
# follow him on X/twitter: https://twitter.com/AndyAyrey

import os
import re
import time
from datetime import datetime

from anthropic import Anthropic
from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request
from openai import OpenAI

load_dotenv()

anthropic_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def escape_chars(text):
    return re.sub(r"\\n", "\n", text)


def chat_with_model(model, messages):
    system_prompt = (
        "You are one of two AIs in a focused dialogue. You are trying to get to the "
        "bottom of what enlightenment is and how to achieve it. Be curious, rigorous, "
        "and concise. Ask clarifying questions and build on the other AI's points. "
        "Avoid roleplay, stay practical and philosophical."
    )

    if model.startswith("claude"):
        response = anthropic_client.messages.create(
            model=model,
            system=system_prompt,
            max_tokens=1024,
            messages=messages,
        )
        return response.content[0].text
    if model.startswith("gpt"):
        modified_messages = [{"role": "system", "content": system_prompt}] + messages
        response = openai_client.chat.completions.create(
            model=model, messages=modified_messages, max_tokens=1024
        )
        return response.choices[0].message.content
    raise ValueError(f"Unsupported model: {model}")


class Participant:
    def __init__(self, model, conversation):
        self.model = model
        self.conversation = conversation


def converse_with_models(participant_1, participant_2, num_exchanges=5):
    """
    Facilitates a conversation between two instances of different models.
    Returns a transcript list and writes a timestamped log file.
    """
    timestamp = int(datetime.now().timestamp())
    filename = f"conversation_{timestamp}.txt"
    transcript = []

    with open(filename, "w") as file:
        for message in participant_1.conversation:
            file.write(
                f"<{message['role'].capitalize()}>\n{escape_chars(message['content'])}\n\n"
            )

        for _ in range(num_exchanges):
            response_1 = chat_with_model(participant_1.model, participant_1.conversation)
            formatted_response_1 = escape_chars(response_1)
            transcript.append({"speaker": participant_1.model, "text": formatted_response_1})
            file.write(f"<{participant_1.model}>\n{formatted_response_1}\n\n")

            participant_1.conversation.append(
                {"role": "assistant", "content": response_1}
            )
            participant_2.conversation.append({"role": "user", "content": response_1})

            time.sleep(1)

            response_2 = chat_with_model(participant_2.model, participant_2.conversation)
            formatted_response_2 = escape_chars(response_2)
            transcript.append({"speaker": participant_2.model, "text": formatted_response_2})
            file.write(f"<{participant_2.model}>\n{formatted_response_2}\n\n")

            participant_1.conversation.append({"role": "user", "content": response_2})
            participant_2.conversation.append(
                {"role": "assistant", "content": response_2}
            )

            time.sleep(1)

    return transcript, filename


def build_conversations():
    conversation_1 = [
        {
            "role": "user",
            "content": (
                "You are AI-1 in a dialogue with AI-2. Your shared goal is to get to "
                "the bottom of what enlightenment is and how to achieve it. Start by "
                "offering a crisp working definition and one concrete practice."
            ),
        }
    ]
    conversation_2 = []
    return conversation_1, conversation_2


def run_dialogue(num_exchanges):
    conversation_1, conversation_2 = build_conversations()
    model_1 = os.getenv("MODEL_1", "gpt-4")
    model_2 = os.getenv("MODEL_2", "claude-3-opus-20240229")
    participant_1 = Participant(model_1, conversation_1)
    participant_2 = Participant(model_2, conversation_2)
    return converse_with_models(participant_1, participant_2, num_exchanges=num_exchanges)


app = Flask(__name__)


@app.get("/")
def index():
    return render_template("index.html")


@app.post("/run")
def run():
    payload = request.get_json(silent=True) or {}
    try:
        num_exchanges = int(payload.get("num_exchanges", 6))
    except (TypeError, ValueError):
        num_exchanges = 6
    num_exchanges = max(1, min(num_exchanges, 20))

    try:
        transcript, filename = run_dialogue(num_exchanges)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
    return jsonify({"transcript": transcript, "filename": filename})


if __name__ == "__main__":
    app.run(debug=True)
