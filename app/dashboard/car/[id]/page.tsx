"use client";

import  { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../(lib)/firebase";
import { ArrowLeft, Calendar, DollarSign, User, Star, Phone, Mail } from "lucide-react";
import Image from "next/image";

interface Car {
  id: string;
  name: string;
  year: string;
  category: string;
  price?: number | string;
  description?: string;
  img?: string;
  imageURL?: string;
  images?: string[];
  quantity?: number;
  rating?: number;
  ratingCount?: number;
  ownerId?: string;
  userEmail?: string;
}

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchCar = async () => {
      if (!params.id) return;

      try {
        // Avval Firebase&apos;dan qidiramiz
        const docRef = doc(db, "project2", "admin", "cars", params.id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setCar({ id: docSnap.id, ...docSnap.data() } as Car);
        } else {
          // Agar Firebase&apos;da bo&apos;lmasa, localStorage dan qidiramiz
          const userCars = JSON.parse(localStorage.getItem("userCars") || "[]");
          const foundCar = userCars.find((c: Car) => c.id === params.id);
          
          if (foundCar) {
            setCar(foundCar);
          } else {
            setError("Mashina topilmadi");
          }
        }
      } catch (err) {
        // Firebase xatolik bo&apos;lsa, localStorage dan qidiramiz
        try {
          const userCars = JSON.parse(localStorage.getItem("userCars") || "[]");
          const foundCar = userCars.find((c: Car) => c.id === params.id);
          
          if (foundCar) {
            setCar(foundCar);
          } else {
            setError("Mashina topilmadi");
          }
        } catch {
          setError("Ma&apos;lumotlarni yuklashda xatolik");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-[#FFD700] text-xl">Yuklanmoqda...</div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-[#FFD700] text-2xl font-bold mb-4">Xatolik</h1>
          <p className="text-[#FFD700]/70 mb-6">{error || "Mashina topilmadi"}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-[#FFD700] rounded-xl transition-colors"
          >
            Orqaga qaytish
          </button>
        </div>
      </div>
    );
  }

  const images = car.images || [car.img || car.imageURL || ""];
  const currentImage = images[currentImageIndex] || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      {/* Orqa fon dekoratsiyalari */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 blur-3xl rounded-full"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/10 backdrop-blur-lg border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-[#FFD700] hover:text-blue-300 transition-colors"
            >
              <ArrowLeft size={20} />
              Orqaga qaytish
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chap tomon - Rasmlar */}
            <div className="space-y-4">
              {/* Asosiy rasm */}
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-black/20 border border-white/20">
                <Image
                  src={currentImage}
                  alt={car.name}
                  fill
                  className="object-cover"
                />
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex ? "bg-white" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Kichik rasmlar */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? "border-blue-400 scale-105"
                          : "border-white/20 hover:border-white/40"
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${car.name} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* O&apos;ng tomon - Ma&apos;lumotlar */}
            <div className="space-y-6">
              {/* Mashina nomi va asosiy ma&apos;lumotlar */}
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#FFD700] mb-4">{car.name}</h1>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-blue-400" size={20} />
                    <div>
                      <p className="text-[#FFD700]/60 text-sm">Yil</p>
                      <p className="text-[#FFD700] font-semibold">{car.year}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <DollarSign className="text-green-400" size={20} />
                    <div>
                      <p className="text-[#FFD700]/60 text-sm">Narx</p>
                      <p className="text-green-400 font-bold text-xl">
                        {typeof car.price === "number" ? car.price.toLocaleString() : car.price} so&apos;m
                      </p>
                    </div>
                  </div>
                </div>

                {car.description && (
                  <div className="mb-6">
                    <h3 className="text-[#FFD700] font-semibold mb-2">Tavsifi</h3>
                    <p className="text-[#FFD700]/80 leading-relaxed">{car.description}</p>
                  </div>
                )}

                <div className="flex items-center gap-4 mb-6">
                  <span className="text-[#FFD700]/60 text-sm bg-white/10 px-3 py-1 rounded-full">
                    {car.category}
                  </span>
                  <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                    (car.quantity ?? 0) > 0 
                      ? "bg-green-500/20 text-green-400 border border-green-400/30" 
                      : "bg-red-500/20 text-red-400 border border-red-400/30"
                  }`}>
                    {(car.quantity ?? 0) > 0 ? `Mavjud: ${car.quantity} ta` : "Mavjud emas"}
                  </span>
                </div>

                {car.rating && (
                  <div className="flex items-center gap-2 mb-6">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={20}
                          className={star <= car.rating! ? "text-yellow-400 fill-yellow-400" : "text-[#FFD700]/30"}
                        />
                      ))}
                    </div>
                    <span className="text-[#FFD700]/80">
                      {car.rating} ({car.ratingCount || 0} ta baho)
                    </span>
                  </div>
                )}

                {(car.quantity ?? 0) > 0 && (
                  <button
                    onClick={() => router.push(`/dashboard/all?order=${car.id}`)}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-[#FFD700] font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
                  >
                    🚗 Ijaraga olish
                  </button>
                )}
              </div>

              {/* Agar bu foydalanuvchi mashinasi bo&apos;lsa */}
              {car.userEmail && (
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
                  <h3 className="text-[#FFD700] font-semibold mb-4 flex items-center gap-2">
                    <User size={20} />
                    Egasi haqida
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="text-[#FFD700]/60" size={16} />
                      <span className="text-[#FFD700]/80">{car.userEmail}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
