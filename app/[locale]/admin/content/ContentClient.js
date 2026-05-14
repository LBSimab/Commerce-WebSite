"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import DataTable from "@/components/DataTable";

const sections = ["about", "contact"];
const blockTypes = [
  { value: "hero", labelEn: "Hero", labelFa: "بنر" },
  { value: "text", labelEn: "Text", labelFa: "متن" },
  { value: "features", labelEn: "Features", labelFa: "ویژگی‌ها" },
  { value: "team", labelEn: "Team", labelFa: "تیم" },
  { value: "locations", labelEn: "Locations", labelFa: "موقعیت‌ها" },
  { value: "testimonials", labelEn: "Testimonials", labelFa: "نظرات" },
  { value: "cta", labelEn: "CTA", labelFa: "فراخوان" },
  { value: "contact-form", labelEn: "Contact Form", labelFa: "فرم تماس" },
  { value: "contact-info", labelEn: "Contact Info", labelFa: "اطلاعات تماس" },
  { value: "slider", labelEn: "Slider", labelFa: "اسلایدر" },
];

export default function ContentClient({ initialContent, locale }) {
  const isRTL = locale === "fa";
  const [content, setContent] = useState(initialContent);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    section: "about",
    type: "hero",
    order: 0,
    isActive: true,
    data: {},
  };
  const [form, setForm] = useState(emptyForm);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setForm({
      section: item.section,
      type: item.type,
      order: item.order || 0,
      isActive: item.isActive !== false,
      data: item.data || {},
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const url = editingId
      ? `/api/site-content/${editingId}`
      : "/api/site-content";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) return setMessage(data.message);
    setMessage(
      editingId
        ? isRTL
          ? "ویرایش شد"
          : "Updated"
        : isRTL
          ? "ایجاد شد"
          : "Created",
    );
    resetForm();
    const ref = await fetch("/api/site-content");
    const refD = await ref.json();
    setContent(refD.data || []);
  };

  const handleDelete = async (id) => {
    if (!confirm(isRTL ? "مطمئنید؟" : "Sure?")) return;
    await fetch(`/api/site-content/${id}`, { method: "DELETE" });
    const ref = await fetch("/api/site-content");
    const refD = await ref.json();
    setContent(refD.data || []);
  };

  const getSectionLabel = (sec) =>
    sec === "about"
      ? isRTL
        ? "درباره ما"
        : "About"
      : isRTL
        ? "تماس با ما"
        : "Contact";
  const getTypeLabel = (type) => {
    const t = blockTypes.find((b) => b.value === type);
    return t ? (isRTL ? t.labelFa : t.labelEn) : type;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          {isRTL ? "محتوای سایت" : "Site Content"}
        </h1>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          variant="primary"
          size="sm"
        >
          {showForm
            ? isRTL
              ? "انصراف"
              : "Cancel"
            : isRTL
              ? "افزودن بلوک"
              : "Add Block"}
        </Button>
      </div>

      {message && (
        <div className="mb-4 p-3 rounded-lg text-sm bg-green-50 dark:bg-green-900/20 text-green-600">
          {message}
        </div>
      )}

      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "بخش" : "Section"}
                </label>
                <select
                  value={form.section}
                  onChange={(e) =>
                    setForm({ ...form, section: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                >
                  {sections.map((s) => (
                    <option key={s} value={s}>
                      {getSectionLabel(s)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "نوع" : "Type"}
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                >
                  {blockTypes.map((b) => (
                    <option key={b.value} value={b.value}>
                      {isRTL ? b.labelFa : b.labelEn}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "ترتیب" : "Order"}
                </label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) =>
                    setForm({ ...form, order: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                />
              </div>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
              />
              <span className="text-sm">{isRTL ? "فعال" : "Active"}</span>
            </label>
            <Button type="submit" variant="primary">
              {editingId
                ? isRTL
                  ? "ذخیره"
                  : "Save"
                : isRTL
                  ? "ایجاد"
                  : "Create"}
            </Button>
          </form>
        </div>
      )}

      <DataTable
        columns={[
          {
            key: "section",
            label: isRTL ? "بخش" : "Section",
            render: (row) => (
              <span className="text-xs font-medium">
                {getSectionLabel(row.section)}
              </span>
            ),
          },
          {
            key: "type",
            label: isRTL ? "نوع" : "Type",
            render: (row) => (
              <span className="text-xs">{getTypeLabel(row.type)}</span>
            ),
          },
          {
            key: "data",
            label: isRTL ? "خلاصه" : "Summary",
            sortable: false,
            render: (row) => (
              <span className="text-xs text-gray-500">
                {row.data?.titleEn || row.data?.titleFa || "—"}
              </span>
            ),
          },
          { key: "order", label: isRTL ? "ترتیب" : "Order", align: "center" },
          {
            key: "isActive",
            label: isRTL ? "وضعیت" : "Status",
            render: (row) => (
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${row.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
              >
                {row.isActive
                  ? isRTL
                    ? "فعال"
                    : "Active"
                  : isRTL
                    ? "غیرفعال"
                    : "Inactive"}
              </span>
            ),
          },
        ]}
        data={content}
        searchPlaceholder={isRTL ? "جستجوی محتوا..." : "Search content..."}
        searchFields={["section", "type"]}
        locale={locale}
        onEdit={handleEdit}
        onDelete={(row) => handleDelete(row._id)}
      />
    </div>
  );
}
