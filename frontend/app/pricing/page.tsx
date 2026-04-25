"use client";

import { useLanguage } from "@/components/LanguageProvider";

type Plan = {
  nameKey: "freePlanName" | "renterPlanName" | "b2bPlanName";
  descKey: "pricingFreeDesc" | "pricingRenterDesc" | "pricingB2bDesc";
  ctaKey: "pricingGetStarted" | "pricingSubscribe" | "pricingContact";
  price: string;
  perMonth: boolean;
  popular: boolean;
  features: Array<"pricingSearches" | "pricingUnlimited" | "pricingAlerts" | "pricingTeam" | "pricingEmbed" | "pricingReport">;
};

const PLANS: Plan[] = [
  {
    nameKey: "freePlanName",
    descKey: "pricingFreeDesc",
    ctaKey: "pricingGetStarted",
    price: "₪0",
    perMonth: false,
    popular: false,
    features: ["pricingSearches"],
  },
  {
    nameKey: "renterPlanName",
    descKey: "pricingRenterDesc",
    ctaKey: "pricingSubscribe",
    price: "₪39",
    perMonth: true,
    popular: true,
    features: ["pricingUnlimited", "pricingAlerts"],
  },
  {
    nameKey: "b2bPlanName",
    descKey: "pricingB2bDesc",
    ctaKey: "pricingContact",
    price: "₪2,500",
    perMonth: true,
    popular: false,
    features: ["pricingUnlimited", "pricingAlerts", "pricingTeam", "pricingEmbed", "pricingReport"],
  },
];

export default function PricingPage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen px-4 py-6 md:py-10 max-w-5xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-10 md:mb-12">
        <h1 className="text-2xl md:text-3xl font-bold text-txt-primary mb-2">
          {t.pricingTitle}{" "}
          <span style={{ color: "#1E7B7B" }}>{t.pricingHighlight}</span>
        </h1>
        <p className="text-txt-secondary">{t.pricingSub}</p>
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {PLANS.map((plan) => (
          <PlanCard key={plan.nameKey} plan={plan} />
        ))}
      </div>
    </main>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const { t } = useLanguage();

  return (
    <div
      className="flex flex-col gap-5 p-6 relative"
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "12px",
        border: plan.popular ? "1.5px solid #1E7B7B" : "1px solid #DDE4E8",
        boxShadow: plan.popular ? "0 4px 28px rgba(30,123,123,0.12)" : "0 2px 8px rgba(30,123,123,0.04)",
      }}
    >
      {/* Popular badge */}
      {plan.popular && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold"
          style={{
            backgroundColor: "#1E7B7B",
            color: "#FFFFFF",
            borderRadius: "99px",
            whiteSpace: "nowrap",
          }}
        >
          {t.pricingPopular}
        </div>
      )}

      {/* Name + price */}
      <div>
        <p className="text-sm font-medium text-txt-secondary mb-1">{t[plan.nameKey]}</p>
        <div className="flex items-baseline gap-1">
          <span
            className="text-3xl font-bold text-txt-primary"
            style={{ fontFamily: "var(--font-dm-mono), monospace" }}
          >
            {plan.price}
          </span>
          {plan.perMonth && (
            <span className="text-sm text-txt-secondary">{t.perMonth}</span>
          )}
        </div>
        <p className="text-sm text-txt-secondary mt-2">{t[plan.descKey]}</p>
      </div>

      {/* Feature list */}
      <ul className="flex flex-col gap-2 flex-1">
        {plan.features.map((featureKey) => (
          <li key={featureKey} className="flex items-center gap-2 text-sm text-txt-primary">
            <span style={{ color: "#1E7B7B", flexShrink: 0 }}>✓</span>
            {t[featureKey]}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        className="w-full py-3 text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98] mt-auto"
        style={
          plan.popular
            ? { backgroundColor: "#1E7B7B", color: "#FFFFFF", borderRadius: "8px", boxShadow: "0 4px 14px rgba(30,123,123,0.28)" }
            : {
                backgroundColor: "transparent",
                color: "#1E7B7B",
                borderRadius: "8px",
                border: "1px solid #1E7B7B50",
              }
        }
      >
        {t[plan.ctaKey]}
      </button>
    </div>
  );
}
