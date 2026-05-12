"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function RegisterPage({ params }) {
  const { use } = require("react");
  const { locale } = use(params);
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const user = useAuthStore((state) => state.user);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in

  // Inside the component:
  useEffect(() => {
    if (user) {
      router.push(`/${locale}`);
    }
  }, [user, router, locale]);

  if (user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Check passwords match
    if (password !== confirmPassword) {
      setError(
        locale === "fa"
          ? "رمز عبور و تکرار آن مطابقت ندارند"
          : "Passwords do not match",
      );
      return;
    }

    setIsLoading(true);

    try {
      await register(name, email, password);
      router.push(`/${locale}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isRTL = locale === "fa";

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 text-center mb-8">
        {isRTL ? "ثبت نام" : "Register"}
      </h1>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {isRTL ? "نام" : "Name"}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder={isRTL ? "علی محمدی" : "Ali Mohammadi"}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {isRTL ? "ایمیل" : "Email"}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder={isRTL ? "example@gmail.com" : "example@gmail.com"}
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {isRTL ? "رمز عبور" : "Password"}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="••••••"
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {isRTL ? "تکرار رمز عبور" : "Confirm Password"}
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="••••••"
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading
            ? isRTL
              ? "در حال ثبت نام..."
              : "Creating account..."
            : isRTL
              ? "ثبت نام"
              : "Register"}
        </Button>
      </form>

      {/* Login link */}
      <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
        {isRTL ? "قبلاً ثبت نام کرده‌اید؟" : "Already have an account?"}{" "}
        <Link
          href={`/${locale}/login`}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
        >
          {isRTL ? "ورود" : "Login"}
        </Link>
      </p>
    </div>
  );
}
