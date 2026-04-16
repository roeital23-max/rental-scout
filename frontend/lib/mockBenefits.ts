export type BenefitProgram = {
  id: string;
  name_he: string;
  name_en: string;
  description_he: string;
  description_en: string;
  monthly_amount_nis: number | null;
  one_time_amount_nis: number | null;
  link: string;
};

export const MOCK_BENEFITS: BenefitProgram[] = [
  {
    id: "rent_subsidy",
    name_he: "סיוע בשכר דירה",
    name_en: "Rent Subsidy",
    description_he: "תשלום חודשי ישיר לשוכרים הזכאים לפי הכנסה, גודל משפחה ומיקום. מנוהל על ידי משרד השיכון.",
    description_en: "Monthly cash payment to eligible renters based on income, family size, and location. Managed by the Ministry of Housing.",
    monthly_amount_nis: 1800,
    one_time_amount_nis: null,
    link: "https://www.gov.il/he/departments/guides/rental_assistance",
  },
  {
    id: "mechir_lemishtaken",
    name_he: "מחיר למשתכן",
    name_en: "Mechir Lemishtaken",
    description_he: "הגרלות לרכישת דירה בהנחה משמעותית ממחיר השוק, לאנשים שאינם בעלי דירה.",
    description_en: "Lottery for purchasing an apartment at a significant discount from market price, for non-homeowners.",
    monthly_amount_nis: null,
    one_time_amount_nis: null,
    link: "https://www.dira.moch.gov.il",
  },
  {
    id: "amidar",
    name_he: "דיור ציבורי — עמידר",
    name_en: "Amidar Public Housing",
    description_he: "רשימת המתנה לדיור ציבורי בשכר דירה מסובסד דרך חברת עמידר. מיועד למשפחות בעלות הכנסה נמוכה.",
    description_en: "Waiting list for public housing at subsidized rent through Amidar. For low-income families.",
    monthly_amount_nis: null,
    one_time_amount_nis: null,
    link: "https://www.amidar.co.il",
  },
  {
    id: "oleh_housing_grant",
    name_he: "מענק דיור לעולה חדש",
    name_en: "Oleh Housing Grant",
    description_he: "מענק חד-פעמי לעולים חדשים לסיוע בעלויות השכרה או רכישת דירה בישראל. ניתן דרך הסוכנות היהודית.",
    description_en: "One-time grant for new immigrants to help cover rental or purchase costs in Israel. Provided through the Jewish Agency.",
    monthly_amount_nis: null,
    one_time_amount_nis: 25000,
    link: "https://www.jewishagency.org/aliyah/housing",
  },
  {
    id: "young_couples_grant",
    name_he: "מענק זוגות צעירים",
    name_en: "Young Couples Grant",
    description_he: "סיוע ברכישת דירה ראשונה לזוגות מתחת לגיל 35, ללא בעלות על דירה. ניתן כמשכנתא מוטבת.",
    description_en: "Mortgage assistance for first-time buyers under 35, who do not own a home. Provided as a subsidized mortgage.",
    monthly_amount_nis: null,
    one_time_amount_nis: 60000,
    link: "https://www.moch.gov.il/young-couples",
  },
  {
    id: "peripheral_benefit",
    name_he: "הטבת פריפריה",
    name_en: "Peripheral Area Benefit",
    description_he: "מענק מיוחד למתיישבים בערים מועדפות כגון באר שבע, חיפה, צפון ודרום. מטרתו לעודד פיזור אוכלוסין.",
    description_en: "Special grant for settling in priority cities like Beer Sheva, Haifa, North and South. Aimed at encouraging population dispersal.",
    monthly_amount_nis: null,
    one_time_amount_nis: 40000,
    link: "https://www.gov.il/he/departments/guides/periphery_benefit",
  },
];
