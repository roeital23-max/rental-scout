export type Lang = "he" | "en";

export const strings = {
  he: {
    // Layout / nav
    toggleLang: "EN",
    navHome: "בית",
    navBenefits: "זכאויות",
    navPricing: "תמחור",

    // Home — feature cards
    featBenefitsTitle: "מצא זכאויות ממשלתיות",
    featBenefitsSub: "גלה את תוכניות הסיוע שמגיעות לך — סיוע בשכר דירה, מחיר למשתכן, מענקי עלייה ועוד.",
    featPricingTitle: "תוכניות ומחירים",
    featPricingSub: "התחל חינם עם 5 חיפושים ביום. שדרג לתראות WhatsApp ועוד.",

    // Home — hero
    badge: "שוק השכירות בישראל · ניתוח חכם",
    heroTitle: "מצא את הבית הבא שלך",
    heroHighlight: "במחיר הוגן",
    heroSub: "השווה כל דירה לחציון השכונה לפני שאתה חותם.",
    heroData: "מופעל על ידי בינת נתונים",

    // Home — search form
    cityLabel: "עיר",
    cityPlaceholder: "כל הערים",
    roomsLabel: "מספר חדרים",
    roomsPlaceholder: "כל הגדלים",
    priceLabel: "מחיר מקסימלי (₪/חודש)",
    pricePlaceholder: "לדוגמה: 7000",
    searchBtn: "חפש עסקאות",

    // Home — trust badges
    trustListings: "~30,000 דירות פעילות",
    trustUpdate: "מתעדכן כל 6 שעות",
    trustData: "מבוסס נתונים אמינים",

    // Results
    backToSearch: "→ חזור לחיפוש",
    resultsFound: "נמצאו",
    resultsSuffix: "דירות",
    resultsInAll: "בכל הערים",
    resultsIn: "ב",
    filterCity: "עיר",
    filterRooms: "חדרים",
    filterMaxPrice: "עד ₪{price}/חודש",
    emptyTitle: "לא נמצאו תוצאות",
    emptySub: "נסה לשנות את הפילטרים — פחות הגבלות יחזירו יותר תוצאות",
    newSearch: "חיפוש חדש",

    // Deal badge
    great_deal: "עסקה מצוינת",
    fair: "מחיר הוגן",
    overpriced: "יקר מדי",
    roommate: "שותפים",
    parking: "חניה / אחסון",

    // Listing detail page
    backToResults: "→ חזרה לתוצאות",
    viewOnYad2: "לצפייה במודעה המקורית",
    priceAnalysis: "ניתוח מחיר",
    neighborhoodTrends: "מגמות שכונה",
    listedOn: "פורסם",
    pricePerSqm: '₪/מ"ר',
    medianLabel: "חציון בשכונה",
    roommateNotice: "מודעה זו מפרסמת חדר בשיתוף — המחיר הוא לחדר בודד, לא לדירה שלמה.",
    parkingNotice: "מודעה זו היא עבור חנייה או אחסון — לא דירה להשכרה.",

    // Listing card
    perMonth: "/חודש",
    rooms: "חדרים",
    sqm: 'מ"ר',
    groundFloor: "קרקע",
    floor: "קומה",
    moreDetails: "לפרטים נוספים ←",

    // Listing features
    featureBalcony: "מרפסת",
    featureParking: "חניה",
    featureGarden: "גינה",
    featureMamad: 'ממ"ד',
    featureBuildingShelter: "מקלט בניין",
    featurePublicShelter: "מקלט ציבורי",

    // Benefits page
    benefitsTitle: "מצא סיוע ממשלתי",
    benefitsHighlight: "שמגיע לך",
    benefitsSub: "ענה על כמה שאלות ונמצא את תוכניות הסיוע הממשלתיות שאתה זכאי להן.",
    incomeLabel: "הכנסה חודשית משפחתית (₪)",
    incomePlaceholder: "לדוגמה: 15000",
    familySizeLabel: "גודל משפחה",
    familySizePlaceholder: "מספר נפשות",
    ownsHomeLabel: "אני בעלים של דירה",
    isOlehLabel: "עולה חדש / עולה חדשה",
    findBenefitsBtn: "מצא תוכניות סיוע",
    monthlyBenefit: "סיוע חודשי",
    oneTimeBenefit: "מענק חד-פעמי",
    applyNow: "לפרטים והגשה ←",
    noBenefitsTitle: "לא נמצאו תוכניות מתאימות",
    noBenefitsSub: "נסה לשנות את הפרטים — ייתכן שאתה זכאי לתוכניות נוספות",
    allProgramsNote: "מציג את כל התוכניות — מלא את הטופס לסינון לפי זכאות",

    // Pricing page
    pricingTitle: "תמחור פשוט",
    pricingHighlight: "ושקוף",
    pricingSub: "התחל חינם. שדרג כשאתה מוכן.",
    freePlanName: "חינם",
    renterPlanName: "שוכר",
    b2bPlanName: "עסקי",
    pricingPopular: "הכי פופולרי",
    pricingSearches: "5 חיפושים ביום",
    pricingUnlimited: "חיפושים ללא הגבלה",
    pricingAlerts: "התראות WhatsApp",
    pricingTeam: "חשבונות צוות",
    pricingEmbed: "ווידג׳ט להטמעה",
    pricingReport: "דוח שוק חודשי",
    pricingGetStarted: "התחל חינם",
    pricingSubscribe: "הירשם עכשיו",
    pricingContact: "צור קשר",
    pricingFreeDesc: "לשוכר שרוצה לבדוק עסקה לפני שחותם",
    pricingRenterDesc: "לשוכרים פעילים שמחפשים את הדירה הבאה",
    pricingB2bDesc: "לחברות השמה, מעסיקים ויועצי נדל\"ן",
  },

  en: {
    // Layout / nav
    toggleLang: "עב",
    navHome: "Home",
    navBenefits: "Benefits",
    navPricing: "Pricing",

    // Home — feature cards
    featBenefitsTitle: "Find Government Benefits",
    featBenefitsSub: "Discover assistance programs you qualify for — rent subsidy, affordable housing lottery, Oleh grants and more.",
    featPricingTitle: "Plans & Pricing",
    featPricingSub: "Start free with 5 searches per day. Upgrade for WhatsApp alerts and more.",

    // Home — hero
    badge: "Israel Rental Market · Smart Analysis",
    heroTitle: "Find Your Next Home",
    heroHighlight: "At a Fair Price",
    heroSub: "Compare every apartment to the neighborhood median before you sign.",
    heroData: "Powered by Data Intelligence",

    // Home — search form
    cityLabel: "City",
    cityPlaceholder: "All cities",
    roomsLabel: "Rooms",
    roomsPlaceholder: "Any size",
    priceLabel: "Max price (₪/month)",
    pricePlaceholder: "e.g. 7000",
    searchBtn: "Search deals",

    // Home — trust badges
    trustListings: "~30,000 active listings",
    trustUpdate: "Updated every 6 hours",
    trustData: "Powered by reliable data",

    // Results
    backToSearch: "← Back to search",
    resultsFound: "Found",
    resultsSuffix: "apartments",
    resultsInAll: "across all cities",
    resultsIn: "in ",
    filterCity: "City",
    filterRooms: "rooms",
    filterMaxPrice: "Up to ₪{price}/mo",
    emptyTitle: "No results found",
    emptySub: "Try adjusting your filters — fewer restrictions will return more listings",
    newSearch: "New search",

    // Deal badge
    great_deal: "Great Deal",
    fair: "Fair Price",
    overpriced: "Overpriced",
    roommate: "Roommate",
    parking: "Parking / Storage",

    // Listing detail page
    backToResults: "← Back to results",
    viewOnYad2: "View original listing",
    priceAnalysis: "Price Analysis",
    neighborhoodTrends: "Neighborhood Trends",
    listedOn: "Listed",
    pricePerSqm: "₪/sqm",
    medianLabel: "Neighborhood median",
    roommateNotice: "This ad is for a room in a shared apartment — the price is per room, not for the whole apartment.",
    parkingNotice: "This ad is for a parking spot or storage unit — not a rental apartment.",

    // Listing card
    perMonth: "/mo",
    rooms: "rooms",
    sqm: "sqm",
    groundFloor: "Ground",
    floor: "Floor",
    moreDetails: "More details →",

    // Listing features
    featureBalcony: "Balcony",
    featureParking: "Parking",
    featureGarden: "Garden",
    featureMamad: "Mamad",
    featureBuildingShelter: "Bldg. Shelter",
    featurePublicShelter: "Public Shelter",

    // Benefits page
    benefitsTitle: "Find Government Assistance",
    benefitsHighlight: "You Deserve",
    benefitsSub: "Answer a few questions and we'll find the Israeli government programs you're eligible for.",
    incomeLabel: "Monthly household income (₪)",
    incomePlaceholder: "e.g. 15000",
    familySizeLabel: "Family size",
    familySizePlaceholder: "Number of people",
    ownsHomeLabel: "I own a home",
    isOlehLabel: "New immigrant (Oleh/Olah)",
    findBenefitsBtn: "Find assistance programs",
    monthlyBenefit: "Monthly benefit",
    oneTimeBenefit: "One-time grant",
    applyNow: "Details & apply →",
    noBenefitsTitle: "No matching programs found",
    noBenefitsSub: "Try adjusting your details — you may qualify for additional programs",
    allProgramsNote: "Showing all programs — fill in the form to filter by eligibility",

    // Pricing page
    pricingTitle: "Simple Pricing",
    pricingHighlight: "and Transparent",
    pricingSub: "Start free. Upgrade when you're ready.",
    freePlanName: "Free",
    renterPlanName: "Renter",
    b2bPlanName: "Business",
    pricingPopular: "Most popular",
    pricingSearches: "5 searches / day",
    pricingUnlimited: "Unlimited searches",
    pricingAlerts: "WhatsApp alerts",
    pricingTeam: "Team accounts",
    pricingEmbed: "Embeddable widget",
    pricingReport: "Monthly market report",
    pricingGetStarted: "Get started free",
    pricingSubscribe: "Subscribe now",
    pricingContact: "Contact us",
    pricingFreeDesc: "For renters who want to check a deal before signing",
    pricingRenterDesc: "For active renters searching for their next apartment",
    pricingB2bDesc: "For HR teams, employers, and real estate advisors",
  },
} as const;

export type Strings = (typeof strings)["he"] | (typeof strings)["en"];
