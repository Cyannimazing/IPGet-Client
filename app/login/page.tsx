"use client";

import { useEffect, useState, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import AuthService from "@/lib/api/AuthService";
import APIError from "@/lib/api/APIError";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("_token");
    if (token) {
      router.replace("/home");
    }
  }, [router]);

  const submit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await AuthService.login(email, password);
      localStorage.setItem("_token", response.token);
      router.replace("/home");
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message);
      } else {
        setError("Login failed.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-b from-slate-100 to-slate-200 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h1 className="mb-1 text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="mb-6 text-sm text-slate-500">Login to continue.</p>

        <form className="space-y-4" onSubmit={submit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-blue-200 focus:ring"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-blue-200 focus:ring"
              required
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}
