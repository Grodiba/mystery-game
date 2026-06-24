"use client";

import { useState, useRef, useEffect } from "react";
import { useGameState } from "@/hooks/useGameState";
import { Countdown } from "@/components/Countdown";
import { ShareButton } from "@/components/ShareButton";

export function GameBoard() {
  const { puzzle, dayState, stats, loading, error, submitGuess } = useGameState();
  const [input, setInput] = useState("");
  const [shake, setShake] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dayState?.won || dayState?.lost) {
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
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
      <div className="flex items-center justify-center min-h-screen bg-black">
        <p className="text-green-400 font-mono animate-pulse tracking-widest">
          กำลังถอดรหัสแฟ้ม...
        </p>
      </div>
    );
  }

  if (error || !puzzle || !dayState) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <p className="text-red-500 font-mono text-center px-6">{error ?? "ไม่พบข้อมูล"}</p>
      </div>
    );
  }

  const isFinished = dayState.won || dayState.lost;
  const hintsUnlocked = dayState.guesses.length;

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono flex flex-col items-center px-4 py-8">
      {/* Scanline overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 scanlines" />

      {/* Header */}
      <header className="w-full max-w-xl mb-8">
        <div className="border border-green-800 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-green-700 uppercase tracking-widest">แฟ้มลับ</p>
            <h1 className="text-lg text-green-300 tracking-wider">{puzzle.id}</h1>
          </div>
          <div className="text-right">
            <p className="text-xs text-green-700">Streak</p>
            <p className="text-xl text-green-400">🔥 {stats.currentStreak}</p>
          </div>
        </div>
      </header>

      {/* Main card */}
      <main className="w-full max-w-xl space-y-6">

        {/* File content */}
        <div className="border border-green-800 p-4">
          <p className="text-xs text-green-700 uppercase tracking-widest mb-3">
            &gt; เปิดแฟ้ม: {puzzle.id}
          </p>
          <pre className="text-green-300 text-sm leading-relaxed whitespace-pre-wrap break-words">
            {puzzle.asset_content}
          </pre>
        </div>

        {/* Question */}
        <div className="border border-green-800 p-4">
          <p className="text-xs text-green-700 uppercase tracking-widest mb-2">&gt; ภารกิจ</p>
          <p className="text-green-200">{puzzle.question}</p>
        </div>

        {/* Hints */}
        {hintsUnlocked >= 1 && (
          <div className="border border-yellow-800 p-4 bg-yellow-900/10">
            <p className="text-xs text-yellow-600 uppercase tracking-widest mb-2">
              &gt; คำใบ้ที่ 1 [ปลดล็อกแล้ว]
            </p>
            <p className="text-yellow-300 text-sm">{puzzle.hint_1}</p>
          </div>
        )}

        {hintsUnlocked >= 2 && (
          <div className="border border-yellow-700 p-4 bg-yellow-900/10">
            <p className="text-xs text-yellow-600 uppercase tracking-widest mb-2">
              &gt; คำใบ้ที่ 2 [ปลดล็อกแล้ว]
            </p>
            <p className="text-yellow-300 text-sm">{puzzle.hint_2}</p>
          </div>
        )}

        {/* Previous guesses */}
        {dayState.guesses.length > 0 && (
          <div className="border border-green-900 p-4 space-y-2">
            <p className="text-xs text-green-700 uppercase tracking-widest mb-3">
              &gt; ประวัติการตอบ
            </p>
            {dayState.guesses.map((g, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-lg">{dayState.statuses[i] === "correct" ? "🟩" : "🟥"}</span>
                <span
                  className={`text-sm ${dayState.statuses[i] === "correct" ? "text-green-300" : "text-red-400 line-through"}`}
                >
                  {g}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Input or result */}
        {!isFinished ? (
          <form onSubmit={handleSubmit} className={shake ? "animate-shake" : ""}>
            <div className="border border-green-600 flex">
              <span className="text-green-600 px-3 py-3 text-sm select-none">&gt;_</span>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`พิมพ์คำตอบ... (${dayState.guesses.length}/3)`}
                className="flex-1 bg-transparent text-green-200 text-sm py-3 pr-3 outline-none placeholder-green-800"
                autoComplete="off"
                autoFocus
              />
              <button
                type="submit"
                className="px-4 text-green-600 hover:text-green-300 text-sm uppercase tracking-widest border-l border-green-600 transition-colors"
              >
                ยืนยัน
              </button>
            </div>
            <p className="text-xs text-green-800 mt-2">
              เหลืออีก {3 - dayState.guesses.length} ครั้ง
            </p>
          </form>
        ) : (
          <div
            ref={resultRef}
            className={`border p-6 text-center space-y-4 ${dayState.won ? "border-green-500 bg-green-900/10" : "border-red-800 bg-red-900/10"}`}
          >
            {dayState.won ? (
              <>
                <p className="text-2xl">✅</p>
                <p className="text-green-300 text-lg">ระบุตัวตนสำเร็จ</p>
                <p className="text-green-200 text-sm">
                  ความพยายามที่ {dayState.guesses.length}/3
                </p>
              </>
            ) : (
              <>
                <p className="text-2xl">❌</p>
                <p className="text-red-400 text-lg">ภารกิจล้มเหลว</p>
              </>
            )}

            {/* Reveal */}
            <div className="border border-green-800 p-4 text-left mt-4">
              <p className="text-xs text-green-700 uppercase tracking-widest mb-2">
                &gt; เฉลย
              </p>
              <p className="text-green-200 text-sm leading-relaxed">{puzzle.reveal_text}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <p className="text-xl text-green-300">{stats.totalPlayed}</p>
                <p className="text-xs text-green-700">เล่นทั้งหมด</p>
              </div>
              <div>
                <p className="text-xl text-green-300">{stats.currentStreak} 🔥</p>
                <p className="text-xs text-green-700">Streak ปัจจุบัน</p>
              </div>
              <div>
                <p className="text-xl text-green-300">{stats.maxStreak}</p>
                <p className="text-xs text-green-700">Streak สูงสุด</p>
              </div>
            </div>

            <ShareButton dayState={dayState} puzzleId={puzzle.id} />
            <Countdown />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 text-xs text-green-900 text-center">
        <p>CLASSIFIED ARCHIVE SYSTEM v1.0</p>
        <p>ข้อมูลทั้งหมดถูกจัดชั้นความลับ — ห้ามเผยแพร่</p>
      </footer>
    </div>
  );
}
