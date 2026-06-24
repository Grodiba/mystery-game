export interface ClueAudio {
  type: "audio";
  label: string;
  transcript: string;
}
export interface ClueRedacted {
  type: "redacted";
  label: string;
  parts: Array<string | { r: number }>;
}
export interface ClueImage {
  type: "image";
  label: string;
  image_url: string;
  caption: string;
}
export type Clue = ClueAudio | ClueRedacted | ClueImage;

export interface Puzzle {
  date: string;
  id: string;
  case_name: string;
  description: string;
  clue_1: Clue;
  clue_2: Clue;
  clue_3: Clue;
  answers: string[];
  reveal_text: string;
}

export function getTodayDateString(): string {
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
  return str.toLowerCase().trim().replace(/\s+/g, " ").replace(/[""'']/g, "");
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

export function getPuzzleForDate(puzzles: Puzzle[], dateStr: string): Puzzle | null {
  return puzzles.find((p) => p.date === dateStr) ?? null;
}
