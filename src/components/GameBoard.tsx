"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useGameState } from "@/hooks/useGameState";
import { DaySelector } from "@/components/DaySelector";
import { Countdown } from "@/components/Countdown";
import { useLang, strings } from "@/lib/i18n";
import { Clue, ClueAudio, ClueRedacted, ClueImage } from "@/lib/gameLogic";

const WAVE_HEIGHTS = [4, 9, 14, 6, 19, 11, 4, 20, 13, 7, 17, 8, 4, 15, 10, 18, 6, 12, 5, 8];

function AudioClueBlock({ clue }: { clue: ClueAudio }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 2, marginBottom: 10, height: 24 }}>
        <span style={{ fontSize: 11, color: "var(--c-amber)", marginRight: 4 }}>♪</span>
        {WAVE_HEIGHTS.map((h, i) => (
          <div
            key={i}
            style={{
              width: 3,
              height: h,
              background: "var(--c-amber)",
              borderRadius: 1,
              transformOrigin: "bottom",
              animation: `wavebar 0.9s ease-in-out ${(i * 0.06).toFixed(2)}s infinite alternate`,
              opacity: 0.8,
            }}
          />
        ))}
      </div>
      <p style={{
        color: "var(--c-text)",
        fontSize: 13,
        fontFamily: "monospace",
        letterSpacing: "0.06em",
        lineHeight: 1.9,
        margin: 0,
      }}>
        {clue.transcript}
      </p>
    </div>
  );
}

function RedactedClueBlock({ clue }: { clue: ClueRedacted }) {
  return (
    <p style={{ color: "var(--c-text)", fontSize: 13, fontFamily: "monospace", lineHeight: 1.9, margin: 0 }}>
      <span style={{ color: "var(--c-text-dim)", marginRight: 6 }}>≡</span>
      {clue.parts.map((part, i) => {
        if (typeof part === "string") return <span key={i}>{part}</span>;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              background: "var(--c-amber-dim)",
              borderRadius: 2,
              padding: "1px 3px",
              letterSpacing: "0.15em",
              color: "var(--c-amber-dim)",
              userSelect: "none",
              fontSize: 11,
            }}
          >
            {"█".repeat(part.r)}
          </span>
        );
      })}
    </p>
  );
}

function ImageClueBlock({ clue }: { clue: ClueImage }) {
  return (
    <div>
      <div style={{ position: "relative", overflow: "hidden", border: "1px solid var(--c-border)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={clue.image_url}
          alt="evidence"
          style={{ width: "100%", display: "block", opacity: 0.5, filter: "saturate(0.15) brightness(0.6)" }}
        />
        <div className="scanlines-img" style={{ position: "absolute", inset: 0 }} />
        <div style={{
          position: "absolute",
          bottom: 6,
          left: 8,
          fontSize: 8,
          color: "var(--c-text-dim)",
          fontFamily: "monospace",
          letterSpacing: "0.1em",
        }}>
          IMG · 49 bytes · degraded
        </div>
      </div>
      <p style={{
        fontSize: 11,
        color: "var(--c-text-dim)",
        fontFamily: "monospace",
        marginTop: 8,
        lineHeight: 1.7,
        letterSpacing: "0.04em",
      }}>
        {clue.caption}
      </p>
    </div>
  );
}

function ClueBlock({ clue, index, unlocked, lang }: {
  clue: Clue;
  index: number;
  unlocked: boolean;
  lang: "th" | "en";
}) {
  const s = strings[lang];
  return (
    <div style={{
      border: "1px solid var(--c-border)",
      borderRadius: 2,
      overflow: "hidden",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "10px 14px",
        background: "rgba(0,0,0,0.25)",
        gap: 12,
      }}>
        <span style={{ fontSize: 10, color: "var(--c-text-dim)", letterSpacing: "0.15em", fontFamily: "monospace", lineHeight: 1.5 }}>
          {s.clue} #{index} · {clue.label}
        </span>
        <span style={{
          fontSize: 9,
          letterSpacing: "0.25em",
          fontFamily: "monospace",
          color: unlocked ? "var(--c-amber)" : "var(--c-text-dim)",
          flexShrink: 0,
        }}>
          {unlocked ? s.unlocked : s.locked}
        </span>
      </div>
      {unlocked && (
        <div style={{ padding: "12px 14px", opacity: 1 }}>
          {clue.type === "audio" && <AudioClueBlock clue={clue} />}
          {clue.type === "redacted" && <RedactedClueBlock clue={clue} />}
          {clue.type === "image" && <ImageClueBlock clue={clue} />}
        </div>
      )}
    </div>
  );
}

export default function GameBoard() {
  const [lang, toggleLang] = useLang();
  const s = strings[lang];
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const { puzzle, dayState, stats, loading, error, submitGuess, allPuzzles, today } =
    useGameState(selectedDate);

  const [input, setInput] = useState("");
  const [shake, setShake] = useState(false);
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const attemptsUsed = dayState?.guesses.length ?? 0;
  const isFinished = !!(dayState?.won || dayState?.lost);
  const isViewingPast = selectedDate !== undefined && selectedDate !== today;

  useEffect(() => {
    if (isFinished && resultRef.current) {
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 250);
    }
  }, [isFinished]);

  const handleSubmit = useCallback(() => {
    if (!input.trim() || !dayState || isFinished) return;
    const trimmed = input.trim();
    submitGuess(trimmed);
    setInput("");
    // check if correct to avoid shake on win
    const isCorrect = puzzle?.answers.some(
      (a) => a.toLowerCase().trim() === trimmed.toLowerCase().trim()
    );
    if (!isCorrect) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  }, [input, dayState, isFinished, puzzle, submitGuess]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  async function handleShare() {
    if (!puzzle || !dayState) return;
    const marks = dayState.statuses.map((st) => (st === "correct" ? "✓" : "✗")).join(" ");
    const empty = Array.from({ length: 3 - attemptsUsed }, () => "○").join(" ");
    const result = dayState.won ? s.solvedIn(attemptsUsed) : s.failedIn(attemptsUsed);
    const text = `📁 ${s.appName}
${puzzle.id}: ${puzzle.case_name}
${marks}${empty ? " " + empty : ""}
${result}

mystery.promptforth.com`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading && allPuzzles.length === 0) {
    return (
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "60px 16px", textAlign: "center" }}>
        <p style={{ color: "var(--c-text-dim)", fontSize: 11, letterSpacing: "0.2em", fontFamily: "monospace" }}>
          {s.accessing}
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 16px 80px" }}>

      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button
          onClick={toggleLang}
          style={{
            background: "transparent",
            border: "1px solid var(--c-border)",
            color: "var(--c-text-dim)",
            fontFamily: "monospace",
            fontSize: 10,
            letterSpacing: "0.2em",
            padding: "4px 10px",
            cursor: "pointer",
          }}
        >
          {lang === "th" ? "EN" : "TH"}
        </button>
        <span style={{ fontSize: 11, color: "var(--c-text-dim)", fontFamily: "monospace", letterSpacing: "0.1em" }}>
          🔥 {s.streak}: {stats.currentStreak}
        </span>
      </div>

      {/* Day selector */}
      {allPuzzles.length > 0 && (
        <DaySelector
          puzzles={allPuzzles}
          today={today}
          selected={selectedDate || today}
          onSelect={(date) => setSelectedDate(date === today ? undefined : date)}
          lang={lang}
        />
      )}

      {/* Error / no puzzle */}
      {!loading && (error || !puzzle) && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p style={{ color: "var(--c-text-dim)", fontSize: 12, fontFamily: "monospace", letterSpacing: "0.15em" }}>
            {error === "load_error" ? s.loadError : s.noCase}
          </p>
        </div>
      )}

      {puzzle && dayState && (
        <>
          {/* Case header */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            paddingBottom: 14,
            marginBottom: 14,
            borderBottom: "1px solid var(--c-border)",
          }}>
            <p style={{ fontSize: 9, color: "var(--c-text-dim)", letterSpacing: "0.2em", fontFamily: "monospace", margin: 0 }}>
              {s.classified} / {s.caseNo} {puzzle.id}
              {isViewingPast && (
                <span style={{ marginLeft: 10, color: "var(--c-warn)", letterSpacing: "0.15em" }}>
                  {s.archive}
                </span>
              )}
            </p>
            {isFinished && (
              <div className="stamp-animate" style={{
                border: `2px solid ${dayState.won ? "var(--c-success)" : "var(--c-danger)"}`,
                color: dayState.won ? "var(--c-success)" : "var(--c-danger)",
                fontFamily: "monospace",
                fontSize: 10,
                fontWeight: "bold",
                letterSpacing: "0.25em",
                padding: "4px 10px",
                transform: "rotate(-3deg)",
                flexShrink: 0,
              }}>
                {s.closed}
              </div>
            )}
          </div>

          {/* Case title */}
          <h1 style={{
            fontSize: 22,
            fontWeight: "bold",
            color: "var(--c-text)",
            fontFamily: "monospace",
            margin: "0 0 12px",
            lineHeight: 1.3,
          }}>
            แฟ้ม: {puzzle.case_name}
          </h1>

          {/* Description */}
          <p style={{
            fontSize: 13,
            color: "var(--c-text)",
            lineHeight: 1.9,
            margin: "0 0 20px",
            opacity: 0.85,
          }}>
            {puzzle.description}
          </p>

          {/* Quota */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <span style={{ fontSize: 10, color: "var(--c-text-dim)", letterSpacing: "0.2em", fontFamily: "monospace" }}>
              {s.quota}
            </span>
            <div style={{ display: "flex", gap: 5 }}>
              {[0, 1, 2].map((i) => {
                const st = dayState.statuses[i];
                return (
                  <div key={i} style={{
                    width: 18,
                    height: 18,
                    background: st === "correct" ? "var(--c-success)" : st === "wrong" ? "var(--c-danger)" : "transparent",
                    border: `1.5px solid ${st === "correct" ? "var(--c-success)" : st === "wrong" ? "var(--c-danger)" : "var(--c-text-dim)"}`,
                    borderRadius: 2,
                    transition: "background 0.2s, border-color 0.2s",
                  }} />
                );
              })}
            </div>
            <span style={{ fontSize: 10, color: "var(--c-text-dim)", letterSpacing: "0.15em", fontFamily: "monospace" }}>
              {s.remaining} {3 - attemptsUsed}/3
            </span>
          </div>

          {/* Input */}
          {!isFinished && (
            <div className={shake ? "animate-shake" : ""} style={{ marginBottom: 22 }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={s.placeholder}
                autoComplete="off"
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "1px solid var(--c-amber-dim)",
                  color: "var(--c-text)",
                  fontFamily: "monospace",
                  fontSize: 13,
                  padding: "12px 14px",
                  outline: "none",
                  boxSizing: "border-box",
                  letterSpacing: "0.04em",
                  marginBottom: 8,
                }}
              />
              <button
                onClick={handleSubmit}
                disabled={!input.trim()}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: input.trim() ? "var(--c-amber-faint)" : "transparent",
                  border: "1px solid var(--c-amber)",
                  color: "var(--c-amber)",
                  fontFamily: "monospace",
                  fontSize: 11,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  cursor: input.trim() ? "pointer" : "not-allowed",
                  opacity: input.trim() ? 1 : 0.4,
                  transition: "opacity 0.15s, background 0.15s",
                }}
              >
                {s.submitBtn}
              </button>
            </div>
          )}

          {/* Clues */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            <ClueBlock clue={puzzle.clue_1} index={1} unlocked={true} lang={lang} />
            <ClueBlock clue={puzzle.clue_2} index={2} unlocked={attemptsUsed >= 1 || isFinished} lang={lang} />
            <ClueBlock clue={puzzle.clue_3} index={3} unlocked={attemptsUsed >= 2 || isFinished} lang={lang} />
          </div>

          {/* Result */}
          {isFinished && (
            <div ref={resultRef}>
              <div style={{
                border: `1px solid ${dayState.won ? "var(--c-success)" : "var(--c-danger)"}`,
                padding: "16px 14px",
                marginBottom: 12,
              }}>
                <p style={{ fontSize: 9, color: "var(--c-text-dim)", letterSpacing: "0.2em", fontFamily: "monospace", margin: "0 0 8px" }}>
                  ผลการสืบสวน
                </p>
                <p style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: dayState.won ? "var(--c-success)" : "var(--c-danger)",
                  fontFamily: "monospace",
                  margin: "0 0 12px",
                }}>
                  {dayState.won ? s.resultWin : s.resultLost}
                </p>
                <p style={{ fontSize: 13, color: "var(--c-text)", lineHeight: 1.85, margin: "0 0 12px" }}>
                  {puzzle.reveal_text}
                </p>
                <p style={{ fontSize: 10, color: "var(--c-text-dim)", fontFamily: "monospace", margin: 0 }}>
                  {s.acceptedAnswers}:{" "}
                  <span style={{ color: "var(--c-amber)" }}>{puzzle.answers.join(", ")}</span>
                </p>
              </div>

              {/* Share card */}
              <p style={{ fontSize: 9, color: "var(--c-text-dim)", letterSpacing: "0.2em", fontFamily: "monospace", margin: "0 0 8px" }}>
                {s.shareLabel}
              </p>
              <div style={{
                border: "1px solid var(--c-border)",
                padding: "14px 16px",
                background: "rgba(0,0,0,0.3)",
                marginBottom: 8,
              }}>
                <p style={{ fontSize: 10, letterSpacing: "0.25em", color: "var(--c-text-dim)", fontFamily: "monospace", margin: "0 0 4px" }}>
                  {s.appName}
                </p>
                <p style={{ fontSize: 14, fontWeight: "bold", color: "var(--c-text)", fontFamily: "monospace", margin: "0 0 12px" }}>
                  {puzzle.case_name}
                </p>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  {dayState.statuses.map((st, i) => (
                    <span key={i} style={{
                      fontSize: 18,
                      color: st === "correct" ? "var(--c-success)" : "var(--c-danger)",
                    }}>
                      {st === "correct" ? "✓" : "✗"}
                    </span>
                  ))}
                  {Array.from({ length: 3 - attemptsUsed }).map((_, i) => (
                    <span key={i} style={{ fontSize: 18, color: "var(--c-text-dim)" }}>○</span>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 10, color: "var(--c-text-dim)", fontFamily: "monospace", letterSpacing: "0.1em" }}>
                    {dayState.won ? s.solvedCase : s.closedCase}
                  </span>
                  <span style={{ fontSize: 10, color: "var(--c-text-dim)", fontFamily: "monospace" }}>
                    {s.streak} {stats.currentStreak}
                  </span>
                </div>
              </div>
              <button
                onClick={handleShare}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: copied ? "var(--c-amber-faint)" : "transparent",
                  border: "1px solid var(--c-amber)",
                  color: "var(--c-amber)",
                  fontFamily: "monospace",
                  fontSize: 11,
                  letterSpacing: "0.25em",
                  cursor: "pointer",
                  marginBottom: 20,
                  transition: "background 0.15s",
                }}
              >
                {copied ? s.copied : s.shareBtn}
              </button>

              {!isViewingPast && <Countdown lang={lang} />}
            </div>
          )}
        </>
      )}
    </div>
  );
}
