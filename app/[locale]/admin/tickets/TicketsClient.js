"use client";

import { useState } from "react";

const statusColors = {
  open: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  replied: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  closed: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const statusLabels = {
  open: { en: "Open", fa: "باز" },
  replied: { en: "Replied", fa: "پاسخ داده شده" },
  closed: { en: "Closed", fa: "بسته شده" },
};

export default function TicketsClient({ initialTickets, locale }) {
  const isRTL = locale === "fa";
  const [tickets, setTickets] = useState(initialTickets);
  const [message, setMessage] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [replyText, setReplyText] = useState("");

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const handleToggle = (id) => {
    setExpandedId(expandedId === id ? null : id);
    setReplyText("");
  };

  const handleReply = async (ticketId) => {
    if (!replyText.trim()) return;
    setMessage("");
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      const ref = await fetch("/api/admin/tickets");
      const refD = await ref.json();
      setTickets(refD.data || []);
      setReplyText("");
      setMessage(isRTL ? "پاسخ ارسال شد" : "Reply sent");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleClose = async (ticketId) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, { method: "PUT" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      const ref = await fetch("/api/admin/tickets");
      const refD = await ref.json();
      setTickets(refD.data || []);
      setMessage(isRTL ? "تیکت بسته شد" : "Ticket closed");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const getUserLabel = (ticket) => {
    if (ticket.user) return ticket.user.name || ticket.user.email;
    if (ticket.name) return ticket.name;
    return isRTL ? "ناشناس" : "Anonymous";
  };

  const getUserEmail = (ticket) => ticket.email || ticket.user?.email || "";

  // Apply filters
  const filteredTickets = tickets.filter((ticket) => {
    // Search by subject, user name, email
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      const name = getUserLabel(ticket).toLowerCase();
      const email = getUserEmail(ticket).toLowerCase();
      const subject = ticket.subject?.toLowerCase() || "";
      const msg = ticket.message?.toLowerCase() || "";
      if (
        !name.includes(s) &&
        !email.includes(s) &&
        !subject.includes(s) &&
        !msg.includes(s)
      )
        return false;
    }

    // Status filter
    if (filterStatus && ticket.status !== filterStatus) return false;

    // Date range
    if (filterDateFrom) {
      const ticketDate = new Date(ticket.createdAt);
      const fromDate = new Date(filterDateFrom);
      fromDate.setHours(0, 0, 0, 0);
      if (ticketDate < fromDate) return false;
    }
    if (filterDateTo) {
      const ticketDate = new Date(ticket.createdAt);
      const toDate = new Date(filterDateTo);
      toDate.setHours(23, 59, 59, 999);
      if (ticketDate > toDate) return false;
    }

    return true;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("");
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          {isRTL ? "تیکت‌ها" : "Tickets"}
          <span className="ml-2 text-lg text-gray-500 font-normal">
            ({filteredTickets.length})
          </span>
        </h1>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${message.includes("موفق") || message.includes("sent") || message.includes("closed") ? "bg-green-50 dark:bg-green-900/20 text-green-600" : "bg-red-50 dark:bg-red-900/20 text-red-600"}`}
        >
          {message}
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-3 mb-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase block mb-1">
            {isRTL ? "جستجو" : "Search"}
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              isRTL ? "جستجوی موضوع، کاربر..." : "Search subject, user..."
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-50"
          />
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase">
            {isRTL ? "وضعیت" : "Status"}
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-50"
          >
            <option value="">{isRTL ? "همه" : "All"}</option>
            <option value="open">{isRTL ? "باز" : "Open"}</option>
            <option value="replied">
              {isRTL ? "پاسخ داده شده" : "Replied"}
            </option>
            <option value="closed">{isRTL ? "بسته شده" : "Closed"}</option>
          </select>
        </div>

        {/* Date From */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase">
            {isRTL ? "از تاریخ" : "From"}
          </label>
          <input
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-50"
          />
        </div>

        {/* Date To */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase">
            {isRTL ? "تا تاریخ" : "To"}
          </label>
          <input
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-50"
          />
        </div>

        {/* Clear */}
        {(searchTerm || filterStatus || filterDateFrom || filterDateTo) && (
          <button
            onClick={clearFilters}
            className="text-xs text-red-500 hover:text-red-600 pb-2"
          >
            {isRTL ? "حذف فیلترها" : "Clear"}
          </button>
        )}
      </div>

      {/* Ticket Cards */}
      {filteredTickets.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border">
          <div className="text-5xl mb-4">🎫</div>
          <p className="text-gray-500">
            {isRTL ? "تیکتی یافت نشد" : "No tickets found"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket._id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
            >
              {/* Header */}
              <div
                className="p-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                onClick={() => handleToggle(ticket._id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                    {getUserLabel(ticket).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-50 text-sm">
                      {getUserLabel(ticket)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getUserEmail(ticket)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}
                  >
                    {isRTL
                      ? statusLabels[ticket.status].fa
                      : statusLabels[ticket.status].en}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(ticket.createdAt).toLocaleDateString(
                      isRTL ? "fa-IR" : "en-US",
                    )}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {expandedId === ticket._id ? "▲" : "▼"}
                  </span>
                </div>
              </div>

              {/* Expanded */}
              {expandedId === ticket._id && (
                <div className="border-t p-4 bg-gray-50 dark:bg-gray-800/30 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      {ticket.subject}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {ticket.message}
                    </p>
                  </div>

                  {ticket.replies?.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase">
                        {isRTL ? "پاسخ‌ها" : "Replies"}
                      </p>
                      {ticket.replies.map((reply, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-lg text-sm ${reply.sender === "admin" ? "bg-indigo-50 dark:bg-indigo-900/20 ml-4" : "bg-white dark:bg-gray-900 mr-4 border"}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-500">
                              {reply.senderName ||
                                (reply.sender === "admin" ? "Admin" : "User")}
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
                    <div className="flex gap-3">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={2}
                        className="flex-1 px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                        placeholder={isRTL ? "پاسخ..." : "Reply..."}
                      />
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleReply(ticket._id)}
                          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                        >
                          {isRTL ? "ارسال" : "Send"}
                        </button>
                        <button
                          onClick={() => handleClose(ticket._id)}
                          className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-400"
                        >
                          {isRTL ? "بستن" : "Close"}
                        </button>
                      </div>
                    </div>
                  )}

                  {ticket.status === "closed" && (
                    <p className="text-center text-sm text-gray-400 py-2">
                      {isRTL
                        ? "این تیکت بسته شده است"
                        : "This ticket is closed"}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
