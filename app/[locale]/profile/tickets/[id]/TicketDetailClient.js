"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function TicketDetailClient({ locale, ticket: initialTicket }) {
  const isRTL = locale === "fa";

  const [ticket, setTicket] = useState(initialTicket);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    setMessage("");

    try {
      const res = await fetch(`/api/tickets/${ticket._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setTicket(data.data);
      setReplyText("");
      setMessage(isRTL ? "پاسخ ارسال شد" : "Reply sent");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleClose = async () => {
    try {
      const res = await fetch(`/api/tickets/${ticket._id}`, { method: "PUT" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setTicket(data.data);
      setMessage(isRTL ? "تیکت بسته شد" : "Ticket closed");
    } catch (err) {
      setMessage(err.message);
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
      <Link
        href={`/${locale}/profile/tickets`}
        className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 mb-4 inline-block"
      >
        {isRTL ? "← بازگشت به تیکت‌ها" : "← Back to Tickets"}
      </Link>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">
            {ticket.subject}
          </h1>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}
          >
            {isRTL
              ? statusLabels[ticket.status].fa
              : statusLabels[ticket.status].en}
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          {ticket.message}
        </p>
        <p className="text-xs text-gray-400 mt-3">
          {new Date(ticket.createdAt).toLocaleDateString(
            isRTL ? "fa-IR" : "en-US",
          )}
        </p>
        {ticket.order && (
          <p className="text-xs text-gray-400 mt-1">
            {isRTL ? "سفارش: " : "Order: "}
            <Link
              href={`/${locale}/orders/${ticket.order}`}
              className="text-indigo-600 hover:text-indigo-700"
            >
              #{ticket.order.toString().slice(-6).toUpperCase()}
            </Link>
          </p>
        )}
      </div>

      {message && (
        <div className="mb-4 p-3 rounded-lg text-sm bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
          {message}
        </div>
      )}

      {/* Replies */}
      {ticket.replies?.length > 0 && (
        <div className="space-y-3 mb-6">
          {ticket.replies.map((reply, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl text-sm ${
                reply.sender === "admin"
                  ? "bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800"
                  : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">
                  {reply.senderName ||
                    (reply.sender === "admin" ? "Admin" : "You")}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(reply.createdAt).toLocaleString(
                    isRTL ? "fa-IR" : "en-US",
                  )}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                {reply.message}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Reply + Close */}
      {ticket.status !== "closed" && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 text-sm"
            placeholder={
              isRTL ? "پاسخ خود را بنویسید..." : "Write your reply..."
            }
          />
          <div className="flex gap-3">
            <Button
              onClick={handleReply}
              variant="primary"
              size="sm"
              disabled={sending}
            >
              {sending
                ? isRTL
                  ? "در حال ارسال..."
                  : "Sending..."
                : isRTL
                  ? "ارسال پاسخ"
                  : "Send Reply"}
            </Button>
            <Button onClick={handleClose} variant="outline" size="sm">
              {isRTL ? "بستن تیکت" : "Close Ticket"}
            </Button>
          </div>
        </div>
      )}

      {ticket.status === "closed" && (
        <div className="text-center py-8 text-gray-400 text-sm">
          {isRTL ? "این تیکت بسته شده است" : "This ticket is closed"}
        </div>
      )}
    </div>
  );
}
