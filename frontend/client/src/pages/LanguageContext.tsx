import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Language = "english" | "sinhala";

type Ctx = {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
};

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, _setLanguage] = useState<Language>("english");

  // ✅ load once on app start
  useEffect(() => {
    const saved = localStorage.getItem("birdvision_language");
    if (saved === "sinhala" || saved === "english") _setLanguage(saved);
  }, []);

  const setLanguage = (lang: Language) => {
    _setLanguage(lang);
    localStorage.setItem("birdvision_language", lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === "english" ? "sinhala" : "english");
  };

  const value = useMemo(() => ({ language, setLanguage, toggleLanguage }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within <LanguageProvider>");
  return ctx;
}