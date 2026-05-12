"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

const personalityOptions = [
  "Cold",
  "Hot",
  "Evil",
  "Angel",
  "GentleWoman",
  "Gentleman",
];

const statKeys = [
  "statPower",
  "statSpeed",
  "statEndurance",
  "statEnergy",
  "statTiming",
  "statExperience",
];
const statLabelsEn = [
  "Power",
  "Speed",
  "Endurance",
  "Energy",
  "Timing",
  "Experience",
];
const statLabelsFa = ["قدرت", "سرعت", "استقامت", "انرژی", "زمان‌بندی", "تجربه"];

export default function TeamClient({ initialMembers, locale }) {
  const isRTL = locale === "fa";
  const statLabels = isRTL ? statLabelsFa : statLabelsEn;

  const [members, setMembers] = useState(initialMembers);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const emptyForm = {
    name: "",
    nameFa: "",
    role: "",
    roleFa: "",
    image: "",
    bio: "",
    bioFa: "",
    fullDetails: "",
    fullDetailsFa: "",
    personality: [],
    statPower: 3,
    statSpeed: 3,
    statEndurance: 3,
    statEnergy: 3,
    statTiming: 3,
    statExperience: 3,
    order: 0,
    isActive: true,
  };
  const [form, setForm] = useState(emptyForm);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (member) => {
    setForm({
      name: member.name,
      nameFa: member.nameFa || "",
      role: member.role,
      roleFa: member.roleFa || "",
      image: member.image || "",
      bio: member.bio || "",
      bioFa: member.bioFa || "",
      fullDetails: member.fullDetails || "",
      fullDetailsFa: member.fullDetailsFa || "",
      personality: member.personality || [],
      statPower: member.statPower ?? 3,
      statSpeed: member.statSpeed ?? 3,
      statEndurance: member.statEndurance ?? 3,
      statEnergy: member.statEnergy ?? 3,
      statTiming: member.statTiming ?? 3,
      statExperience: member.statExperience ?? 3,
      order: member.order || 0,
      isActive: member.isActive !== false,
    });
    setEditingId(member._id);
    setShowForm(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) setForm({ ...form, image: data.data.url });
    setIsUploading(false);
  };

  const togglePersonality = (type) => {
    const current = form.personality;
    if (current.includes(type)) {
      setForm({ ...form, personality: current.filter((t) => t !== type) });
    } else if (current.length < 3) {
      setForm({ ...form, personality: [...current, type] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const url = editingId ? `/api/team/${editingId}` : "/api/team";
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
    const ref = await fetch("/api/team");
    const refD = await ref.json();
    setMembers(refD.data || []);
  };

  const handleDelete = async (id) => {
    if (!confirm(isRTL ? "مطمئنید؟" : "Sure?")) return;
    await fetch(`/api/team/${id}`, { method: "DELETE" });
    const ref = await fetch("/api/team");
    const refD = await ref.json();
    setMembers(refD.data || []);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          {isRTL ? "اعضای تیم" : "Team Members"}
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
              ? "افزودن عضو"
              : "Add Member"}
        </Button>
      </div>

      {message && (
        <div className="mb-4 p-3 rounded-lg text-sm bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
          {message}
        </div>
      )}

      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
            {editingId
              ? isRTL
                ? "ویرایش"
                : "Edit"
              : isRTL
                ? "عضو جدید"
                : "New Member"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "نام (EN)" : "Name (EN)"}
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "نام (FA)" : "Name (FA)"}
                </label>
                <input
                  type="text"
                  value={form.nameFa}
                  onChange={(e) => setForm({ ...form, nameFa: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "نقش (EN)" : "Role (EN)"}
                </label>
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "نقش (FA)" : "Role (FA)"}
                </label>
                <input
                  type="text"
                  value={form.roleFa}
                  onChange={(e) => setForm({ ...form, roleFa: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "بیو (EN)" : "Bio (EN)"}
                </label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "بیو (FA)" : "Bio (FA)"}
                </label>
                <textarea
                  value={form.bioFa}
                  onChange={(e) => setForm({ ...form, bioFa: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "جزئیات کامل (EN)" : "Full Details (EN)"}
                </label>
                <textarea
                  value={form.fullDetails}
                  onChange={(e) =>
                    setForm({ ...form, fullDetails: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? "جزئیات کامل (FA)" : "Full Details (FA)"}
                </label>
                <textarea
                  value={form.fullDetailsFa}
                  onChange={(e) =>
                    setForm({ ...form, fullDetailsFa: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {isRTL ? "تصویر" : "Image"}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full text-sm"
              />
              {form.image && (
                <img
                  src={form.image}
                  className="mt-2 h-16 w-16 object-cover rounded-lg"
                />
              )}
            </div>

            {/* Personality */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {isRTL ? "شخصیت (حداکثر ۳)" : "Personality (max 3)"}
              </label>
              <div className="flex flex-wrap gap-2">
                {personalityOptions.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePersonality(p)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${form.personality.includes(p) ? "bg-indigo-100 border-indigo-300 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" : "bg-gray-100 border-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {isRTL ? "امتیازات (۰-۶)" : "Stats (0-6)"}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {statKeys.map((key, i) => (
                  <div key={key}>
                    <label className="text-xs text-gray-500 mb-1 block">
                      {statLabels[i]}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={6}
                      value={form[key]}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          [key]: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 text-center"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div>
                <label className="text-sm mr-2">
                  {isRTL ? "ترتیب" : "Order"}
                </label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) =>
                    setForm({ ...form, order: parseInt(e.target.value) || 0 })
                  }
                  className="w-20 px-2 py-1 rounded border"
                />
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
            </div>

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

      {/* Members table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 dark:bg-gray-800/50">
              <th className="p-3 text-left">{isRTL ? "تصویر" : "Image"}</th>
              <th className="p-3 text-left">{isRTL ? "نام" : "Name"}</th>
              <th className="p-3 text-left">{isRTL ? "نقش" : "Role"}</th>
              <th className="p-3 text-left">
                {isRTL ? "شخصیت" : "Personality"}
              </th>
              <th className="p-3 text-left">{isRTL ? "وضعیت" : "Status"}</th>
              <th className="p-3 text-right">{isRTL ? "عملیات" : "Actions"}</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr
                key={m._id}
                className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td className="p-3">
                  {m.image ? (
                    <img
                      src={m.image}
                      className="h-10 w-10 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                  )}
                </td>
                <td className="p-3">
                  <p className="font-medium">
                    {isRTL && m.nameFa ? m.nameFa : m.name}
                  </p>
                </td>
                <td className="p-3 text-gray-500 text-xs">
                  {isRTL && m.roleFa ? m.roleFa : m.role}
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    {m.personality?.map((p) => (
                      <span
                        key={p}
                        className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${m.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                  >
                    {m.isActive
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
                    onClick={() => handleEdit(m)}
                    className="text-indigo-600 mr-3"
                  >
                    {isRTL ? "ویرایش" : "Edit"}
                  </button>
                  <button
                    onClick={() => handleDelete(m._id)}
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
