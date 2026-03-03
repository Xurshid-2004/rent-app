"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../(lib)/firebase";
import { signOut, onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc,
  deleteDoc, 
  doc, 
  updateDoc
} from "firebase/firestore";
import { db } from "../../(lib)/firebase";
import { User, Edit, Trash2, Car, DollarSign, Calendar, X } from "lucide-react";
import Link from "next/link";
import { useToast } from "../../(lib)/ToastContext";
import { downloadOrderPdf } from "../../(lib)/pdf";
import { useLanguage } from "../../(lib)/LanguageContext";

interface UserCar {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  userId: string;
  userEmail: string;
  createdAt: string;
}

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
}

interface RentalOrder {
  id: string;
  carName: string;
  carId: string;
  carOwnerEmail: string;
  carOwnerName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: any;
  updatedAt: string;
}

const ProfilePage = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [userCars, setUserCars] = useState<UserCar[]>([]);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [rentalOrders, setRentalOrders] = useState<RentalOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [editCar, setEditCar] = useState<UserCar | null>(null);
  const [editForm, setEditForm] = useState<Partial<UserCar>>({});
  const [confirmKey, setConfirmKey] = useState<string | null>(null);
  const [confirmUntil, setConfirmUntil] = useState<number>(0);
  const [userInfo, setUserInfo] = useState<any>(null);

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
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      router.push("/dashboard/all");
      return;
    }
    loadUserData(user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, user, router]);

  const loadUserData = async (u: FirebaseUser) => {

    try {
      const toMs = (v: any) => {
        if (!v) return 0;
        if (typeof v?.toDate === "function") return v.toDate().getTime();

        if (v instanceof Date) return v.getTime();
        if (typeof v === "number") return v;
        if (typeof v === "string") {
          const d = new Date(v);
          return Number.isNaN(d.getTime()) ? 0 : d.getTime();
        }
        return 0;
      };

      const userDoc = await getDoc(doc(db, "users", u.uid));
      if (userDoc.exists()) {
        setUserInfo(userDoc.data());
      } else {
        setUserInfo(null);
      }

      // User mashinalarini Firebase dan yuklash
      const carsQuery = query(
        collection(db, "project2", "admin", "cars"),
        where("userId", "==", u.uid)
      );
      const carsSnapshot = await getDocs(carsQuery);
      const carsList = carsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as UserCar));
      carsList.sort((a: any, b: any) => toMs(b.createdAt) - toMs(a.createdAt));
      setUserCars(carsList);

      // User buyurtmalarini Firebase dan yuklash
      const ordersRef = collection(db, "project2", "admin", "orders");
      const uid = u.uid;
      const email = u.email || "";

      const [byUidSnap, byEmailSnap] = await Promise.all([
        getDocs(query(ordersRef, where("customerUid", "==", uid))),
        email ? getDocs(query(ordersRef, where("customerEmail", "==", email))) : Promise.resolve(null as any),
      ]);

      const merged = new Map<string, Order>();
      (byUidSnap?.docs || []).forEach((d: any) => {
        merged.set(d.id, { id: d.id, ...(d.data() as any) } as Order);
      });
      (byEmailSnap?.docs || []).forEach((d: any) => {
        if (!merged.has(d.id)) merged.set(d.id, { id: d.id, ...(d.data() as any) } as Order);
      });

      const ordersList = Array.from(merged.values());
      ordersList.sort((a: any, b: any) => toMs(b.createdAt) - toMs(a.createdAt));
      setUserOrders(ordersList);

      // Ijaraga berilgan mashinalar buyurtmalarini yuklash
      const rentalOrdersQuery = query(
        collection(db, "project2", "admin", "orders"),
        where("carOwnerEmail", "==", u.email)
      );
      const rentalOrdersSnapshot = await getDocs(rentalOrdersQuery);
      const rentalOrdersList = rentalOrdersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as RentalOrder));
      rentalOrdersList.sort((a: any, b: any) => toMs(b.createdAt) - toMs(a.createdAt));
      setRentalOrders(rentalOrdersList);

    } catch (error) {
      console.error("Error loading user data:", error);
      showToast(t.profile.dataLoadError, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCar = async (carId: string) => {
    await toastConfirm(
      `delete_car_${carId}`,
      t.common.confirmAgain,
      async () => {
        try {
          await deleteDoc(doc(db, "project2", "admin", "cars", carId));
          setUserCars((prev) => prev.filter((car) => car.id !== carId));
          showToast(t.profile.carDeleted, "success");
        } catch (error) {
          console.error("Error deleting car:", error);
          showToast(t.profile.carDeleteError, "error");
        }
      }
    );
  };

  const handleEditCar = (car: UserCar) => {
    setEditCar(car);
    setEditForm({
      name: car.name,
      description: car.description,
      price: car.price,
      category: car.category
    });
  };

  const handleSaveEdit = async () => {
    if (!editCar) return;

    try {
      const carRef = doc(db, "project2", "admin", "cars", editCar.id);
      await updateDoc(carRef, {
        ...editForm,
        updatedAt: new Date()
      });

      setUserCars((prev) =>
        prev.map((car) =>
          car.id === editCar.id ? { ...car, ...editForm } : car
        )
      );

      setEditCar(null);
      setEditForm({});
      showToast(t.profile.carUpdated, "success");
    } catch (error) {
      console.error("Error updating car:", error);
      showToast(t.profile.carUpdateError, "error");
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    await toastConfirm(
      `cancel_order_${orderId}`,
      t.common.confirmAgain,
      async () => {
        try {
          const orderRef = doc(db, "project2", "admin", "orders", orderId);
          await updateDoc(orderRef, {
            status: "cancelled",
            updatedAt: new Date(),
          });

          setUserOrders((prev) =>
            prev.map((order) =>
              order.id === orderId ? { ...order, status: "cancelled" as const } : order
            )
          );

          showToast(t.profile.orderCancelled, "success");
        } catch (error) {
          console.error("Error cancelling order:", error);
          showToast(t.profile.orderCancelError, "error");
        }
      }
    );
  };

  const handleDeleteOrder = async (orderId: string) => {
    await toastConfirm(
      `delete_order_${orderId}`,
      "Buyurtmani o&apos;chirishni tasdiqlaysizmi?",
      async () => {
        try {
          await deleteDoc(doc(db, "project2", "admin", "orders", orderId));
          setUserOrders((prev) => prev.filter((order) => order.id !== orderId));
          showToast("Buyurtma o&apos;chirildi", "success");
        } catch (error) {
          console.error("Error deleting order:", error);
          showToast("Buyurtmani o&apos;chirishda xatolik", "error");
        }
      }
    );
  };

  const handleReturnToSale = async (carId: string) => {
    await toastConfirm(
      `return_car_${carId}`,
      "Mashinani sotuvga qaytarishni tasdiqlaysizmi?",
      async () => {
        try {
          // Mashinani sotuvga qaytarish - isUserCar ni false qilish
          const carRef = doc(db, "project2", "admin", "cars", carId);
          await updateDoc(carRef, {
            isUserCar: false,
            updatedAt: new Date()
          });

          // UserCars listidan olib tashlash
          setUserCars((prev) => prev.filter((car) => car.id !== carId));
          
          showToast("Mashina sotuvga qaytarildi", "success");
          
          // 2 soniyadan keyin sotuv qismiga yo'naltirish
          setTimeout(() => {
            router.push("/dashboard/all");
          }, 2000);
        } catch (error) {
          console.error("Error returning car to sale:", error);
          showToast("Sotuvga qaytarishda xatolik", "error");
        }
      }
    );
  };

  const handleRejectRental = async (orderId: string) => {
    await toastConfirm(
      `reject_rental_${orderId}`,
      "Ijarani rad etishni tasdiqlaysizmi?",
      async () => {
        try {
          const orderRef = doc(db, "project2", "admin", "orders", orderId);
          await updateDoc(orderRef, {
            status: "cancelled",
            updatedAt: new Date(),
          });

          // Rental orders listidan olib tashlash
          setRentalOrders((prev) => prev.filter((order) => order.id !== orderId));
          
          showToast("Ijara rad etildi", "success");
        } catch (error) {
          console.error("Error rejecting rental:", error);
          showToast("Ijarani rad etishda xatolik", "error");
        }
      }
    );
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showToast(t.common.loggedOut, "success");
      router.push("/dashboard/all");
    } catch (e: any) {
      showToast(e?.message || t.common.logoutError, "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center">
        <div className="text-[#FFD700] text-lg sm:text-xl">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 px-3 sm:px-4 py-6 sm:py-8 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-slate-800/60 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 md:p-8 border border-white/10 mb-6 sm:mb-8">
          <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shrink-0">
                <User className="w-7 h-7 sm:w-10 sm:h-10 text-amber-300" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#FFD700] truncate">{t.profile.title}</h1>
                <p className="text-amber-200/90 text-sm sm:text-base md:text-lg font-medium truncate">{userInfo?.fullName || "Foydalanuvchi"}</p>
                <p className="text-amber-200/70 text-xs sm:text-sm truncate">{auth.currentUser?.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3 md:justify-end">
              <Link
                href="/dashboard/orders"
                className="px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-indigo-600 hover:bg-indigo-500 text-amber-100 font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 text-sm sm:text-base"
              >
                {t.profile.myOrders}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-slate-700/80 hover:bg-slate-600/80 text-amber-100 font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 border border-white/10 text-sm sm:text-base"
              >
                {t.common.loggedOut}
              </button>
              <Link
                href="/dashboard/add-car"
                className="px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-500 text-amber-100 font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 text-sm sm:text-base"
              >
                {t.nav.addCar}
              </Link>
            </div>
          </div>
        </div>

        {/* Mening mashinalarim */}
        <div className="bg-slate-800/60 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 md:p-8 border border-white/10 mb-6 sm:mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-[#FFD700] mb-6 flex items-center gap-3">
            <Car size={24} className="md:w-7 md:h-7 shrink-0" />
            {t.profile.myCars}
          </h2>
          
          {userCars.length === 0 ? (
            <div className="text-center py-12">
              <Car size={60} className="text-[#FFD700]/50 mx-auto mb-4" />
              <p className="text-[#FFD700]/70 text-lg">{t.profile.noCars}</p>
              <Link
                href="/dashboard/add-car"
                className="inline-block mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-[#FFD700] font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
              >
                {t.profile.addFirstCar}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userCars.map((car) => (
                <div key={car.id} className="bg-slate-800/50 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10 hover:border-amber-400/40 transition-all duration-300 shadow-lg">
                  {/* Mashina rasmi */}
                  <div className="relative aspect-video overflow-hidden">
                    {car.images && car.images.length > 0 ? (
                      <img
                        src={car.images[0]}
                        alt={car.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                        <Car size={40} className="text-gray-500" />
                      </div>
                    )}
                  </div>
                  
                  {/* Mashina ma'lumotlari */}
                  <div className="p-4">
                    <h3 className="text-[#FFD700] font-bold text-lg mb-2">{car.name}</h3>
                    <p className="text-[#FFD700]/70 text-sm mb-3 line-clamp-2">{car.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[#FFD700] font-bold text-xl">
                        {typeof car.price === "number" ? car.price.toLocaleString() : car.price}{" so'm"}
                      </span>
                      <span className="text-[#FFD700]/70 text-sm bg-white/10 px-3 py-1 rounded-full">
                        {car.category}
                      </span>
                    </div>
                    
                    {/* Tugmalar */}
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditCar(car)}
                          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-[#FFD700] font-medium rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <Edit size={16} />
                          {t.common.edit}
                        </button>
                        <button
                          onClick={() => handleDeleteCar(car.id)}
                          className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-[#FFD700] font-medium rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <Trash2 size={16} />
                          {t.common.delete}
                        </button>
                      </div>
                      <button
                        onClick={() => handleReturnToSale(car.id)}
                        className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-[#FFD700] font-medium rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <DollarSign size={16} />
                        {t.admin.returnToSales}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
     

        {/* Ijaraga berilgan mashinalar */}
        <div className="bg-slate-800/60 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 md:p-8 border border-white/10 mb-6 sm:mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-[#FFD700] mb-6 flex items-center gap-3">
            <DollarSign size={24} className="md:w-7 md:h-7 shrink-0" />
            {t.profile.myRentalCars}
          </h2>
          
          {rentalOrders.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign size={60} className="text-[#FFD700]/50 mx-auto mb-4" />
              <p className="text-[#FFD700]/70 text-lg">{t.profile.noRentalCars}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rentalOrders.map((order) => (
                <div key={order.id} className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-4 sm:p-5 md:p-6 border border-white/10 hover:border-amber-400/30 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-amber-100 font-bold text-base sm:text-lg">{order.carName}</h3>
                      <p className="text-amber-200/80 text-sm">{order.startDate} — {order.endDate}</p>
                      <p className="text-amber-200/60 text-sm mt-1">Ijarachi: {order.customerName}</p>
                      <p className="text-amber-200/60 text-sm">Tel: {order.customerPhone}</p>
                      <p className="text-amber-200/60 text-sm truncate">Email: {order.customerEmail}</p>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2 shrink-0">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                        order.status === "confirmed" ? "bg-emerald-600/90 text-amber-100" :
                        order.status === "cancelled" ? "bg-red-600/90 text-amber-100" :
                        "bg-amber-600/80 text-slate-900"
                      }`}>
                        {order.status === 'confirmed' ? t.profile.confirmed :
                         order.status === 'cancelled' ? t.profile.cancelled : t.profile.pending}
                      </span>
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleRejectRental(order.id)}
                          className="ml-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-[#FFD700] rounded-lg transition-colors text-sm"
                        >
                          {t.profile.rejectRental}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mening buyurtmalarim */}
        <div className="bg-slate-800/60 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 md:p-8 border border-white/10">
          <h2 className="text-xl md:text-2xl font-bold text-[#FFD700] mb-6 flex items-center gap-3">
            <Calendar size={24} className="md:w-7 md:h-7 shrink-0" />
            {t.profile.myOrders}
          </h2>
          
          {userOrders.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={60} className="text-[#FFD700]/50 mx-auto mb-4" />
              <p className="text-[#FFD700]/70 text-lg">{t.profile.noOrders}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userOrders.map((order) => (
                <div key={order.id} className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-4 sm:p-5 md:p-6 border border-white/10 hover:border-amber-400/30 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-amber-100 font-bold text-base sm:text-lg">{order.carName}</h3>
                      <p className="text-amber-200/80 text-sm">{order.startDate} — {order.endDate}</p>
                      <p className="text-amber-200/60 text-sm mt-1">Tel: {order.customerPhone}</p>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2 shrink-0">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                        order.status === "confirmed" ? "bg-emerald-600/90 text-amber-100" :
                        order.status === "cancelled" ? "bg-red-600/90 text-amber-100" :
                        "bg-amber-600/80 text-slate-900"
                      }`}>
                        {order.status === 'confirmed' ? t.profile.confirmed :
                         order.status === 'cancelled' ? t.profile.cancelled : t.profile.pending}
                      </span>
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="ml-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-[#FFD700] rounded-lg transition-colors text-sm"
                        >
                          {t.profile.cancelOrder}
                        </button>
                      )}
                    </div>
                  </div>



                  <div className="mt-4 flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => downloadOrderPdf(order)}
                      className="px-4 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-amber-100 rounded-lg transition-colors border border-white/10"
                    >
                      PDF yuklab olish
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="w-full sm:w-[130px] h-10 bg-slate-800 text-amber-100 rounded-xl active:scale-95 hover:bg-red-600 transition-colors font-medium text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit modal */}
      {editCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-800">{t.admin.editTitle}</h3>
              <button
                onClick={() => setEditCar(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.car.name}</label>
                <input
                  value={editForm.name || ""}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.car.description}</label>
                <textarea
                  value={editForm.description || ""}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full h-24 px-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.car.price} ({"so'm"})</label>
                <input
                  type="number"
                  value={editForm.price || ""}
                  onChange={(e) => setEditForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                  className="w-full h-11 px-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.car.category}</label>
                <select
                  value={editForm.category || ""}
                  onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none bg-white"
                >
                  <option value="family">Family</option>
                  <option value="comfort">Comfort</option>
                  <option value="sport">Sport</option>
                  <option value="classic">Classic</option>
                  <option value="business">Business</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditCar(null)}
                className="flex-1 h-11 rounded-xl border-2 border-gray-300 text-gray-700 font-medium"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-[#FFD700] font-medium"
              >
                {t.common.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;