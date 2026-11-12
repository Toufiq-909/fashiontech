"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Recommendation = { name: string; brand: string; priceINR: number; fabric: string; href: string };
type BotReply = { message: string; results: Recommendation[] };

const QUICK_PROMPTS = ["Easy-care shirts", "Merino for travel", "Something under ₹2,000"];

export function StyleConcierge() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [reply, setReply] = useState<BotReply | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const visible = scrolled || open;

  async function ask(message: string) {
    const trimmed = message.trim();
    if (!trimmed || loading) return;
    setInput("");
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = (await response.json()) as BotReply & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "I couldn’t search the collection just now.");
      setReply(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "I couldn’t search the collection just now.");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(input);
  }

  return (
    <aside
      className={`style-concierge ${open ? "is-open" : ""} ${visible ? "is-visible" : ""}`}
      aria-label="Butterfly shopping assistant"
    >
      {open && (
        <div className="concierge-panel" id="style-concierge-panel">
          <div className="concierge-head">
            <div>
              <span className="concierge-eyebrow">Butterfly concierge</span>
              <h2>Find your next favourite.</h2>
            </div>
            <button type="button" className="concierge-close" onClick={() => setOpen(false)} aria-label="Close concierge">×</button>
          </div>
          <div className="concierge-body">
            <p className="concierge-welcome">Tell me what you need — a fabric, occasion, fit, category or budget — and I’ll search the catalogue.</p>
            {!reply && <div className="concierge-prompts">{QUICK_PROMPTS.map((prompt) => <button type="button" key={prompt} onClick={() => void ask(prompt)}>{prompt}</button>)}</div>}
            {loading && <p className="concierge-status">Looking through the collection…</p>}
            {error && <p className="concierge-error">{error}</p>}
            {reply && !loading && (
              <div className="concierge-reply" aria-live="polite">
                <p>{reply.message}</p>
                <div className="concierge-results">
                  {reply.results.map((item) => (
                    <Link key={item.href} href={item.href} className="concierge-result">
                      <span><strong>{item.name}</strong><small>{item.brand} · {item.fabric}</small></span>
                      <b>₹{item.priceINR.toLocaleString("en-IN")}</b>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          <form className="concierge-form" onSubmit={onSubmit}>
            <label className="sr-only" htmlFor="concierge-question">What are you looking for?</label>
            <input id="concierge-question" value={input} onChange={(event) => setInput(event.target.value)} placeholder="e.g. breathable shirts for travel" maxLength={500} />
            <button type="submit" disabled={!input.trim() || loading}>Send</button>
          </form>
        </div>
      )}
      <button className="concierge-toggle" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="style-concierge-panel">
        <span className="concierge-toggle-mark" aria-hidden="true">✦</span>
        <span>{open ? "Close" : "Need help finding something?"}</span>
      </button>
    </aside>
  );
}
