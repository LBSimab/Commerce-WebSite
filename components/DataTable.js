"use client";

import { useState } from "react";

export default function DataTable({
  columns,
  data,
  searchPlaceholder,
  searchFields,
  locale,
  onEdit,
  onDelete,
  emptyMessage,
}) {
  const isRTL = locale === "fa";
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  // Filter by search
  const filtered = search
    ? data.filter((row) =>
        searchFields.some((field) => {
          const val = field.split(".").reduce((obj, key) => obj?.[key], row);
          return val?.toString().toLowerCase().includes(search.toLowerCase());
        }),
      )
    : data;

  // Sort
  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const aVal = sortKey.split(".").reduce((obj, key) => obj?.[key], a);
        const bVal = sortKey.split(".").reduce((obj, key) => obj?.[key], b);
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        if (typeof aVal === "string") {
          return sortDir === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      })
    : filtered;

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // RTL-aware alignment helper
  const getAlign = (col) => {
    if (col.align === "center") return "text-center";
    if (col.align === "right") return isRTL ? "text-left" : "text-right";
    if (col.align === "left") return isRTL ? "text-right" : "text-left";
    // Default: text-left in LTR, text-right in RTL
    return isRTL ? "text-right" : "text-left";
  };

  return (
    <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
      {/* Search */}
      <div className={`relative max-w-sm ${isRTL ? "mr-0 ml-auto" : ""}`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 ${isRTL ? "right-3" : "left-3"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={searchPlaceholder || (isRTL ? "جستجو..." : "Search...")}
          className={`w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${isRTL ? "pr-10 pl-4" : "pl-10 pr-4"}`}
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() =>
                      col.sortable !== false && handleSort(col.key)
                    }
                    className={`px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                      col.sortable !== false
                        ? "cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none"
                        : ""
                    } ${getAlign(col)}`}
                  >
                    <div
                      className={`flex items-center gap-1.5 ${isRTL ? "flex-row-reverse justify-end" : ""}`}
                    >
                      <span>{col.label}</span>
                      {sortKey === col.key && (
                        <span className="text-indigo-500 text-xs">
                          {sortDir === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {(onEdit || onDelete) && (
                  <th
                    className={`px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isRTL ? "text-left" : "text-right"}`}
                  >
                    {isRTL ? "عملیات" : "Actions"}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {sorted.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                    className="px-5 py-12 text-center text-sm text-gray-400"
                  >
                    {emptyMessage ||
                      (isRTL ? "داده‌ای یافت نشد" : "No data found")}
                  </td>
                </tr>
              ) : (
                sorted.map((row, i) => (
                  <tr
                    key={row._id || i}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-5 py-3.5 text-sm ${getAlign(col)} ${col.className || ""}`}
                      >
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                    {(onEdit || onDelete) && (
                      <td
                        className={`px-5 py-3.5 ${isRTL ? "text-left" : "text-right"}`}
                      >
                        <div
                          className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse justify-start" : "justify-end"}`}
                        >
                          {onEdit && (
                            <button
                              onClick={() => onEdit(row)}
                              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                            >
                              {isRTL ? "ویرایش" : "Edit"}
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(row)}
                              className="text-xs font-medium text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                            >
                              {isRTL ? "حذف" : "Delete"}
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Count */}
      <p
        className={`text-xs text-gray-400 ${isRTL ? "text-right" : "text-left"}`}
      >
        {isRTL
          ? `${sorted.length} از ${data.length} مورد`
          : `${sorted.length} of ${data.length} items`}
        {search && ` (${isRTL ? "فیلتر شده" : "filtered"})`}
      </p>
    </div>
  );
}
