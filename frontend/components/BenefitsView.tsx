"use client";

import { useState } from "react";
import { useLanguage } from "./LanguageProvider";
import BenefitsCard from "./BenefitsCard";
import { getBenefits, type BenefitProgram, type BenefitsParams } from "@/lib/benefitsApi";

type FormState = {
  income: string;
  family_size: string;
  owns_home: boolean;
  is_oleh: boolean;
};

const inputStyle = {
  backgroundColor: "#0A0E1A",
  borderColor: "#1e2a3a",
  borderRadius: "8px",
  borderWidth: "1px",
};

export default function BenefitsView() {
  const { t } = useLanguage();

  const [form, setForm] = useState<FormState>({
    income: "",
    family_size: "",
    owns_home: false,
    is_oleh: false,
  });
  const [results, setResults] = useState<BenefitProgram[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const params: BenefitsParams = {
        income: form.income ? Number(form.income) : undefined,
        family_size: form.family_size ? Number(form.family_size) : undefined,
        owns_home: form.owns_home,
        is_oleh: form.is_oleh,
      };
      const data = await getBenefits(params);
      setResults(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 md:py-10 max-w-3xl mx-auto">
      {/* Hero */}
      <div className="mb-8 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-txt-primary mb-2">
          {t.benefitsTitle}{" "}
          <span style={{ color: "#00E5A0" }}>{t.benefitsHighlight}</span>
        </h1>
        <p className="text-txt-secondary">{t.benefitsSub}</p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 p-5 md:p-6 mb-8"
        style={{
          backgroundColor: "#0D1421",
          borderRadius: "12px",
          border: "1px solid #1e2a3a",
        }}
      >
        {/* Income + Family size — side by side on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-txt-secondary">
              {t.incomeLabel}
            </label>
            <input
              type="number"
              value={form.income}
              onChange={(e) => setForm({ ...form, income: e.target.value })}
              placeholder={t.incomePlaceholder}
              min={0}
              className="w-full px-4 py-3 text-txt-primary border transition-colors focus:outline-none"
              style={inputStyle}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-txt-secondary">
              {t.familySizeLabel}
            </label>
            <input
              type="number"
              value={form.family_size}
              onChange={(e) => setForm({ ...form, family_size: e.target.value })}
              placeholder={t.familySizePlaceholder}
              min={1}
              className="w-full px-4 py-3 text-txt-primary border transition-colors focus:outline-none"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex flex-col gap-3 pt-1">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={form.owns_home}
              onChange={(e) => setForm({ ...form, owns_home: e.target.checked })}
              className="w-5 h-5 rounded cursor-pointer"
              style={{ accentColor: "#00E5A0" }}
            />
            <span className="text-sm text-txt-secondary group-hover:text-txt-primary transition-colors">
              {t.ownsHomeLabel}
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={form.is_oleh}
              onChange={(e) => setForm({ ...form, is_oleh: e.target.checked })}
              className="w-5 h-5 rounded cursor-pointer"
              style={{ accentColor: "#00E5A0" }}
            />
            <span className="text-sm text-txt-secondary group-hover:text-txt-primary transition-colors">
              {t.isOlehLabel}
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 mt-1 text-base font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          style={{
            backgroundColor: "#00E5A0",
            color: "#0A0E1A",
            borderRadius: "8px",
          }}
        >
          {loading ? "..." : t.findBenefitsBtn}
        </button>
      </form>

      {/* Results */}
      <ResultsSection results={results} />
    </main>
  );
}

function ResultsSection({ results }: { results: BenefitProgram[] | null }) {
  const { t } = useLanguage();

  if (results === null) {
    return (
      <p className="text-sm text-txt-secondary text-center py-4">
        {t.allProgramsNote}
      </p>
    );
  }

  if (results.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 text-center"
        style={{
          backgroundColor: "#0D1421",
          border: "1px solid #1e2a3a",
          borderRadius: "12px",
        }}
      >
        <div className="text-4xl mb-4 opacity-40">🔍</div>
        <h2 className="text-xl font-semibold text-txt-primary mb-2">
          {t.noBenefitsTitle}
        </h2>
        <p className="text-txt-secondary">{t.noBenefitsSub}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {results.map((program) => (
        <BenefitsCard key={program.id} program={program} />
      ))}
    </div>
  );
}
