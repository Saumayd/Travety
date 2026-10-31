import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export type Theme = 'light' | 'dark';

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({
  children,
  initialDark = false,
  onSyncDark,
}: {
  children: ReactNode;
  initialDark?: boolean;
  onSyncDark?: (dark: boolean) => void;
}) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = window.localStorage.getItem('travity-theme');
      if (stored === 'dark' || stored === 'light') return stored;
    } catch {
      // ignore
    }
    return initialDark ? 'dark' : 'light';
  });

  useEffect(() => {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    try {
      window.localStorage.setItem('travity-theme', theme);
    } catch {
      // ignore
    }
    onSyncDark?.(isDark);
  }, [theme, onSyncDark]);

  const toggleTheme = useCallback(() => {
    setThemeState((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

export type Lang = 'en' | 'hi';

const en = {
  'brand.tagline': 'Good plans. Great people. Safer journeys.',
  'brand.support': 'Plan together. Travel smarter. Make memories.',
  'nav.home': 'Home',
  'nav.plan': 'Plan an outing',
  'nav.join': 'Join a plan',
  'nav.lobby': 'Group lobby',
  'nav.recommendations': 'Recommendations',
  'nav.explore': 'Explore places',
  'nav.upcoming': 'My outings',
  'nav.calendar': 'Calendar',
  'nav.invitations': 'Invitations',
  'nav.past': 'Past outings',
  'nav.reviews': 'Reviews & experiences',
  'nav.saved': 'Saved places',
  'nav.expenses': 'Expenses',
  'nav.notifications': 'Notifications',
  'nav.profile': 'Profile & settings',
  'nav.help': 'Help & privacy',
  'common.back': 'Back',
  'common.next': 'Next',
  'common.continue': 'Continue',
  'common.copy': 'Copy',
  'common.copied': 'Copied!',
  'common.share': 'Share',
  'common.search': 'Search',
  'common.save': 'Save',
  'common.saved': 'Saved',
  'common.filters': 'Filters',
  'common.demo': 'NSUT & IGDTUW Squad · Delhi NCR',
  'common.illustrative': 'DMRC Metro & Curfew Estimate',
  'common.viewAll': 'View all',
  'common.selectDestination': 'Select destination',
  'common.viewDetails': 'View details',
  'common.routeMap': 'Route map',
  'common.safety': 'Safety',
  'common.duration': 'Duration',
  'common.budget': 'Budget',
  'common.perPerson': 'per person',
  'common.destinationBudget': 'Destination budget',
  'common.commuteFare': 'Commute fare',
  'common.commuteFareNote':
    'Destination budget covers food, activities and entry tickets. Commute fares are always shown separately.',
  'home.heroTitle': 'A place everyone can get to.',
  'home.heroSub':
    'Plan day outings with friends across Delhi NCR — routes, budgets and safety awareness, all together.',
  'home.ctaPlan': 'Plan an outing',
  'home.ctaPlanSub': 'Find a place that works for everyone.',
  'home.greeting': 'Hi {name}! Ready for the next outing?',
  'lobby.title': 'Group lobby',
  'lobby.startPoint': 'Your starting point',
  'lobby.useLocation': 'Snap to Rajiv Chowk Midpoint',
  'lobby.useMetro': 'Select my nearest metro station',
  'lobby.joined': 'Joined',
  'lobby.pending': 'Preferences pending',
  'lobby.invite': 'Invite friends',
  'lobby.groupChat': 'Group notes',
  'plan.stepKind': 'Outing type',
  'plan.stepGroup': 'Group details',
  'plan.stepBudget': 'Destination budget',
  'plan.stepReview': 'Review & create',
  'safety.title': 'Safety awareness',
  'safety.layers': 'Map layers',
  'safety.detail': 'Marker details',
  'safety.status.official': 'Official record',
  'safety.status.mapped': 'Mapped location',
  'safety.status.community': 'Community-reported',
  'safety.status.satellite': 'Satellite-derived estimate',
  'safety.status.demo': 'Illustrative demo data',
  'safety.status.unknown': 'Unknown / insufficient information',
  'safety.limited': 'Verify on the ground',
  'safety.incomplete': 'Some route segments have incomplete data',
  'map.title': 'Route map',
  'map.skipIntro': 'Skip animation',
  'map.legend': 'Legend',
  'map.selectFriend': 'Select a friend to see their route',
  'explore.title': 'Explore places',
  'explore.sub': 'Every Travety destination across Delhi NCR, with commute and budget context.',
  'outings.title': 'My outings',
  'outings.sub': 'Your active plans and what needs your attention.',
  'past.title': 'Past outings',
  'past.sub': "Where you've been and how each outing went.",
  'reviews.title': 'Reviews & experiences',
  'reviews.sub': 'What your groups said after each outing.',
  'saved.title': 'Saved places',
  'saved.sub': 'Places your groups shortlisted for later.',
  'expenses.title': 'Expenses',
  'expenses.sub': 'Split shared costs fairly across the group.',
  'notifications.title': 'Notifications',
  'notifications.sub': 'Invites, updates and safety notes from your groups.',
  'profile.title': 'Profile & settings',
  'profile.sub': 'Your details, preferences and app settings.',
  'help.title': 'Help & privacy',
  'help.sub': 'How Travety works, and how your data is handled.',
  'destination.photoNote': 'Delhi NCR Campus & Transit Hub',
  'recommendations.title': 'Destination recommendations',
} as const;

export type TKey = keyof typeof en;

const hi: Partial<Record<TKey, string>> = {
  'brand.tagline': 'अच्छी प्लानिंग। बढ़िया दोस्त। सुरक्षित सफ़र।',
  'brand.support': 'साथ प्लान करें। समझदारी से यात्रा करें। यादें बनाएँ।',
  'nav.home': 'होम',
  'nav.plan': 'आउटिंग प्लान करें',
  'nav.join': 'प्लान जॉइन करें',
  'nav.lobby': 'ग्रुप लॉबी',
  'nav.recommendations': 'सुझाव',
  'nav.explore': 'जगहें खोजें',
  'nav.upcoming': 'मेरी आउटिंग्स',
  'nav.calendar': 'कैलेंडर',
  'nav.invitations': 'इनवाइट',
  'nav.past': 'पिछली आउटिंग्स',
  'nav.reviews': 'रिव्यू और अनुभव',
  'nav.saved': 'सेव की गई जगहें',
  'nav.expenses': 'खर्चे',
  'nav.notifications': 'सूचनाएँ',
  'nav.profile': 'प्रोफ़ाइल और सेटिंग्स',
  'nav.help': 'मदद और प्राइवेसी',
  'common.back': 'वापस',
  'common.next': 'आगे',
  'common.continue': 'आगे बढ़ें',
  'common.copy': 'कॉपी करें',
  'common.copied': 'कॉपी हो गया!',
  'common.share': 'शेयर करें',
  'common.search': 'खोजें',
  'common.save': 'सेव करें',
  'common.saved': 'सेव हो गया',
  'common.filters': 'फ़िल्टर',
  'common.demo': 'NSUT & IGDTUW स्क्वाड · Delhi NCR',
  'common.illustrative': 'DMRC मेट्रो और कर्फ्यू अनुमान',
  'common.viewAll': 'सभी देखें',
  'common.selectDestination': 'डेस्टिनेशन चुनें',
  'common.viewDetails': 'डिटेल देखें',
  'common.routeMap': 'रूट मैप',
  'common.safety': 'सुरक्षा',
  'common.duration': 'अवधि',
  'common.budget': 'बजट',
  'common.perPerson': 'प्रति व्यक्ति',
  'common.destinationBudget': 'डेस्टिनेशन बजट',
  'common.commuteFare': 'सफ़र का किराया',
  'common.commuteFareNote':
    'डेस्टिनेशन बजट में खाना, एक्टिविटीज़ और एंट्री टिकट आते हैं। सफ़र का किराया हमेशा अलग से दिखाया जाता है।',
  'home.heroTitle': 'ऐसी जगह जहाँ सब पहुँच सकें।',
  'home.heroSub':
    'दोस्तों के साथ Delhi NCR की डे-आउटिंग प्लान करें — रास्ते, बजट और सुरक्षा-जानकारी, सब एक जगह।',
  'home.ctaPlan': 'आउटिंग प्लान करें',
  'home.ctaPlanSub': 'ऐसी जगह जो सबके लिए काम करे।',
  'home.greeting': 'हाय {name}! अगली आउटिंग के लिए तैयार हैं?',
  'lobby.title': 'ग्रुप लॉबी',
  'lobby.startPoint': 'आपका स्टार्टिंग पॉइंट',
  'lobby.useLocation': 'राजीव चौक मिडपॉइंट चुनें',
  'lobby.useMetro': 'मेरा नज़दीकी मेट्रो स्टेशन चुनें',
  'lobby.joined': 'जॉइन कर चुके',
  'lobby.pending': 'प्रेफ़रेंसेज़ बाकी',
  'lobby.invite': 'दोस्तों को इनवाइट करें',
  'lobby.groupChat': 'ग्रुप नोट्स',
  'plan.stepKind': 'आउटिंग का टाइप',
  'plan.stepGroup': 'ग्रुप डिटेल्स',
  'plan.stepBudget': 'डेस्टिनेशन बजट',
  'plan.stepReview': 'रिव्यू करें और बनाएँ',
  'safety.title': 'सुरक्षा-जानकारी',
  'safety.layers': 'मैप लेयर',
  'safety.detail': 'मार्कर डिटेल',
  'safety.status.official': 'आधिकारिक रिकॉर्ड',
  'safety.status.mapped': 'मैप की गई लोकेशन',
  'safety.status.community': 'कम्युनिटी-रिपोर्टेड',
  'safety.status.satellite': 'सैटेलाइट-आधारित अनुमान',
  'safety.status.demo': 'सांकेतिक डेमो डेटा',
  'safety.status.unknown': 'अज्ञात / पर्याप्त जानकारी नहीं',
  'safety.limited': 'हाल की देखरेख सीमित है',
  'safety.incomplete': 'कुछ रूट-सेगमेंट की जानकारी अधूरी है',
  'map.title': 'रूट मैप',
  'map.skipIntro': 'एनिमेशन छोड़ें',
  'map.legend': 'लेजेंड',
  'map.selectFriend': 'रूट देखने के लिए कोई दोस्त चुनें',
  'explore.title': 'जगहें खोजें',
  'explore.sub': 'Delhi NCR की हर Travety जगह — सफ़र और बजट के हिसाब के साथ।',
  'outings.title': 'मेरी आउटिंग्स',
  'outings.sub': 'आपके चालू प्लान और जो आपसे बाकी है।',
  'past.title': 'पिछली आउटिंग्स',
  'past.sub': 'आप कहाँ गए और हर आउटिंग कैसी रही।',
  'reviews.title': 'रिव्यू और अनुभव',
  'reviews.sub': 'हर आउटिंग के बाद आपके ग्रुप ने क्या कहा।',
  'saved.title': 'सेव की गई जगहें',
  'saved.sub': 'जगहें जो आपके ग्रुप ने बाद के लिए चुनीं।',
  'expenses.title': 'खर्चे',
  'expenses.sub': 'शेयर्ड खर्चे ग्रुप में बराबर बाँटें।',
  'notifications.title': 'सूचनाएँ',
  'notifications.sub': 'इनवाइट, अपडेट और ग्रुप की सुरक्षा-नोट्स।',
  'profile.title': 'प्रोफ़ाइल और सेटिंग्स',
  'profile.sub': 'आपकी डिटेल्स, प्रेफ़रेंसेज़ और ऐप सेटिंग्स।',
  'help.title': 'मदद और प्राइवेसी',
  'help.sub': 'Travety कैसे काम करता है, और आपका डेटा कैसे संभलता है।',
  'destination.photoNote': 'Delhi NCR कैंपस और ट्रांजिट हब',
  'recommendations.title': 'डेस्टिनेशन सुझाव',
};

const dashEn: Record<string, string> = {
  back: 'Back',
  menu: 'Settings menu',
  appearance: 'Appearance',
  light: 'Light mode',
  dark: 'Dark mode',
  language: 'Language',
  notifs: 'Notifications',
  markAll: 'Mark all read',
  noNotifs: 'All caught up!',
  noNotifsSub: 'New invites and safety updates appear here.',
  planTitle: 'Plan an outing together',
  planSub:
    'Pick a vibe, check NSUT & IGDTUW metro routes, and find a safe spot before everyone’s curfew.',
  planCta: 'Start planning',
  joinTitle: 'Join a friend’s plan',
  joinSub: 'Have a TRV-XXXX invite code? Enter it to jump into the group lobby.',
  activeTitle: 'Active outing',
  today: 'Today at',
  noActive: 'No active outing',
  noActiveSub: 'Start a new plan with your squad',
  upcomingTitle: 'Upcoming plans',
  upcomingCount: '{n} scheduled',
  recentTitle: 'Past outings',
  recentCount: '{n} completed',
  calTitle: 'Outing Calendar',
  calSub: 'Past, active, and upcoming squad hangouts across Delhi NCR.',
  legend: 'Status legend',
  'status.past': 'Past',
  'status.active': 'Active today',
  'status.upcoming': 'Upcoming',
  noOutingDay: 'No outing scheduled on this date.',
  selectDay: 'Pick another highlighted day on the calendar.',
  invTitle: 'Invitations',
  invSub: 'Outing invitations received from and sent to your squad.',
  received: 'Received',
  sent: 'Sent',
  from: 'Invite from {name}',
  to: 'Sent to {name}',
  accept: 'Accept invite',
  decline: 'Decline',
  accepted: 'Accepted',
  declined: 'Declined',
  pending: 'Pending',
  'tab.home': 'Home',
  'tab.calendar': 'Calendar',
  'tab.map': 'Map',
  'tab.invites': 'Lobby',
  'tab.profile': 'Profile',
};

const dashHi: Record<string, string> = {
  back: 'वापस',
  menu: 'सेटिंग्स मेनू',
  appearance: 'रंग-रूप',
  light: 'लाइट मोड',
  dark: 'डार्क मोड',
  language: 'भाषा',
  notifs: 'सूचनाएँ',
  markAll: 'सब पढ़ा हुआ मार्क करें',
  noNotifs: 'कोई नई सूचना नहीं!',
  noNotifsSub: 'नए इनवाइट और अपडेट यहाँ दिखेंगे।',
  planTitle: 'दोस्तों के साथ आउटिंग प्लान करें',
  planSub: 'वाइब चुनें, NSUT और IGDTUW मेट्रो रूट देखें, और कर्फ्यू से पहले सुरक्षित जगह चुनें।',
  planCta: 'प्लान शुरू करें',
  joinTitle: 'दोस्त का प्लान जॉइन करें',
  joinSub: 'TRV-XXXX इनवाइट कोड से सीधे ग्रुप लॉबी में जुड़ें।',
  activeTitle: 'चालू आउटिंग',
  today: 'आज',
  noActive: 'कोई चालू आउटिंग नहीं',
  noActiveSub: 'नया प्लान शुरू करें',
  upcomingTitle: 'आने वाले प्लान',
  upcomingCount: '{n} तय हैं',
  recentTitle: 'पिछली आउटिंग्स',
  recentCount: '{n} पूरी हुईं',
  calTitle: 'आउटिंग कैलेंडर',
  calSub: 'आपकी पिछली, चालू और आने वाली ग्रुप आउटिंग्स।',
  legend: 'स्टेटस लेजेंड',
  'status.past': 'पिछली',
  'status.active': 'आज चालू',
  'status.upcoming': 'आने वाली',
  noOutingDay: 'इस दिन कोई आउटिंग तय नहीं है।',
  selectDay: 'कैलेंडर पर कोई दूसरा दिन चुनें।',
  invTitle: 'इनवाइट्स',
  invSub: 'ग्रुप से मिले और भेजे गए आउटिंग इनवाइट्स।',
  received: 'मिले हुए',
  sent: 'भेजे गए',
  from: '{name} का इनवाइट',
  to: '{name} को भेजा',
  accept: 'स्वीकार करें',
  decline: 'मना करें',
  accepted: 'स्वीकृत',
  declined: 'अस्वीकृत',
  pending: 'बाकी है',
  'tab.home': 'होम',
  'tab.calendar': 'कैलेंडर',
  'tab.map': 'मैप',
  'tab.invites': 'लॉबी',
  'tab.profile': 'प्रोफ़ाइल',
};

const LangContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey, vars?: Record<string, string>) => string;
  dt: (key: string, vars?: Record<string, string | number>) => string;
}>({
  lang: 'en',
  setLang: () => {},
  t: (k) => en[k],
  dt: (k) => dashEn[k] ?? k,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('travity-lang');
      if (stored === 'hi' || stored === 'en') setLangState(stored);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem('travity-lang', lang);
    } catch {
      // ignore
    }
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);

  const t = useCallback(
    (key: TKey, vars?: Record<string, string>) => {
      let out: string = (lang === 'hi' ? hi[key] : undefined) ?? en[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          out = out.replace(`{${k}}`, v);
        }
      }
      return out;
    },
    [lang]
  );

  const dt = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      let out: string = (lang === 'hi' ? dashHi[key] : undefined) ?? dashEn[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          out = out.replace(`{${k}}`, String(v));
        }
      }
      return out;
    },
    [lang]
  );

  return (
    <LangContext.Provider value={{ lang, setLang, t, dt }}>{children}</LangContext.Provider>
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
        'h-9 cursor-pointer rounded-lg border border-border bg-card px-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent ' +
        (className ?? '')
      }
    >
      <option value="en">English</option>
      <option value="hi">हिन्दी</option>
    </select>
  );
}
