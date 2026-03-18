"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthService from "@/lib/api/AuthService";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const token = localStorage.getItem("_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        await AuthService.me();
        router.replace("/home");
      } catch {
        localStorage.removeItem("_token");
        router.replace("/login");
      }
    };

    void run();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100">
      <p className="text-sm text-slate-500">Loading...</p>
    </main>
  );
}
