import { redirect } from "next/navigation";

export default function RootPage() {
  // Saytga kirgan zahoti /dashboard/all ga yuboramiz
  redirect("/dashboard/all");
  
  return null; // Hech narsa render qilmaydi
}