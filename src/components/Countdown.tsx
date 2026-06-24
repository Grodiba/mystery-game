"use client";

import { useEffect, useState } from "react";
import { getNextMidnightMs } from "@/lib/gameLogic";
import { Lang } from "@/lib/i18n";

export function Countdown({ lang }: { lang: Lang }) {
  const [ms, setMs] = useState(getNextMidnightMs());

  useEffect(() => {
    const id = setInterval(() => setMs(getNextMidnightMs()), 1000);
    return () => clearInterval(id);
  }, []);

  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");

  const label = lang === "th"
    ? "แฟ้มใหม่จะปลดล็อกอีกครั้งเวลา 00:00 น."
    : "New case unlocks at midnight";

  return (
    <div style={{
      borderTop: "1px dashed var(--c-border)",
      paddingTop: 16,
      textAlign: "center",
    }}>
      <p style={{
        color: "var(--c-text-dim)",
        fontSize: 10,
        letterSpacing: "0.15em",
        fontFamily: "monospace",
        margin: "0 0 6px",
      }}>
        {label}
      </p>
      <p style={{
        fontSize: 20,
        fontFamily: "monospace",
        color: "var(--c-amber)",
        letterSpacing: "0.1em",
        fontVariantNumeric: "tabular-nums",
        margin: 0,
      }}>
        {pad(h)}:{pad(m)}:{pad(sec)}
      </p>
    </div>
  );
}
