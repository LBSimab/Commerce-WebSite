"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

const sections = ["about", "contact"];
const blockTypes = [
  { value: "hero", labelEn: "Hero Banner", labelFa: "بنر اصلی" },
  { value: "text", labelEn: "Text Section", labelFa: "بخش متنی" },
  { value: "features", labelEn: "Features Grid", labelFa: "ویژگی‌ها" },
  { value: "team", labelEn: "Team Members", labelFa: "اعضای تیم" },
  { value: "locations", labelEn: "Locations", labelFa: "موقعیت‌ها" },
  { value: "testimonials", labelEn: "Testimonials", labelFa: "نظرات مشتریان" },
  { value: "cta", labelEn: "Call to Action", labelFa: "فراخوان" },
  { value: "contact-form", labelEn: "Contact Form", labelFa: "فرم تماس" },
  { value: "contact-info", labelEn: "Contact Info", labelFa: "اطلاعات تماس" },
];

export default function ContentClient({ initialContent, locale }) {
  const isRTL = locale === "fa";
  const [content, setContent] = useState(initialContent);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const emptyData = {
    titleEn: "",
    titleFa: "",
    subtitleEn: "",
    subtitleFa: "",
    bodyEn: "",
    bodyFa: "",
    image: "",
    buttonTextEn: "",
    buttonTextFa: "",
    buttonLink: "",
    descriptionEn: "",
    descriptionFa: "",
    count: 5,
    items: [],
  };

  const emptyForm = {
    section: "about",
    type: "hero",
    order: 0,
    isActive: true,
    data: { ...emptyData },
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
      data: { ...emptyData, ...(item.data || {}) },
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const updateData = (key, value) => {
    setForm({ ...form, data: { ...form.data, [key]: value } });
  };

  // Add/remove feature items
  const addFeatureItem = () => {
    const items = [...(form.data.items || [])];
    items.push({ icon: "", titleEn: "", titleFa: "", descEn: "", descFa: "" });
    updateData("items", items);
  };

  const updateFeatureItem = (index, field, value) => {
    const items = [...(form.data.items || [])];
    items[index] = { ...items[index], [field]: value };
    updateData("items", items);
  };

  const removeFeatureItem = (index) => {
    const items = (form.data.items || []).filter((_, i) => i !== index);
    updateData("items", items);
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

  const needsNoData = ["team", "locations", "contact-info"];

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
        <div className="mb-4 p-3 rounded-lg text-sm bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
          {message}
        </div>
      )}

      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Section + Type + Order */}
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
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
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
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
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
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
            </div>

            {/* Dynamic form fields based on type */}
            {!needsNoData.includes(form.type) && (
              <div className="space-y-4 border-t pt-4">
                {/* hero, text, cta: title */}
                {["hero", "text", "cta", "contact-form"].includes(
                  form.type,
                ) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {isRTL ? "عنوان (EN)" : "Title (EN)"}
                      </label>
                      <input
                        type="text"
                        value={form.data.titleEn}
                        onChange={(e) => updateData("titleEn", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {isRTL ? "عنوان (FA)" : "Title (FA)"}
                      </label>
                      <input
                        type="text"
                        value={form.data.titleFa}
                        onChange={(e) => updateData("titleFa", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                      />
                    </div>
                  </div>
                )}

                {/* hero, cta: subtitle */}
                {["hero", "cta"].includes(form.type) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {isRTL ? "زیرعنوان (EN)" : "Subtitle (EN)"}
                      </label>
                      <input
                        type="text"
                        value={form.data.subtitleEn}
                        onChange={(e) =>
                          updateData("subtitleEn", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {isRTL ? "زیرعنوان (FA)" : "Subtitle (FA)"}
                      </label>
                      <input
                        type="text"
                        value={form.data.subtitleFa}
                        onChange={(e) =>
                          updateData("subtitleFa", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                      />
                    </div>
                  </div>
                )}

                {/* hero, cta: button */}
                {["hero", "cta"].includes(form.type) && (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {isRTL ? "متن دکمه (EN)" : "Button (EN)"}
                      </label>
                      <input
                        type="text"
                        value={form.data.buttonTextEn}
                        onChange={(e) =>
                          updateData("buttonTextEn", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {isRTL ? "متن دکمه (FA)" : "Button (FA)"}
                      </label>
                      <input
                        type="text"
                        value={form.data.buttonTextFa}
                        onChange={(e) =>
                          updateData("buttonTextFa", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {isRTL ? "لینک" : "Link"}
                      </label>
                      <input
                        type="text"
                        value={form.data.buttonLink}
                        onChange={(e) =>
                          updateData("buttonLink", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                      />
                    </div>
                  </div>
                )}

                {/* text, contact-form: body */}
                {["text", "contact-form"].includes(form.type) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {isRTL ? "متن (EN)" : "Body (EN)"}
                      </label>
                      <textarea
                        value={form.data.bodyEn}
                        onChange={(e) => updateData("bodyEn", e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {isRTL ? "متن (FA)" : "Body (FA)"}
                      </label>
                      <textarea
                        value={form.data.bodyFa}
                        onChange={(e) => updateData("bodyFa", e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                      />
                    </div>
                  </div>
                )}

                {/* hero, cta: image */}
                {["hero", "cta"].includes(form.type) && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {isRTL ? "تصویر (URL)" : "Image (URL)"}
                    </label>
                    <input
                      type="text"
                      value={form.data.image}
                      onChange={(e) => updateData("image", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                      placeholder="/uploads/hero.jpg"
                    />
                  </div>
                )}

                {/* features */}
                {form.type === "features" && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {isRTL ? "آیتم‌های ویژگی" : "Feature Items"}
                      </span>
                      <button
                        type="button"
                        onClick={addFeatureItem}
                        className="text-xs text-indigo-600"
                      >
                        {isRTL ? "+ افزودن" : "+ Add"}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs mb-1">
                          {isRTL ? "عنوان (EN)" : "Title (EN)"}
                        </label>
                        <input
                          type="text"
                          value={form.data.titleEn}
                          onChange={(e) =>
                            updateData("titleEn", e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">
                          {isRTL ? "عنوان (FA)" : "Title (FA)"}
                        </label>
                        <input
                          type="text"
                          value={form.data.titleFa}
                          onChange={(e) =>
                            updateData("titleFa", e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                        />
                      </div>
                    </div>
                    {(form.data.items || []).map((item, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-5 gap-2 mb-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div>
                          <label className="text-xs">Icon</label>
                          <input
                            type="text"
                            value={item.icon}
                            onChange={(e) =>
                              updateFeatureItem(i, "icon", e.target.value)
                            }
                            className="w-full px-2 py-1 rounded border text-center text-lg"
                            placeholder="✅"
                          />
                        </div>
                        <div>
                          <label className="text-xs">EN Title</label>
                          <input
                            type="text"
                            value={item.titleEn}
                            onChange={(e) =>
                              updateFeatureItem(i, "titleEn", e.target.value)
                            }
                            className="w-full px-2 py-1 rounded border"
                          />
                        </div>
                        <div>
                          <label className="text-xs">FA Title</label>
                          <input
                            type="text"
                            value={item.titleFa}
                            onChange={(e) =>
                              updateFeatureItem(i, "titleFa", e.target.value)
                            }
                            className="w-full px-2 py-1 rounded border"
                          />
                        </div>
                        <div>
                          <label className="text-xs">EN Desc</label>
                          <input
                            type="text"
                            value={item.descEn}
                            onChange={(e) =>
                              updateFeatureItem(i, "descEn", e.target.value)
                            }
                            className="w-full px-2 py-1 rounded border"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeFeatureItem(i)}
                            className="text-red-500 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="col-span-5">
                          <label className="text-xs">FA Desc</label>
                          <input
                            type="text"
                            value={item.descFa}
                            onChange={(e) =>
                              updateFeatureItem(i, "descFa", e.target.value)
                            }
                            className="w-full px-2 py-1 rounded border"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* testimonials: count */}
                {form.type === "testimonials" && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {isRTL ? "تعداد نمایش" : "Count"}
                    </label>
                    <input
                      type="number"
                      value={form.data.count || 5}
                      onChange={(e) =>
                        updateData("count", parseInt(e.target.value) || 5)
                      }
                      className="w-32 px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Active toggle */}
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

      {/* Blocks table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 dark:bg-gray-800/50">
              <th className="p-3">{isRTL ? "بخش" : "Section"}</th>
              <th className="p-3">{isRTL ? "نوع" : "Type"}</th>
              <th className="p-3">{isRTL ? "خلاصه" : "Summary"}</th>
              <th className="p-3">{isRTL ? "ترتیب" : "Order"}</th>
              <th className="p-3">{isRTL ? "وضعیت" : "Status"}</th>
              <th className="p-3 text-right">{isRTL ? "عملیات" : "Actions"}</th>
            </tr>
          </thead>
          <tbody>
            {content.map((c) => (
              <tr
                key={c._id}
                className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td className="p-3 text-xs">{getSectionLabel(c.section)}</td>
                <td className="p-3 text-xs">{getTypeLabel(c.type)}</td>
                <td className="p-3 text-xs text-gray-500">
                  {c.data?.titleEn || c.data?.bodyEn?.slice(0, 50) || "—"}
                </td>
                <td className="p-3">{c.order}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${c.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                  >
                    {c.isActive
                      ? isRTL
                        ? "فعال"
                        : "Active"
                      : isRTL
                        ? "غیرفعال"
                        : "Inactive"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => handleEdit(c)}
                    className="text-indigo-600 mr-3"
                  >
                    {isRTL ? "ویرایش" : "Edit"}
                  </button>
                  <button
                    onClick={() => handleDelete(c._id)}
                    className="text-red-600"
                  >
                    {isRTL ? "حذف" : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
