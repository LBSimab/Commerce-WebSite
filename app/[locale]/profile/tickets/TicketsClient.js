"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function TicketsClient({ locale, initialTickets }) {
  const isRTL = locale === "fa";

  const [tickets, setTickets] = useState(initialTickets);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: "", message: "", orderId: "" });
  const [formMsg, setFormMsg] = useState("");
  const [formErr, setFormErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setFormMsg("");
    setFormErr("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: form.subject,
          message: form.message,
          order: form.orderId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setFormMsg(
        isRTL ? "تیکت با موفقیت ایجاد شد" : "Ticket created successfully",
      );
      setForm({ subject: "", message: "", orderId: "" });
      setShowForm(false);

      // Refresh tickets list
      const ref = await fetch("/api/tickets");
      const refData = await ref.json();
      setTickets(refData.data || []);
    } catch (err) {
      setFormErr(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const statusLabels = {
    open: { en: "Open", fa: "باز" },
    replied: { en: "Replied", fa: "پاسخ داده شده" },
    closed: { en: "Closed", fa: "بسته شده" },
  };

  const statusColors = {
    open: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    replied: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    closed: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
          {isRTL ? "تیکت‌های من" : "My Tickets"}
          <span className="ml-2 text-lg text-gray-500 dark:text-gray-400 font-normal">
            ({tickets.length})
          </span>
        </h1>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant="primary"
          size="sm"
        >
          {showForm
            ? isRTL
              ? "انصراف"
              : "Cancel"
            : isRTL
              ? "تیکت جدید"
              : "New Ticket"}
        </Button>
      </div>

      {/* New ticket form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
            {isRTL ? "تیکت جدید" : "New Ticket"}
          </h2>

          {formMsg && (
            <div className="mb-4 p-3 rounded-lg text-sm bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
              {formMsg}
            </div>
          )}
          {formErr && (
            <div className="mb-4 p-3 rounded-lg text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
              {formErr}
            </div>
          )}

          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isRTL ? "موضوع" : "Subject"}
              </label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-indigo-500"
                placeholder={isRTL ? "موضوع تیکت..." : "Ticket subject..."}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isRTL ? "شماره سفارش (اختیاری)" : "Order ID (optional)"}
              </label>
              <input
                type="text"
                value={form.orderId}
                onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-indigo-500"
                placeholder={
                  isRTL
                    ? "مثال: 507f1f77bcf86cd799439011"
                    : "e.g. 507f1f77bcf86cd799439011"
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isRTL ? "پیام" : "Message"}
              </label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-indigo-500"
                placeholder={
                  isRTL
                    ? "توضیح دهید چه مشکلی دارید..."
                    : "Describe your issue..."
                }
              />
            </div>

            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting
                ? isRTL
                  ? "در حال ارسال..."
                  : "Sending..."
                : isRTL
                  ? "ارسال تیکت"
                  : "Submit Ticket"}
            </Button>
          </form>
        </div>
      )}

      {/* Tickets list */}
      {tickets.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="text-5xl mb-4">🎫</div>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
            {isRTL ? "هیچ تیکتی ندارید" : "No tickets yet"}
          </p>
          <Button onClick={() => setShowForm(true)} variant="primary">
            {isRTL ? "ایجاد تیکت جدید" : "Create Your First Ticket"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Link
              key={ticket._id}
              href={`/${locale}/profile/tickets/${ticket._id}`}
              className="block bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-gray-50">
                  {ticket.subject}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}
                >
                  {isRTL
                    ? statusLabels[ticket.status].fa
                    : statusLabels[ticket.status].en}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                {ticket.message}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>
                  {ticket.replies?.length || 0} {isRTL ? "پاسخ" : "replies"}
                </span>
                <span>
                  {new Date(ticket.updatedAt).toLocaleDateString(
                    isRTL ? "fa-IR" : "en-US",
                  )}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
