"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import Button from "@/components/ui/Button";
import { useEffect } from "react";
export default function ProfilePage({ params }) {
  const { use } = require("react");
  const { locale } = use(params);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [confirmPassword, setConfirmPassword] = useState("");
  // Profile form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Active tab
  const [activeTab, setActiveTab] = useState("profile");

  const isRTL = locale === "fa";

  // Populate form with user data when loaded
  useState(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/${locale}/login`);
    }
  }, [isLoading, user, router, locale]);

  if (isLoading) {
    // ... loading skeleton
  }

  if (!user) return null;

  // Show loading
  if (isLoading || !user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    );
  }

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMessage("");
    setProfileError("");
    setIsSaving(true);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setUser(data.data);
      setProfileMessage(
        isRTL
          ? "پروفایل با موفقیت به‌روزرسانی شد"
          : "Profile updated successfully",
      );
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage("");
    setPasswordError("");
    setIsChangingPassword(true);

    if (newPassword !== confirmPassword) {
      setPasswordError(
        isRTL ? "رمز عبور و تکرار آن مطابقت ندارند" : "Passwords do not match",
      );
      setIsChangingPassword(false);
      return;
    }
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setPasswordMessage(
        isRTL
          ? "رمز عبور با موفقیت تغییر کرد"
          : "Password changed successfully",
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-8">
        {isRTL ? "پروفایل من" : "My Profile"}
      </h1>

      {/* User info header */}
      <div className="flex items-center gap-4 mb-8 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="w-16 h-16 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {user.name?.charAt(0).toUpperCase() || "?"}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
            {user.name}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {user.email}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {isRTL ? "عضو از " : "Member since "}
            {new Date(user.createdAt).toLocaleDateString(
              isRTL ? "fa-IR" : "en-US",
            )}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "profile"
              ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          {isRTL ? "ویرایش پروفایل" : "Edit Profile"}
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "password"
              ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          {isRTL ? "تغییر رمز عبور" : "Change Password"}
        </button>
      </div>

      {/* Profile Form */}
      {activeTab === "profile" && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          {profileMessage && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm">
              {profileMessage}
            </div>
          )}
          {profileError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              {profileError}
            </div>
          )}

          <form onSubmit={handleProfileUpdate} className="space-y-4">
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
              />
            </div>

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
              />
            </div>

            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving
                ? isRTL
                  ? "در حال ذخیره..."
                  : "Saving..."
                : isRTL
                  ? "ذخیره تغییرات"
                  : "Save Changes"}
            </Button>
          </form>
        </div>
      )}

      {/* Password Form */}
      {activeTab === "password" && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          {passwordMessage && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm">
              {passwordMessage}
            </div>
          )}
          {passwordError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isRTL ? "رمز عبور فعلی" : "Current Password"}
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

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
              <p className="mt-1 text-xs text-gray-400">
                {isRTL ? "حداقل ۶ کاراکتر" : "Minimum 6 characters"}
              </p>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-400">
                {isRTL ? "حداقل ۶ کاراکتر" : "Minimum 6 characters"}
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={isChangingPassword}
            >
              {isChangingPassword
                ? isRTL
                  ? "در حال تغییر..."
                  : "Changing..."
                : isRTL
                  ? "تغییر رمز عبور"
                  : "Change Password"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
