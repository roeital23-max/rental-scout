"use client";

import { useLanguage } from "./LanguageProvider";
import type { DealLabel } from "@/lib/api";

type Props = {
  label: DealLabel;
  score: number;
};

const BADGE_STYLE: Record<DealLabel, { color: string; bg: string; border: string }> = {
  great_deal: { color: "#2E7D52", bg: "#E9F5EE", border: "#2E7D5230" },
  fair:        { color: "#B5620E", bg: "#FEF0E3", border: "#B5620E30" },
  overpriced:  { color: "#BC2B2B", bg: "#FDECEA", border: "#BC2B2B30" },
  roommate:    { color: "#637280", bg: "#F0F3F5", border: "#63728030" },
  parking:     { color: "#637280", bg: "#F0F3F5", border: "#63728030" },
};

export default function DealBadge({ label, score }: Props) {
  const { t } = useLanguage();
  const { color, bg, border } = BADGE_STYLE[label];
  const showScore = label !== "roommate" && label !== "parking";
  const scoreStr = score === 0 ? "±0%" : score < 0 ? `${score}%` : `+${score}%`;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold"
      style={{
        color,
        backgroundColor: bg,
        borderRadius: "99px",
        border: `1.5px solid ${border}`,
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0, display: "inline-block" }} />
      <span>{t[label]}</span>
      {showScore && (
        <span style={{ fontFamily: "var(--font-dm-mono), monospace", opacity: 0.85 }}>
          {scoreStr}
        </span>
      )}
    </span>
  );
}
