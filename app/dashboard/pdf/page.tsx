"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../(lib)/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { downloadOrderPdf } from "../../(lib)/pdf";

type Order = {
  id: string;
  carName?: string;
  carId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  startDate?: string;
  endDate?: string;
  status?: "pending" | "confirmed" | "cancelled";
  createdAt?: any;
};

export default function PdfPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");

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

  useEffect(() => {
    if (!auth.currentUser) {
      router.push("/dashboard/all");
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "project2", "admin", "orders"),
          where("customerEmail", "==", auth.currentUser?.email || "")
        );
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
        list.sort((a: any, b: any) => toMs(b.createdAt) - toMs(a.createdAt));
        setOrders(list);
        setSelectedId(list[0]?.id || "");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedId) || null,
    [orders, selectedId]
  );

  return (
    <div className="min-h-screen w-full bg-[#f3d24d] relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,rgba(0,0,0,0.25),transparent_55%)]" />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[280px] h-10 bg-black/25 blur-2xl rounded-full" />
              <div className="w-[310px] md:w-[380px] bg-white rounded-2xl shadow-2xl rotate-[-18deg] overflow-hidden border border-black/10">
                <div className="h-12 bg-black flex items-center px-4">
                  <span className="text-white font-bold tracking-wider">drivingCar</span>
                </div>
                <div className="p-4">
                  <div className="h-4 w-40 bg-slate-200 rounded mb-3" />
                  <div className="grid grid-cols-3 gap-3">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="aspect-[4/5] rounded-lg bg-slate-200" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-black/85 border border-white/15 rounded-2xl p-8 shadow-2xl">
            <h1 className="text-white text-2xl md:text-3xl font-extrabold leading-snug">
              Buyurtmangizni PDF ko&apos;rinishida yuklab oling
            </h1>
            <p className="text-white/70 mt-3 text-sm">
              PDF ichida ism-familya, mashina, sanalar va buyurtma qilingan vaqt ko&apos;rsatiladi.
            </p>

            <div className="mt-8 space-y-4">
              <div>
                <label className="block text-white/80 text-sm mb-2">Buyurtmani tanlang</label>
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none"
                  disabled={loading || orders.length === 0}
                >
                  {orders.length === 0 ? (
                    <option value="">Buyurtmalar topilmadi</option>
                  ) : (
                    orders.map((o) => (
                      <option key={o.id} value={o.id} className="text-black">
                        {o.carName || "Mashina"} — {o.startDate || ""} - {o.endDate || ""}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">Ism familya</label>
                <input
                  value={selectedOrder?.customerName || ""}
                  readOnly
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white/80"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">Telefon</label>
                <input
                  value={selectedOrder?.customerPhone || ""}
                  readOnly
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white/80"
                />
              </div>

              <button
                type="button"
                onClick={() => selectedOrder && downloadOrderPdf(selectedOrder)}
                disabled={!selectedOrder}
                className="w-full h-12 rounded-xl bg-black text-white font-bold hover:bg-gray-900 transition disabled:opacity-50"
              >
                PDF yuklab olish
              </button>

              <button
                type="button"
                onClick={() => router.push("/dashboard/profil")}
                className="w-full h-12 rounded-xl border border-white/25 text-white font-semibold hover:bg-white/10 transition"
              >
                Profilga qaytish
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
