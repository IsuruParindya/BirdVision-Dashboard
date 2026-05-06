import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Check, Globe2, Bell, Database, Shield } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import en from "@/contents/en";
import sin from "@/contents/sin";

type LangMode = "english" | "sinhala" | "both";

export default function Settings() {
  const { language, setLanguage } = useLanguage() as {
    language: LangMode;
    setLanguage: (lang: LangMode) => void;
  };

  const [notification, setNotification] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const e = en.settings;
  const s = sin.settings;

  const getBoth = (eVal: string, sVal: string) =>
    language === "both" ? `${eVal} / ${sVal}` : language === "sinhala" ? sVal : eVal;

  const options: Array<{ id: LangMode; label: string; desc: string }> = [
    {
      id: "english",
      label: e.options.english.label,
      desc: getBoth(e.options.english.desc, s.options.english.desc),
    },
    {
      id: "sinhala",
      label: e.options.sinhala.label,
      desc: getBoth(e.options.sinhala.desc, s.options.sinhala.desc),
    },
  ];

  const handleLanguageChange = (lang: LangMode) => {
    setLanguage(lang);
    const selectedLabel = lang === "sinhala"
      ? s.options.sinhala.label
      : e.options.english.label;
    // Use the new language directly instead of getBoth (which reads old state)
    const notificationText = lang === "sinhala" ? s.notification : e.notification;
    setNotification(`${notificationText} "${selectedLabel}"`);
    setVisible(true);
    setTimeout(() => setVisible(false), 2500);
  };

  useEffect(() => {
    if (!visible && notification) {
      const timer = setTimeout(() => setNotification(null), 300);
      return () => clearTimeout(timer);
    }
  }, [visible, notification]);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground">
            {getBoth(e.title, s.title)}
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {getBoth(e.subtitle, s.subtitle)}
          </p>
        </div>

        <div className="glass-card rounded-[32px] overflow-hidden relative">
          {/* Notification */}
          <div
            className={`
              absolute top-4 right-4 bg-primary text-white px-4 py-2 rounded-lg shadow-lg
              transition-all duration-300
              ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}
            `}
          >
            {notification}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4">
            {/* Sidebar */}
            <div className="border-r border-border/50 bg-muted/10 p-6 space-y-2">
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white text-primary font-bold shadow-sm">
                <Globe2 className="w-5 h-5" /> {getBoth(e.languageTab, s.languageTab)}
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-white/50 font-medium transition-colors">
                <Bell className="w-5 h-5" /> {getBoth(e.notificationsTab, s.notificationsTab)}
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-white/50 font-medium transition-colors">
                <Database className="w-5 h-5" /> {getBoth(e.dataStorageTab, s.dataStorageTab)}
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-white/50 font-medium transition-colors">
                <Shield className="w-5 h-5" /> {getBoth(e.privacyTab, s.privacyTab)}
              </button>
            </div>

            {/* Content */}
            <div className="col-span-3 p-8 lg:p-12">
              <div className="max-w-md">
                <h2 className="text-2xl font-bold mb-6">
                  {getBoth(e.displayLanguage, s.displayLanguage)}
                </h2>

                <div className="space-y-4">
                  {options.map((option) => (
                    <div
                      key={option.id}
                      onClick={() => handleLanguageChange(option.id)}
                      className={`
                        relative flex items-center p-5 rounded-2xl cursor-pointer border-2 transition-all duration-200
                        ${language === option.id
                          ? "border-primary bg-primary/5"
                          : "border-transparent bg-muted/30 hover:bg-muted/50"
                        }
                      `}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="flex-1">
                        <h3 className={`font-bold text-lg ${language === option.id ? "text-primary" : "text-foreground"}`}>
                          {option.label}
                        </h3>
                        <p className="text-muted-foreground text-sm mt-1">{option.desc}</p>
                      </div>

                      <div className={`
                        w-6 h-6 rounded-full border-2 flex items-center justify-center
                        ${language === option.id ? "border-primary bg-primary" : "border-muted-foreground/30"}
                      `}>
                        {language === option.id && <Check className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}