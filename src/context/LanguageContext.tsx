import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Lang = 'en' | 'ur';

const T = {
  en: {
    // Tab labels
    tabHome: 'Home',
    tabNews: 'News',
    tabLaws: 'Laws',
    tabProfile: 'Profile',
    // Dashboard
    greeting: 'Hello',
    complianceOverview: "Here's your compliance overview",
    complianceScore: 'Compliance Score',
    priorityCompliance: '🚨 Priority Compliance',
    mustDo: 'Must-do requirements for your business',
    latestNews: '📰 Latest News',
    seeAll: 'See all ›',
    viewLaws: 'View Laws ›',
    fineCalc: 'Fine Calc',
    calendar: 'Calendar',
    quickTip: '💡 Quick Tip',
    upgradeNow: 'Upgrade Now ›',
    freePlan: '🔒 Free Plan — 5 Laws Only',
    // Laws
    lawsTitle: '⚖️ Laws & Regulations',
    lawsSub: 'Pakistan business compliance',
    searchPlaceholder: 'Search laws, authorities…',
    mySector: 'My Sector',
    allLaws: 'All Laws',
    // Profile
    profileTitle: 'My Profile',
    settings: 'Settings',
    darkMode: 'Dark Mode',
    tutorial: 'App Tutorial',
    signOut: 'Sign Out',
    // Paywall
    upgradePremium: 'Upgrade to Premium',
    unlockAllLaws: 'Unlock all compliance laws for your business',
    // Tutorial
    tutSkip: 'Skip',
    tutNext: 'Next',
    tutDone: "Let's Go!",
    // Closing time
    closingLabel: 'MANDATORY CLOSING TIME TONIGHT',
    closingFine: '⚠ PKR 25,000 fine if open after this time',
    // Compliance
    compliant: 'Compliant',
    doneOf: 'done',
    fineFree: 'Complete your checklist to reduce risk of fines.',
    // Lang toggle
    langLabel: 'اردو',
  },
  ur: {
    tabHome: 'ہوم',
    tabNews: 'خبریں',
    tabLaws: 'قوانین',
    tabProfile: 'پروفائل',
    greeting: 'السلام علیکم',
    complianceOverview: 'آپ کی تعمیل کا جائزہ',
    complianceScore: 'تعمیل اسکور',
    priorityCompliance: '🚨 فوری تعمیل',
    mustDo: 'آپ کے کاروبار کے لیے لازمی اقدامات',
    latestNews: '📰 تازہ خبریں',
    seeAll: 'سب دیکھیں ›',
    viewLaws: 'قوانین دیکھیں ›',
    fineCalc: 'جرمانہ',
    calendar: 'کیلنڈر',
    quickTip: '💡 فوری مشورہ',
    upgradeNow: 'ابھی اپ گریڈ کریں ›',
    freePlan: '🔒 مفت پلان — صرف 5 قوانین',
    lawsTitle: '⚖️ قوانین اور ضوابط',
    lawsSub: 'پاکستانی کاروباری تعمیل',
    searchPlaceholder: 'قوانین تلاش کریں…',
    mySector: 'میرا شعبہ',
    allLaws: 'تمام قوانین',
    profileTitle: 'میرا پروفائل',
    settings: 'ترتیبات',
    darkMode: 'ڈارک موڈ',
    tutorial: 'ایپ ٹیوٹوریل',
    signOut: 'سائن آؤٹ',
    upgradePremium: 'پریمیم اپ گریڈ',
    unlockAllLaws: 'اپنے کاروبار کے تمام قوانین کھولیں',
    tutSkip: 'چھوڑیں',
    tutNext: 'آگے',
    tutDone: 'شروع کریں!',
    closingLabel: 'آج رات بند کرنے کا وقت',
    closingFine: '⚠ اس وقت کے بعد کھلا رہنے پر PKR 25,000 جرمانہ',
    compliant: 'تعمیل',
    doneOf: 'مکمل',
    fineFree: 'جرمانے سے بچنے کے لیے چیک لسٹ مکمل کریں۔',
    langLabel: 'EN',
  },
} as const;

export type Translations = typeof T.en;

interface LangContextType {
  lang: Lang;
  t: Translations;
  toggleLang: () => void;
}

const LangContext = createContext<LangContextType>({
  lang: 'en',
  t: T.en,
  toggleLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    AsyncStorage.getItem('@lang').then(v => {
      if (v === 'ur' || v === 'en') setLang(v);
    });
  }, []);

  const toggleLang = async () => {
    const next: Lang = lang === 'en' ? 'ur' : 'en';
    setLang(next);
    await AsyncStorage.setItem('@lang', next);
  };

  return (
    <LangContext.Provider value={{ lang, t: T[lang], toggleLang }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
