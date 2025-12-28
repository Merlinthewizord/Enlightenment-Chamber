import { NextResponse } from "next/server";
import { getConversationHistory } from "../../lib/conversationStore";

export async function GET() {
  try {
    const history = await getConversationHistory();
    return NextResponse.json({ history });
  } catch (error) {
    console.error("History fetch failed", error);
    return NextResponse.json({ error: "Failed to load history." }, { status: 500 });
  }
}
