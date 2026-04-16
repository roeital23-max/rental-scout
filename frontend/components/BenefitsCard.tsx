"use client";

import { useLanguage } from "./LanguageProvider";
import type { BenefitProgram } from "@/lib/benefitsApi";

type Props = {
  program: BenefitProgram;
};

export default function BenefitsCard({ program }: Props) {
  const { lang, t } = useLanguage();

  const name = lang === "he" ? program.name_he : program.name_en;
  const description = lang === "he" ? program.description_he : program.description_en;

  return (
    <div
      className="flex flex-col gap-4 p-5"
      style={{
        backgroundColor: "#0D1421",
        borderRadius: "12px",
        border: "1px solid #1e2a3a",
      }}
    >
      {/* Name + amount chips */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-txt-primary leading-snug">{name}</h3>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          {program.monthly_amount_nis && (
            <span
              className="inline-flex items-center px-2.5 py-1 text-xs font-medium whitespace-nowrap"
              style={{
                color: "#00E5A0",
                backgroundColor: "rgba(0, 229, 160, 0.12)",
                borderRadius: "99px",
                border: "1px solid rgba(0, 229, 160, 0.25)",
              }}
            >
              ₪{program.monthly_amount_nis.toLocaleString()} {t.monthlyBenefit}
            </span>
          )}
          {program.one_time_amount_nis && (
            <span
              className="inline-flex items-center px-2.5 py-1 text-xs font-medium whitespace-nowrap"
              style={{
                color: "#FFA040",
                backgroundColor: "rgba(255, 160, 64, 0.12)",
                borderRadius: "99px",
                border: "1px solid rgba(255, 160, 64, 0.25)",
              }}
            >
              {t.oneTimeBenefit} ₪{program.one_time_amount_nis.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-txt-secondary leading-relaxed">{description}</p>

      {/* Apply link */}
      <a
        href={program.link}
        target="_blank"
        rel="noopener noreferrer"
        className="self-start text-sm font-medium transition-opacity hover:opacity-80 py-2 -my-2"
        style={{ color: "#00E5A0" }}
      >
        {t.applyNow}
      </a>
    </div>
  );
}
