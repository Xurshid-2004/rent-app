"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CarInfoPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/all");
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <p className="text-gray-400">Yuklanmoqda...</p>
    </div>
  );
}
