"use client";

import { useState } from "react";
import DataTable from "@/components/DataTable";

export default function UsersClient({ initialUsers, locale }) {
  const isRTL = locale === "fa";
  const [users, setUsers] = useState(initialUsers);
  const [message, setMessage] = useState("");

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
      setMessage(isRTL ? "نقش تغییر کرد" : "Role updated");
    } catch (err) {
      setMessage(err.message);
    }
  };

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
      setMessage(isRTL ? "وضعیت تغییر کرد" : "Status updated");
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-6">
        {isRTL ? "کاربران" : "Users"}
      </h1>

      {message && (
        <div className="mb-4 p-3 rounded-lg text-sm bg-green-50 dark:bg-green-900/20 text-green-600">
          {message}
        </div>
      )}

      <DataTable
        columns={[
          {
            key: "name",
            label: isRTL ? "کاربر" : "User",
            render: (row) => (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                  {row.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-50 text-sm">
                    {row.name}
                  </p>
                  <p className="text-xs text-gray-400">{row.email}</p>
                </div>
              </div>
            ),
          },
          {
            key: "role",
            label: isRTL ? "نقش" : "Role",
            render: (row) => (
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${row.role === "admin" ? "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}
              >
                {row.role === "admin"
                  ? isRTL
                    ? "مدیر"
                    : "Admin"
                  : isRTL
                    ? "کاربر"
                    : "User"}
              </span>
            ),
          },
          {
            key: "isActive",
            label: isRTL ? "وضعیت" : "Status",
            render: (row) => (
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${row.isActive !== false ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"}`}
              >
                {row.isActive !== false
                  ? isRTL
                    ? "فعال"
                    : "Active"
                  : isRTL
                    ? "غیرفعال"
                    : "Inactive"}
              </span>
            ),
          },
          {
            key: "createdAt",
            label: isRTL ? "تاریخ عضویت" : "Joined",
            render: (row) => (
              <span className="text-xs text-gray-500">
                {new Date(row.createdAt).toLocaleDateString(
                  isRTL ? "fa-IR" : "en-US",
                )}
              </span>
            ),
          },
        ]}
        data={users}
        searchPlaceholder={isRTL ? "جستجوی کاربر..." : "Search users..."}
        searchFields={["name", "email"]}
        locale={locale}
        onEdit={(row) => handleRoleToggle(row._id, row.role)}
        onDelete={(row) => handleActiveToggle(row._id, row.isActive !== false)}
        emptyMessage={isRTL ? "کاربری یافت نشد" : "No users found"}
      />
    </div>
  );
}
