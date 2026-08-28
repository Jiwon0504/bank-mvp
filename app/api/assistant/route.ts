import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { ASSISTANT_SYSTEM_PROMPT, buildCompanyContext } from "@/lib/aiAssistant";

// Resolves credentials from the environment (ANTHROPIC_API_KEY /
// ANTHROPIC_AUTH_TOKEN / an `ant auth login` profile) — never hardcode a key.
const client = new Anthropic();

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

interface AssistantRequestBody {
  companyId?: string;
  question?: string;
  locale?: "ko" | "en";
  history?: ChatTurn[];
}

export async function POST(request: Request) {
  const body = (await request.json()) as AssistantRequestBody;
  const { companyId, question, locale, history } = body;

  if (!companyId || !question?.trim()) {
    return NextResponse.json({ error: "companyId and question are required" }, { status: 400 });
  }

  const context = buildCompanyContext(companyId);
  if (!context) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  const languageInstruction =
    locale === "en"
      ? "Respond in English."
      : "Respond in Korean (한국어로 답변하세요).";

  try {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 4096,
      system: [
        { type: "text", text: ASSISTANT_SYSTEM_PROMPT },
        {
          type: "text",
          text: `Here is the full internal data on this borrower:\n\n${context}`,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        ...(history ?? []).map((turn) => ({ role: turn.role, content: turn.content })),
        { role: "user" as const, content: `${languageInstruction}\n\n${question}` },
      ],
    });

    const answer = response.content.find((block) => block.type === "text")?.text ?? "";
    return NextResponse.json({ answer });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: "AI Assistant is not configured (invalid API credentials)." }, { status: 500 });
    }
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "Rate limited — please try again shortly." }, { status: 429 });
    }
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json({ error: `AI Assistant request failed: ${error.message}` }, { status: 502 });
    }
    throw error;
  }
}
