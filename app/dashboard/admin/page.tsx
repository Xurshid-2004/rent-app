"use client";

// Professional error handling helper
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Noma'lum xatolik yuz berdi";
}

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { db } from "../../(lib)/firebase";
import { collection, addDoc, getDocs, getDoc, query, where, updateDoc, doc, increment, deleteDoc } from "firebase/firestore";
import { useToast } from "../../(lib)/ToastContext";
import { useLanguage } from "../../(lib)/LanguageContext";

type Category = "all" | "comfort" | "classic" | "sport" | "family";

interface Order {
  id: string;
  carName: string;
  carId?: string;
  customerName: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  createdAt?: {
    toMillis?: () => number;
  };
}

interface AdminCar {
  id: string;
  name: string;
  year: string;
  category: string;
  quantity?: number;
  price?: number | string;
  rating?: number;
  ratingCount?: number;
  img?: string;
  imageURL?: string;
  description?: string;
  images?: string[];
  ownerId?: string;
  returnedToSales?: boolean;
  returnedDate?: any;
}

export default function AdminPage() {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [adminCars, setAdminCars] = useState<AdminCar[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [quantity, setQuantity] = useState("1");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState<Category>("all");
  const [editPrice, setEditPrice] = useState("");
  const [confirmKey, setConfirmKey] = useState<string | null>(null);
  const [confirmUntil, setConfirmUntil] = useState<number>(0);

  // Check if car is currently rented
  const isCarRented = (carId: string) => {
    const car = adminCars.find(c => c.id === carId);
    if (!car) return false;
    
    // Agar quantity 0 bo'lsa, ijarada deb hisoblaymiz
    if ((car.quantity ?? 1) === 0) return true;
    
    // Agar returnedToSales true bo'lsa, ijarada emas
    if (car.returnedToSales) return false;
    
    // Buyurtmalarni tekshirish
    return orders.some(order => 
      order.carId === carId || (order.carName && car.name === order.carName)
    );
  };

  // Load orders function
  const loadOrders = async () => {
    try {
      const ordersRef = collection(db, "project2", "admin", "orders");
      const snap = await getDocs(ordersRef);
      const ordersList = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
      ordersList.sort((a, b) => {
        const t1 = a.createdAt?.toMillis?.() ?? 0;
        const t2 = b.createdAt?.toMillis?.() ?? 0;
        return t2 - t1;
      });
      setOrders(ordersList);
    } catch (error: unknown) {
      showToast(getErrorMessage(error), "error");
      setOrders([]);
    }
  };

  const toastConfirm = async (key: string, message: string, action: () => Promise<void>) => {
    const now = Date.now();
    if (confirmKey === key && now < confirmUntil) {
      setConfirmKey(null);
      setConfirmUntil(0);
      await action();
      return;
    }
    setConfirmKey(key);
    setConfirmUntil(now + 3000);
    showToast(message, "warning");
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadAdminCars = async () => {
    try {
      const snap = await getDocs(collection(db, "project2", "admin", "cars"));
      setAdminCars(snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdminCar)));
    } catch {
      setAdminCars([]);
    }
  };

  useEffect(() => {
    loadAdminCars();
  }, []);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const resizeImage = (dataUrl: string, maxW = 800, quality = 0.75): Promise<string> =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > maxW) {
          height = (height * maxW) / width;
          width = maxW;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = dataUrl;
    });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    Array.from(files).forEach((file) => {
      // Rasm turi tekshiruvi
      if (!file.type.startsWith("image/")) {
        showToast(t.admin.imageTypeError, "error");
        return;
      }

      // Rasm hajmi tekshiruvi (1MB dan kichik)
      if (file.size > 1024 * 1024) {
        showToast(`${file.name} rasm hajmi juda katta. Iltimos, 1MB dan kichik rasm tanlang.`, "error");
        return;
      }

      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    if (newFiles.length > 0) {
      setImageFiles(prev => [...prev, ...newFiles]);
      setImagePreviews(prev => [...prev, ...newPreviews]);
      
      // Birinchi rasmni asosiy qilib olish
      if (!imageFile && newFiles.length > 0) {
        setImageFile(newFiles[0]);
        setImagePreview(newPreviews[0]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast(t.admin.nameRequired, "warning");
      return;
    }
    if (!year.trim()) {
      showToast(t.admin.yearRequired, "warning");
      return;
    }
    if (imageFiles.length === 0) {
      showToast(t.admin.imageRequired, "warning");
      return;
    }
    if (!quantity.trim() || Number(quantity) < 1) {
      showToast("Iltimos, to'g'ri miqdor kiriting", "warning");
      return;
    }

    setLoading(true);
    try {
      // Barcha rasmlarni base64 ga o'tkazish
      const base64Images: string[] = [];
      for (const file of imageFiles) {
        let base64 = await fileToBase64(file);
        if (base64.length > 900000) base64 = await resizeImage(base64, 800, 0.7);
        base64Images.push(base64);
      }

      const carsRef = collection(db, "project2", "admin", "cars");
      const sameNameCategory = query(
        carsRef,
        where("name", "==", name.trim()),
        where("category", "==", category)
      );
      const snap = await getDocs(sameNameCategory);

      if (snap.docs.length > 0) {
        const existingDoc = snap.docs[0];
        await updateDoc(doc(db, "project2", "admin", "cars", existingDoc.id), {
          quantity: increment(Number(quantity)),
        });
        showToast(`${Number(quantity)} ta ${name.trim()} ${t.admin.carAdded}`, "success");
        loadAdminCars();
      } else {
        await addDoc(carsRef, {
          img: base64Images[0], // Asosiy rasm
          images: base64Images, // Barcha rasmlar
          name: name.trim(),
          year: year.trim(),
          description: description.trim(),
          category,
          quantity: Number(quantity),
          price: price.trim() ? (isNaN(Number(price)) ? price.trim() : Number(price)) : undefined,
        });
        showToast(`${Number(quantity)} ta ${name.trim()} ${t.admin.carAdded}`, "success");
      }
      
      // Formani tozalash
      setImageFile(null);
      setImagePreview(null);
      setImageFiles([]);
      setImagePreviews([]);
      setName("");
      setYear("");
      setDescription("");
      setPrice("");
      setQuantity("1");
      setCategory("all");
      loadAdminCars();
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error: unknown) {
      showToast(getErrorMessage(error) || t.admin.retryError, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await toastConfirm(
      `delete_admin_car_${id}`,
      t.common.confirmAgain,
      async () => {
        try {
          await deleteDoc(doc(db, "project2", "admin", "cars", id));
          showToast(t.admin.deleted, "success");
          loadAdminCars();
        } catch (error: unknown) {
          showToast(getErrorMessage(error) || t.common.error, "error");
        }
      }
    );
  };

  const handleDeleteOrder = async (id: string) => {
    await toastConfirm(
      `delete_order_${id}`,
      t.admin.deleteOrderConfirm,
      async () => {
        try {
          await deleteDoc(doc(db, "project2", "admin", "orders", id));
          showToast(t.admin.orderDeleted, "success");
          // Buyurtmalarni qayta yuklash
          const loadOrders = async () => {
            try {
              const ordersRef = collection(db, "project2", "admin", "orders");
              const snap = await getDocs(ordersRef);
              const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
              list.sort((a, b) => {
                const t1 = a.createdAt?.toMillis?.() ?? 0;
                const t2 = b.createdAt?.toMillis?.() ?? 0;
                return t2 - t1;
              });
              setOrders(list);
            } catch {
              setOrders([]);
            }
          };
          loadOrders();
        } catch (error: unknown) {
          showToast(getErrorMessage(error) || t.admin.returnError, "error");
        }
      }
    );
  };

  const handleReturnToSales = async (carId: string) => {
    await toastConfirm(
      `return_to_sales_${carId}`,
      t.admin.confirmReturn,
      async () => {
        try {
          // Avval mashina ma'lumotlarini olish
          const carRef = doc(db, "project2", "admin", "cars", carId);
          const carSnap = await getDoc(carRef);
          
          if (carSnap.exists()) {
            const carData = carSnap.data();
            
            // Avval qo'shilgan carni topib o'chirish (agar mavjud bo'lsa)
            const carsRef = collection(db, "project2", "admin", "cars");
            const existingCarQuery = query(carsRef, where("originalCarId", "==", carId));
            const existingCarSnap = await getDocs(existingCarQuery);
            
            if (!existingCarSnap.empty) {
              // Avval qo'shilgan carni o'chirish
              existingCarSnap.docs.forEach(doc => deleteDoc(doc.ref));
            }
            
            // Admin cardini yangilash - quantity ni 1 ga oshirish va returnedToSales ni false qilish
            await updateDoc(carRef, {
              quantity: increment(1), // Sonini oshirish
              returnedToSales: false, // Sotuvga qaytarilganligini bekor qilish
              returnedDate: null // Qaytarilgan vaqtini tozalash
            });
            
            // Faqat shu mashinani local state da yangilash
            setAdminCars(prev => 
              prev.map(car => 
                car.id === carId 
                  ? { ...car, quantity: (car.quantity || 0) + 1, returnedToSales: false, returnedDate: null }
                  : car
              )
            );
            
            showToast(t.admin.returnSuccess, "success");
          }
        } catch (error: unknown) {
          showToast(getErrorMessage(error) || t.admin.returnError, "error");
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Orqa fon effektlari */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-indigo-900/20 animate-pulse"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-black/30 to-transparent"></div>
      
      {/* Asosiy content */}
      <div className="relative z-10">
      <header className="sticky top-0 z-10 border-b border-gray-700 bg-black/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
          <Link href="/dashboard/all" className="text-gray-300 hover:text-[#FFD700] font-medium transition-colors text-sm sm:text-base shrink-0">
            ← {t.common.back}
          </Link>
          <h1 className="text-base sm:text-lg md:text-xl font-bold text-[#FFD700] truncate text-center flex-1 min-w-0">
            {t.admin.title} — {t.admin.addCar}
          </h1>
          <div className="w-16 sm:w-20 shrink-0" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 border border-gray-700/50 shadow-2xl">
            <label className="block text-sm font-bold text-[#FFD700] mb-3 text-lg">{t.admin.image}</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full min-h-[200px] rounded-2xl border-2 border-dashed border-[#FFD700]/50 hover:border-[#FFD700] hover:bg-gradient-to-br hover:from-purple-900/20 hover:to-blue-900/20 transition-all duration-300 flex flex-col items-center justify-center gap-3 text-gray-300 backdrop-blur-sm"
            >
              {imagePreviews.length > 0 ? (
                <div className="w-full">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={preview} 
                          alt={`Preview ${index + 1}`} 
                          className="w-full h-24 object-cover rounded-lg" 
                        />
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setImageFiles(prev => prev.filter((_, i) => i !== index));
                            setImagePreviews(prev => prev.filter((_, i) => i !== index));
                            if (index === 0 && imagePreviews.length > 1) {
                              setImageFile(imageFiles[1] || null);
                              setImagePreview(imagePreviews[1] || null);
                            }
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer w-6 h-6 flex items-center justify-center text-sm font-bold"
                        >
                          ×
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-center text-sm text-gray-400">
                    {imagePreviews.length} ta rasm tanlandi
                  </p>
                </div>
              ) : (
                <>
                  <span className="text-5xl">📷</span>
                  <span className="text-base font-bold text-[#FFD700]">{t.admin.image}</span>
                  <span className="text-sm text-gray-400">Bir nechta rasm tanlang</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 border border-gray-700/50 shadow-2xl">
            <label className="block text-sm font-bold text-[#FFD700] mb-2 sm:mb-3 text-base sm:text-lg">{t.admin.carName}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.admin.carNamePlaceholder}
              className="w-full h-14 px-5 rounded-xl bg-gray-700/50 border-2 border-[#FFD700]/30 focus:border-[#FFD700] focus:outline-none focus:bg-gray-700/70 text-white font-medium placeholder-gray-400 transition-all duration-300 shadow-lg"
            />
          </div>

          <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 border border-gray-700/50 shadow-2xl">
            <label className="block text-sm font-bold text-[#FFD700] mb-2 sm:mb-3 text-base sm:text-lg">{t.admin.year}</label>
            <input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder={t.admin.yearPlaceholder}
              className="w-full h-14 px-5 rounded-xl bg-gray-700/50 border-2 border-[#FFD700]/30 focus:border-[#FFD700] focus:outline-none focus:bg-gray-700/70 text-white font-medium placeholder-gray-400 transition-all duration-300 shadow-lg"
            />
          </div>

          <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 border border-gray-700/50 shadow-2xl">
            <label className="block text-sm font-bold text-[#FFD700] mb-2 sm:mb-3 text-base sm:text-lg">{t.admin.description}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.admin.descriptionPlaceholder}
              rows={4}
              className="w-full px-5 py-4 rounded-xl bg-gray-700/50 border-2 border-[#FFD700]/30 focus:border-[#FFD700] focus:outline-none focus:bg-gray-700/70 text-white font-medium placeholder-gray-400 transition-all duration-300 shadow-lg resize-none"
            />
          </div>

          <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 border border-gray-700/50 shadow-2xl">
            <label className="block text-sm font-bold text-[#FFD700] mb-2 sm:mb-3 text-base sm:text-lg">{t.admin.price}</label>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={t.admin.pricePlaceholder}
              className="w-full h-14 px-5 rounded-xl bg-gray-700/50 border-2 border-[#FFD700]/30 focus:border-[#FFD700] focus:outline-none focus:bg-gray-700/70 text-white font-medium placeholder-gray-400 transition-all duration-300 shadow-lg"
            />
          </div>

          <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 border border-gray-700/50 shadow-2xl">
            <label className="block text-sm font-bold text-[#FFD700] mb-2 sm:mb-3 text-base sm:text-lg">Nechta mashina qo&apos;shmoqchisiz?</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Masalan: 3"
              min="1"
              className="w-full h-14 px-5 rounded-xl bg-gray-700/50 border-2 border-[#FFD700]/30 focus:border-[#FFD700] focus:outline-none focus:bg-gray-700/70 text-white font-medium placeholder-gray-400 transition-all duration-300 shadow-lg"
            />
          </div>

          <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 border border-gray-700/50 shadow-2xl">
            <label className="block text-sm font-bold text-[#FFD700] mb-2 sm:mb-3 text-base sm:text-lg">{t.admin.category}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full h-14 px-5 rounded-xl bg-gray-700/50 border-2 border-[#FFD700]/30 focus:border-[#FFD700] focus:outline-none focus:bg-gray-700/70 text-white font-medium transition-all duration-300 shadow-lg"
            >
              <option value="all">All</option>
              <option value="comfort">Comfort</option>
              <option value="classic">Classic</option>
              <option value="sport">Sport</option>
              <option value="family">Family</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-gradient-to-r from-[#FFD700] to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 disabled:opacity-60 text-black font-bold text-lg rounded-xl transition-all duration-300 shadow-2xl hover:shadow-3xl active:scale-[0.98] transform hover:scale-105"
          >
            {loading ? t.admin.saving : t.common.save}
          </button>
        </form>

        <section className="mt-10 sm:mt-16">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#FFD700] mb-4 sm:mb-6 md:mb-8 text-center">{t.admin.myCars}</h2>
          {adminCars.length === 0 ? (
            <p className="text-gray-400 text-base sm:text-lg text-center">{t.admin.noCars}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {adminCars.map((car) => (
                <div
                  key={car.id}
                  className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-lg rounded-2xl overflow-hidden shadow-xl border border-gray-700/50 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-700 to-gray-800">
                    <img
                      src={car.img || car.imageURL || ""}
                      alt={car.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-[#FFD700] text-base lg:text-lg">{car.name}</h3>
                      {isCarRented(car.id) && (
                        <h4 className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                          Ijarada
                        </h4>
                      )}
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{car.year} yil • {car.category}</p>
                    {car.price != null && (
                      <p className="text-green-400 font-bold text-sm mb-2">
                        {typeof car.price === "number" ? car.price.toLocaleString() : car.price}{" so'm"} / kun
                      </p>
                    )}
                    <div className="flex items-center gap-1 mb-2 text-yellow-400 text-sm">
                      {"★".repeat(Math.round(car.rating ?? 0))}
                      {"☆".repeat(5 - Math.round(car.rating ?? 0))}
                      {car.ratingCount != null && car.ratingCount > 0 && (
                        <span className="text-gray-400 text-xs">({car.ratingCount})</span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{t.admin.available.replace('{count}', String(car.quantity ?? 0))}</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditId(car.id);
                          setEditName(car.name);
                          setEditYear(car.year);
                          setEditDescription(car.description || "");
                          setEditCategory(car.category as Category);
                          setEditPrice(car.price != null ? String(car.price) : "");
                        }}
                        className="flex-1 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold text-sm transition-all duration-300 shadow-lg"
                      >
                        {t.common.edit}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(car.id)}
                        className="flex-1 h-10 rounded-lg bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold text-sm transition-all duration-300 shadow-lg"
                      >
                        {t.common.delete}
                      </button>
                    </div>
                    {isCarRented(car.id) && (
                      <button
                        type="button"
                        onClick={() => handleReturnToSales(car.id)}
                        className="w-full h-10 mt-2 rounded-lg bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold text-sm transition-all duration-300 shadow-lg"
                      >
                        {t.admin.returnToSales}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {editId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 overflow-y-auto">
            <div className="bg-white w-full max-w-md rounded-2xl p-5 sm:p-6 shadow-xl my-4">
              <h3 className="font-bold text-lg text-slate-800 mb-4">{t.admin.editTitle}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1">{t.admin.carName}</label>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border-2 border-slate-300 focus:border-blue-600 focus:outline-none font-bold text-slate-900 text-base placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1">{t.admin.year}</label>
                  <input
                    value={editYear}
                    onChange={(e) => setEditYear(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border-2 border-slate-300 focus:border-blue-600 focus:outline-none font-bold text-slate-900 text-base placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1">{t.admin.description}</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder={t.admin.descriptionPlaceholder}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-blue-600 focus:outline-none resize-none font-bold text-slate-900 text-base placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1">{t.admin.price}</label>
                  <input
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border-2 border-slate-300 focus:border-blue-600 focus:outline-none font-bold text-slate-900 text-base placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1">Kategoriya</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as Category)}
                    className="w-full h-12 px-4 rounded-xl border-2 border-slate-300 focus:border-blue-600 focus:outline-none bg-white font-bold text-slate-900 text-base"
                  >
                    <option value="all">All</option>
                    <option value="comfort">Comfort</option>
                    <option value="classic">Classic</option>
                    <option value="sport">Sport</option>
                    <option value="family">Family</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditId(null)}
                  className="flex-1 h-11 rounded-xl border-2 border-slate-300 text-slate-700 font-medium"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await updateDoc(doc(db, "project2", "admin", "cars", editId), {
                        name: editName.trim(),
                        year: editYear.trim(),
                        description: editDescription.trim(),
                        category: editCategory,
                        price: isNaN(Number(editPrice)) ? editPrice.trim() : Number(editPrice),
                      });
                      showToast(t.admin.saved, "success");
                      setEditId(null);
                      loadAdminCars();
                    } catch (error: unknown) {
                      showToast(getErrorMessage(error) || t.common.error, "error");
                    }
                  }}
                  className="flex-1 h-11 rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium"
                >
                  {t.common.save}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Buyurtmalar — admin uchun xabarlar */}
        <section className="mt-10 sm:mt-16 pt-6 sm:pt-10 border-t border-gray-700">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#FFD700] mb-4 sm:mb-6 md:mb-8 text-center">{t.admin.orders}</h2>
          {orders.length === 0 ? (
            <p className="text-gray-400 text-lg text-center">Hali buyurtma {`yo'q`}.</p>
          ) : (
            <ul className="space-y-4">
              {orders.map((o) => (
                <li
                  key={o.id}
                  className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-lg rounded-2xl p-4 sm:p-5 md:p-6 shadow-xl border border-gray-700/50"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-base sm:text-lg">
                        <span className="text-green-400">{o.customerName}</span> {t.admin.customerName} {" "}
                        <span className="font-bold text-[#FFD700]">{o.carName}</span> {t.admin.customerBought}
                      </p>
                      <p className="text-gray-300 text-base mt-2">{t.admin.customerPhone.replace('{phone}', o.customerPhone)}</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {t.admin.dates.replace('{start}', o.startDate).replace('{end}', o.endDate)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteOrder(o.id)}
                      className="sm:ml-4 h-10 w-10 shrink-0 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold transition-all duration-300 shadow-lg flex items-center justify-center"
                      title={t.admin.deleteOrderConfirm}
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      </div>
    </div>
  );
}
