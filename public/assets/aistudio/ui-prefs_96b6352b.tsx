import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/* ------------------------------------------------------------------ */
/* Theme (light is the product default; toggle persists per session)   */
/* ------------------------------------------------------------------ */

type Theme = "light" | "dark";
const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void }>({
  theme: "light",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = window.localStorage.getItem("travity-theme");
    if (stored === "dark" || stored === "light") setTheme(stored);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("travity-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === "light" ? "dark" : "light")),
    [],
  );

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

/* ------------------------------------------------------------------ */
/* Language: English default, Hindi covers key UI. Missing Hindi keys  */
/* gracefully fall back to English.                                    */
/* ------------------------------------------------------------------ */

export type Lang = "en" | "hi";

const en = {
  "brand.tagline": "Good plans. Great people. Safer journeys.",
  "brand.support": "Plan together. Travel smarter. Make memories.",
  "nav.home": "Home",
  "nav.plan": "Plan an outing",
  "nav.join": "Join a plan",
  "nav.explore": "Explore places",
  "nav.upcoming": "My outings",
  "nav.past": "Past outings",
  "nav.reviews": "Reviews & experiences",
  "nav.saved": "Saved places",
  "nav.expenses": "Expenses",
  "nav.notifications": "Notifications",
  "nav.profile": "Profile & settings",
  "nav.help": "Help & privacy",
  "common.back": "Back",
  "common.next": "Next",
  "common.continue": "Continue",
  "common.copy": "Copy",
  "common.copied": "Copied!",
  "common.share": "Share",
  "common.search": "Search",
  "common.save": "Save",
  "common.saved": "Saved",
  "common.filters": "Filters",
  "common.demo": "Demo preview — data is simulated",
  "common.illustrative": "Illustrative demo estimate",
  "common.viewAll": "View all",
  "common.selectDestination": "Select destination",
  "common.viewDetails": "View details",
  "common.routeMap": "Route map",
  "common.safety": "Safety",
  "common.duration": "Duration",
  "common.budget": "Budget",
  "common.perPerson": "per person",
  "common.destinationBudget": "Destination budget",
  "common.commuteFare": "Commute fare",
  "common.commuteFareNote":
    "Destination budget covers food, activities and entry tickets. Commute fares are always shown separately.",
  "login.greeting":
    "Hey! I'm Travis. Let's find a place everyone can get to, enjoy, and feel comfortable exploring.",
  "login.signIn": "Sign in",
  "login.createAccount": "Create account",
  "login.email": "Email",
  "login.password": "Password",
  "login.confirmPassword": "Confirm password",
  "login.showPassword": "Show password",
  "login.hidePassword": "Hide password",
  "login.rememberMe": "Remember me",
  "login.forgot": "Forgot password?",
  "login.google": "Continue with Google (demo)",
  "login.recoverTitle": "Recover your password",
  "login.backToSignIn": "Back to sign in",
  "home.heroTitle": "A place everyone can get to.",
  "home.heroSub":
    "Plan day outings with friends across Delhi NCR — routes, budgets and safety awareness, all together.",
  "home.ctaPlan": "Plan an outing",
  "home.ctaPlanSub": "Find a place that works for everyone.",
  "home.activePlans": "Active & upcoming plans",
  "home.recent": "Recent outings",
  "home.invites": "Invitations & updates",
  "home.offers": "Local offers & activities",
  "home.greeting": "Hi {name}! Ready for the next outing?",
  "lobby.title": "Group lobby",
  "lobby.startPoint": "Your starting point",
  "lobby.useLocation": "Use my current location",
  "lobby.useMetro": "Select my nearest metro station",
  "lobby.manual": "Enter location manually",
  "lobby.joined": "Joined",
  "lobby.pending": "Preferences pending",
  "lobby.invite": "Invite friends",
  "lobby.groupChat": "Group notes",
  "lobby.findCommonRoute": "Find a common route with a friend",
  "plan.stepKind": "Outing type",
  "plan.stepGroup": "Group details",
  "plan.stepBudget": "Destination budget",
  "plan.stepReview": "Review & create",
  "safety.title": "Safety awareness",
  "safety.layers": "Map layers",
  "safety.detail": "Marker details",
  "safety.status.official": "Official record",
  "safety.status.mapped": "Mapped location",
  "safety.status.community": "Community-reported",
  "safety.status.satellite": "Satellite-derived estimate",
  "safety.status.demo": "Illustrative demo data",
  "safety.status.unknown": "Unknown / insufficient information",
  "safety.moreInfo": "More mapped safety information available",
  "safety.limited": "Limited recent observations",
  "safety.incomplete": "Some route segments have incomplete data",
  "map.title": "Route map",
  "map.skipIntro": "Skip animation",
  "map.legend": "Legend",
  "map.selectFriend": "Select a friend to see their route",
  "explore.title": "Explore places",
  "explore.sub": "Every Travity destination across Delhi NCR, with commute and budget context.",
  "outings.title": "My outings",
  "outings.sub": "Your active plans and what needs your attention.",
  "past.title": "Past outings",
  "past.sub": "Where you've been and how each outing went.",
  "reviews.title": "Reviews & experiences",
  "reviews.sub": "What your groups said after each outing.",
  "saved.title": "Saved places",
  "saved.sub": "Places your groups shortlisted for later.",
  "expenses.title": "Expenses",
  "expenses.sub": "Split shared costs fairly across the group.",
  "notifications.title": "Notifications",
  "notifications.sub": "Invites, updates and safety notes from your groups.",
  "profile.title": "Profile & settings",
  "profile.sub": "Your details, preferences and app settings.",
  "help.title": "Help & privacy",
  "help.sub": "How Travity works, and how your data is handled.",
  "destination.photoNote": "Official place photo not connected in this demo — branded placeholder shown.",
  "recommendations.title": "Destination recommendations",
} as const;

export type TKey = keyof typeof en;

const hi: Partial<Record<TKey, string>> = {
  "brand.tagline": "अच्छी प्लानिंग। बढ़िया दोस्त। सुरक्षित सफ़र।",
  "brand.support": "साथ प्लान करें। समझदारी से यात्रा करें। यादें बनाएँ।",
  "nav.home": "होम",
  "nav.plan": "आउटिंग प्लान करें",
  "nav.join": "प्लान जॉइन करें",
  "nav.explore": "जगहें खोजें",
  "nav.upcoming": "मेरी आउटिंग्स",
  "nav.past": "पिछली आउटिंग्स",
  "nav.reviews": "रिव्यू और अनुभव",
  "nav.saved": "सेव की गई जगहें",
  "nav.expenses": "खर्चे",
  "nav.notifications": "सूचनाएँ",
  "nav.profile": "प्रोफ़ाइल और सेटिंग्स",
  "nav.help": "मदद और प्राइवेसी",
  "common.back": "वापस",
  "common.next": "आगे",
  "common.continue": "आगे बढ़ें",
  "common.copy": "कॉपी करें",
  "common.copied": "कॉपी हो गया!",
  "common.share": "शेयर करें",
  "common.search": "खोजें",
  "common.save": "सेव करें",
  "common.saved": "सेव हो गया",
  "common.filters": "फ़िल्टर",
  "common.demo": "डेमो प्रीव्यू — डेटा सिम्युलेटेड है",
  "common.illustrative": "सांकेतिक डेमो अनुमान",
  "common.viewAll": "सभी देखें",
  "common.selectDestination": "डेस्टिनेशन चुनें",
  "common.viewDetails": "डिटेल देखें",
  "common.routeMap": "रूट मैप",
  "common.safety": "सुरक्षा",
  "common.duration": "अवधि",
  "common.budget": "बजट",
  "common.perPerson": "प्रति व्यक्ति",
  "common.destinationBudget": "डेस्टिनेशन बजट",
  "common.commuteFare": "सफ़र का किराया",
  "common.commuteFareNote":
    "डेस्टिनेशन बजट में खाना, एक्टिविटीज़ और एंट्री टिकट आते हैं। सफ़र का किराया हमेशा अलग से दिखाया जाता है।",
  "login.greeting":
    "नमस्ते! मैं ट्रैविस हूँ। चलिए ऐसी जगह ढूँढें जहाँ सब पहुँच सकें, मज़े कर सकें, और सहज महसूस करके घूम सकें।",
  "login.signIn": "साइन इन करें",
  "login.createAccount": "नया अकाउंट बनाएँ",
  "login.email": "ईमेल",
  "login.password": "पासवर्ड",
  "login.confirmPassword": "पासवर्ड दोबारा लिखें",
  "login.showPassword": "पासवर्ड दिखाएँ",
  "login.hidePassword": "पासवर्ड छिपाएँ",
  "login.rememberMe": "मुझे याद रखें",
  "login.forgot": "पासवर्ड भूल गए?",
  "login.google": "Google से जारी रखें (डेमो)",
  "login.recoverTitle": "पासवर्ड रिकवर करें",
  "login.backToSignIn": "वापस साइन इन पर",
  "home.heroTitle": "ऐसी जगह जहाँ सब पहुँच सकें।",
  "home.heroSub":
    "दोस्तों के साथ Delhi NCR की डे-आउटिंग प्लान करें — रास्ते, बजट और सुरक्षा-जानकारी, सब एक जगह।",
  "home.ctaPlan": "आउटिंग प्लान करें",
  "home.ctaPlanSub": "ऐसी जगह जो सबके लिए काम करे।",
  "home.activePlans": "चालू और आने वाले प्लान",
  "home.recent": "हाल की आउटिंग्स",
  "home.invites": "इनवाइट और अपडेट",
  "home.offers": "लोकल ऑफ़र और एक्टिविटीज़",
  "home.greeting": "हाय {name}! अगली आउटिंग के लिए तैयार हैं?",
  "lobby.title": "ग्रुप लॉबी",
  "lobby.startPoint": "आपका स्टार्टिंग पॉइंट",
  "lobby.useLocation": "मेरी मौजूदा लोकेशन इस्तेमाल करें",
  "lobby.useMetro": "मेरा नज़दीकी मेट्रो स्टेशन चुनें",
  "lobby.manual": "लोकेशन खुद लिखें",
  "lobby.joined": "जॉइन कर चुके",
  "lobby.pending": "प्रेफ़रेंसेज़ बाकी",
  "lobby.invite": "दोस्तों को इनवाइट करें",
  "lobby.groupChat": "ग्रुप नोट्स",
  "lobby.findCommonRoute": "किसी दोस्त के साथ कॉमन रूट ढूँढें",
  "plan.stepKind": "आउटिंग का टाइप",
  "plan.stepGroup": "ग्रुप डिटेल्स",
  "plan.stepBudget": "डेस्टिनेशन बजट",
  "plan.stepReview": "रिव्यू करें और बनाएँ",
  "safety.title": "सुरक्षा-जानकारी",
  "safety.layers": "मैप लेयर",
  "safety.detail": "मार्कर डिटेल",
  "safety.status.official": "आधिकारिक रिकॉर्ड",
  "safety.status.mapped": "मैप की गई लोकेशन",
  "safety.status.community": "कम्युनिटी-रिपोर्टेड",
  "safety.status.satellite": "सैटेलाइट-आधारित अनुमान",
  "safety.status.demo": "सांकेतिक डेमो डेटा",
  "safety.status.unknown": "अज्ञात / पर्याप्त जानकारी नहीं",
  "safety.moreInfo": "यहाँ ज़्यादा मैप की गई सुरक्षा-जानकारी उपलब्ध है",
  "safety.limited": "हाल की देखरेख सीमित है",
  "safety.incomplete": "कुछ रूट-सेगमेंट की जानकारी अधूरी है",
  "map.title": "रूट मैप",
  "map.skipIntro": "एनिमेशन छोड़ें",
  "map.legend": "लेजेंड",
  "map.selectFriend": "रूट देखने के लिए कोई दोस्त चुनें",
  "explore.title": "जगहें खोजें",
  "explore.sub": "Delhi NCR की हर Travity जगह — सफ़र और बजट के हिसाब के साथ।",
  "outings.title": "मेरी आउटिंग्स",
  "outings.sub": "आपके चालू प्लान और जो आपसे बाकी है।",
  "past.title": "पिछली आउटिंग्स",
  "past.sub": "आप कहाँ गए और हर आउटिंग कैसी रही।",
  "reviews.title": "रिव्यू और अनुभव",
  "reviews.sub": "हर आउटिंग के बाद आपके ग्रुप ने क्या कहा।",
  "saved.title": "सेव की गई जगहें",
  "saved.sub": "जगहें जो आपके ग्रुप ने बाद के लिए चुनीं।",
  "expenses.title": "खर्चे",
  "expenses.sub": "शेयर्ड खर्चे ग्रुप में बराबर बाँटें।",
  "notifications.title": "सूचनाएँ",
  "notifications.sub": "इनवाइट, अपडेट और ग्रुप की सुरक्षा-नोट्स।",
  "profile.title": "प्रोफ़ाइल और सेटिंग्स",
  "profile.sub": "आपकी डिटेल्स, प्रेफ़रेंसेज़ और ऐप सेटिंग्स।",
  "help.title": "मदद और प्राइवेसी",
  "help.sub": "Travity कैसे काम करता है, और आपका डेटा कैसे संभलता है।",
  "destination.photoNote": "इस डेमो में असली जगह की तस्वीर कनेक्ट नहीं है — ब्रांडेड प्लेसहोल्डर दिख रहा है।",
  "recommendations.title": "डेस्टिनेशन सुझाव",
};

const LangContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey, vars?: Record<string, string>) => string;
}>({
  lang: "en",
  setLang: () => {},
  t: (k) => en[k],
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem("travity-lang");
    if (stored === "hi" || stored === "en") setLangState(stored);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("travity-lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const t = useCallback(
    (key: TKey, vars?: Record<string, string>) => {
      let out = (lang === "hi" ? hi[key] : undefined) ?? en[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          out = out.replace(`{${k}}`, v);
        }
      }
      return out;
    },
    [lang],
  );

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export const useT = () => useContext(LangContext);

export function LanguageSelect({ className }: { className?: string }) {
  const { lang, setLang } = useT();
  return (
    <select
      aria-label="Language"
      value={lang}
      onChange={(e) => setLang(e.target.value as Lang)}
      className={
        "h-9 cursor-pointer rounded-lg border border-border bg-card px-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent " +
        (className ?? "")
      }
    >
      <option value="en">English</option>
      <option value="hi">हिन्दी</option>
    </select>
  );
}
