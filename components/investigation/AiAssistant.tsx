"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Dictionary, Locale } from "@/lib/i18n/translations";

type AssistantDict = Dictionary["investigation"]["assistant"];

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

// Client component (needs local chat state + fetch) that talks to
// app/api/assistant/route.ts, which is the only place that touches the
// Claude API — this component never calls Anthropic directly. History is
// kept in memory only (component state), same as every other demo-session
// entity here; it resets on navigation/refresh.
export function AiAssistant({ companyId, locale, t }: { companyId: string; locale: Locale; t: AssistantDict }) {
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitQuestion() {
    const question = input.trim();
    if (!question || loading) return;

    const history = messages;
    setMessages([...history, { role: "user", content: question }]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, question, locale, history }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? `Request failed (${res.status})`);
        return;
      }
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {messages.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.emptyState}</p>
      ) : (
        <ul className="space-y-3">
          {messages.map((m, i) => (
            <li key={i} className="text-sm">
              <p className="mb-1 text-xs font-semibold text-muted-foreground">
                {m.role === "user" ? t.userLabel : t.assistantLabel}
              </p>
              <p className="whitespace-pre-wrap rounded-md border bg-muted/30 p-3">{m.content}</p>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {t.errorPrefix}
          {error}
        </p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitQuestion();
        }}
        className="flex items-end gap-2"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.placeholder}
          className="min-h-16"
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submitQuestion();
            }
          }}
        />
        <Button type="submit" disabled={loading || !input.trim()}>
          {loading ? t.sending : t.send}
        </Button>
      </form>
    </div>
  );
}
