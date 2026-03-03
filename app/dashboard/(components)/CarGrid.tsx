"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../(lib)/firebase";
import { useOrderDate } from "../../(lib)/OrderDateContext";
import { useToast } from "../../(lib)/ToastContext";
import { auth } from "../../(lib)/firebase";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../(lib)/LanguageContext";

export type CarCategory = "all" | "comfort" | "classic" | "sport" | "family";

export interface Car {
  id: string;
  imageURL?: string;
  img?: string;
  name: string;
  year: string;
  category: string;
  quantity?: number;
  price?: number | string;
  rating?: number;
  ratingCount?: number;
  isUserCar?: boolean;
  userId?: string;
}

function OrderModal({
  car,
  onClose,
  onSuccess,
  onError,
}: {
  car: Car;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const { range } = useOrderDate();
  const { t } = useLanguage();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    let cancelled = false;

    (async () => {
      try {
        const snap = await getDoc(doc(db, "project2", "users", uid));
        const fullName = (snap.exists() ? (snap.data() as any)?.fullName : "") || "";
        if (!cancelled && fullName && !customerName.trim()) setCustomerName(String(fullName));
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const startStr = range.start ? format(range.start, "yyyy-MM-dd") : "";
  const endStr = range.end ? format(range.end, "yyyy-MM-dd") : "";
  const hasDates = !!range.start && !!range.end;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Authentication tekshiruvi
    if (!auth.currentUser) {
      onError(t.auth.pleaseLogin);
      return;
    }
    
    if (!hasDates) {
      onError(t.order.selectDates);
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      onError(t.addCar.required);
      return;
    }
    const qty = car.quantity ?? 1;
    if (qty < 1) {
      onError(t.car.notAvailable);
      return;
    }

    setLoading(true);
    try {
      // Buyurtmalarni saqlash uchun collection
      const ordersRef = collection(db, "project2", "admin", "orders");

      // Car owner email ni olish
      let carOwnerEmail = "";
      if (car.userId) {
        const ownerDoc = await getDoc(doc(db, "users", car.userId));
        if (ownerDoc.exists()) {
          carOwnerEmail = (ownerDoc.data() as any)?.email || "";
        }
      }

      await addDoc(ordersRef, {
        carId: car.id,
        carName: car.name,
        category: car.category,
        carOwnerEmail: carOwnerEmail,
        carOwnerName: userInfo?.fullName || "Mashina egasi",
        customerUid: auth.currentUser?.uid || "",
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: auth.currentUser?.email || "",
        startDate: startStr,
        endDate: endStr,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const newQty = (car.quantity ?? 1) - 1;
      await updateDoc(doc(db, "project2", "admin", "cars", car.id), {
        quantity: newQty,
      });

      onSuccess(t.order.success);
      onClose();
    } catch (err: any) {
      onError(err?.message || t.order.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-slate-800 text-white px-6 py-4 flex justify-between items-center">
          <h3 className="font-bold text-lg">
            {t.order.title} — {car.name}
          </h3>
          <button type="button" onClick={onClose} className="text-white/80 hover:text-white text-xl">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!hasDates ? (
            <p className="text-amber-700 bg-amber-50 px-4 py-3 rounded-xl text-sm">
              {t.order.selectDates}
            </p>
          ) : (
            <div className="bg-slate-100 rounded-xl px-4 py-3 text-slate-700 text-sm">
              <span className="font-medium">{t.order.selectedDates}: </span>
              {format(range.start!, "dd.MM.yyyy")} — {format(range.end!, "dd.MM.yyyy")}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              {t.order.customerName}
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder={t.auth.fullName}
              className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-green-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              {t.order.customerPhone}
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder={t.auth.phone}
              className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-green-500 focus:outline-none"
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={loading || !hasDates}
              className="flex-1 h-11 rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium disabled:opacity-60"
            >
              {loading ? t.common.loading : t.order.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StarRating({ car, onRated }: { car: Car; onRated: () => void }) {
  const rating = car.rating ?? 0;
  const count = car.ratingCount ?? 0;
  const [submitting, setSubmitting] = useState(false);

  const handleRate = async (value: number) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const newCount = count + 1;
      const newRating = (rating * count + value) / newCount;
      await updateDoc(doc(db, "project2", "admin", "cars", car.id), {
        rating: Math.round(newRating * 10) / 10,
        ratingCount: newCount,
      });
      onRated();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleRate(star)}
          disabled={submitting}
          className="text-xl hover:scale-110 transition-transform"
        >
          {star <= rating ? "⭐" : "☆"}
        </button>
      ))}
      {count > 0 && <span className="text-white/60 text-xs ml-1">({count})</span>}
    </div>
  );
}

export default function CarGrid({ category }: { category: CarCategory }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderCar, setOrderCar] = useState<Car | null>(null);
  const [showViewOrderButton, setShowViewOrderButton] = useState<string | null>(null);
  const { showToast } = useToast();
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());

  const handleOrderSuccess = () => {
    setShowViewOrderButton(orderCar?.id || null);
  };

  const handleViewOrder = () => {
    router.push('/dashboard/profil');
  };

  const fetchCars = async () => {
    setLoading(true);
    setError(null);
    try {
      const colRef = collection(db, "project2", "admin", "cars");
      const q =
        category === "all"
          ? colRef
          : query(colRef, where("category", "==", category));
      const snap = await getDocs(q);
      const list = snap.docs.map((docSnap) => ({ 
        id: docSnap.id, 
        ...docSnap.data() 
      } as Car));
      
      list.sort((a, b) => (b.year || "").localeCompare(a.year || ""));
      setCars(list);
    } catch (err: any) {
      setError(err?.message || t.common.error);
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, [category]);

  // Scroll animation uchun observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleCards(prev => new Set(prev).add(index));
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    // Observerni o'rnatish
    const timeoutId = setTimeout(() => {
      const elements = document.querySelectorAll('[data-scroll-card]');
      elements.forEach((el) => observer.observe(el));
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [cars]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl bg-slate-200 dark:bg-slate-800 h-72 flex items-center justify-center">
              <img 
                src="/gif.gif" 
                alt="Loading..." 
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <p className="text-red-600 bg-red-50 dark:bg-red-900/40 rounded-xl px-4 py-3 inline-block">
          {t.common.error}: {error}
        </p>
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center text-slate-500">
        {t.admin.noCars}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 relative">
      {orderCar && (
        <OrderModal
          car={orderCar}
          onClose={() => setOrderCar(null)}
          onSuccess={(msg) => {
            showToast(msg, "success");
            fetchCars();
            handleOrderSuccess();
          }}
          onError={(msg) => showToast(msg, "error")}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 justify-items-center">
        {cars.map((car, index) => {
          const qty = car.quantity ?? 1;
          const isVisible = visibleCards.has(index);
          
          return (
            <article
              key={car.id}
              data-scroll-card
              data-index={index}
              className={`w-full max-w-[340px] h-[420px] bg-gray-50 dark:bg-slate-900/70 mx-auto rounded-3xl p-4 border border-gray-200/60 dark:border-slate-700/80 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{
                transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
                transitionDelay: isVisible ? `${index * 100}ms` : "0ms",
              }}
            >
              {/* Rasm qismi */}
              <div className="relative h-44 overflow-hidden rounded-2xl mb-4 bg-gray-100 dark:bg-slate-800">
                <img
                  src={car.img || car.imageURL || ""}
                  alt={car.name}
                  className="w-full h-full object-cover opacity-95 scale-105 group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>
                <div className="absolute bottom-2 left-2 right-2">
                  <h3 className="text-[#FFD700] font-bold text-xl md:text-2xl drop-shadow">
                    {car.name}
                  </h3>
                </div>
              </div>
              
              {/* Kontent qismi */}
              <div className="flex flex-col h-[calc(100%-11rem)] justify-between">
                {/* Yil va kategoriya */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 dark:text-slate-300 text-xs font-medium bg-white/90 dark:bg-slate-900/80 px-2 py-1 rounded-full border border-gray-200 dark:border-slate-700">
                    {car.year}
                  </span>
                  <span className="text-gray-600 dark:text-slate-300 text-xs font-medium bg-white/90 dark:bg-slate-900/80 px-2 py-1 rounded-full border border-gray-200 dark:border-slate-700">
                    {car.category}
                  </span>
                </div>

                {/* Narx flex holatda */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <p className="text-gray-900 dark:text-slate-50 font-bold text-xl">
                      {typeof car.price === "number" ? car.price.toLocaleString() : car.price}
                    </p>
                    <p className="text-gray-500 dark:text-slate-300 text-sm">
                      {t.car.price} / {t.car.perDay}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        qty > 0 ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></span>
                    <span
                      className={`text-base font-semibold ${
                        qty > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {qty} ×
                    </span>
                  </div>
                </div>

                {/* Reyting */}
                <div>
                  <StarRating car={car} onRated={fetchCars} />
                </div>

                {/* Tugmalar */}
                <div className="flex flex-col mb-4 gap-2 mt-auto">
                  <button
                    type="button"
                    onClick={() => qty > 0 && setOrderCar(car)}
                    disabled={qty < 1}
                    className={`w-full h-8 rounded-md font-medium text-sm transition-all duration-200 ${
                      qty > 0 
                        ? "bg-green-500 hover:bg-green-600 text-white" 
                        : "bg-black cursor-not-allowed text-white font-bold"
                    }`}
                  >
                    {qty > 0 ? t.car.rentCar : t.car.notAvailable}
                  </button>
                  
                  {showViewOrderButton === car.id && (
                    <button
                      type="button"
                      onClick={handleViewOrder}
                      className="w-full h-8 rounded-md bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-all duration-200"
                    >
                      {t.profile.myOrders}
                    </button>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => router.push(`/dashboard/car/${car.id}`)}
                    className="w-full h-8 rounded-md bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-all duration-200"
                  >
                    {t.car.details}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
