"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../(lib)/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc, increment } from "firebase/firestore";
import { db } from "../../(lib)/firebase";
import { Upload, X, Car, DollarSign, Tag } from "lucide-react";
import Image from "next/image";
import { useToast } from "../../(lib)/ToastContext";
import { useLanguage } from "../../(lib)/LanguageContext";

interface CarData {
  name: string;
  description: string;
  price: string; // number dan string ga o'zgartiramiz
  category: string;
  images: string[];
  userId: string;
  userEmail: string;
  quantity: number;
}

const AddCarPage = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [carData, setCarData] = useState<CarData>({
    name: "",
    description: "",
    price: "", // 0 o'rniga bo'sh string
    category: "family",
    images: [],
    userId: "",
    userEmail: "",
    quantity: 1
  });

  const categories = [
    { value: "family", label: t.nav.family },
    { value: "comfort", label: t.nav.comfort },
    { value: "sport", label: t.nav.sport },
    { value: "classic", label: t.nav.classic },
    { value: "business", label: "Business" }
  ];

  useEffect(() => {
    if (!auth.currentUser) {
      router.push("/dashboard/all");
      return;
    }
    
    setCarData(prev => ({
      ...prev,
      userId: auth.currentUser?.uid || "",
      userEmail: auth.currentUser?.email || ""
    }));
  }, [router]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    let processedFiles = 0;

    Array.from(files).forEach((file) => {
      // Rasm hajmini tekshirish (1MB dan kichik)
      if (file.size > 1024 * 1024) {
        showToast(`${file.name} rasm hajmi juda katta. Iltimos, 1MB dan kichik rasm tanlang.`, "error");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          // Base64 uzunligini tekshirish
          const base64String = event.target.result as string;
          if (base64String.length > 1048487) {
            showToast(`${file.name} rasm hajmi juda katta. Iltimos, kichikroq rasm tanlang.`, "error");
            return;
          }

          newImages.push(base64String);
          processedFiles++;
          
          if (processedFiles === Array.from(files).filter(f => f.size <= 1024 * 1024).length) {
            setCarData(prev => ({
              ...prev,
              images: [...prev.images, ...newImages]
            }));
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setCarData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!auth.currentUser) {
        showToast("Iltimos, avval ro'yxatdan o'ting!", "error");
        return;
      }

      
      if (carData.images.length === 0) {
        showToast("Iltimos, kamida bitta rasm yuklang", "error");
        setLoading(false);
        return;
      }

      // Bir xil mashinalarni tekshirish
      const carsCollection = collection(db, "project2", "admin", "cars");
      const sameNameCategory = query(
        carsCollection,
        where("name", "==", carData.name.trim()),
        where("category", "==", carData.category)
      );
      const snap = await getDocs(sameNameCategory);

      if (snap.docs.length > 0) {
        // Mavjud mashinani yangilash
        const existingDoc = snap.docs[0];
        await updateDoc(doc(db, "project2", "admin", "cars", existingDoc.id), {
          quantity: increment(1),
        });
        showToast(`${carData.name} qo'shildi`, "success");
      } else {
        // Yangi mashina qo'shish
        const carDoc = {
          name: carData.name,
          description: carData.description,
          price: Number(carData.price) || 0, // string ni number ga o'tkazamiz
          category: carData.category,
          img: carData.images[0] || "", // Asosiy rasm
          images: carData.images, // Barcha rasmlar
          year: "2024",
          quantity: 1, // Har doim 1 ta mashina
          rating: 0,
          ratingCount: 0,
          userId: auth.currentUser.uid,
          userEmail: auth.currentUser.email,
          isUserCar: true, // Foydalanuvchi mashinasini belgilash uchun
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(carsCollection, carDoc);
        showToast(`${carData.name} qo'shildi`, "success");
      }
      
      // Formani tozalash
      setCarData({
        name: "",
        description: "",
        price: "",
        category: "family",
        images: [],
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email || "",
        quantity: 1
      });
      
      // 2 soniyadan keyin sotuv qismiga yo'naltirish
      setTimeout(() => {
        router.push("/dashboard/all");
      }, 2000);
      
    } catch (error) {
      console.error("Error adding car:", error);
      showToast("Xatolik yuz berdi. Qaytadan urinib ko'ring.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!auth.currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 px-4 py-8 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-[#16181d] to-[#0a0b0d] backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-yellow-500/30">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-yellow-400 mb-6 md:mb-8 text-center flex items-center justify-center gap-2 md:gap-3">
            <Car size={28} className="md:w-10 md:h-10 shrink-0" />
            {t.nav.addCar}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mashina nomi */}
            <div>
              <label className="block text-yellow-400 font-medium mb-2 flex items-center gap-2">
                <Car size={20} />
                {t.car.name}
              </label>
              <input
                type="text"
                value={carData.name}
                onChange={(e) => setCarData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-yellow-500/30 text-yellow-400 placeholder-yellow-600/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder={t.car.name + "..."}
                required
              />
            </div>

            {/* Mashina haqida ma'lumot */}
            <div>
              <label className="block text-yellow-400 font-medium mb-2">
                {t.car.description}
              </label>
              <textarea
                value={carData.description}
                onChange={(e) => setCarData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-yellow-500/30 text-yellow-400 placeholder-yellow-600/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent h-32 resize-none"
                placeholder={t.car.description + "..."}
                required
              />
            </div>

            {/* Narx */}
            <div>
              <label className="block text-yellow-400 font-medium mb-2 flex items-center gap-2">
                <DollarSign size={20} />
                {t.car.price} ({t.car.perDay})
              </label>
              <input
                type="number"
                value={carData.price}
                onChange={(e) => setCarData(prev => ({ ...prev, price: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-yellow-500/30 text-yellow-400 placeholder-yellow-600/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder={t.car.price + "..."}
                min="0"
                required
              />
            </div>

            {/* Kategoriya */}
            <div>
              <label className="block text-yellow-400 font-medium mb-2 flex items-center gap-2">
                <Tag size={20} />
                {t.car.category}
              </label>
              <select
                value={carData.category}
                onChange={(e) => setCarData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-yellow-500/30 text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value} className="bg-[#16181d]">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            
            {/* Rasm yuklash */}
            <div>
              <label className="block text-yellow-400 font-medium mb-2 flex items-center gap-2">
                <Upload size={20} />
                Rasmlar
              </label>
              <div className="border-2 border-dashed border-yellow-500/30 rounded-xl p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center gap-2 text-yellow-600/70 hover:text-yellow-400 transition-colors"
                >
                  <Upload size={40} />
                  <span>Rasmlarni tanlang</span>
                  <span className="text-sm">Bir nechta rasm tanlashingiz mumkin</span>
                </label>
              </div>

              {/* Rasm preview */}
              {carData.images.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {carData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={image}
                        alt={`Car image ${index + 1}`}
                        width={200}
                        height={150}
                        className="w-full h-32 object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-yellow-400 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit tugmasi */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-yellow-100 font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t.common.loading : t.nav.addCar}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCarPage;
