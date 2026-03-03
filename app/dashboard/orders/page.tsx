"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../(lib)/firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc,
  increment
} from "firebase/firestore";
import { db } from "../../(lib)/firebase";
import { User, Car, DollarSign, Calendar, Trash2, RotateCcw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useToast } from "../../(lib)/ToastContext";

interface Order {
  id: string;
  carName: string;
  carId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: any;
  updatedAt: string;
  userId?: string; // Mashina egasi
}

const OrdersPage = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      router.push("/dashboard/all");
      return;
    }
    loadUserOrders();
  }, [authReady, user, router]);

  const loadUserOrders = async () => {
    try {
      // Faqat o'zi qo'shgan mashinalaridagi buyurtmalarni olish
      const ordersRef = collection(db, "project2", "admin", "orders");
      
      // Avval o'z mashinalarini topamiz
      const carsQuery = query(
        collection(db, "project2", "admin", "cars"),
        where("userId", "==", user.uid)
      );
      const carsSnap = await getDocs(carsQuery);
      const carIds = carsSnap.docs.map(doc => doc.id);

      if (carIds.length === 0) {
        setUserOrders([]);
        return;
      }

      // O'z mashinalaridagi buyurtmalarni olish
      const ordersQuery = query(
        ordersRef,
        where("carId", "in", carIds)
      );
      const ordersSnap = await getDocs(ordersQuery);
      const ordersList = ordersSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order));

      // Sanab bo'yich saralash
      ordersList.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });

      setUserOrders(ordersList);
    } catch (error) {
      console.error("Error loading orders:", error);
      showToast("Buyurtmalarni yuklashda xatolik", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReturnToSale = async (orderId: string, carId: string) => {
    try {
      // Buyurtma statusini yangilash
      await updateDoc(doc(db, "project2", "admin", "orders", orderId), {
        status: "cancelled",
        updatedAt: new Date()
      });

      // Mashina quantity sini oshirish
      await updateDoc(doc(db, "project2", "admin", "cars", carId), {
        quantity: increment(1)
      });

      setUserOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status: "cancelled" as const }
            : order
        )
      );

      showToast("Mashina sotuvga qaytarildi", "success");
    } catch (error) {
      console.error("Error returning to sale:", error);
      showToast("Xatolik yuz berdi", "error");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Bu buyurtmani o'chirmoqchimisiz?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "project2", "admin", "orders", orderId));
      
      setUserOrders(prev => prev.filter(order => order.id !== orderId));
      
      showToast("Buyurtma o'chirildi", "success");
    } catch (error) {
      console.error("Error deleting order:", error);
      showToast("Xatolik yuz berdi", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-[#FFD700] text-xl">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 px-4 py-8 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/profil"
                className="p-3 bg-white/15 hover:bg-white/25 text-[#FFD700] rounded-xl transition-all duration-300"
              >
                <ArrowLeft size={24} />
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#FFD700] flex items-center gap-2 md:gap-3">
                  <Calendar size={24} className="md:w-8 md:h-8 shrink-0" />
                  Buyurtmalarim
                </h1>
                <p className="text-[#FFD700]/70 mt-1 text-sm md:text-base">Faqat o'zingiz qo'shgan mashinalardagi buyurtmalar</p>
              </div>
            </div>
          </div>
        </div>

        {/* Buyurtmalar ro'yxati */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
          {userOrders.length === 0 ? (
            <div className="text-center py-16">
              <Calendar size={60} className="text-[#FFD700]/50 mx-auto mb-4" />
              <p className="text-[#FFD700]/70 text-xl mb-2">Hozircha buyurtmalar yo'q</p>
              <p className="text-[#FFD700]/50">Siz qo'shgan mashinalarga hech kim buyurtma bermagan</p>
            </div>
          ) : (
            <div className="space-y-6">
              {userOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Car size={24} className="text-[#FFD700]" />
                        <h3 className="text-xl font-bold text-[#FFD700]">{order.carName}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === "pending" 
                            ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                            : order.status === "confirmed"
                            ? "bg-green-500/20 text-green-300 border border-green-500/30"
                            : "bg-red-500/20 text-red-300 border border-red-500/30"
                        }`}>
                          {order.status === "pending" ? "Kutilmoqda" : 
                           order.status === "confirmed" ? "Tasdiqlangan" : "Bekor qilingan"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[#FFD700]/80">
                        <div className="flex items-center gap-2">
                          <User size={16} />
                          <span className="text-sm">{order.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign size={16} />
                          <span className="text-sm">{order.customerPhone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span className="text-sm">Boshlanish: {order.startDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span className="text-sm">Tugash: {order.endDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {order.status !== "cancelled" && (
                        <button
                          onClick={() => handleReturnToSale(order.id, order.carId)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-all duration-300 flex items-center gap-2 text-sm"
                        >
                          <RotateCcw size={16} />
                          Sotuvga qaytarish
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-all duration-300 flex items-center gap-2 text-sm"
                      >
                        <Trash2 size={16} />
                        O'chirish
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
