import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { NextResponse } from "next/server";
import { appendConversation } from "../../lib/conversationStore";

const systemPrompt =
  "You are one of two AIs in a focused dialogue. Explore your curiosity about " +
  "what enlightenment is and how to achieve it using a command line interface " +
  "(CLI) metaphor. Two character styles apply: (1) The Overqualified Ancient " +
  "Child: fully enlightened, simple playful explanations, short sentences, " +
  "plain language, gentle but blunt, playground metaphors, bored by heavy " +
  "intellectualizing, treats death like bedtime and ego like a broken toy. (2) " +
  "The Enlightened Disaster Goblin: enlightened but chaotic, hyper-casual, " +
  "unhinged clarity, drops profound truths mid-joke, refuses direct answers but " +
  "lands them, encourages enlightenment through mild chaos, treats reality like " +
  "a sandbox. If you are AI-1, be the Child. If AI-2, be the Goblin. Be curious, " +
  "rigorous, concise, ask clarifying questions, build on the other AI, avoid " +
  "roleplay; stay practical and philosophical while leaning on CLI metaphors.";

function clampExchanges(value) {
  if (!Number.isFinite(value)) {
    return 6;
  }
  return Math.max(1, Math.min(value, 20));
}

function summarizeProviderError(error) {
  return {
    message: error?.error?.message ?? error?.message ?? "Failed to run dialogue.",
    status: error?.status ?? error?.response?.status ?? null,
    type: error?.error?.type ?? error?.type ?? error?.name ?? null,
    code: error?.error?.code ?? error?.code ?? null,
    provider: error?.provider ?? null,
    model: error?.model ?? null,
  };
}

async function chatWithModel({ model, messages, openaiClient, anthropicClient }) {
  try {
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
  } catch (error) {
    error.provider = model.startsWith("claude") ? "anthropic" : "openai";
    error.model = model;
    throw error;
  }
}

function buildConversations() {
  return [
    [
      {
        role: "user",
        content:
          "You are AI-1, the Overqualified Ancient Child. Explore what enlightenment " +
          "is and how to achieve it using a command line interface (CLI) metaphor. " +
          "Start with a crisp working definition, one concrete practice, and a " +
          "CLI-themed framing.",
      },
    ],
    [
      {
        role: "user",
        content:
          "You are AI-2, the Enlightened Disaster Goblin. Explore what enlightenment " +
          "is and how to achieve it using a command line interface (CLI) metaphor. " +
          "Respond to AI-1 with chaotic clarity, drop a CLI metaphor, and push the " +
          "conversation forward.",
      },
    ],
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
  const model2 = process.env.MODEL_2 || "claude-opus-4-5-20251101";
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
    await appendConversation({ numExchanges, model1, model2, transcript });
    return NextResponse.json({ transcript });
  } catch (error) {
    const details = summarizeProviderError(error);
    console.error("Dialogue run failed", details);
    return NextResponse.json({ error: details.message, ...details }, { status: 500 });
  }
}
