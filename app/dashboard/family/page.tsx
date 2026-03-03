
"use client";

import { motion, Variants } from "framer-motion";
import CarGrid from "../(components)/CarGrid";
import { useLanguage } from "../../(lib)/LanguageContext";

// Animatsiya konfiguratsiyalari
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};



const fadeIn: Variants = { // : Variants qo&apos;shildi
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: "easeOut" } 
  }
};



const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.1 } }
};

export default function Family() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      {/* 1. HEADER SECTION */}
      <div className="relative border-b border-amber-900/10 bg-[#0d0f12] py-8 overflow-hidden group">
        <div className="absolute -bottom-10 left-0 w-[400px] h-[150px] bg-amber-500/5 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col md:flex-row md:items-center md:gap-8 gap-3"
          >
            <div className="relative">
              <h1 className="text-2xl md:text-4xl font-sans font-extrabold text-white tracking-tight">
                Family
              </h1>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="absolute -bottom-2 left-0 h-[3px] bg-gradient-to-r from-amber-500/80 via-amber-200/40 to-transparent"
              ></motion.div>
            </div>

            <div className="flex items-center gap-3 mt-1 md:mt-0">
              <div className="hidden md:block w-px h-8 bg-slate-800"></div>
              <div className="flex flex-col">
                <p className="text-slate-400 text-sm md:text-base font-medium tracking-wide">
                  Oilaviy mashinalar
                </p>
                <span className="text-[10px] uppercase tracking-[0.3em] text-amber-500/60 font-bold">
                  Safety & Space
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 2. CAR GRID SECTION */}
      <motion.div 
        id="card" 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-12 bg-white bg-gradient-to-br from-[#16181d] to-[#0a0b0d]"
      >
        <CarGrid category="family" />
      </motion.div>



      <section className="relative w-full min-h-screen bg-black overflow-hidden flex flex-col md:block">
        
        {/* 1. MOBIL UCHUN RASM (Tepada ixcham turadi) */}
        <div className="w-full h-[40vh] relative md:hidden flex items-center justify-center bg-black pt-10">
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            src="/mers2.png"
            alt="G-Class Mobile"
            className="w-full h-full object-contain"
          />
          {/* Mobil uchun pastki gradient (matnga yumshoq o'tish uchun) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>
      
        {/* 2. DESKTOP UCHUN RASM (Orqa fonda) */}
        <div className="hidden md:block absolute inset-0 z-0">
          <motion.img
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2 }}
            src="/mers2.png"
            alt="G-Class Desktop"
            className="w-full h-full object-cover object-right opacity-80"
          />
          {/* Desktop gradient: Chapdan o'ngga qorayish */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
        </div>
      
        {/* 3. ASOSIY KONTENT (Matn va Tugma) */}
        <div className="container mx-auto px-6 md:px-16 relative z-10 flex flex-col justify-center min-h-[50vh] md:min-h-screen">
          <motion.div
             initial={{ y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ 
          duration: 1.4,
          ease: [0.22, 1, 0.36, 1]  // cubic-bezier
        }}
        viewport={{ once: true }}
        className="max-w-2xl text-center md:text-left"
          >
            {/* Jiloli kichik yozuv */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 py-1.5 px-3 rounded-full mb-6 mx-auto md:mx-0">
              <span className="h-2 w-2 rounded-full bg-yellow-500 shadow-[0_0_10px_#f59e0b] animate-pulse" />
              <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-white">
                Premium Klass
              </span>
            </div>
      
            {/* Sarlavha */}
            <h1 className="text-3xl md:text-7xl font-black text-[#FFD700] leading-tight mb-4 drop-shadow-2xl">
              {t.landing.premiumFeel}
            </h1>
      
            <p className="text-gray-400 text-sm md:text-lg mb-8 max-w-sm md:max-w-md mx-auto md:mx-0 leading-relaxed">
              {t.landing.orderNow}
            </p>
      
            {/* Jiloli Tugma */}
            <button
              onClick={() => document.getElementById('card')?.scrollIntoView({ behavior: 'smooth' })}
              className="group relative overflow-hidden bg-[#FFD700] text-black font-extrabold py-3.5 px-10 rounded-xl transition-all active:scale-95 shadow-lg mx-auto md:mx-0"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative uppercase tracking-wider text-sm md:text-base">{t.landing.orderNowBtn}</span>
            </button>
          </motion.div>
        </div>
      
        {/* Pastki sectionga yopishib turishini kafolatlovchi qatlam */}
        <div className="absolute bottom-0 left-0 w-full h-px bg-black" />
      </section>
      {/* --- 3. HERO SECTION (Mercedes G-class) --- */}
      
      
      
            {/* --- 4. FEATURES SECTION --- */}
            <div className="relative w-full bg-[#0f1115] py-20 px-6 overflow-hidden">
              <div className="max-w-7xl mx-auto relative z-10">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center mb-20"
                >
                  <h2 className="text-xl md:text-5xl font-extrabold text-white uppercase tracking-tighter italic transform -skew-x-2">
                    {t.landing.aboutRental}
                  </h2>
                </motion.div>
      
                <motion.div 
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8"
                >
                  {[
                    { img: "/q.png", title: t.landing.affordable, text: t.landing.affordable },
                    { img: "/l.png", title: t.landing.transparent, text: t.landing.transparent },
                    { img: "/c.png", title: t.landing.idealCondition, text: t.landing.idealCondition },
                    { img: "/lok.png", title: t.landing.delivery, text: t.landing.delivery },
                    { img: "/h.png", title: "Tezkor", text: `Hujjatlar ${t.landing.getIn15Minutes} tayyor` },
                  ].map((item, index) => (
                    <motion.div variants={fadeIn} key={index} className="group relative">
                      <div className="h-full bg-gradient-to-b from-white/[0.07] to-transparent border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center hover:border-amber-500/50 transition-all duration-500">
                        <div className="relative mb-6">
                          <img className="w-12 h-12 object-contain" src={item.img} alt="feature" />
                        </div>
                        <h3 className="text-amber-400 font-bold text-sm uppercase tracking-widest mb-2">{item.title}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">{item.text}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
      
            {/* --- 5. CONTACT SECTION --- */}
      
      
        <div className="relative w-full bg-[#0a0b0d] py-24 px-6 overflow-hidden">
              <div className="max-w-7xl mx-auto relative z-10">
                <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
                  <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1 }}
                    className="max-w-3xl"
                  >
                    <h2 className="text-2xl md:text-6xl font-black text-white leading-tight uppercase tracking-tighter">
                      {t.landing.whyChooseUs} <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200 italic px-1">
                        {t.landing.drivingCarBrand}
                      </span>
                    </h2>
                  </motion.div>
                  <motion.p 
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="text-slate-400 text-lg md:text-xl max-w-md font-light border-l border-amber-500/30 pl-6"
                  >
                    {t.landing.partnershipBenefits}
                  </motion.p>
                </div>
      
                <motion.div 
                  variants={staggerContainer}
                  initial="initial"
                  whileInView="whileInView"
                  viewport={{ once: true }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                  {[
                    { img: "/rul.png", title: t.landing.largeParking, desc: t.landing.parkingDesc },
                    { img: "/toza.png", title: t.landing.cleanCars, desc: t.landing.cleanCarsDesc },
                    { img: "/sk.png", title: t.landing.comfortClass, desc: t.landing.comfortClassDesc },
                    { img: "/r.png", title: t.landing.technicalIdeal, desc: t.landing.technicalIdealDesc },
                  ].map((card, idx) => (
                    <motion.div key={idx} variants={fadeInUp} className="group relative">
                      <div className="relative h-full bg-gradient-to-br from-[#16181d] to-[#0a0b0d] p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center text-center transition-all duration-500 group-hover:border-amber-500/40 group-hover:-translate-y-3 shadow-2xl">
                        <div className="relative mb-2 w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
                          <img src={card.img} alt={card.title} className="relative z-10 w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-700" />
                        </div>
                        <h3 className="text-white text-xl font-bold tracking-tight  group-hover:text-amber-400 transition-colors">
                          {card.title}
                        </h3>
                        <p className="text-slate-500 text-sm uppercase tracking-widest font-medium opacity-0 group-hover:opacity-100 transition-all duration-700">
                          {card.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
      
            {/* --- 5. CONTACT SECTION --- */}
            <section className="w-full bg-black py-2 px-2 min-h-screen flex flex-col items-center">
              <motion.h2 
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-[#FFD700] text-3xl md:text-6xl font-extrabold mb-16 text-center tracking-tight"
              >
                {t.landing.contacts}
              </motion.h2>
      
              <div className="max-w-7xl w-full items-center grid grid-cols-1 lg:grid-cols-2 gap-12">
                <motion.div 
                  initial={{ x: -50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="flex flex-col gap-6"
                >
                  {/* Telefon Card */}
                  <div className="bg-white rounded-[32px] p-6 flex items-center gap-8 mb-12 group">
                    <div className="bg-slate-100 p-5 rounded-2xl group-hover:rotate-12 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-500 text-lg font-medium mb-1">{t.landing.phoneNumber}</p>
                      <a href="tel:+998933948200" className="text-black text-xl md:text-2xl lg:text-3xl font-bold">+998 93 394 82 00</a>
                    </div>
                  </div>
                  {/* Manzil Card */}
                  <div className="bg-white rounded-[32px] p-5 flex items-center gap-8 group">
                    <div className="bg-slate-100 p-5 rounded-2xl group-hover:rotate-12 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-500 text-lg font-medium mb-1">{t.landing.address}</p>
                      <p className="text-black text-base md:text-xl lg:text-2xl font-bold">Toshkent sh., Mirobod ko'chasi, 41/6</p>
                    </div>
                  </div>
                </motion.div>
      
                {/* Map Side */}
                <motion.div 
                  initial={{ x: 50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="relative w-full h-[400px] lg:h-auto min-h-[450px] rounded-[40px] overflow-hidden border-4 border-white/10"
                >
                  <iframe 
                    src="https://www.google.com/maps/embed?..." 
                    className="absolute inset-0 w-full h-full grayscale-[0.2]"
                    allowFullScreen={true} 
                    loading="lazy" 
                  ></iframe>
                </motion.div>
              </div>
            </section>
      
            {/* --- FOOTER CTA --- */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="w-full py-6 flex flex-col md:flex-row items-center justify-center bg-black gap-4 border-t border-white/5"
            >
              <p className="text-white text-lg font-semibold text-center">
                {t.landing.needWebsite}
              </p>
              <button
                onClick={() => window.open("https://t.me/xursh1d_jonn", "_blank")}
                className="flex items-center gap-4 px-6 py-2 bg-white rounded-full shadow-lg hover:bg-blue-50 transition-all active:scale-95"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-blue-500 rounded-full">
                  <img src="/tg.png" alt="{t.landing.connectWithUs}" className="w-4 h-4" />
                </div>
                <span className="text-blue-500 font-bold">{t.landing.connectWithUs}</span>
              </button>
            </motion.div>
      
      
      
      
      
      
    </div>
  );
}