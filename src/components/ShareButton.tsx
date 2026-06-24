"use client";

import { useState } from "react";
import { DayState } from "@/hooks/useGameState";

interface ShareButtonProps {
  dayState: DayState;
  puzzleId: string;
}

export function ShareButton({ dayState, puzzleId }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  function buildShareText() {
    const squares = dayState.statuses.map((s) => (s === "correct" ? "🟩" : "🟥")).join("");
    const filledSlots = dayState.statuses.length;
    const maxSlots = 3;
    const emptySquares = "⬛".repeat(maxSlots - filledSlots);

    const result = dayState.won
      ? `ค้นพบตัวตนในความพยายามที่ ${filledSlots}/${maxSlots}`
      : `ไม่สามารถระบุตัวตนได้ (${filledSlots}/${maxSlots})`;

    return `📁 แฟ้มลับสัตว์ประหลาด ${puzzleId}
🔍 ${result}
${squares}${emptySquares}

เข้ามาสืบด้วยตัวเองที่: [mystery.promptforth.com]`;
  }

  async function handleShare() {
    const text = buildShareText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      onClick={handleShare}
      className="mt-4 w-full py-3 px-6 border border-green-500 text-green-400 font-mono text-sm uppercase tracking-widest hover:bg-green-500 hover:text-black transition-colors duration-200"
    >
      {copied ? "[ คัดลอกแล้ว! ]" : "[ แชร์ผลลัพธ์ ]"}
    </button>
  );
}
