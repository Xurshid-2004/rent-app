"use client"
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../(lib)/firebase";
import { Plus, ChevronDown } from "lucide-react";
import { useToast } from "../../(lib)/ToastContext";
import { useLanguage } from "../../(lib)/LanguageContext";

const Navbar = () => {
  const [active, setActive] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const tabs = [
    { label: t.nav.all, path: "/dashboard/all" },
    { label: t.nav.family, path: "/dashboard/family" },
    { label: t.nav.comfort, path: "/dashboard/comfort" },
    { label: t.nav.sport, path: "/dashboard/sport" },
    { label: t.nav.classic, path: "/dashboard/classic" },
  ];

  const handleAddCar = () => {
    if (auth.currentUser) {
      router.push("/dashboard/add-car");
    } else {
      showToast(t.auth.pleaseLogin, "warning");
    }
  };

  const handleMobileTabClick = (index: number, path: string) => {
    setActive(index);
    setMobileOpen(false);
    router.push(path);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Mobil: barcha kategoriyalar bitta tugma ostida */}
      <div className="w-full max-w-md mx-auto md:hidden mt-6 sm:mt-8 md:mt-10 space-y-2 sm:space-y-3 px-2 sm:px-0">
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-black/50 border border-white/30 text-white text-xs sm:text-sm font-semibold backdrop-blur-md active:scale-95 transition-all"
        >
          <span>{t.nav.categories}</span>
          <ChevronDown
            size={18}
            className={`transition-transform ${mobileOpen ? "rotate-180" : ""}`}
          />
        </button>

        {mobileOpen && (
          <div className="w-full rounded-2xl bg-black/70 border border-white/20 backdrop-blur-md p-2 flex flex-col gap-2">
            {tabs.map((tab, index) => (
              <button
                key={tab.path}
                type="button"
                onClick={() => handleMobileTabClick(index, tab.path)}
                className={`w-full px-4 py-2 rounded-xl text-sm font-medium text-left transition-all ${
                  active === index
                    ? "bg-green-500 text-white"
                    : "bg-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop / katta ekran: eski dizayn deyarli o'z holicha */}
      <div className="relative mt-16 md:mt-32 lg:mt-40 md:w-[1120px] max-w-[900px] h-[50px] md:h-[60px] bg-white/10 border border-white/20 rounded-2xl shadow-2xl items-center px-2 hidden md:flex">
        <div
          className="absolute h-[40px] md:h-[42px] rounded-xl bg-green-500 transition-all duration-500 ease-in-out"
          style={{
            width: `calc((100% - 16px) / ${tabs.length})`,
            left: `calc(8px + ${active * (100 / tabs.length)}%)`,
          }}
        />

        {tabs.map((tab, index) => (
          <Link
            key={index}
            href={tab.path}
            onClick={() => setActive(index)}
            className={`relative z-10 flex-1 h-full flex items-center justify-center font-medium transition-all duration-300 ${
              active === index
                ? "font-bold text-white"
                : "text-white/70 hover:text-white"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
      
      {/* O'z mashinasini qo'shish tugmasi */}
      <button
        onClick={handleAddCar}
        className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
      >
        <Plus className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
        {t.nav.addCar}
      </button>
    </div>
  );
};

export default Navbar;