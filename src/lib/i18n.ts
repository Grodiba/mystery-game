export type Lang = "th" | "en";

export const strings = {
  th: {
    appName: "คลังลับซีโน",
    streak: "สตรีก",
    threatLevel: "ระดับภัย",
    nominal: "ปกติ",
    elevated: "สูงขึ้น",
    critical: "วิกฤต",
    breach: "ถูกเจาะ",
    signal: "สัญญาณ",
    attempt: "ครั้งที่",
    placeholder: "พิมพ์ชื่อสิ่งมีชีวิต...",
    verifyBtn: "[ ยืนยันข้อมูล ]",
    systemLogs: "บันทึกระบบ / คำใบ้ที่ถอดรหัสแล้ว",
    hint1: "คำใบ้-01",
    hint2: "คำใบ้-02",
    locked: "ล็อก",
    decrypted: "ถอดรหัสแล้ว",
    tapAudio: "( 🔊 ) แตะเพื่อฟังสัญญาณรบกวน",
    visualData: "ข้อมูลภาพ",
    identityConfirmed: "ระบุตัวตนสำเร็จ",
    missionFailed: "ภารกิจล้มเหลว",
    verifiedIn: (n: number) => `ยืนยันในความพยายามที่ ${n}/3`,
    declassified: "// ยกเลิกความลับ",
    played: "เล่นแล้ว",
    best: "ดีสุด",
    shareBtn: "[ แชร์ผลลัพธ์ ]",
    copied: "[ คัดลอกแล้ว! ]",
    nextCase: "คดีใหม่เปิดอีก",
    footer: "ระบบคลังลับซีโน // ข้อมูลทั้งหมดเป็นความลับ",
    accessing: "กำลังเข้าถึงคลัง...",
    selectDay: "เลือกวัน",
    today: "วันนี้",
    lockedDay: "ยังไม่เปิด",
    noCase: "ไม่พบคดีในวันนี้ — กลับมาใหม่พรุ่งนี้",
    loadError: "เกิดข้อผิดพลาดในการโหลดข้อมูล",
  },
  en: {
    appName: "Xeno-Archive",
    streak: "Streak",
    threatLevel: "THREAT LEVEL",
    nominal: "NOMINAL",
    elevated: "ELEVATED",
    critical: "CRITICAL",
    breach: "BREACH",
    signal: "SIGNAL",
    attempt: "ATTEMPT",
    placeholder: "Enter creature name...",
    verifyBtn: "[ VERIFY DATA ]",
    systemLogs: "SYSTEM LOGS / DECRYPTED HINTS",
    hint1: "HINT-01",
    hint2: "HINT-02",
    locked: "LOCKED",
    decrypted: "DECRYPTED",
    tapAudio: "( 🔊 ) Tap to listen to interference signal",
    visualData: "VISUAL DATA",
    identityConfirmed: "Identity Confirmed",
    missionFailed: "Mission Failed",
    verifiedIn: (n: number) => `Verified in ${n}/3 attempt${n > 1 ? "s" : ""}`,
    declassified: "// Declassified",
    played: "PLAYED",
    best: "BEST",
    shareBtn: "[ SHARE RESULT ]",
    copied: "[ COPIED! ]",
    nextCase: "Next case opens in",
    footer: "Xeno-Archive System // All data classified",
    accessing: "Accessing archive...",
    selectDay: "SELECT DAY",
    today: "TODAY",
    lockedDay: "LOCKED",
    noCase: "No case found for today — come back tomorrow",
    loadError: "Failed to load archive data",
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
