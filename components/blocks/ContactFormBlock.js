"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import Button from "@/components/ui/Button";

export default function ContactFormBlock({ data, locale }) {
  const isRTL = locale === "fa";
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const title = isRTL && data.titleFa ? data.titleFa : data.titleEn;
  const description =
    isRTL && data.descriptionFa ? data.descriptionFa : data.descriptionEn;

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    setLoading(true);

    try {
      const body = { subject: form.subject, message: form.message };
      if (!user) {
        body.name = form.name;
        body.email = form.email;
      }

      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const d = await res.json();
      if (!res.ok) throw new Error(d.message);

      setMsg(
        isRTL ? "پیام شما ارسال شد. متشکریم!" : "Message sent. Thank you!",
      );
      setForm({ name: "", email: "", subject: "", message: "" });

      // If guest, redirect to public ticket page
      if (!user && d.data?.accessToken) {
        setTimeout(
          () =>
            router.push(
              `/${locale}/ticket/${d.data._id}?token=${d.data.accessToken}`,
            ),
          1500,
        );
      }
    } catch (er) {
      setErr(er.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4 text-center">
            {title}
          </h2>
        )}
        {description && (
          <p className="text-gray-500 dark:text-gray-400 mb-8 text-center">
            {description}
          </p>
        )}

        {msg && (
          <div className="mb-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm text-center">
            {msg}
          </div>
        )}
        {err && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm text-center">
            {err}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          {!user && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "نام" : "Name"}
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "ایمیل (اختیاری)" : "Email (optional)"}
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">
              {isRTL ? "موضوع" : "Subject"}
            </label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-xl border dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {isRTL ? "پیام" : "Message"}
            </label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
              rows={5}
              className="w-full px-4 py-3 rounded-xl border dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading
              ? isRTL
                ? "در حال ارسال..."
                : "Sending..."
              : isRTL
                ? "ارسال پیام"
                : "Send Message"}
          </Button>
        </form>
      </div>
    </section>
  );
}
