"use client";

import { useLanguage } from "./LanguageProvider";
import type { DealLabel } from "@/lib/api";

type Props = {
  label: DealLabel;
  score: number;
};

const BADGE_STYLE: Record<DealLabel, { color: string; bg: string }> = {
  great_deal: { color: "#00E5A0", bg: "rgba(0, 229, 160, 0.12)" },
  fair:        { color: "#FFA040", bg: "rgba(255, 160, 64, 0.12)" },
  overpriced:  { color: "#FF5252", bg: "rgba(255, 82, 82, 0.12)" },
  roommate:    { color: "#8899AA", bg: "rgba(136, 153, 170, 0.12)" },
  parking:     { color: "#8899AA", bg: "rgba(136, 153, 170, 0.12)" },
};

export default function DealBadge({ label, score }: Props) {
  const { t } = useLanguage();
  const { color, bg } = BADGE_STYLE[label];
  const showScore = label !== "roommate" && label !== "parking";
  const scoreStr = score === 0 ? "±0%" : score < 0 ? `${score}%` : `+${score}%`;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium"
      style={{
        color,
        backgroundColor: bg,
        borderRadius: "99px",
        border: `1px solid ${color}33`,
      }}
    >
      <span>{t[label]}</span>
      {showScore && (
        <span
          className="text-xs opacity-80"
          style={{ fontFamily: "var(--font-space-mono), monospace" }}
        >
          {scoreStr}
        </span>
      )}
    </span>
  );
}
