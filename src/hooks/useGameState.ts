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

const STATS_KEY = "mystery_stats";

function dayStateKey(date: string) {
  return `mystery_state_${date}`;
}

function loadDayState(date: string): DayState | null {
  try {
    const raw = localStorage.getItem(dayStateKey(date));
    if (!raw) return null;
    return JSON.parse(raw) as DayState;
  } catch {
    return null;
  }
}

function saveDayState(state: DayState) {
  localStorage.setItem(dayStateKey(state.date), JSON.stringify(state));
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

export function useGameState(selectedDate?: string) {
  const [allPuzzles, setAllPuzzles] = useState<Puzzle[]>([]);
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [dayState, setDayState] = useState<DayState | null>(null);
  const [stats, setStats] = useState<Stats>(loadStats());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = getTodayDateString();
  const targetDate = selectedDate || today;

  // Load all puzzles once
  useEffect(() => {
    loadPuzzles()
      .then(setAllPuzzles)
      .catch(() => setError("load_error"));
  }, []);

  // When targetDate or puzzles change, load the right puzzle + day state
  useEffect(() => {
    if (allPuzzles.length === 0) return;
    setLoading(true);

    const found = getPuzzleForDate(allPuzzles, targetDate);
    if (!found) {
      setPuzzle(null);
      setDayState(null);
      setError("no_case");
      setLoading(false);
      return;
    }

    setPuzzle(found);
    setError(null);

    const saved = loadDayState(targetDate);
    if (saved) {
      setDayState(saved);
    } else {
      const fresh: DayState = {
        date: targetDate,
        guesses: [],
        statuses: [],
        won: false,
        lost: false,
      };
      setDayState(fresh);
      saveDayState(fresh);
    }
    setLoading(false);
  }, [allPuzzles, targetDate]);

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
        const current = loadStats();
        const newStats: Stats = {
          totalPlayed: current.totalPlayed + 1,
          totalWon: current.totalWon + (won ? 1 : 0),
          currentStreak: won ? current.currentStreak + 1 : 0,
          maxStreak: won
            ? Math.max(current.maxStreak, current.currentStreak + 1)
            : current.maxStreak,
        };
        setStats(newStats);
        saveStats(newStats);
      }
    },
    [puzzle, dayState]
  );

  return { puzzle, dayState, stats, loading, error, submitGuess, allPuzzles, today };
}
