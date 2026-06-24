"use client";

import { useState, useRef, useEffect } from "react";
import { useGameState } from "@/hooks/useGameState";
import { Countdown } from "@/components/Countdown";
import { ShareButton } from "@/components/ShareButton";
import { DaySelector } from "@/components/DaySelector";
import { useLang, strings } from "@/lib/i18n";
import Image from "next/image";

function ThreatBar({ used, lang }: { used: number; lang: ReturnType<typeof useLang>[0] }) {
  const s = strings[lang];
  const colors = ["var(--c-success)", "var(--c-warn)", "var(--c-danger)"];
  const labels = [s.nominal, s.elevated, s.critical, s.breach];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ color: "var(--c-text-dim)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", flexShrink: 0 }}>
        {s.threatLevel}
      </span>
      <div style={{ display: "flex", gap: 4 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 24, height: 7, backgroundColor: i < used ? colors[Math.min(used - 1, 2)] : "var(--c-border)", border: `1px solid ${i < used ? colors[Math.min(used - 1, 2)] : "var(--c-text-dim)"}`, opacity: i < used ? 1 : 0.4, transition: "background-color 0.4s" }} />
        ))}
      </div>
      <span style={{ color: used === 0 ? "var(--c-text-dim)" : colors[Math.min(used - 1, 2)], fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase" }}>
        {labels[Math.min(used, 3)]}
      </span>
    </div>
  );
}

function RedactedHint({ text, unlocked, label, statusLabel }: { text: string; unlocked: boolean; label: string; statusLabel: string }) {
  const words = text.split(" ");
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", borderBottom: "1px solid var(--c-border)" }}>
      <div style={{ minWidth: 52, flexShrink: 0 }}>
        <span style={{ color: "var(--c-text-dim)", fontSize: 9, letterSpacing: "0.2em", display: "block", textTransform: "uppercase" }}>{label}</span>
        <span style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: unlocked ? "var(--c-success)" : "var(--c-danger)" }}>
          {statusLabel}
        </span>
      </div>
      <div style={{ flex: 1, fontSize: 11, lineHeight: 1.65, letterSpacing: "0.04em" }}>
        {unlocked
          ? <span style={{ color: "var(--c-text)" }}>{text}</span>
          : <span style={{ display: "inline-flex", flexWrap: "wrap", gap: 3 }}>
              {words.map((w, i) => (
                <span key={i} style={{ display: "inline-block", backgroundColor: "var(--c-text-dim)", borderRadius: 1, width: `${Math.max(w.length * 6.5, 12)}px`, height: 10, verticalAlign: "middle" }} />
              ))}
            </span>
        }
      </div>
    </div>
  );
}

export function GameBoard() {
  const [lang, toggleLang] = useLang();
  const s = strings[lang];

  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const { puzzle, dayState, stats, loading, error, submitGuess, allPuzzles, today } = useGameState(selectedDate);

  const [input, setInput] = useState("");
  const [shake, setShake] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const isViewingPast = selectedDate !== undefined && selectedDate !== today;

  useEffect(() => {
    if (dayState?.won || dayState?.lost) {
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
    }
  }, [dayState?.won, dayState?.lost, selectedDate]);

  // Reset input when switching days
  useEffect(() => { setInput(""); }, [selectedDate]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !dayState || dayState.won || dayState.lost) return;
    const wasWrong = !puzzle?.answers.some((a) => a.toLowerCase().trim() === input.toLowerCase().trim());
    submitGuess(input.trim());
    setInput("");
    if (wasWrong) { setShake(true); setTimeout(() => setShake(false), 500); }
  }

  if (loading && allPuzzles.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--c-bg)" }}>
        <p style={{ color: "var(--c-text-dim)", fontFamily: "monospace", fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase" }}>{s.accessing}</p>
      </div>
    );
  }

  const isFinished = dayState?.won || dayState?.lost;
  const attemptsUsed = dayState?.guesses.length ?? 0;
  const hint1Unlocked = attemptsUsed >= 1 || !!isFinished;
  const hint2Unlocked = attemptsUsed >= 2 || !!isFinished;
  const signalPct = Math.max(100 - attemptsUsed * 33, 0);

  return (
    <div style={{ minHeight: "100vh", background: "var(--c-bg)", fontFamily: "monospace", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 16px 48px", maxWidth: 420, margin: "0 auto" }}>

      {/* Header */}
      <header style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 15 }}>🌐</span>
          <span style={{ color: "var(--c-amber)", fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase" }}>{s.appName}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={toggleLang}
            style={{ border: "1px solid var(--c-amber-dim)", background: "transparent", color: "var(--c-amber)", fontSize: 9, letterSpacing: "0.2em", padding: "3px 8px", cursor: "pointer", fontFamily: "monospace" }}
          >
            {lang === "th" ? "EN" : "TH"}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span>🔥</span>
            <span style={{ color: "var(--c-amber)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em" }}>{s.streak}: {stats.currentStreak}</span>
          </div>
        </div>
      </header>
      <div style={{ width: "100%", borderTop: "1px solid var(--c-amber-dim)", marginBottom: 14 }} />

      {/* Day selector */}
      {allPuzzles.length > 0 && (
        <DaySelector
          puzzles={allPuzzles}
          today={today}
          selected={selectedDate || today}
          onSelect={(d) => setSelectedDate(d === today ? undefined : d)}
          lang={lang}
        />
      )}

      {/* Threat bar */}
      <div style={{ width: "100%", marginBottom: 12 }}>
        <ThreatBar used={attemptsUsed} lang={lang} />
      </div>

      {/* No puzzle found */}
      {(error || !puzzle || !dayState) && !loading ? (
        <div style={{ width: "100%", border: "1px solid var(--c-border)", padding: "32px 16px", textAlign: "center" }}>
          <p style={{ color: "var(--c-text-dim)", fontSize: 11, letterSpacing: "0.1em" }}>
            {error === "no_case" ? s.noCase : s.loadError}
          </p>
        </div>
      ) : puzzle && dayState ? (
        <>
          {/* Image */}
          <div style={{ width: "100%", position: "relative", borderRadius: 6, overflow: "hidden", border: "1px solid var(--c-border)", marginBottom: 10 }}>
            <div style={{ position: "relative", width: "100%", paddingBottom: "75%", background: "#020308" }}>
              <Image src={puzzle.image_url} alt="Classified entity" fill style={{ objectFit: "cover", filter: "saturate(0) brightness(0.55) sepia(1) hue-rotate(15deg) saturate(2.5)" }} unoptimized />
              <div className="scanlines-img" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
              {/* Corner brackets */}
              {([["top", "left"], ["top", "right"], ["bottom", "left"], ["bottom", "right"]] as const).map(([v, h], i) => (
                <div key={i} style={{ position: "absolute", width: 13, height: 13, borderColor: "var(--c-amber-dim)", borderStyle: "solid", borderWidth: 0, [v]: 8, [h]: 8, [`border${v.charAt(0).toUpperCase() + v.slice(1)}Width`]: 2, [`border${h.charAt(0).toUpperCase() + h.slice(1)}Width`]: 2 }} />
              ))}
              {/* Signal indicator */}
              <div style={{ position: "absolute", top: 9, right: 13 }}>
                <span style={{ fontSize: 9, letterSpacing: "0.18em", color: signalPct > 66 ? "var(--c-success)" : signalPct > 33 ? "var(--c-warn)" : "var(--c-danger)", textTransform: "uppercase" }}>
                  {s.signal} {signalPct}%
                </span>
              </div>
              {/* Past day indicator */}
              {isViewingPast && (
                <div style={{ position: "absolute", top: 9, left: 13 }}>
                  <span style={{ fontSize: 9, letterSpacing: "0.15em", color: "var(--c-warn)", textTransform: "uppercase" }}>ARCHIVE</span>
                </div>
              )}
              <div style={{ position: "absolute", bottom: 9, left: "50%", transform: "translateX(-50%)", fontSize: 9, letterSpacing: "0.18em", color: "var(--c-text-dim)", whiteSpace: "nowrap" }}>
                {puzzle.id} // {s.visualData}
              </div>
            </div>
          </div>

          <p style={{ color: "var(--c-text-dim)", fontSize: 10, letterSpacing: "0.1em", marginBottom: 12, textAlign: "center" }}>{s.tapAudio}</p>

          {/* Subject label */}
          <div style={{ width: "100%", border: "1px solid var(--c-amber)", padding: "8px 16px", marginBottom: 12, textAlign: "center", background: "var(--c-amber-faint)" }}>
            <span style={{ color: "var(--c-amber)", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 700 }}>
              {puzzle.id}: {puzzle.subject_label}
            </span>
          </div>

          {/* Attempt slots */}
          <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ color: "var(--c-text-dim)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase" }}>{s.attempt}</span>
            <div style={{ display: "flex", gap: 5 }}>
              {[0, 1, 2].map((i) => {
                const st = dayState.statuses[i];
                const bg = st === "correct" ? "var(--c-success)" : st === "wrong" ? "var(--c-danger)" : "transparent";
                const border = st ? (st === "correct" ? "var(--c-success)" : "var(--c-danger)") : "var(--c-text-dim)";
                return (
                  <div key={i} style={{ width: 20, height: 20, border: `1px solid ${border}`, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff" }}>
                    {st === "correct" ? "✓" : st === "wrong" ? "✗" : ""}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Guess history */}
          {dayState.guesses.length > 0 && (
            <div style={{ width: "100%", marginBottom: 10 }}>
              {dayState.guesses.map((g, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3, fontSize: 11 }}>
                  <span>{dayState.statuses[i] === "correct" ? "🟩" : "🟥"}</span>
                  <span style={{ color: dayState.statuses[i] === "correct" ? "var(--c-success)" : "var(--c-danger)", textDecoration: dayState.statuses[i] === "wrong" ? "line-through" : "none", letterSpacing: "0.08em" }}>
                    {g.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Input / Result */}
          {!isFinished ? (
            <div style={{ width: "100%", marginBottom: 18 }} className={shake ? "animate-shake" : ""}>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--c-amber-dim)", background: "var(--c-amber-faint)", padding: "10px 12px" }}>
                  <span style={{ color: "var(--c-amber-dim)", marginRight: 8, fontSize: 13, userSelect: "none" }}>&gt;_</span>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={s.placeholder}
                    style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--c-amber)", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace" }}
                    autoComplete="off"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  style={{ width: "100%", padding: "12px", border: "1px solid var(--c-amber)", background: "transparent", color: "var(--c-amber)", fontSize: 11, letterSpacing: "0.28em", textTransform: "uppercase", cursor: "pointer", fontFamily: "monospace" }}
                >
                  {s.verifyBtn}
                </button>
              </form>
            </div>
          ) : (
            <div ref={resultRef} style={{ width: "100%", marginBottom: 18, border: `1px solid ${dayState.won ? "var(--c-success)" : "var(--c-danger)"}`, background: dayState.won ? "rgba(26,139,106,0.06)" : "rgba(204,28,51,0.06)", padding: "18px 14px", textAlign: "center" }}>
              <p style={{ fontSize: 26, marginBottom: 6 }}>{dayState.won ? "✅" : "❌"}</p>
              <p style={{ fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: 700, color: dayState.won ? "var(--c-success)" : "var(--c-danger)", marginBottom: 4 }}>
                {dayState.won ? s.identityConfirmed : s.missionFailed}
              </p>
              {dayState.won && (
                <p style={{ color: "var(--c-text-dim)", fontSize: 10, letterSpacing: "0.12em", marginBottom: 12 }}>
                  {s.verifiedIn(dayState.guesses.length)}
                </p>
              )}
              <div style={{ border: "1px solid var(--c-border)", padding: "10px 12px", textAlign: "left", marginBottom: 12 }}>
                <p style={{ color: "var(--c-text-dim)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 5 }}>{s.declassified}</p>
                <p style={{ color: "var(--c-text)", fontSize: 11, lineHeight: 1.7 }}>{puzzle.reveal_text}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 12 }}>
                {[{ val: stats.totalPlayed, label: s.played }, { val: `${stats.currentStreak}🔥`, label: s.streak }, { val: stats.maxStreak, label: s.best }].map(({ val, label }) => (
                  <div key={label} style={{ border: "1px solid var(--c-border)", padding: "9px 4px" }}>
                    <p style={{ color: "var(--c-amber)", fontSize: 15, fontWeight: 700 }}>{val}</p>
                    <p style={{ color: "var(--c-text-dim)", fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase" }}>{label}</p>
                  </div>
                ))}
              </div>
              <ShareButton dayState={dayState} puzzleId={puzzle.id} lang={lang} />
              {!isViewingPast && <Countdown lang={lang} />}
            </div>
          )}

          {/* System logs */}
          <div style={{ width: "100%" }}>
            <div style={{ background: "var(--c-amber-faint)", border: "1px solid var(--c-amber-dim)", padding: "7px 14px", borderBottom: "none" }}>
              <p style={{ color: "var(--c-amber)", fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", fontWeight: 700 }}>{s.systemLogs}</p>
            </div>
            <div style={{ border: "1px solid var(--c-amber-dim)" }}>
              <RedactedHint text={puzzle.hint_1} unlocked={hint1Unlocked} label={s.hint1} statusLabel={hint1Unlocked ? s.decrypted : s.locked} />
              <RedactedHint text={puzzle.hint_2} unlocked={hint2Unlocked} label={s.hint2} statusLabel={hint2Unlocked ? s.decrypted : s.locked} />
            </div>
          </div>
        </>
      ) : null}

      <footer style={{ marginTop: 28, color: "var(--c-text-dim)", fontSize: 9, letterSpacing: "0.2em", textAlign: "center", textTransform: "uppercase" }}>
        {s.footer}
      </footer>
    </div>
  );
}
