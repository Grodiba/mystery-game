"use client";

import { useRef, useEffect } from "react";
import { Puzzle } from "@/lib/gameLogic";
import { Lang, strings } from "@/lib/i18n";

interface DayState {
  won: boolean;
  lost: boolean;
  guesses: string[];
}

function loadDayState(date: string): DayState | null {
  try {
    const raw = localStorage.getItem(`mystery_state_${date}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function formatDate(dateStr: string, lang: Lang): string {
  const d = new Date(dateStr + "T00:00:00");
  if (lang === "th") {
    const thMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    return `${d.getDate()} ${thMonths[d.getMonth()]}`;
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface DaySelectorProps {
  puzzles: Puzzle[];
  today: string;
  selected: string;
  onSelect: (date: string) => void;
  lang: Lang;
}

export function DaySelector({ puzzles, today, selected, onSelect, lang }: DaySelectorProps) {
  const s = strings[lang];
  const scrollRef = useRef<HTMLDivElement>(null);

  // Only show days up to today
  const available = puzzles.filter((p) => p.date <= today);

  useEffect(() => {
    // Scroll to selected day
    const el = scrollRef.current?.querySelector(`[data-date="${selected}"]`);
    el?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [selected]);

  function getStatus(date: string) {
    const state = loadDayState(date);
    if (!state || state.guesses.length === 0) return "unplayed";
    if (state.won) return "won";
    if (state.lost) return "lost";
    return "inprogress";
  }

  const statusColor = {
    won: "var(--c-success)",
    lost: "var(--c-danger)",
    inprogress: "var(--c-warn)",
    unplayed: "var(--c-text-dim)",
  };

  const statusDot = {
    won: "✓",
    lost: "✗",
    inprogress: "●",
    unplayed: "○",
  };

  return (
    <div style={{ width: "100%", marginBottom: 14 }}>
      <p style={{ color: "var(--c-text-dim)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 6 }}>
        {s.selectDay}
      </p>
      <div
        ref={scrollRef}
        style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}
      >
        {available.map((p) => {
          const isSelected = p.date === selected;
          const isToday = p.date === today;
          const status = getStatus(p.date);

          return (
            <button
              key={p.date}
              data-date={p.date}
              onClick={() => onSelect(p.date)}
              style={{
                flexShrink: 0,
                padding: "7px 11px",
                border: `1px solid ${isSelected ? "var(--c-amber)" : "var(--c-border)"}`,
                background: isSelected ? "var(--c-amber-faint)" : "transparent",
                cursor: "pointer",
                textAlign: "center",
                minWidth: 58,
                transition: "border-color 0.15s",
              }}
            >
              <div style={{ fontSize: 9, letterSpacing: "0.1em", color: isSelected ? "var(--c-amber)" : "var(--c-text-dim)", fontFamily: "monospace", marginBottom: 2 }}>
                {isToday ? s.today : formatDate(p.date, lang)}
              </div>
              <div style={{ fontSize: 11, color: statusColor[status], fontFamily: "monospace" }}>
                {statusDot[status]}
              </div>
              <div style={{ fontSize: 8, letterSpacing: "0.05em", color: "var(--c-text-dim)", fontFamily: "monospace", marginTop: 1 }}>
                {p.id}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
