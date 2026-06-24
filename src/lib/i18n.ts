export type Lang = "th" | "en";

export const strings = {
  th: {
    appName: "SECRET TOOLBOX",
    classified: "ลับเฉพาะ",
    caseNo: "คดีหมายเลข",
    open: "OPEN",
    closed: "CLOSED",
    quota: "โควต้า",
    remaining: "เหลือ",
    placeholder: "พิมพ์คำตอบ...",
    submitBtn: "ส่งคำตอบ",
    clue: "เบาะแส",
    unlocked: "UNLOCKED",
    locked: "LOCKED",
    resultWin: "ระบุได้สำเร็จ",
    resultLost: "คดีถูกปิดโดยไม่พบคำตอบ",
    acceptedAnswers: "คำตอบที่ยอมรับ",
    shareLabel: "การ์ดแชร์ — ไม่สปอยส์คำตอบ",
    shareBtn: "คัดลอกผลการเล่น",
    copied: "คัดลอกแล้ว!",
    closedCase: "ปิดคดี",
    solvedCase: "แก้คดีได้!",
    streak: "streak",
    nextCase: "แฟ้มใหม่จะปลดล็อกอีกครั้งเวลา 00:00 น.",
    accessing: "กำลังโหลดแฟ้มคดี...",
    selectDay: "เลือกวัน",
    today: "วันนี้",
    noCase: "ไม่พบคดีในวันนี้ — กลับมาใหม่พรุ่งนี้",
    loadError: "เกิดข้อผิดพลาดในการโหลดข้อมูล",
    archive: "ARCHIVE",
    solvedIn: (n: number) => `แก้ได้ใน ${n}/3 ครั้ง`,
    failedIn: (n: number) => `ไม่สำเร็จ (${n}/3)`,
  },
  en: {
    appName: "SECRET TOOLBOX",
    classified: "CLASSIFIED",
    caseNo: "CASE NO.",
    open: "OPEN",
    closed: "CLOSED",
    quota: "QUOTA",
    remaining: "LEFT",
    placeholder: "Type your answer...",
    submitBtn: "SUBMIT",
    clue: "CLUE",
    unlocked: "UNLOCKED",
    locked: "LOCKED",
    resultWin: "Case Solved",
    resultLost: "Case Closed — Unsolved",
    acceptedAnswers: "Accepted answers",
    shareLabel: "Share card — no spoilers",
    shareBtn: "Copy result",
    copied: "Copied!",
    closedCase: "closed",
    solvedCase: "solved!",
    streak: "streak",
    nextCase: "New case unlocks at 00:00",
    accessing: "Loading case file...",
    selectDay: "SELECT DAY",
    today: "TODAY",
    noCase: "No case today — come back tomorrow",
    loadError: "Failed to load data",
    archive: "ARCHIVE",
    solvedIn: (n: number) => `Solved in ${n}/3 attempt${n > 1 ? "s" : ""}`,
    failedIn: (n: number) => `Failed (${n}/3)`,
  },
} as const;

export function useLang(): [Lang, () => void] {
  if (typeof window === "undefined") return ["th", () => {}];
  const saved = (localStorage.getItem("mystery_lang") as Lang) || "th";
  const toggle = () => {
    const next: Lang = saved === "th" ? "en" : "th";
    localStorage.setItem("mystery_lang", next);
    window.location.reload();
  };
  return [saved, toggle];
}
