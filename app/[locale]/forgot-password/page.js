"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function ForgotPasswordPage({ params }) {
  const { use } = require("react");
  const { locale } = use(params);
  const isRTL = locale === "fa";

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      // Show success message — user checks their email (or terminal in dev)
      setIsSent(true);
      setMessage(
        isRTL
          ? "لینک بازیابی به ایمیل شما ارسال شد. لطفاً ایمیل خود را بررسی کنید."
          : "A reset link has been sent to your email. Please check your inbox.",
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Email sent state
  if (isSent) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="text-5xl mb-4">📧</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2">
          {isRTL ? "ایمیل ارسال شد" : "Email Sent"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {isRTL
            ? "لطفاً ایمیل خود را بررسی کنید و روی لینک بازیابی کلیک کنید."
            : "Please check your email and click the reset link."}
        </p>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {isRTL
            ? "اگر ایمیل را دریافت نکردید، پوشه اسپم را بررسی کنید."
            : "If you don't see the email, check your spam folder."}
        </p>
        <Link
          href={`/${locale}/login`}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
        >
          {isRTL ? "← بازگشت به ورود" : "← Back to Login"}
        </Link>
      </div>
    );
  }

  // Email input form
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 text-center mb-4">
        {isRTL ? "فراموشی رمز عبور" : "Forgot Password"}
      </h1>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
        {isRTL
          ? "ایمیل خود را وارد کنید تا لینک بازیابی برای شما ارسال شود."
          : "Enter your email and we will send you a reset link."}
      </p>

      {message && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading
            ? isRTL
              ? "در حال ارسال..."
              : "Sending..."
            : isRTL
              ? "ارسال لینک بازیابی"
              : "Send Reset Link"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <Link
          href={`/${locale}/login`}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
        >
          {isRTL ? "← بازگشت به ورود" : "← Back to Login"}
        </Link>
      </p>
    </div>
  );
}
