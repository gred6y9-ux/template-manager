"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Chrome, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithEmail, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await loginWithEmail(email, password);

      // 🔥 Жорсткий редірект після логіну
      router.replace("/dashboard");
    } catch (err: any) {
      setError("Помилка входу. Спробуйте ще раз");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      await loginWithGoogle();

      // 🔥 Жорсткий редірект
      router.replace("/dashboard");
    } catch (err: any) {
      setError("Помилка входу через Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Template Manager
          </h1>
          <p className="text-text-secondary">
            Вхід до вашого облікового запису
          </p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-8">
          {error && (
            <div className="bg-error/10 border border-error/30 text-error rounded-lg p-3 mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-3"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ваш пароль"
                  className="w-full bg-background border border-border rounded-lg pl-10 pr-12 py-3"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Вхід...
                </>
              ) : (
                "Увійти"
              )}
            </button>
          </form>

          <div className="my-6 text-center text-sm text-text-muted">
            або
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-surface-hover border border-border py-3 rounded-lg flex items-center justify-center gap-3"
          >
            <Chrome className="text-[#4285F4]" />
            Увійти через Google
          </button>

          <p className="text-center mt-6 text-sm">
            Ще не маєте облікового запису?{" "}
            <Link href="/register" className="text-primary">
              Зареєструватися
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}