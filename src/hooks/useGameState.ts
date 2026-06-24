"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Puzzle,
  checkAnswer,
  getTodayDateString,
  loadPuzzles,
  getPuzzleForDate,
} from "@/lib/gameLogic";

export type GuessStatus = "correct" | "wrong";

export interface DayState {
  date: string;
  guesses: string[];
  statuses: GuessStatus[];
  won: boolean;
  lost: boolean;
}

export interface Stats {
  currentStreak: number;
  maxStreak: number;
  totalPlayed: number;
  totalWon: number;
}

const STORAGE_KEY = "mystery_day_state";
const STATS_KEY = "mystery_stats";

function loadDayState(): DayState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DayState;
  } catch {
    return null;
  }
}

function saveDayState(state: DayState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { currentStreak: 0, maxStreak: 0, totalPlayed: 0, totalWon: 0 };
    return JSON.parse(raw) as Stats;
  } catch {
    return { currentStreak: 0, maxStreak: 0, totalPlayed: 0, totalWon: 0 };
  }
}

function saveStats(stats: Stats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function useGameState() {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [dayState, setDayState] = useState<DayState | null>(null);
  const [stats, setStats] = useState<Stats>(loadStats());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const today = getTodayDateString();
        const puzzles = await loadPuzzles();
        const todayPuzzle = getPuzzleForDate(puzzles, today);

        if (!todayPuzzle) {
          setError("ไม่พบแฟ้มลับสำหรับวันนี้ — กรุณากลับมาใหม่พรุ่งนี้");
          setLoading(false);
          return;
        }

        setPuzzle(todayPuzzle);

        const saved = loadDayState();
        if (saved && saved.date === today) {
          setDayState(saved);
        } else {
          const fresh: DayState = {
            date: today,
            guesses: [],
            statuses: [],
            won: false,
            lost: false,
          };
          setDayState(fresh);
          saveDayState(fresh);
        }
      } catch {
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const submitGuess = useCallback(
    (input: string) => {
      if (!puzzle || !dayState) return;
      if (dayState.won || dayState.lost) return;
      if (dayState.guesses.length >= 3) return;

      const isCorrect = checkAnswer(input, puzzle);
      const newGuesses = [...dayState.guesses, input];
      const newStatuses: GuessStatus[] = [...dayState.statuses, isCorrect ? "correct" : "wrong"];
      const won = isCorrect;
      const lost = !isCorrect && newGuesses.length >= 3;

      const newState: DayState = {
        date: dayState.date,
        guesses: newGuesses,
        statuses: newStatuses,
        won,
        lost,
      };

      setDayState(newState);
      saveDayState(newState);

      if (won || lost) {
        const currentStats = loadStats();
        const newStats: Stats = {
          totalPlayed: currentStats.totalPlayed + 1,
          totalWon: currentStats.totalWon + (won ? 1 : 0),
          currentStreak: won ? currentStats.currentStreak + 1 : 0,
          maxStreak: won
            ? Math.max(currentStats.maxStreak, currentStats.currentStreak + 1)
            : currentStats.maxStreak,
        };
        setStats(newStats);
        saveStats(newStats);
      }
    },
    [puzzle, dayState]
  );

  return { puzzle, dayState, stats, loading, error, submitGuess };
}
