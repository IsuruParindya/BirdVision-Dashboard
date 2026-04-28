import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  FolderUp,
  Activity,
  Settings,
  Bird,
  Cctv,
} from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/pages/LanguageContext";
import en from "@/contents/en";
import sin from "@/contents/sin";

type LangMode = "english" | "sinhala" | "both";

export function Sidebar() {
  const [location] = useLocation();
  const { language } = useLanguage() as { language: LangMode };

  const e = en.sidebar;
  const s = sin.sidebar;

  const getBoth = (eVal: string, sVal: string) =>
    language === "both"
      ? `${eVal} / ${sVal}`
      : language === "sinhala"
      ? sVal
      : eVal;

  const navItems = [
    {
      href: "/",
      label: getBoth(e.nav.dashboard, s.nav.dashboard),
      icon: LayoutDashboard,
    },
    {
      href: "/live",
      label: getBoth(e.nav.liveDetection, s.nav.liveDetection),
      icon: Cctv,
    },
    {
      href: "/upload",
      label: getBoth(e.nav.upload, s.nav.upload),
      icon: FolderUp,
    },
    {
      href: "/system-performance",
      label: getBoth(e.nav.systemPerformance,s.nav.systemPerformance),
      icon: Activity,
    },
    {
      href: "/settings",
      label: getBoth(e.nav.settings, s.nav.settings),
      icon: Settings,
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-72 sidebar-gradient rounded-r-[40px] shadow-2xl flex flex-col z-50 overflow-hidden">

      {/* Bird Watermark */}
      <div className="absolute inset-0 flex items-end justify-center opacity-[0.15] pointer-events-none">
        <img
          src="/boris.png"
          alt="Bird Watermark"
          className="w-[600px] scale-125 object-contain"
        />
      </div>

      {/* Logo */}
      <div className="p-8 flex items-center gap-4 relative z-10">
        <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/20">
          <Bird className="w-8 h-8 text-white" />
        </div>

        <div>
          <h1 className="text-2xl font-display font-bold text-white tracking-wide">
            Bird<span className="text-accent">Vision</span>
          </h1>

          <p className="text-white/60 text-xs tracking-widest font-outfit">
            {getBoth(e.bilingualSupports, s.bilingualSupports)}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2 relative z-10">
        {navItems.map((item) => {
          const isActive = location === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="block relative"
            >
              <div
                className={`
                  flex items-center gap-4 px-6 py-4 rounded-2xl
                  transition-all duration-300 group
                  ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute left-0 w-1.5 h-8 bg-accent rounded-r-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}

                <item.icon
                  className={`w-5 h-5 transition-transform duration-300 ${
                    isActive
                      ? "text-accent"
                      : "group-hover:scale-110"
                  }`}
                />

                <span className="font-medium text-lg">
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* System Status */}
      <div className="p-5 relative z-10">
        <div className="bg-black/20 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />

            <span className="text-white/80 text-sm font-medium">
              {getBoth(e.systemOnline, s.systemOnline)}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}