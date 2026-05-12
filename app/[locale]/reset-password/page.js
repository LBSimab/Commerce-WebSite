"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";

// Inner component that uses useSearchParams
function ResetPasswordForm({ locale }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRTL = locale === "fa";

  // Get email and code from URL query params
  const email = searchParams.get("email") || "";
  const code = searchParams.get("code") || "";

  const [isValid, setIsValid] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [verifyError, setVerifyError] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Verify the reset code from URL on page load
  useEffect(() => {
    const verifyCode = async () => {
      // If no email or code in URL, mark as invalid immediately
      if (!email || !code) {
        setIsValid(false);
        setVerifyError(
          isRTL
            ? "لینک بازیابی نامعتبر است. ایمیل یا کد موجود نیست."
            : "Invalid reset link. Email or code is missing.",
        );
        setIsChecking(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/verify-reset-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setIsValid(true);
        } else {
          setIsValid(false);
          setVerifyError(data.message);
        }
      } catch {
        setIsValid(false);
        setVerifyError(
          isRTL
            ? "خطا در بررسی کد. لطفاً دوباره تلاش کنید."
            : "Error verifying code. Please try again.",
        );
      } finally {
        setIsChecking(false);
      }
    };

    verifyCode();
  }, [email, code, isRTL]);

  // Show loading spinner while checking
  if (isChecking) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400">
          {isRTL ? "در حال بررسی لینک..." : "Verifying reset link..."}
        </p>
      </div>
    );
  }

  // Invalid or expired link
  if (!isValid) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="text-5xl mb-4">⏰</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
          {isRTL ? "لینک نامعتبر" : "Invalid Link"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{verifyError}</p>
        <Link href={`/${locale}/forgot-password`}>
          <Button variant="primary">
            {isRTL ? "درخواست لینک جدید" : "Request New Link"}
          </Button>
        </Link>
      </div>
    );
  }

  // Link is valid — show password reset form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    // Check passwords match
    if (newPassword !== confirmPassword) {
      setError(
        isRTL ? "رمز عبور و تکرار آن مطابقت ندارند" : "Passwords do not match",
      );
      return;
    }

    // Check minimum length
    if (newPassword.length < 6) {
      setError(
        isRTL
          ? "رمز عبور باید حداقل ۶ کاراکتر باشد"
          : "Password must be at least 6 characters",
      );
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resetCode: code, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setMessage(
        isRTL
          ? "رمز عبور با موفقیت تغییر کرد. در حال انتقال به صفحه ورود..."
          : "Password reset successfully. Redirecting to login...",
      );

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push(`/${locale}/login`);
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 text-center mb-4">
        {isRTL ? "بازنشانی رمز عبور" : "Reset Password"}
      </h1>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
        {isRTL ? "رمز عبور جدید خود را وارد کنید." : "Enter your new password."}
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
            {isRTL ? "رمز عبور جدید" : "New Password"}
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {isRTL ? "تکرار رمز عبور جدید" : "Confirm New Password"}
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
              ? "در حال بازنشانی..."
              : "Resetting..."
            : isRTL
              ? "بازنشانی رمز عبور"
              : "Reset Password"}
        </Button>
      </form>
    </div>
  );
}

// Wrap in Suspense because useSearchParams requires it
export default function ResetPasswordPage({ params }) {
  const { use } = require("react");
  const { locale } = use(params);

  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">
            {locale === "fa" ? "در حال بارگذاری..." : "Loading..."}
          </p>
        </div>
      }
    >
      <ResetPasswordForm locale={locale} />
    </Suspense>
  );
}
