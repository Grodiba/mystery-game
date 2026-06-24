export interface Puzzle {
  date: string;
  id: string;
  asset_type: "text" | "image" | "audio";
  asset_content?: string;
  asset_url?: string;
  question: string;
  answers: string[];
  hint_1: string;
  hint_2: string;
  reveal_text: string;
}

export function getTodayDateString(): string {
  // Bangkok timezone (UTC+7)
  const now = new Date();
  const bangkokOffset = 7 * 60;
  const utcMinutes = now.getTime() / 60000 + now.getTimezoneOffset();
  const bangkokTime = new Date((utcMinutes + bangkokOffset) * 60000);

  const y = bangkokTime.getFullYear();
  const m = String(bangkokTime.getMonth() + 1).padStart(2, "0");
  const d = String(bangkokTime.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getNextMidnightMs(): number {
  const now = new Date();
  const bangkokOffset = 7 * 60;
  const utcMinutes = now.getTime() / 60000 + now.getTimezoneOffset();
  const bangkokMs = (utcMinutes + bangkokOffset) * 60000;
  const bangkokNow = new Date(bangkokMs);

  const nextMidnight = new Date(bangkokMs);
  nextMidnight.setHours(24, 0, 0, 0);
  return nextMidnight.getTime() - bangkokNow.getTime();
}

export function normalizeAnswer(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[""'']/g, "");
}

export function checkAnswer(input: string, puzzle: Puzzle): boolean {
  const normalized = normalizeAnswer(input);
  if (!normalized) return false;
  return puzzle.answers.some((a) => normalizeAnswer(a) === normalized);
}

export async function loadPuzzles(): Promise<Puzzle[]> {
  const res = await fetch("/data/puzzles.json");
  if (!res.ok) throw new Error("Failed to load puzzles");
  return res.json();
}

export function getPuzzleForDate(
  puzzles: Puzzle[],
  dateStr: string
): Puzzle | null {
  return puzzles.find((p) => p.date === dateStr) ?? null;
}
