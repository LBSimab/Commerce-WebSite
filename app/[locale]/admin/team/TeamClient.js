"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import DataTable from "@/components/DataTable";

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
    if (current.includes(type))
      setForm({ ...form, personality: current.filter((t) => t !== type) });
    else if (current.length < 3)
      setForm({ ...form, personality: [...current, type] });
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
          {isRTL ? "اعضای تیم" : "Team"}
        </h1>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          variant="primary"
          size="sm"
        >
          {showForm ? (isRTL ? "انصراف" : "Cancel") : isRTL ? "افزودن" : "Add"}
        </Button>
      </div>

      {message && (
        <div className="mb-4 p-3 rounded-lg text-sm bg-green-50 dark:bg-green-900/20 text-green-600">
          {message}
        </div>
      )}

      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
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
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
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
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
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
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
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
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                />
              </div>
            </div>
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
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${form.personality.includes(p) ? "bg-indigo-100 border-indigo-300 text-indigo-700" : "bg-gray-100 border-gray-200 text-gray-600"}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
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
                      className="w-full px-3 py-2 rounded-lg border text-center text-sm"
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
                  className="w-20 px-2 py-1 rounded border text-sm"
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

      <DataTable
        columns={[
          {
            key: "image",
            label: isRTL ? "تصویر" : "Img",
            sortable: false,
            render: (row) =>
              row.image ? (
                <img
                  src={row.image}
                  className="h-10 w-10 object-cover rounded-full"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                  {row.name?.charAt(0).toUpperCase()}
                </div>
              ),
          },
          {
            key: "name",
            label: isRTL ? "نام" : "Name",
            render: (row) => (
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-50 text-sm">
                  {isRTL && row.nameFa ? row.nameFa : row.name}
                </p>
                <p className="text-xs text-gray-400">
                  {isRTL && row.roleFa ? row.roleFa : row.role}
                </p>
              </div>
            ),
          },
          {
            key: "personality",
            label: isRTL ? "شخصیت" : "Personality",
            sortable: false,
            render: (row) => (
              <div className="flex gap-1">
                {row.personality?.map((p) => (
                  <span
                    key={p}
                    className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-600"
                  >
                    {p}
                  </span>
                ))}
              </div>
            ),
          },
          { key: "order", label: isRTL ? "ترتیب" : "Order", align: "center" },
          {
            key: "isActive",
            label: isRTL ? "وضعیت" : "Status",
            render: (row) => (
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${row.isActive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-gray-100 text-gray-500"}`}
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
        data={members}
        searchPlaceholder={isRTL ? "جستجوی عضو..." : "Search members..."}
        searchFields={["name", "nameFa", "role", "roleFa"]}
        locale={locale}
        onEdit={handleEdit}
        onDelete={(row) => handleDelete(row._id)}
        emptyMessage={isRTL ? "عضوی یافت نشد" : "No members found"}
      />
    </div>
  );
}
