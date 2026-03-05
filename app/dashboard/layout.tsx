"use client";

import React, { ReactNode, useState, useRef } from "react";
import { Drawer } from "vaul";
import Navbar from "./(navbar)/page";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RentCalendar from "./(components)/RentCalendar";
import { auth } from "../(lib)/firebase";
import { OrderDateProvider, useOrderDate } from "../(lib)/OrderDateContext";
import { ToastProvider } from "../(lib)/ToastContext";
import { useToast } from "../(lib)/ToastContext";
import { LanguageProvider, useLanguage } from "../(lib)/LanguageContext";
import { ThemeProvider, useTheme } from "../(lib)/ThemeContext";
import { db } from "../(lib)/firebase";
import { doc, serverTimestamp, setDoc, getDoc } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";

// ─── Error helper ───────────────────────────────────────────────────────────
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Noma'lum xatolik yuz berdi";
}

// ─── Types ───────────────────────────────────────────────────────────────────
type AuthMode = "signin" | "signup";
type ThemeName = "indigo" | "emerald" | "rose" | "slate" | "blue";
type ThemeMap = Record<ThemeName, string>;

// ─── Shared input class ──────────────────────────────────────────────────────
const INPUT =
  "w-full h-11 sm:h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent " +
  "focus:bg-white transition-all duration-200 text-sm sm:text-base text-gray-900 " +
  "placeholder-gray-400 font-medium shadow-sm";

// ─── Close button (shared) ───────────────────────────────────────────────────
const CloseBtn = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="group w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center
               rounded-full bg-gray-100 hover:bg-red-500 border border-gray-200
               hover:border-red-500 text-gray-400 hover:text-white
               transition-all duration-200 active:scale-90"
  >
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
      <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  </button>
);

// ─── Google SVG icon ─────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// ─── Drawer sheet wrapper ─────────────────────────────────────────────────────
const Sheet = ({ children }: { children: ReactNode }) => (
  <div className="bg-white w-full max-w-md rounded-t-[28px] sm:rounded-[28px] p-5 sm:p-7
                  shadow-2xl border border-gray-100 min-w-0 mx-auto
                  max-h-[92dvh] overflow-y-auto pb-[env(safe-area-inset-bottom)] sm:pb-0">
    {children}
  </div>
);

// ─── Sheet header ─────────────────────────────────────────────────────────────
const SheetHeader = ({
  icon,
  iconColor,
  title,
  subtitle,
  onClose,
}: {
  icon: ReactNode;
  iconColor: string;
  title: string;
  subtitle: string;
  onClose: () => void;
}) => (
  <div className="flex items-center justify-between mb-6 gap-3">
    <div className="flex items-center gap-3 min-w-0">
      <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${iconColor} flex items-center justify-center shadow-lg shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <Drawer.Title className="text-lg sm:text-xl font-bold text-gray-900 truncate">{title}</Drawer.Title>
        <p className="text-xs sm:text-sm text-gray-400 truncate">{subtitle}</p>
      </div>
    </div>
    <CloseBtn onClick={onClose} />
  </div>
);

// ─── Primary button ───────────────────────────────────────────────────────────
const PrimaryBtn = ({
  children,
  type = "button",
  disabled,
  onClick,
  className = "",
}: {
  children: ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}) => (
  <button
    type={type}
    disabled={disabled}
    onClick={onClick}
    className={`w-full h-11 sm:h-12 rounded-xl font-semibold text-sm sm:text-base
                bg-gradient-to-r from-blue-600 to-blue-500 text-white
                hover:from-blue-700 hover:to-blue-600
                shadow-[0_4px_16px_rgba(59,130,246,0.35)]
                hover:shadow-[0_6px_20px_rgba(59,130,246,0.45)]
                active:scale-[0.98] transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

// ─── MenuButton accent map ────────────────────────────────────────────────────
const accentMap: Record<string, {
  bg: string; border: string; hoverBg: string;
  iconBg: string; ring: string; text: string;
  dot: string; glow: string;
}> = {
  indigo:  { bg:"bg-indigo-500/10",  border:"border-indigo-500/20",  hoverBg:"hover:bg-indigo-500/[0.18]",  iconBg:"bg-indigo-500/20",  ring:"ring-indigo-500/30",  text:"text-indigo-300",  dot:"bg-indigo-400",  glow:"group-hover:shadow-[0_0_28px_rgba(99,102,241,0.28)]"  },
  emerald: { bg:"bg-emerald-500/10", border:"border-emerald-500/20", hoverBg:"hover:bg-emerald-500/[0.18]", iconBg:"bg-emerald-500/20", ring:"ring-emerald-500/30", text:"text-emerald-300", dot:"bg-emerald-400", glow:"group-hover:shadow-[0_0_28px_rgba(16,185,129,0.28)]" },
  rose:    { bg:"bg-rose-500/10",    border:"border-rose-500/20",    hoverBg:"hover:bg-rose-500/[0.18]",    iconBg:"bg-rose-500/20",    ring:"ring-rose-500/30",    text:"text-rose-300",    dot:"bg-rose-400",    glow:"group-hover:shadow-[0_0_28px_rgba(244,63,94,0.28)]"    },
  slate:   { bg:"bg-white/5",        border:"border-white/10",       hoverBg:"hover:bg-white/[0.1]",        iconBg:"bg-white/10",       ring:"ring-white/15",       text:"text-slate-300",   dot:"bg-slate-400",   glow:"group-hover:shadow-[0_0_28px_rgba(255,255,255,0.08)]"  },
  blue:    { bg:"bg-blue-500/10",    border:"border-blue-500/20",    hoverBg:"hover:bg-blue-500/[0.18]",    iconBg:"bg-blue-500/20",    ring:"ring-blue-500/30",    text:"text-blue-300",    dot:"bg-blue-400",    glow:"group-hover:shadow-[0_0_28px_rgba(59,130,246,0.28)]"    },
};

// ─── MenuButton ───────────────────────────────────────────────────────────────
const MenuButton = ({
  icon, label, color, onClick, className = "",
}: {
  icon: string; label: string; color: string;
  onClick?: () => void; className?: string;
}) => {
  const a = accentMap[color] ?? accentMap.slate;
  return (
    <button
      onClick={onClick}
      className={`group relative w-full flex items-center gap-4
                  min-h-[60px] px-4 py-3 rounded-2xl
                  ${a.bg} ${a.border} ${a.hoverBg}
                  border transition-all duration-200 active:scale-[0.97] ${a.glow}
                  ${className}`}
    >
      {/* icon */}
      <div className={`shrink-0 w-11 h-11 rounded-xl ${a.iconBg} ring-1 ${a.ring}
                       flex items-center justify-center overflow-hidden
                       transition-transform duration-200 group-hover:scale-105`}>
        <img src={icon} alt="" className="w-7 h-7 object-cover rounded-lg"
             onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
      </div>
      {/* label */}
      <span className={`flex-1 text-left text-[15px] font-semibold ${a.text} tracking-wide`}>
        {label}
      </span>
      {/* chevron */}
      <svg className="w-4 h-4 text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all duration-200"
           fill="none" viewBox="0 0 16 16">
        <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {/* dot */}
      <span className={`absolute top-3 right-3 w-1.5 h-1.5 rounded-full ${a.dot}
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
    </button>
  );
};

// ─── Main Layout ──────────────────────────────────────────────────────────────
function LayoutContent({ children }: { children: ReactNode }) {
  const { setRange } = useOrderDate();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const [draw, setDraw] = useState(false);
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(false);
  const router = useRouter();
  const [signUp, setSignUp] = useState(false);
  const [isCalOpen, setIsCalOpen] = useState(false);
  const [contact, setContact] = useState(false);

  const [signUpName, setSignUpName] = useState("");
  const [signUpAge, setSignUpAge] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");

  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docCode, setDocCode] = useState("");
  const [docError, setDocError] = useState("");
  const [showDocCode, setShowDocCode] = useState(false);

  const handleSaveDates = (days: string[], start: Date | null, end: Date | null) => {
    setRange({ start, end });
    setIsCalOpen(false);
  };

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const handleOpenChange = (state: boolean) => {
    setOpen(state);
    if (state) videoRef.current?.pause();
    else videoRef.current?.play();
  };

  function openDocModal() {
    setOpen(false);
    setDocModalOpen(true);
    setDocCode("");
    setDocError("");
  }

  const handleDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDocError("");
    if (docCode.trim() === "20042004") {
      if (typeof window !== "undefined") localStorage.setItem("admin_entered", "true");
      setDocModalOpen(false);
      setDocCode("");
      router.push("/dashboard/admin");
    } else {
      setDocError("Noto'g'ri kod. Qaytadan urinib ko'ring.");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, signUpEmail, signUpPassword);
      await setDoc(doc(db, "users", cred.user.uid), {
        fullName: signUpName.trim(),
        email: signUpEmail.trim(),
        age: signUpAge ? String(signUpAge).trim() : "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setSignUp(false);
      setSignUpName(""); setSignUpAge(""); setSignUpEmail(""); setSignUpPassword("");
    } catch (error: unknown) {
      setAuthError(getErrorMessage(error));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      await signInWithEmailAndPassword(auth, signInEmail, signInPassword);
      setCount(false);
      setSignInEmail(""); setSignInPassword("");
    } catch (error: unknown) {
      setAuthError(getErrorMessage(error));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleAuth = async (isSignUp: boolean) => {
    setAuthError("");
    setAuthLoading(true);
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const user = result.user;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            fullName: user.displayName || "",
            email: user.email || "",
            age: "",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      }
      if (isSignUp) setSignUp(false); else setCount(false);
    } catch (error: unknown) {
      setAuthError(getErrorMessage(error));
    } finally {
      setAuthLoading(false);
    }
  };

  const loadingText = language === "uz" ? "Kutilmoqda..." : language === "ru" ? "Ожидание..." : "Loading...";

  return (
    <div className="relative w-full overflow-x-hidden antialiased">

      <RentCalendar isOpen={isCalOpen} onClose={() => setIsCalOpen(false)} onSave={handleSaveDates} />

      {/* ══════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════ */}
      <section className="relative h-screen w-full overflow-hidden flex flex-col items-center">
        <div className="absolute inset-0 -z-10 bg-black">
          <video ref={videoRef} autoPlay loop muted playsInline preload="metadata"
                 className="w-full h-full object-cover">
            <source src="/v2.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/30" />
        </div>

        {/* ── NAVBAR ── */}
        <nav className="w-full pt-4 sm:pt-6 z-50">
          <div className="max-w-[1350px] mx-auto px-3 sm:px-6 h-[60px] sm:h-[70px]
                          flex items-center justify-between
                          bg-black/40 bg-white/10 border border-white/20
                          rounded-2xl shadow-lg overflow-visible">

            {/* Logo */}
            <div className="flex items-center gap-2 md:gap-3 lg:gap-6 text-green-500 active:scale-95 min-w-0 flex-shrink-0">
              <Link href="/dashboard/all">
                <img src="/dod.png" alt="Logo" className="h-7 sm:h-10 md:h-12 w-auto brightness-110 rounded-xl" />
              </Link>
              <h4 className="font-bold text-sm sm:text-lg md:text-xl lg:text-3xl text-green-500 truncate max-w-[110px] sm:max-w-none">
                {t.landing.carRental}
              </h4>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-4 lg:gap-6 flex-shrink-0">

              {/* Choose day */}
              <button
                onClick={() => setIsCalOpen(true)}
                className="text-[#FFD700]/90 w-[60px] sm:w-[90px] md:w-[140px] h-[26px] sm:h-[28px] md:h-[34px]
                           rounded-xl active:scale-95 bg-green-500 hover:bg-green-400 hover:text-white
                           transition-colors font-medium text-[8px] sm:text-xs md:text-sm uppercase tracking-wider"
              >
                {t.nav.chooseDay}
              </button>

              {/* Language */}
              <div className="relative" ref={langRef}>
                <button
                  type="button"
                  onClick={() => setLangOpen((o) => !o)}
                  className="flex items-center gap-1 sm:gap-2 h-[26px] sm:h-[34px] md:h-[42px] px-2 sm:px-3 md:px-4
                             rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 border border-amber-400
                             text-white hover:from-amber-700 hover:to-amber-600 transition font-medium
                             text-[10px] sm:text-xs md:text-sm shadow-lg"
                >
                  <span>{language === "en" ? "EN" : language === "uz" ? "O'Z" : "РУ"}</span>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {langOpen && (
                  <>
                    <div className="fixed inset-0 z-[9998]" onClick={() => setLangOpen(false)} />
                    <div className="absolute top-full right-0 mt-2 z-[9999] min-w-[120px] sm:min-w-[140px] py-1
                                    rounded-xl bg-slate-800/95 border border-white/20 shadow-xl overflow-hidden">
                      {[["en","English"],["uz","O'zbekcha"],["ru","Русский"]].map(([code, name]) => (
                        <button key={code} type="button"
                                onClick={() => { setLanguage(code as any); setLangOpen(false); }}
                                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[#FFD700]
                                           hover:bg-white/10 text-xs sm:text-sm font-medium">
                          {name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Profile button */}
              <button onClick={(e) => { setOpen(true); e.currentTarget.blur(); }}
                      className="active:scale-95 transition-transform">
                <div className="flex items-center gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full
                                bg-blue-600 hover:bg-blue-500 border border-white/30 backdrop-blur-sm
                                transition-all shadow-lg">
                  <span className="text-[10px] sm:text-xs md:text-sm lg:text-base font-medium text-white whitespace-nowrap">
                    Kirish
                  </span>
                  <div className="w-[1px] h-4 bg-white/30" />
                  <img className="w-4 h-4 sm:w-5 sm:h-5 invert" src="/k.png" alt="profile" />
                </div>
              </button>
            </div>
          </div>
        </nav>

        {/* Hero text */}
        <div className="flex-1 flex flex-col items-center justify-center text-center z-10 px-4">
          <h1 className="text-green-500 text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight mb-48 sm:mb-0 drop-shadow-2xl">
            {t.landing.discoverWorld}
          </h1>
          <div className="mt-6 sm:mt-8 md:mt-12 lg:mt-16 flex justify-center w-full">
            <Navbar />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SIGN UP DRAWER
      ══════════════════════════════════════ */}
      <Drawer.Root open={signUp} onOpenChange={(s) => { setSignUp(s); if (!s) setAuthError(""); }}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[101] flex justify-center outline-none
                                     md:inset-0 md:items-center md:pb-0 md:overflow-visible">
            <Sheet>
              <SheetHeader
                icon={<svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1a3 3 0 01-3 3H6a3 3 0 01-3-3v-1a6 6 0 0112 0z" /></svg>}
                iconColor="bg-gradient-to-br from-emerald-500 to-teal-600"
                title={t.auth.signup}
                subtitle={language === "uz" ? "Yangi hisob yarating" : language === "ru" ? "Создайте аккаунт" : "Create a new account"}
                onClose={() => setSignUp(false)}
              />
              <form onSubmit={handleSignUp} className="flex flex-col gap-3 sm:gap-4">
                {authError && (
                  <p className="text-xs sm:text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100 flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                    {authError}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.auth.fullName}</label>
                    <input type="text" placeholder={language === "uz" ? "Ismingiz" : language === "ru" ? "Имя" : "Your name"}
                           value={signUpName} onChange={(e) => setSignUpName(e.target.value)} className={INPUT} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {language === "uz" ? "Yosh" : language === "ru" ? "Возраст" : "Age"}
                    </label>
                    <input type="text" placeholder={language === "uz" ? "Yoshingiz" : language === "ru" ? "Возраст" : "Your age"}
                           value={signUpAge} onChange={(e) => setSignUpAge(e.target.value)} className={INPUT} />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.auth.email}</label>
                  <input type="email" placeholder="you@example.com" value={signUpEmail}
                         onChange={(e) => setSignUpEmail(e.target.value)} required className={INPUT} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.auth.password}</label>
                  <input type="password" placeholder={language === "uz" ? "Kamida 6 ta belgi" : language === "ru" ? "Минимум 6 символов" : "Min 6 characters"}
                         value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} required minLength={6} className={INPUT} />
                </div>
                <div className="flex flex-col gap-2 pt-1">
                  <PrimaryBtn type="submit" disabled={authLoading}>
                    {authLoading ? loadingText : t.auth.signup}
                  </PrimaryBtn>
                  <button type="button" onClick={() => handleGoogleAuth(true)} disabled={authLoading}
                          className="w-full h-11 sm:h-12 rounded-xl font-semibold text-sm sm:text-base
                                     bg-white text-gray-700 border-2 border-gray-200
                                     hover:bg-gray-50 hover:border-gray-300
                                     flex items-center justify-center gap-3
                                     active:scale-[0.98] transition-all duration-200 disabled:opacity-50">
                    <GoogleIcon />
                    {language === "uz" ? "Google bilan" : language === "ru" ? "Через Google" : "Continue with Google"}
                  </button>
                </div>
              </form>
              <div className="mt-5 pt-4 border-t border-gray-100 text-center">
                <span className="text-xs sm:text-sm text-gray-400">{t.auth.alreadyHave}</span>
                <button type="button" onClick={() => { setSignUp(false); setCount(true); setAuthError(""); }}
                        className="ml-2 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                  {t.auth.login}
                </button>
              </div>
            </Sheet>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* ══════════════════════════════════════
          SIGN IN DRAWER
      ══════════════════════════════════════ */}
      <Drawer.Root open={count} onOpenChange={(s) => { setCount(s); if (!s) setAuthError(""); }}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[101] flex justify-center outline-none
                                     md:inset-0 md:items-center md:pb-0 md:overflow-visible">
            <Sheet>
              <SheetHeader
                icon={<svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 3H7a2 2 0 00-2 2v14a2 2 0 002 2h8m4-9l-4-4m0 0l-4 4m4-4v12" /></svg>}
                iconColor="bg-gradient-to-br from-blue-500 to-indigo-600"
                title={t.auth.login}
                subtitle={language === "uz" ? "Hisobingizga kiring" : language === "ru" ? "Войдите в аккаунт" : "Sign in to your account"}
                onClose={() => setCount(false)}
              />
              <form onSubmit={handleSignIn} className="flex flex-col gap-3 sm:gap-4">
                {authError && (
                  <p className="text-xs sm:text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100 flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                    {authError}
                  </p>
                )}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.auth.email}</label>
                  <input type="email" placeholder="you@example.com" value={signInEmail}
                         onChange={(e) => setSignInEmail(e.target.value)} required className={INPUT} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.auth.password}</label>
                  <input type="password" placeholder="••••••••" value={signInPassword}
                         onChange={(e) => setSignInPassword(e.target.value)} required className={INPUT} />
                </div>
                <div className="flex flex-col gap-2 pt-1">
                  <PrimaryBtn type="submit" disabled={authLoading}>
                    {authLoading ? loadingText : t.auth.login}
                  </PrimaryBtn>
                  <button type="button" onClick={() => handleGoogleAuth(false)} disabled={authLoading}
                          className="w-full h-11 sm:h-12 rounded-xl font-semibold text-sm sm:text-base
                                     bg-white text-gray-700 border-2 border-gray-200
                                     hover:bg-gray-50 hover:border-gray-300
                                     flex items-center justify-center gap-3
                                     active:scale-[0.98] transition-all duration-200 disabled:opacity-50">
                    <GoogleIcon />
                    {language === "uz" ? "Google bilan kirish" : language === "ru" ? "Войти через Google" : "Continue with Google"}
                  </button>
                </div>
              </form>
              <div className="mt-5 pt-4 border-t border-gray-100 text-center">
                <span className="text-xs sm:text-sm text-gray-400">{t.auth.dontHave}</span>
                <button type="button" onClick={() => { setCount(false); setSignUp(true); setAuthError(""); }}
                        className="ml-2 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                  {t.auth.signup}
                </button>
              </div>
            </Sheet>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* ══════════════════════════════════════
          CONTACT DRAWER
      ══════════════════════════════════════ */}
      <Drawer.Root open={contact} onOpenChange={(s: boolean) => setContact(s)}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[101] flex justify-center outline-none
                                     md:inset-0 md:items-center md:pb-0 md:overflow-visible">
            <Sheet>
              <SheetHeader
                icon={<svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
                iconColor="bg-gradient-to-br from-rose-500 to-pink-600"
                title={t.contact.title}
                subtitle={language === "uz" ? "Biz bilan bog'laning" : language === "ru" ? "Свяжитесь с нами" : "Get in touch"}
                onClose={() => setContact(false)}
              />

              <div className="flex flex-col gap-3">
                {/* Phone */}
                <button onClick={() => window.location.href = "tel:933948200"}
                        className="group flex items-center gap-4 p-4 rounded-2xl
                                   bg-blue-50 hover:bg-blue-100 border border-blue-100 hover:border-blue-200
                                   transition-all duration-200 active:scale-[0.98] text-left">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md shrink-0">
                    <img src="/tel.png" alt="" className="w-6 h-6 filter brightness-0 invert" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">{t.contact.phone}</p>
                    <p className="text-gray-500 text-xs sm:text-sm">+998 93 394 82 00</p>
                  </div>
                  <svg className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>

                {/* Instagram */}
                <button onClick={() => window.open("https://instagram.com/xurshid__jonn", "_blank")}
                        className="group flex items-center gap-4 p-4 rounded-2xl
                                   bg-pink-50 hover:bg-pink-100 border border-pink-100 hover:border-pink-200
                                   transition-all duration-200 active:scale-[0.98] text-left">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-md shrink-0">
                    <img src="/i.jpg" alt="" className="w-6 h-6 filter brightness-0 invert" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">{t.contact.instagram}</p>
                    <p className="text-gray-500 text-xs sm:text-sm">@xurshid__jonn</p>
                  </div>
                  <svg className="w-4 h-4 text-pink-400 group-hover:translate-x-0.5 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>

                {/* Telegram */}
                <button onClick={() => window.open("https://t.me/xursh1d_jonn", "_blank")}
                        className="group flex items-center gap-4 p-4 rounded-2xl
                                   bg-cyan-50 hover:bg-cyan-100 border border-cyan-100 hover:border-cyan-200
                                   transition-all duration-200 active:scale-[0.98] text-left">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-md shrink-0">
                    <img src="/tg.png" alt="" className="w-6 h-6 filter brightness-0 invert" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">{t.contact.telegram}</p>
                    <p className="text-gray-500 text-xs sm:text-sm">@xursh1d_jonn</p>
                  </div>
                  <svg className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400">
                  {language === "uz" ? "Ish vaqti: 09:00 – 21:00 · Tez javob beramiz" : language === "ru" ? "Время работы: 09:00 – 21:00 · Быстро отвечаем" : "Hours: 09:00 – 21:00 · We respond quickly"}
                </p>
              </div>
            </Sheet>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* ══════════════════════════════════════
          ADMIN / DOCUMENTATION DRAWER
      ══════════════════════════════════════ */}
      <Drawer.Root open={docModalOpen} onOpenChange={(s) => { setDocModalOpen(s); if (!s) { setDocCode(""); setDocError(""); } }}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[101] flex justify-center outline-none
                                     md:inset-0 md:items-center md:pb-0 md:overflow-visible">
            <div className="bg-white w-full max-w-sm rounded-t-[28px] sm:rounded-[28px] overflow-hidden
                            shadow-2xl border border-gray-100 mx-auto max-h-[92dvh] overflow-y-auto
                            pb-[env(safe-area-inset-bottom)] sm:pb-0">

              {/* Dark header */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 px-6 sm:px-8 py-8 sm:py-10 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/10 ring-1 ring-white/20 flex items-center justify-center">
                  <img src="/d.png" alt="" className="w-8 h-8 invert" />
                </div>
                <Drawer.Title className="text-lg sm:text-xl font-bold text-amber-400 mb-1">
                  {language === "uz" ? "Dokumentatsiya" : language === "ru" ? "Документация" : "Documentation"}
                </Drawer.Title>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  {language === "uz" ? "Admin paneliga kirish uchun maxsus kodni kiriting"
                    : language === "ru" ? "Введите специальный код для входа"
                    : "Enter the special code to access admin panel"}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleDocSubmit} className="p-5 sm:p-7">
                {docError && (
                  <p className="text-xs sm:text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100 mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                    {docError}
                  </p>
                )}
                <div className="relative mb-4">
                  <input
                    type={showDocCode ? "text" : "password"}
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder={language === "uz" ? "Kodni kiriting" : language === "ru" ? "Введите код" : "Enter code"}
                    value={docCode}
                    onChange={(e) => setDocCode(e.target.value)}
                    className="w-full h-12 pr-12 px-4 rounded-xl border-2 border-gray-200
                               focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20
                               text-center text-lg tracking-[0.4em] font-mono transition text-gray-900 bg-gray-50"
                  />
                  <button type="button" onClick={() => setShowDocCode(!showDocCode)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                    {showDocCode
                      ? <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      : <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59" /></svg>
                    }
                  </button>
                </div>
                <button type="submit"
                        className="w-full h-11 sm:h-12 bg-green-500 hover:bg-green-600 text-white
                                   font-semibold text-sm sm:text-base rounded-xl transition active:scale-[0.98] shadow-md">
                  {t.auth.login}
                </button>
                <button type="button" onClick={() => setDocModalOpen(false)}
                        className="w-full mt-2 text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors">
                  {t.common.cancel}
                </button>
              </form>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* ══════════════════════════════════════
          PROFIL DRAWER  (o'ngdan)
      ══════════════════════════════════════ */}
      <Drawer.Root open={open} onOpenChange={handleOpenChange} direction="right">
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99]" />
          <Drawer.Content
            className="fixed top-0 bottom-0 right-0 z-[100]
                       w-full max-w-[calc(100vw-16px)] sm:max-w-[360px]
                       flex flex-col outline-none will-change-transform
                       overflow-hidden rounded-l-[28px] sm:rounded-l-[36px]
                       border-l border-white/[0.07]
                       bg-[#0d0f1a]
                       shadow-[-40px_0_120px_rgba(0,0,0,0.7)]"
          >
            {/* Ambient orbs */}
            <div className="pointer-events-none absolute  inset-0 overflow-hidden">
              <div className="absolute -top-28 -left-20 w-80 h-80 rounded-full bg-indigo-700/25 blur-[90px]" />
              <div className="absolute top-1/2 -right-20 w-60 h-60 rounded-full bg-violet-700/20 blur-[70px]" />
              <div className="absolute -bottom-24 left-4 w-72 h-72 rounded-full bg-blue-700/15 blur-[100px]" />
              <div className="absolute inset-0 opacity-[0.03]"
                   style={{ backgroundImage:"linear-gradient(rgba(255,255,255,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.7) 1px,transparent 1px)", backgroundSize:"32px 32px" }} />
            </div>

            {/* Scrollable content */}
            <div className="relative z-10 flex flex-col h-full overflow-y-auto px-5 sm:px-6
                            pt-6 sm:pt-8 pb-[env(safe-area-inset-bottom)]">

              {/* Header */}
              <div className="mb-7 sm:mb-9">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <Drawer.Title className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    {t.nav.profile}
                  </Drawer.Title>
                  <button onClick={() => setOpen(false)}
                          className="group w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center rounded-full
                                     bg-white/[0.07] hover:bg-red-500/20 border border-white/10 hover:border-red-500/40
                                     text-white/40 hover:text-red-400 transition-all duration-200 active:scale-90">
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                      <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <Drawer.Description className="text-white/30 text-xs font-medium tracking-widest uppercase">
                  {language === "uz" ? "Profil bo'limi" : language === "ru" ? "Раздел профиля" : "Profile section"}
                </Drawer.Description>
                <div className="mt-5 h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
              </div>

              {/* Menu buttons */}
              <div className="flex flex-col gap-2.5 flex-1">
                <MenuButton onClick={() => { setOpen(false); setCount(true); }}
                            icon="/k2.png" label={t.auth.login} color="indigo" />
                <MenuButton onClick={() => { setOpen(false); setSignUp(true); }}
                            icon="/k.png" label={t.auth.signup} color="emerald" />
                <MenuButton onClick={() => {
                              setOpen(false);
                              if (!auth.currentUser) { showToast(t.auth.pleaseLogin, "warning"); return; }
                              router.push("/dashboard/profil");
                            }}
                            icon="/s.png" label={t.nav.profile} color="blue" />
                <MenuButton onClick={() => setContact(true)}
                            icon="/t.png" label={t.contact.title} color="rose" />
                <MenuButton onClick={openDocModal}
                            icon="/admin.jpg"
                            label={language === "uz" ? "Dokumentatsiya" : language === "ru" ? "Документация" : "Documentation"}
                            color="slate" />
              </div>

              {/* Footer close */}
              <div className="mt-auto pt-4 pb-4 sm:pb-5">
                <button onClick={() => setOpen(false)}
                        className="w-full min-h-[46px] rounded-2xl font-semibold text-sm sm:text-base text-white tracking-wide
                                   bg-gradient-to-r from-indigo-600 to-violet-600
                                   hover:from-indigo-500 hover:to-violet-500
                                   border border-white/10
                                   shadow-[0_8px_30px_rgba(99,102,241,0.4)]
                                   hover:shadow-[0_8px_40px_rgba(99,102,241,0.55)]
                                   active:scale-[0.97] transition-all duration-200">
                  {t.common.close}
                </button>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Main content */}
      <main className="relative z-20 bg-white">
        {children}
      </main>
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────
const Home = ({ children }: { children: ReactNode }) => (
  <ThemeProvider>
    <LanguageProvider>
      <ToastProvider>
        <OrderDateProvider>
          <LayoutContent>{children}</LayoutContent>
        </OrderDateProvider>
      </ToastProvider>
    </LanguageProvider>
  </ThemeProvider>
);

export default Home;