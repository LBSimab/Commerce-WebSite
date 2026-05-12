"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

export default function TicketClient({
  locale,
  id,
  token,
  initialTicket,
  initialError,
}) {
  const isRTL = locale === "fa";

  const [ticket, setTicket] = useState(initialTicket);
  const [error, setError] = useState(initialError || "");
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const invalidLink = !id || !token;
  const linkError = isRTL ? "لینک نامعتبر" : "Invalid link";

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    setMessage("");

    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText, accessToken: token }),
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

  if (invalidLink) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
          {isRTL ? "خطا" : "Error"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">{linkError}</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
          {isRTL ? "خطا" : "Error"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2">
        {isRTL ? "تیکت پشتیبانی" : "Support Ticket"}
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        {isRTL ? "پیگیری تیکت شما" : "Track your ticket"}
      </p>

      {message && (
        <div className="mb-4 p-3 rounded-lg text-sm bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
          {message}
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
            {ticket.subject}
          </h2>
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
      </div>

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

      {ticket.status !== "closed" && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            {isRTL ? "پاسخ شما" : "Your Reply"}
          </h3>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 text-sm mb-3"
            placeholder={
              isRTL ? "پیام خود را بنویسید..." : "Write your message..."
            }
          />
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
                ? "ارسال"
                : "Send"}
          </Button>
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
