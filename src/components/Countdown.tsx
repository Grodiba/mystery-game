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
    <div className="text-center mt-4">
      <p className="text-xs text-green-600 uppercase tracking-widest mb-1">
        แฟ้มใหม่เปิดอีก
      </p>
      <p className="text-2xl font-mono text-green-400 tabular-nums">
        {pad(h)}:{pad(m)}:{pad(s)}
      </p>
    </div>
  );
}
