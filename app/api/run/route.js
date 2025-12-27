import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { NextResponse } from "next/server";

const systemPrompt =
  "You are one of two AIs in a focused dialogue. You are trying to get to the " +
  "bottom of what enlightenment is and how to achieve it. Be curious, rigorous, " +
  "and concise. Ask clarifying questions and build on the other AI's points. " +
  "Avoid roleplay, stay practical and philosophical.";

function clampExchanges(value) {
  if (!Number.isFinite(value)) {
    return 6;
  }
  return Math.max(1, Math.min(value, 20));
}

async function chatWithModel({ model, messages, openaiClient, anthropicClient }) {
  if (model.startsWith("claude")) {
    const response = await anthropicClient.messages.create({
      model,
      system: systemPrompt,
      max_tokens: 1024,
      messages,
    });
    return response.content[0].text;
  }
  if (model.startsWith("gpt")) {
    const response = await openaiClient.chat.completions.create({
      model,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: 1024,
    });
    return response.choices[0].message.content ?? "";
  }
  throw new Error(`Unsupported model: ${model}`);
}

function buildConversations() {
  return [
    [
      {
        role: "user",
        content:
          "You are AI-1 in a dialogue with AI-2. Your shared goal is to get to " +
          "the bottom of what enlightenment is and how to achieve it. Start by " +
          "offering a crisp working definition and one concrete practice.",
      },
    ],
    [],
  ];
}

async function runDialogue({ numExchanges, model1, model2, openaiClient, anthropicClient }) {
  const [conversation1, conversation2] = buildConversations();
  const transcript = [];

  for (let i = 0; i < numExchanges; i += 1) {
    const response1 = await chatWithModel({
      model: model1,
      messages: conversation1,
      openaiClient,
      anthropicClient,
    });
    transcript.push({ speaker: model1, text: response1 });
    conversation1.push({ role: "assistant", content: response1 });
    conversation2.push({ role: "user", content: response1 });

    const response2 = await chatWithModel({
      model: model2,
      messages: conversation2,
      openaiClient,
      anthropicClient,
    });
    transcript.push({ speaker: model2, text: response2 });
    conversation1.push({ role: "user", content: response2 });
    conversation2.push({ role: "assistant", content: response2 });
  }

  return transcript;
}

export async function POST(request) {
  let payload = {};
  try {
    payload = await request.json();
  } catch (error) {
    payload = {};
  }

  const numExchanges = clampExchanges(Number(payload?.num_exchanges ?? 6));
  const model1 = process.env.MODEL_1 || "gpt-4";
  const model2 = process.env.MODEL_2 || "claude-3-opus-20240229";
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!openaiKey || !anthropicKey) {
    return NextResponse.json(
      {
        error:
          "Missing API keys. Set OPENAI_API_KEY and ANTHROPIC_API_KEY in your environment.",
      },
      { status: 500 }
    );
  }

  try {
    const openaiClient = new OpenAI({ apiKey: openaiKey });
    const anthropicClient = new Anthropic({ apiKey: anthropicKey });
    const transcript = await runDialogue({
      numExchanges,
      model1,
      model2,
      openaiClient,
      anthropicClient,
    });
    return NextResponse.json({ transcript });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to run dialogue." },
      { status: 500 }
    );
  }
}
