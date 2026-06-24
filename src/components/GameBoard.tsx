"use client";

import { useState, useRef, useEffect } from "react";
import { useGameState } from "@/hooks/useGameState";
import { Countdown } from "@/components/Countdown";
import { ShareButton } from "@/components/ShareButton";
import Image from "next/image";

function ThreatBar({ used }: { used: number }) {
  const slots = [0, 1, 2];
  const colors = ["#1a8b6a", "#b87d00", "#cc1c33"];
  return (
    <div className="flex items-center gap-2">
      <span style={{ color: "var(--c-text-dim)", fontSize: "9px", letterSpacing: "0.25em" }}>
        THREAT LEVEL
      </span>
      <div className="flex gap-1">
        {slots.map((i) => (
          <div
            key={i}
            style={{
              width: 28,
              height: 8,
              backgroundColor: i < used ? colors[Math.min(used - 1, 2)] : "var(--c-border)",
              border: `1px solid ${i < used ? colors[Math.min(used - 1, 2)] : "var(--c-text-dim)"}`,
              opacity: i < used ? 1 : 0.4,
              transition: "background-color 0.4s, opacity 0.4s",
            }}
          />
        ))}
      </div>
      <span style={{ color: colors[Math.min(used - 1, 2)] ?? "var(--c-text-dim)", fontSize: "9px", letterSpacing: "0.2em" }}>
        {used === 0 ? "NOMINAL" : used === 1 ? "ELEVATED" : used === 2 ? "CRITICAL" : "BREACH"}
      </span>
    </div>
  );
}

function RedactedHint({ text, unlocked, label }: { text: string; unlocked: boolean; label: string }) {
  const words = text.split(" ");
  return (
    <div className="flex items-start gap-3 py-3 px-4" style={{ borderBottom: "1px solid var(--c-border)" }}>
      <div style={{ minWidth: 48 }}>
        <span style={{ color: "var(--c-text-dim)", fontSize: "9px", letterSpacing: "0.25em", display: "block" }}>
          {label}
        </span>
        <span style={{ fontSize: "10px", color: unlocked ? "var(--c-success)" : "var(--c-danger)", letterSpacing: "0.1em" }}>
          {unlocked ? "DECRYPTED" : "LOCKED"}
        </span>
      </div>
      <p style={{ fontSize: "11px", lineHeight: 1.6, color: unlocked ? "var(--c-text)" : "transparent", textShadow: unlocked ? "none" : "0 0 8px var(--c-text-dim)", letterSpacing: "0.05em" }}>
        {unlocked ? text : words.map((w, i) => (
          <span key={i} style={{ display: "inline-block", backgroundColor: "var(--c-text-dim)", borderRadius: 1, marginRight: 4, marginBottom: 2, width: `${Math.max(w.length * 6.5, 12)}px`, height: "11px", verticalAlign: "middle" }} />
        ))}
      </p>
    </div>
  );
}

export function GameBoard() {
  const { puzzle, dayState, stats, loading, error, submitGuess } = useGameState();
  const [input, setInput] = useState("");
  const [shake, setShake] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dayState?.won || dayState?.lost) {
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
    }
  }, [dayState?.won, dayState?.lost]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !dayState || dayState.won || dayState.lost) return;
    const wasWrong = !puzzle?.answers.some(
      (a) => a.toLowerCase().trim() === input.toLowerCase().trim()
    );
    submitGuess(input.trim());
    setInput("");
    if (wasWrong) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--c-bg)" }}>
        <p style={{ color: "var(--c-amber-dim)", fontFamily: "monospace", fontSize: "12px", letterSpacing: "0.3em", textTransform: "uppercase" }}>
          Accessing archive...
        </p>
      </div>
    );
  }

  if (error || !puzzle || !dayState) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--c-bg)" }}>
        <p style={{ color: "var(--c-danger)", fontFamily: "monospace", textAlign: "center", padding: "0 24px" }}>{error ?? "No data found"}</p>
      </div>
    );
  }

  const isFinished = dayState.won || dayState.lost;
  const attemptsUsed = dayState.guesses.length;
  const hint1Unlocked = attemptsUsed >= 1 || isFinished;
  const hint2Unlocked = attemptsUsed >= 2 || isFinished;
  const signalPct = Math.max(100 - attemptsUsed * 33, 0);

  return (
    <div style={{ minHeight: "100vh", background: "var(--c-bg)", fontFamily: "monospace", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 16px 48px", maxWidth: 420, margin: "0 auto" }}>

      {/* Header */}
      <header style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>🌐</span>
          <span style={{ color: "var(--c-amber)", fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase" }}>
            Xeno-Archive
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
          <span>🔥</span>
          <span style={{ color: "var(--c-amber)", fontWeight: 700, letterSpacing: "0.15em" }}>
            Streak: {stats.currentStreak}
          </span>
        </div>
      </header>
      <div style={{ width: "100%", borderTop: "1px solid var(--c-amber-dim)", marginBottom: 16 }} />

      {/* Threat bar */}
      <div style={{ width: "100%", marginBottom: 14 }}>
        <ThreatBar used={attemptsUsed} />
      </div>

      {/* Image */}
      <div style={{ width: "100%", position: "relative", borderRadius: 6, overflow: "hidden", border: "1px solid var(--c-border)", marginBottom: 10 }}>
        <div style={{ position: "relative", width: "100%", paddingBottom: "75%", background: "#020308" }}>
          <Image
            src={puzzle.image_url}
            alt="Classified entity"
            fill
            style={{ objectFit: "cover", filter: "saturate(0) brightness(0.55) sepia(1) hue-rotate(15deg) saturate(2.5)" }}
            unoptimized
          />
          <div className="scanlines-img" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
          {/* Corner brackets */}
          {[["top-2 left-2", "border-t-2 border-l-2"], ["top-2 right-2", "border-t-2 border-r-2"], ["bottom-2 left-2", "border-b-2 border-l-2"], ["bottom-2 right-2", "border-b-2 border-r-2"]].map(([pos, border], i) => (
            <div key={i} style={{ position: "absolute", width: 14, height: 14, borderColor: "var(--c-amber-dim)", borderStyle: "solid", borderWidth: 0, ...(pos.includes("top") ? { top: 8 } : { bottom: 8 }), ...(pos.includes("left") ? { left: 8 } : { right: 8 }), ...(border.includes("border-t") ? { borderTopWidth: 2 } : { borderBottomWidth: 2 }), ...(border.includes("border-l") ? { borderLeftWidth: 2 } : { borderRightWidth: 2 }) }} />
          ))}
          {/* Signal integrity */}
          <div style={{ position: "absolute", top: 10, right: 14, textAlign: "right" }}>
            <span style={{ fontSize: 9, letterSpacing: "0.2em", color: signalPct > 66 ? "var(--c-success)" : signalPct > 33 ? "var(--c-warn)" : "var(--c-danger)" }}>
              SIGNAL {signalPct}%
            </span>
          </div>
          {/* ID watermark */}
          <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", fontSize: 9, letterSpacing: "0.2em", color: "var(--c-text-dim)", whiteSpace: "nowrap" }}>
            {puzzle.id} // VISUAL DATA
          </div>
        </div>
      </div>

      {/* Audio hint */}
      <p style={{ color: "var(--c-text-dim)", fontSize: 11, letterSpacing: "0.12em", marginBottom: 14, textAlign: "center" }}>
        ( 🔊 ) Tap to listen to interference signal
      </p>

      {/* Subject label */}
      <div style={{ width: "100%", border: "1px solid var(--c-amber)", padding: "8px 16px", marginBottom: 14, textAlign: "center", background: "var(--c-amber-faint)" }}>
        <span style={{ color: "var(--c-amber)", fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: 700 }}>
          {puzzle.id}: {puzzle.subject_label}
        </span>
      </div>

      {/* Attempt slots */}
      <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{ color: "var(--c-text-dim)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase" }}>Attempt</span>
        <div style={{ display: "flex", gap: 6 }}>
          {[0, 1, 2].map((i) => {
            const status = dayState.statuses[i];
            const bg = status === "correct" ? "var(--c-success)" : status === "wrong" ? "var(--c-danger)" : "transparent";
            const border = status ? (status === "correct" ? "var(--c-success)" : "var(--c-danger)") : "var(--c-text-dim)";
            return (
              <div key={i} style={{ width: 20, height: 20, border: `1px solid ${border}`, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>
                {status === "correct" ? "✓" : status === "wrong" ? "✗" : ""}
              </div>
            );
          })}
        </div>
      </div>

      {/* Previous guesses */}
      {dayState.guesses.length > 0 && (
        <div style={{ width: "100%", marginBottom: 10 }}>
          {dayState.guesses.map((g, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, fontSize: 11 }}>
              <span>{dayState.statuses[i] === "correct" ? "🟩" : "🟥"}</span>
              <span style={{ color: dayState.statuses[i] === "correct" ? "var(--c-success)" : "var(--c-danger)", textDecoration: dayState.statuses[i] === "wrong" ? "line-through" : "none", letterSpacing: "0.1em" }}>
                {g.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Input / result */}
      {!isFinished ? (
        <div style={{ width: "100%", marginBottom: 20 }} className={shake ? "animate-shake" : ""}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--c-amber-dim)", background: "var(--c-amber-faint)", padding: "10px 12px" }}>
              <span style={{ color: "var(--c-amber-dim)", marginRight: 8, fontSize: 13, userSelect: "none" }}>&gt;_</span>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter creature name..."
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--c-amber)", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase" }}
                autoComplete="off"
                autoFocus
              />
            </div>
            <button
              type="submit"
              style={{ width: "100%", padding: "12px", border: "1px solid var(--c-amber)", background: "transparent", color: "var(--c-amber)", fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", cursor: "pointer", transition: "background 0.15s, color 0.15s" }}
              onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = "var(--c-amber)"; (e.target as HTMLButtonElement).style.color = "var(--c-bg)"; }}
              onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = "transparent"; (e.target as HTMLButtonElement).style.color = "var(--c-amber)"; }}
            >
              [ VERIFY DATA ]
            </button>
          </form>
        </div>
      ) : (
        <div ref={resultRef} style={{ width: "100%", marginBottom: 20, border: `1px solid ${dayState.won ? "var(--c-success)" : "var(--c-danger)"}`, background: dayState.won ? "rgba(26,139,106,0.06)" : "rgba(204,28,51,0.06)", padding: "20px 16px", textAlign: "center" }}>
          <p style={{ fontSize: 28, marginBottom: 8 }}>{dayState.won ? "✅" : "❌"}</p>
          <p style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: 700, color: dayState.won ? "var(--c-success)" : "var(--c-danger)", marginBottom: 4 }}>
            {dayState.won ? "Identity Confirmed" : "Mission Failed"}
          </p>
          {dayState.won && (
            <p style={{ color: "var(--c-text-dim)", fontSize: 10, letterSpacing: "0.15em", marginBottom: 12 }}>
              Verified in {dayState.guesses.length}/3 attempt{dayState.guesses.length > 1 ? "s" : ""}
            </p>
          )}
          <div style={{ border: "1px solid var(--c-border)", padding: 12, textAlign: "left", marginBottom: 14 }}>
            <p style={{ color: "var(--c-text-dim)", fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 6 }}>// Declassified</p>
            <p style={{ color: "var(--c-text)", fontSize: 11, lineHeight: 1.7 }}>{puzzle.reveal_text}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
            {[{ val: stats.totalPlayed, label: "PLAYED" }, { val: `${stats.currentStreak}🔥`, label: "STREAK" }, { val: stats.maxStreak, label: "BEST" }].map(({ val, label }) => (
              <div key={label} style={{ border: "1px solid var(--c-border)", padding: "10px 4px" }}>
                <p style={{ color: "var(--c-amber)", fontSize: 16, fontWeight: 700 }}>{val}</p>
                <p style={{ color: "var(--c-text-dim)", fontSize: 8, letterSpacing: "0.25em" }}>{label}</p>
              </div>
            ))}
          </div>
          <ShareButton dayState={dayState} puzzleId={puzzle.id} />
          <Countdown />
        </div>
      )}

      {/* System logs */}
      <div style={{ width: "100%" }}>
        <div style={{ background: "var(--c-amber-faint)", border: "1px solid var(--c-amber-dim)", padding: "8px 16px", borderBottom: "none" }}>
          <p style={{ color: "var(--c-amber)", fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: 700 }}>
            System Logs / Decrypted Hints
          </p>
        </div>
        <div style={{ border: "1px solid var(--c-amber-dim)" }}>
          <RedactedHint text={puzzle.hint_1} unlocked={hint1Unlocked} label="HINT-01" />
          <RedactedHint text={puzzle.hint_2} unlocked={hint2Unlocked} label="HINT-02" />
        </div>
      </div>

      <footer style={{ marginTop: 32, color: "var(--c-text-dim)", fontSize: 9, letterSpacing: "0.25em", textAlign: "center", textTransform: "uppercase" }}>
        Xeno-Archive System // All data classified
      </footer>
    </div>
  );
}
