"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

export default function UsersClient({ initialUsers, locale }) {
  const isRTL = locale === "fa";

  const [users, setUsers] = useState(initialUsers);
  const [message, setMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Toggle user role
  const handleRoleToggle = async (userId, currentRole) => {
    setMessage("");
    const newRole = currentRole === "admin" ? "user" : "admin";

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u)),
      );
      if (selectedUser?._id === userId) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
      setMessage(isRTL ? "نقش کاربر با موفقیت تغییر کرد" : "User role updated");
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Toggle user active status
  const handleActiveToggle = async (userId, currentStatus) => {
    setMessage("");

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, isActive: !currentStatus } : u,
        ),
      );
      if (selectedUser?._id === userId) {
        setSelectedUser({ ...selectedUser, isActive: !currentStatus });
      }
      setMessage(
        isRTL
          ? `کاربر ${!currentStatus ? "فعال" : "غیرفعال"} شد`
          : `User ${!currentStatus ? "activated" : "deactivated"}`,
      );
    } catch (err) {
      setMessage(err.message);
    }
  };

  // View user details and orders
  const handleViewUser = async (user) => {
    setSelectedUser(user);
    setIsLoadingOrders(true);

    try {
      const res = await fetch(`/api/admin/users/${user._id}/orders`);
      const data = await res.json();
      if (res.ok) {
        setUserOrders(data.data || []);
      } else {
        setUserOrders([]);
      }
    } catch {
      setUserOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Close detail panel
  const handleCloseDetail = () => {
    setSelectedUser(null);
    setUserOrders([]);
  };

  const statusLabels = {
    pending: isRTL ? "در انتظار" : "Pending",
    confirmed: isRTL ? "تایید شده" : "Confirmed",
    processing: isRTL ? "در حال پردازش" : "Processing",
    shipped: isRTL ? "ارسال شده" : "Shipped",
    delivered: isRTL ? "تحویل داده شده" : "Delivered",
    cancelled: isRTL ? "لغو شده" : "Cancelled",
  };

  const getStatusColor = (status) => {
    const colors = {
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      confirmed:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      processing:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
      shipped:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      delivered:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return colors[status] || "";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          {isRTL ? "کاربران" : "Users"}
          <span className="ml-2 text-lg text-gray-500 dark:text-gray-400 font-normal">
            ({users.length})
          </span>
        </h1>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            message.includes("موفقیت") ||
            message.includes("success") ||
            message.includes("updated") ||
            message.includes("فعال")
              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400"
              : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
          }`}
        >
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users table */}
        <div className={selectedUser ? "lg:col-span-2" : "lg:col-span-3"}>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      {isRTL ? "کاربر" : "User"}
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      {isRTL ? "ایمیل" : "Email"}
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      {isRTL ? "نقش" : "Role"}
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      {isRTL ? "وضعیت" : "Status"}
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      {isRTL ? "تاریخ عضویت" : "Joined"}
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      {isRTL ? "عملیات" : "Actions"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                        selectedUser?._id === user._id
                          ? "bg-indigo-50 dark:bg-indigo-900/10"
                          : ""
                      }`}
                    >
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="text-left hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-gray-50">
                              {user.name}
                            </span>
                          </div>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs">
                        {user.email}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {user.role === "admin"
                            ? isRTL
                              ? "مدیر"
                              : "Admin"
                            : isRTL
                              ? "کاربر"
                              : "User"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.isActive !== false
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {user.isActive !== false
                            ? isRTL
                              ? "فعال"
                              : "Active"
                            : isRTL
                              ? "غیرفعال"
                              : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString(
                          isRTL ? "fa-IR" : "en-US",
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              handleRoleToggle(user._id, user.role)
                            }
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
                          >
                            {user.role === "admin"
                              ? isRTL
                                ? "تبدیل به کاربر"
                                : "Make User"
                              : isRTL
                                ? "تبدیل به مدیر"
                                : "Make Admin"}
                          </button>
                          <button
                            onClick={() =>
                              handleActiveToggle(
                                user._id,
                                user.isActive !== false,
                              )
                            }
                            className={`text-xs ${
                              user.isActive !== false
                                ? "text-red-600 dark:text-red-400 hover:text-red-700"
                                : "text-green-600 dark:text-green-400 hover:text-green-700"
                            }`}
                          >
                            {user.isActive !== false
                              ? isRTL
                                ? "غیرفعال کردن"
                                : "Deactivate"
                              : isRTL
                                ? "فعال کردن"
                                : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* User detail panel */}
        {selectedUser && (
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                  {isRTL ? "جزئیات کاربر" : "User Details"}
                </h2>
                <button
                  onClick={handleCloseDetail}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              {/* User info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white text-lg font-bold">
                  {selectedUser.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-50">
                    {selectedUser.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedUser.email}
                  </p>
                </div>
              </div>

              {/* User metadata */}
              <div className="space-y-2 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    {isRTL ? "نقش" : "Role"}
                  </span>
                  <span className="text-gray-900 dark:text-gray-50">
                    {selectedUser.role === "admin"
                      ? isRTL
                        ? "مدیر"
                        : "Admin"
                      : isRTL
                        ? "کاربر"
                        : "User"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    {isRTL ? "وضعیت" : "Status"}
                  </span>
                  <span
                    className={
                      selectedUser.isActive !== false
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {selectedUser.isActive !== false
                      ? isRTL
                        ? "فعال"
                        : "Active"
                      : isRTL
                        ? "غیرفعال"
                        : "Inactive"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    {isRTL ? "تاریخ عضویت" : "Joined"}
                  </span>
                  <span className="text-gray-900 dark:text-gray-50">
                    {new Date(selectedUser.createdAt).toLocaleDateString(
                      isRTL ? "fa-IR" : "en-US",
                    )}
                  </span>
                </div>
                {selectedUser.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      {isRTL ? "تلفن" : "Phone"}
                    </span>
                    <span className="text-gray-900 dark:text-gray-50">
                      {selectedUser.phone}
                    </span>
                  </div>
                )}
              </div>

              {/* User orders */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  {isRTL ? "سفارشات کاربر" : "User Orders"} ({userOrders.length}
                  )
                </h3>

                {isLoadingOrders ? (
                  <div className="text-center py-4">
                    <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
                  </div>
                ) : userOrders.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    {isRTL ? "سفارشی یافت نشد" : "No orders found"}
                  </p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {userOrders.map((order) => (
                      <div
                        key={order._id}
                        className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-sm"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-mono text-xs text-gray-900 dark:text-gray-50">
                            #{order._id.slice(-8).toUpperCase()}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                          >
                            {statusLabels[order.status] || order.status}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500 dark:text-gray-400">
                            {order.items?.length || 0}{" "}
                            {isRTL ? "محصول" : "items"}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-gray-50">
                            {order.total?.toLocaleString()} T
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(order.createdAt).toLocaleDateString(
                            isRTL ? "fa-IR" : "en-US",
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
