"use client";

import { useEffect, useState } from "react";
import { getNextMidnightMs } from "@/lib/gameLogic";

export function Countdown() {
  const [ms, setMs] = useState(getNextMidnightMs());

  useEffect(() => {
    const id = setInterval(() => setMs(getNextMidnightMs()), 1000);
    return () => clearInterval(id);
  }, []);

  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div style={{ textAlign: "center", marginTop: 14 }}>
      <p style={{ color: "var(--c-text-dim)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 4 }}>
        แฟ้มใหม่เปิดอีก
      </p>
      <p style={{ fontSize: 22, fontFamily: "monospace", color: "var(--c-amber)", letterSpacing: "0.05em", fontVariantNumeric: "tabular-nums" }}>
        {pad(h)}:{pad(m)}:{pad(s)}
      </p>
    </div>
  );
}
