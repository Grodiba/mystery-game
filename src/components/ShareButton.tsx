"use client";

import { useState } from "react";
import { DayState } from "@/hooks/useGameState";
import { Lang, strings } from "@/lib/i18n";

interface ShareButtonProps {
  dayState: DayState;
  puzzleId: string;
  lang: Lang;
}

export function ShareButton({ dayState, puzzleId, lang }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const s = strings[lang];

  function buildShareText() {
    const squares = dayState.statuses.map((s) => (s === "correct" ? "🟩" : "🟥")).join("");
    const emptySquares = "⬛".repeat(3 - dayState.statuses.length);
    const n = dayState.statuses.length;

    const result = lang === "th"
      ? dayState.won
        ? `ค้นพบตัวตนในความพยายามที่ ${n}/3`
        : `ไม่สามารถระบุตัวตนได้ (${n}/3)`
      : dayState.won
        ? `Identified in ${n}/3 attempt${n > 1 ? "s" : ""}`
        : `Failed to identify (${n}/3)`;

    return `📁 ${lang === "th" ? "คลังลับซีโน" : "Xeno-Archive"} ${puzzleId}
🔍 ${result}
${squares}${emptySquares}

${lang === "th" ? "เข้ามาสืบด้วยตัวเองที่" : "Try it yourself at"}: [mystery.promptforth.com]`;
  }

  async function handleShare() {
    const text = buildShareText();
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

  return (
    <button
      onClick={handleShare}
      style={{ marginTop: 8, width: "100%", padding: "11px", border: "1px solid var(--c-amber)", background: "transparent", color: "var(--c-amber)", fontFamily: "monospace", fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", cursor: "pointer" }}
    >
      {copied ? s.copied : s.shareBtn}
    </button>
  );
}
