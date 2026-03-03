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

  // Sign Up form
  const [signUpName, setSignUpName] = useState("");
  const [signUpAge, setSignUpAge] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");

  // Sign In form
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Documentation — admin kirish kodi
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docCode, setDocCode] = useState("");
  const [docError, setDocError] = useState("");
  const [showDocCode, setShowDocCode] = useState(false);

  // ✅ FIX: handleSaveDates - RentCalendar tashqarida
  const handleSaveDates = (days: string[], start: Date | null, end: Date | null) => {
    setRange({ start, end });
    setIsCalOpen(false);
  };

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const handleOpenChange = (state: boolean) => {
    setOpen(state);
    if (state) {
      videoRef.current?.pause();
    } else {
      videoRef.current?.play();
    }
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
      setSignUpName("");
      setSignUpAge("");
      setSignUpEmail("");
      setSignUpPassword("");
    } catch (err: any) {
      setAuthError(err?.message || "Ro'yxatdan o'tishda xato");
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
      setSignInEmail("");
      setSignInPassword("");
    } catch (err: any) {
      setAuthError(err?.message || "Kirishda xato");
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
      if (isSignUp) setSignUp(false);
      else setCount(false);
    } catch (err: any) {
      setAuthError(err?.message || "Google orqali kirishda xato");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="relative w-full overflow-x-hidden antialiased">

      {/* ✅ FIX: RentCalendar navbar TASHQARISIDA, z-index yuqori */}
      <RentCalendar
        isOpen={isCalOpen}
        onClose={() => setIsCalOpen(false)}
        onSave={handleSaveDates}
      />

      {/* 1. HERO SECTION */}
      <section className="relative h-screen w-full overflow-hidden flex flex-col items-center">
        {/* Background Video */}
        <div className="absolute inset-0 -z-10 bg-black">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
          >
            <source src="/v2.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/30"></div>
        </div>

        {/* Navbar */}
        <nav className="w-full pt-4 sm:pt-6 z-50">
          <div className="max-w-[1350px] mx-auto px-3 sm:px-6 h-[60px] sm:h-[70px] flex items-center justify-between bg-black/40 bg-white/10 border border-white/20 rounded-2xl shadow-lg overflow-visible">

            {/* Logo + Sarlavha */}
            <div className="flex items-center gap-4 md:gap-6 lg:gap-10 text-green-500 active:scale-95 min-w-0 flex-shrink-0">
              <Link href={"/dashboard/all"}>
                <img
                  src="/dod.png"
                  alt="Logo"
                  className="h-7 sm:h-10 md:h-12 w-auto brightness-110 rounded-xl"
                />
              </Link>

              {/* ✅ FIX: Responsiv sarlavha - kichik ekranda kichraidi */}
              <h4 className="font-bold text-sm sm:text-lg md:text-xl lg:text-3xl text-green-500 truncate max-w-[110px] sm:max-w-none">
                {t.landing.carRental}
              </h4>
            </div>

            {/* O'ng tomondagi tugmalar */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-4 lg:gap-6 flex-shrink-0">

              {/* ✅ FIX: Kun tanlash tugmasi - RentCalendar tashqarida */}
              <button
                onClick={() => setIsCalOpen(true)}
                className="text-[#FFD700]/90 w-[60px] sm:w-[90px] md:w-[140px] h-[26px] sm:h-[28px] md:h-[34px] rounded-xl active:scale-95 bg-green-500 hover:bg-green-400 hover:text-white transition-colors font-medium text-[8px] sm:text-xs md:text-sm uppercase tracking-wider"
              >
                {t.nav.chooseDay}
              </button>

              {/* ✅ FIX: Til tanlash - responsiv, overflow:visible */}
              <div className="relative" ref={langRef}>
                <button
                  type="button"
                  onClick={() => setLangOpen((o) => !o)}
                  className="flex items-center gap-1 sm:gap-2 h-[26px] sm:h-[34px] md:h-[42px] px-2 sm:px-3 md:px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 border border-amber-400 text-white hover:from-amber-700 hover:to-amber-600 transition font-medium text-[10px] sm:text-xs md:text-sm shadow-lg"
                >
                  <span>{language === "en" ? "EN" : language === "uz" ? "O'Z" : "РУ"}</span>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* ✅ FIX: Dropdown - z-index [9999], overflow:visible */}
                {langOpen && (
                  <>
                    <div className="fixed inset-0 z-[9998]" onClick={() => setLangOpen(false)} />
                    <div className="absolute top-full right-0 mt-2 z-[9999] min-w-[120px] sm:min-w-[140px] py-1 rounded-xl bg-slate-800/95 border border-white/20 shadow-xl overflow-hidden">
                      <button type="button" onClick={() => { setLanguage("en"); setLangOpen(false); }} className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[#FFD700] hover:bg-white/10 text-xs sm:text-sm font-medium">English</button>
                      <button type="button" onClick={() => { setLanguage("uz"); setLangOpen(false); }} className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[#FFD700] hover:bg-white/10 text-xs sm:text-sm font-medium">O'zbekcha</button>
                      <button type="button" onClick={() => { setLanguage("ru"); setLangOpen(false); }} className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[#FFD700] hover:bg-white/10 text-xs sm:text-sm font-medium">Русский</button>
                    </div>
                  </>
                )}
              </div>

              {/* Profil tugmasi */}
              
{/* Profil / Ro'yxatdan o'tish tugmasi */}
<button
  onClick={(e) => { setOpen(true); e.currentTarget.blur(); }}
  className="active:scale-95 transition-transform"
>
  <div className="flex items-center gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full 
  bg-blue-600 hover:bg-blue-500 
  border border-white/30 backdrop-blur-sm 
  transition-all shadow-lg">

    {/* Har doim Ro'yxatdan o'tish chiqadi */}
    <span className="
      text-[10px] 
      sm:text-xs 
      md:text-sm 
      lg:text-base 
      font-medium 
      text-white 
      whitespace-nowrap
    ">
      Kirish
    </span>

    <div className="w-[1px] h-4 bg-white/30"></div>

    <img
      className="w-4 h-4 sm:w-5 sm:h-5 invert"
      src="/k.png"
      alt="profile"
    />
  </div>
</button>




            </div>
          </div>
        </nav>

        {/* Hero Matn */}
       <div className="flex-1 flex flex-col items-center justify-center text-center z-10 px-4">
  {/* Sarlavha */}
  <h1 className="text-green-500 text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight mb-56 sm:mb-0 drop-shadow-2xl">
    {t.landing.discoverWorld}
  </h1>

  {/* Navbar va sarlavha orasidagi responsiv bo‘shliq */}
  <div className="mt-6 sm:mt-8 md:mt-12 lg:mt-16 flex justify-center w-full">
    <Navbar />
  </div>
</div>



        
      </section>

      {/* Sign Up Drawer */}
      <Drawer.Root open={signUp} onOpenChange={(state) => { setSignUp(state); if (!state) setAuthError(""); }}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[101] flex justify-center outline-none max-h-[92dvh] overflow-y-auto pb-[env(safe-area-inset-bottom)] md:inset-0 md:items-center md:max-h-none md:pb-0 md:overflow-visible">
            <div className="bg-gradient-to-br from-white via-gray-50 to-white w-full max-w-md rounded-t-2xl sm:rounded-t-3xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl border border-gray-100 min-w-0 mx-auto">
              <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1a3 3 0 01-3 3H6a3 3 0 01-3-3v-1a6 6 0 0112 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <Drawer.Title className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">{t.auth.signup}</Drawer.Title>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">{language === "uz" ? "Yangi hisob yarating" : language === "ru" ? "Создайте новый аккаунт" : "Create a new account"}</p>
                  </div>
                </div>
                <button onClick={() => setSignUp(false)} className="w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] sm:min-w-[44px] flex items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-200 text-white text-lg sm:text-xl active:scale-95 shadow-lg shrink-0">
                  ✕
                </button>
              </div>
              <form onSubmit={handleSignUp} className="flex flex-col gap-3 sm:gap-4">
                {authError && <p className="text-xs sm:text-sm text-red-600 bg-red-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-red-200">{authError}</p>}
                <div className="flex flex-col gap-1.5 sm:gap-2">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700">{t.auth.fullName}</label>
                  <input type="text" placeholder={language === "uz" ? "Ismingizni kiriting" : language === "ru" ? "Введите имя" : "Enter your name"} value={signUpName} onChange={(e) => setSignUpName(e.target.value)} className="w-full min-h-[42px] sm:min-h-[44px] h-11 sm:h-12 px-3 sm:px-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base bg-white shadow-sm text-gray-900 placeholder-gray-400" />
                </div>
                <div className="flex flex-col gap-1.5 sm:gap-2">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700">{language === "uz" ? "Yoshingiz" : language === "ru" ? "Возраст" : "Age"}</label>
                  <input type="text" placeholder={language === "uz" ? "Yoshingizni kiriting" : language === "ru" ? "Введите возраст" : "Enter your age"} value={signUpAge} onChange={(e) => setSignUpAge(e.target.value)} className="w-full min-h-[42px] sm:min-h-[44px] h-11 sm:h-12 px-3 sm:px-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base bg-white shadow-sm text-gray-900 placeholder-gray-400" />
                </div>
                <div className="flex flex-col gap-1.5 sm:gap-2">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700">{t.auth.email}</label>
                  <input type="email" placeholder={language === "uz" ? "Elektron pochtangizni kiriting" : language === "ru" ? "Введите email" : "Enter your email"} value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} required className="w-full min-h-[42px] sm:min-h-[44px] h-11 sm:h-12 px-3 sm:px-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base bg-white shadow-sm text-gray-900 placeholder-gray-400" />
                </div>
                <div className="flex flex-col gap-1.5 sm:gap-2">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700">{t.auth.password}</label>
                  <input type="password" placeholder={language === "uz" ? "Parolingizni kiriting (min 6)" : language === "ru" ? "Пароль (мин 6)" : "Password (min 6)"} value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} required minLength={6} className="w-full min-h-[42px] sm:min-h-[44px] h-11 sm:h-12 px-3 sm:px-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base bg-white shadow-sm text-gray-900 placeholder-gray-400" />
                </div>
                <button type="submit" disabled={authLoading} className="w-full min-h-[42px] sm:min-h-[44px] h-11 sm:h-12 mt-1 sm:mt-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold text-sm sm:text-base hover:from-blue-600 hover:to-blue-700 active:scale-95 transition-all duration-200 shadow-lg disabled:opacity-60">
                  {authLoading ? (language === "uz" ? "Kutilmoqda..." : language === "ru" ? "Ожидание..." : "Loading...") : t.auth.signup}
                </button>
                <button type="button" onClick={() => handleGoogleAuth(true)} disabled={authLoading} className="w-full min-h-[42px] sm:min-h-[44px] h-11 sm:h-12 bg-gradient-to-r from-gray-900 to-black text-white rounded-xl font-semibold text-sm sm:text-base hover:from-gray-800 hover:to-gray-900 active:scale-95 transition-all duration-200 shadow-lg disabled:opacity-60">
                  {language === "uz" ? "Google orqali ro'yxatdan o'tish" : language === "ru" ? "Регистрация через Google" : "Sign up with Google"}
                </button>
              </form>
              <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-100 text-center">
                <span className="text-xs sm:text-sm text-gray-500">{t.auth.alreadyHave}</span>
                <button type="button" onClick={() => { setSignUp(false); setCount(true); setAuthError(""); }} className="ml-2 text-xs sm:text-sm font-semibold text-blue-600 hover:underline">{t.auth.login}</button>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Contact Drawer */}
      <Drawer.Root open={contact} onOpenChange={(state: boolean) => setContact(state)}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[101] flex justify-center outline-none max-h-[92dvh] overflow-y-auto pb-[env(safe-area-inset-bottom)] md:inset-0 md:items-center md:max-h-none md:pb-0 md:overflow-visible">
            <div className="bg-gradient-to-br from-white via-gray-50 to-white w-full max-w-md rounded-t-2xl sm:rounded-t-3xl md:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-2xl border border-gray-100 flex flex-col items-center min-w-0 mx-auto">
              <div className="flex items-center justify-between w-full mb-5 sm:mb-6 md:mb-8 gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <Drawer.Title className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">{t.contact.title}</Drawer.Title>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">{language === "uz" ? "Biz bilan bog'laning" : language === "ru" ? "Свяжитесь с нами" : "Get in touch with us"}</p>
                  </div>
                </div>
                <button onClick={() => setContact(false)} className="w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] sm:min-w-[44px] flex items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-200 text-white text-lg sm:text-xl active:scale-95 shadow-lg shrink-0">✕</button>
              </div>
              <div className="flex flex-col gap-3 sm:gap-4 w-full">
                <button onClick={() => window.location.href = "tel:933948200"} className="group relative overflow-hidden bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 hover:from-blue-100 hover:to-blue-200 transition-all duration-300 active:scale-[0.98] border border-blue-200">
                  <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-blue-500/10 rounded-full -translate-y-8 translate-x-8 sm:-translate-y-10 sm:translate-x-10 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shrink-0">
                      <img src="/tel.png" alt="Phone" className="w-6 h-6 sm:w-7 sm:h-7 filter brightness-0 invert" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <h3 className="font-semibold text-gray-900 text-base sm:text-lg">{t.contact.phone}</h3>
                      <p className="text-gray-600 text-sm sm:text-base truncate">+998 93 394 82 00</p>
                    </div>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 group-hover:translate-x-1 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </div>
                </button>
                <button onClick={() => window.open("https://instagram.com/xurshid__jonn", "_blank")} className="group relative overflow-hidden bg-gradient-to-r from-pink-50 to-purple-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 hover:from-pink-100 hover:to-purple-200 transition-all duration-300 active:scale-[0.98] border border-pink-200">
                  <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-pink-500 to-purple-500/10 rounded-full -translate-y-8 translate-x-8 sm:-translate-y-10 sm:translate-x-10 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shrink-0">
                      <img src="/i.jpg" alt="Instagram" className="w-6 h-6 sm:w-7 sm:h-7 filter brightness-0 invert" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <h3 className="font-semibold text-gray-900 text-base sm:text-lg">{t.contact.instagram}</h3>
                      <p className="text-gray-600 text-sm sm:text-base truncate">@xurshid__jonn</p>
                    </div>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 group-hover:translate-x-1 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </div>
                </button>
                <button onClick={() => window.open("https://t.me/xursh1d_jonn", "_blank")} className="group relative overflow-hidden bg-gradient-to-r from-blue-50 to-cyan-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 hover:from-blue-100 hover:to-cyan-200 transition-all duration-300 active:scale-[0.98] border border-blue-200">
                  <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-cyan-500/10 rounded-full -translate-y-8 translate-x-8 sm:-translate-y-10 sm:translate-x-10 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shrink-0">
                      <img src="/tg.png" alt="Telegram" className="w-6 h-6 sm:w-7 sm:h-7 filter brightness-0 invert" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <h3 className="font-semibold text-gray-900 text-base sm:text-lg">{t.contact.telegram}</h3>
                      <p className="text-gray-600 text-sm sm:text-base truncate">@xursh1d_jonn</p>
                    </div>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-500 group-hover:translate-x-1 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </div>
                </button>
              </div>
              <div className="mt-5 sm:mt-6 md:mt-8 pt-4 border-t border-gray-100 text-center w-full">
                <p className="text-xs sm:text-sm text-gray-500">{language === "uz" ? "Ish vaqti: 09:00 - 21:00" : language === "ru" ? "Время работы: 09:00 - 21:00" : "Hours: 09:00 - 21:00"}</p>
                <p className="text-xs text-gray-400 mt-1">{language === "uz" ? "Tez javob beramiz" : language === "ru" ? "Быстро отвечаем" : "We respond quickly"}</p>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Sign In Drawer */}
      <Drawer.Root open={count} onOpenChange={(state) => { setCount(state); if (!state) setAuthError(""); }}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[101] flex justify-center outline-none max-h-[92dvh] overflow-y-auto pb-[env(safe-area-inset-bottom)] md:inset-0 md:items-center md:max-h-none md:pb-0 md:overflow-visible">
            <div className="bg-gradient-to-br from-white via-gray-50 to-white w-full max-w-md rounded-t-2xl sm:rounded-t-3xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl border border-gray-100 min-w-0 mx-auto">
              <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h18m-2-4a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <Drawer.Title className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">{t.auth.login}</Drawer.Title>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">{language === "uz" ? "Hisobingizga kiring" : language === "ru" ? "Войдите в аккаунт" : "Sign in to your account"}</p>
                  </div>
                </div>
                <button onClick={() => setCount(false)} className="w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] sm:min-w-[44px] flex items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-200 text-white text-lg sm:text-xl active:scale-95 shadow-lg shrink-0">✕</button>
              </div>
              <form onSubmit={handleSignIn} className="flex flex-col gap-3 sm:gap-4">
                {authError && <p className="text-xs sm:text-sm text-red-600 bg-red-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-red-200">{authError}</p>}
                <div className="flex flex-col gap-1.5 sm:gap-2">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700">{t.auth.email}</label>
                  <input type="email" placeholder={language === "uz" ? "Elektron pochtangizni kiriting" : language === "ru" ? "Введите email" : "Enter your email"} value={signInEmail} onChange={(e) => setSignInEmail(e.target.value)} required className="w-full min-h-[42px] sm:min-h-[44px] h-11 sm:h-12 px-3 sm:px-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base bg-white shadow-sm text-gray-900 placeholder-gray-400 font-medium" />
                </div>
                <div className="flex flex-col gap-1.5 sm:gap-2">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700">{t.auth.password}</label>
                  <input type="password" placeholder={language === "uz" ? "Parolingizni kiriting" : language === "ru" ? "Введите пароль" : "Enter your password"} value={signInPassword} onChange={(e) => setSignInPassword(e.target.value)} required className="w-full min-h-[42px] sm:min-h-[44px] h-11 sm:h-12 px-3 sm:px-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base bg-white shadow-sm text-gray-900 placeholder-gray-400 font-medium" />
                </div>
                <button type="submit" disabled={authLoading} className="w-full min-h-[42px] sm:min-h-[44px] h-11 sm:h-12 mt-1 sm:mt-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold text-sm sm:text-base hover:from-blue-600 hover:to-blue-700 active:scale-95 transition-all duration-200 shadow-lg disabled:opacity-60">
                  {authLoading ? (language === "uz" ? "Kutilmoqda..." : language === "ru" ? "Ожидание..." : "Loading...") : t.auth.login}
                </button>
                <button type="button" onClick={() => handleGoogleAuth(false)} disabled={authLoading} className="w-full min-h-[42px] sm:min-h-[44px] h-11 sm:h-12 bg-gradient-to-r from-gray-900 to-black text-white rounded-xl font-semibold text-sm sm:text-base hover:from-gray-800 hover:to-gray-900 active:scale-95 transition-all duration-200 shadow-lg disabled:opacity-60">
                  {language === "uz" ? "Google orqali kirish" : language === "ru" ? "Войти через Google" : "Sign in with Google"}
                </button>
              </form>
              <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-100 text-center">
                <span className="text-xs sm:text-sm text-gray-500">{t.auth.dontHave}</span>
                <button type="button" onClick={() => { setCount(false); setSignUp(true); setAuthError(""); }} className="ml-2 text-xs sm:text-sm font-semibold text-blue-600 hover:underline">{t.auth.signup}</button>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Admin / Dokumentatsiya Drawer */}
      <Drawer.Root open={docModalOpen} onOpenChange={(state) => { setDocModalOpen(state); if (!state) { setDocCode(""); setDocError(""); } }}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]" />
          <Drawer.Content className="fixed inset-0 z-[101] flex items-end sm:items-center justify-center outline-none p-0 sm:p-4">
            <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden max-h-[92dvh] overflow-y-auto pb-[env(safe-area-inset-bottom)] sm:pb-0 sm:max-h-none mx-auto sm:my-0">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 text-center">
                <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 mx-auto mb-2 sm:mb-3 md:mb-4 rounded-xl sm:rounded-2xl bg-white/10 flex items-center justify-center">
                  <img src="/d.png" alt="" className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 invert" />
                </div>
                <Drawer.Title className="text-base sm:text-lg md:text-xl font-bold text-[#FFD700]">{language === "uz" ? "Dokumentatsiya" : language === "ru" ? "Документация" : "Documentation"}</Drawer.Title>
                <p className="text-slate-300 text-xs sm:text-sm mt-1.5 sm:mt-2 px-2">{language === "uz" ? "Admin paneliga kirish uchun maxsus kodni kiriting" : language === "ru" ? "Введите специальный код для входа в админ-панель" : "Enter the special code to access admin panel"}</p>
              </div>
              <form onSubmit={handleDocSubmit} className="p-4 sm:p-6 md:p-8">
                {docError && <p className="text-xs sm:text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl mb-3 sm:mb-4">{docError}</p>}
                <div className="relative">
                  <input
                    type={showDocCode ? "text" : "password"}
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder={language === "uz" ? "Kodni kiriting" : language === "ru" ? "Введите код" : "Enter code"}
                    value={docCode}
                    onChange={(e) => setDocCode(e.target.value)}
                    className="w-full min-h-[44px] sm:min-h-[48px] h-11 sm:h-12 pr-11 sm:pr-12 px-3 sm:px-4 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-center text-sm sm:text-base md:text-lg tracking-widest font-mono transition text-gray-900"
                  />
                  <button type="button" onClick={() => setShowDocCode(!showDocCode)} className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Toggle password visibility">
                    {showDocCode ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243" /></svg>
                    )}
                  </button>
                </div>
                <button type="submit" className="w-full min-h-[42px] sm:min-h-[44px] h-11 sm:h-12 mt-3 sm:mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold text-sm sm:text-base rounded-xl transition active:scale-[0.98]">
                  {t.auth.login}
                </button>
                <button type="button" onClick={() => setDocModalOpen(false)} className="w-full mt-2 sm:mt-3 min-h-[40px] sm:min-h-[44px] text-xs sm:text-sm text-gray-500 hover:text-gray-700 py-2">
                  {t.common.cancel}
                </button>
              </form>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Profil Drawer - o'ngdan */}
      <Drawer.Root open={open} onOpenChange={handleOpenChange} direction="right">
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[99]" />
          <Drawer.Content className="fixed top-0 bottom-0 right-0 z-[100] w-full max-w-[calc(100vw-24px)] sm:max-w-[340px] sm:w-[340px] bg-gradient-to-b from-slate-900 to-slate-800 border-l border-white/10 p-3 sm:p-4 md:p-6 flex flex-col shadow-2xl outline-none rounded-l-[20px] sm:rounded-l-[24px] md:rounded-l-[32px] will-change-transform overflow-y-auto pb-[env(safe-area-inset-bottom)]">
            <div className="mb-4 sm:mb-6 md:mb-10 mt-1 sm:mt-2 md:mt-4 px-1 sm:px-2">
              <div className="flex items-center justify-between mb-1.5 sm:mb-2 gap-2">
                <Drawer.Title className="text-lg sm:text-xl md:text-2xl font-bold text-amber-100 truncate">{t.nav.profile}</Drawer.Title>
                <button onClick={() => setOpen(false)} className="w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] sm:min-w-[44px] flex items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-200 text-white text-lg sm:text-xl active:scale-95 shadow-lg shrink-0">
                  ✕
                </button>
              </div>
              <Drawer.Description className="text-slate-400 text-xs sm:text-sm">{language === "uz" ? "Profil bo'limi" : language === "ru" ? "Раздел профиля" : "Profile section"}</Drawer.Description>
            </div>
            <div className="flex flex-col gap-2 sm:gap-3 md:gap-4 overflow-y-auto flex-1">
              <MenuButton onClick={() => { setOpen(false); setCount(true); }} icon="/k2.png" label={t.auth.login} color="indigo" />
              <MenuButton onClick={() => { setOpen(false); setSignUp(true); }} icon="/k.png" label={t.auth.signup} color="emerald" />
              <MenuButton onClick={() => {
                setOpen(false);
                if (!auth.currentUser) {
                  showToast(t.auth.pleaseLogin, "warning");
                  return;
                }
                router.push("/dashboard/profil");
              }} icon="/s.png" label={t.nav.profile} color="blue" />
              <MenuButton onClick={() => setContact(true)} icon="/t.png" label={t.contact.title} color="rose" />
              <MenuButton onClick={openDocModal} icon="/admin.jpg" label={language === "uz" ? "Dokumentatsiya" : language === "ru" ? "Документация" : "Documentation"} color="slate" />
            </div>
            <div className="mt-auto pb-3 sm:pb-4 pt-2 px-1 sm:px-2">
              <button onClick={() => setOpen(false)} className="w-full mt-3 sm:mt-4 min-h-[40px] sm:min-h-[44px] h-10 sm:h-11 bg-indigo-600 hover:bg-indigo-500 text-amber-100 text-sm sm:text-base rounded-xl font-medium active:scale-95 transition-colors">
                {t.common.close}
              </button>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Main Content */}
      <main className="relative z-20 bg-white">
        {children}
      </main>
    </div>
  );
}

const MenuButton = ({
  icon,
  label,
  color,
  onClick,
  className,
}: {
  icon: string;
  label: string;
  color: string;
  onClick?: () => void;
  className?: string;
}) => {
  const themes: any = {
    indigo: "hover:border-indigo-200 text-indigo-600 bg-indigo hover:bg-indigo-500",
    emerald: "hover:border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-500",
    rose: "hover:border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-500",
    slate: "hover:border-slate-300 text-slate-800 bg-slate-100 hover:bg-slate-800",
    blue: "hover:border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-500",
  };

  return (
    <button onClick={onClick} className="group flex gap-3 sm:gap-4 items-center w-full border border-slate-700/50 p-3 rounded-2xl shadow-sm hover:shadow-md hover:bg-slate-700/30 transition-all duration-200 active:scale-95 min-h-[52px]">
      <div className={`w-10 h-10 sm:w-11 sm:h-11 flex items-center rounded-xl ${themes[color].split(" ").slice(2).join(" ")}`}>
        <img className="w-5 h-5 group-hover:invert transition-all" src={icon} alt={label} />
      </div>
      <span className="text-base font-semibold text-slate-200">{label}</span>
    </button>
  );
};

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
