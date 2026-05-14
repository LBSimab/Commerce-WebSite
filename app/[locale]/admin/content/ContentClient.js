'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import DataTable from '@/components/DataTable';

const sections = ['about', 'contact'];
const blockTypes = [
  { value: 'hero', labelEn: 'Hero', labelFa: 'بنر' },
  { value: 'text', labelEn: 'Text', labelFa: 'متن' },
  { value: 'features', labelEn: 'Features', labelFa: 'ویژگی‌ها' },
  { value: 'team', labelEn: 'Team', labelFa: 'تیم' },
  { value: 'locations', labelEn: 'Locations', labelFa: 'موقعیت‌ها' },
  { value: 'testimonials', labelEn: 'Testimonials', labelFa: 'نظرات' },
  { value: 'cta', labelEn: 'CTA', labelFa: 'فراخوان' },
  { value: 'contact-form', labelEn: 'Contact Form', labelFa: 'فرم تماس' },
  { value: 'contact-info', labelEn: 'Contact Info', labelFa: 'اطلاعات تماس' },
  { value: 'slider', labelEn: 'Slider', labelFa: 'اسلایدر' },
];

export default function ContentClient({ initialContent, locale }) {
  const isRTL = locale === 'fa';
  const [content, setContent] = useState(initialContent);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const emptyData = { titleEn: '', titleFa: '', subtitleEn: '', subtitleFa: '', bodyEn: '', bodyFa: '', image: '', buttonTextEn: '', buttonTextFa: '', buttonLink: '', descriptionEn: '', descriptionFa: '', count: 5, items: [], images: [] };
  const emptyForm = { section: 'about', type: 'hero', order: 0, isActive: true, data: { ...emptyData } };
  const [form, setForm] = useState(emptyForm);

  const resetForm = () => { setForm(emptyForm); setEditingId(null); setShowForm(false); };

  const handleEdit = (item) => {
    setForm({ section: item.section, type: item.type, order: item.order || 0, isActive: item.isActive !== false, data: { ...emptyData, ...(item.data || {}) } });
    setEditingId(item._id); setShowForm(true);
  };

  const updateData = (key, value) => setForm({ ...form, data: { ...form.data, [key]: value } });

  const handleSubmit = async (e) => {
    e.preventDefault(); setMessage('');
    const url = editingId ? `/api/site-content/${editingId}` : '/api/site-content';
    const method = editingId ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) return setMessage(data.message);
    setMessage(editingId ? (isRTL ? 'ویرایش شد' : 'Updated') : (isRTL ? 'ایجاد شد' : 'Created'));
    resetForm();
    const ref = await fetch('/api/site-content'); const refD = await ref.json();
    setContent(refD.data || []);
  };

  const handleDelete = async (id) => {
    if (!confirm(isRTL ? 'مطمئنید؟' : 'Sure?')) return;
    await fetch(`/api/site-content/${id}`, { method: 'DELETE' });
    const ref = await fetch('/api/site-content'); const refD = await ref.json();
    setContent(refD.data || []);
  };

  const getSectionLabel = (sec) => sec === 'about' ? (isRTL ? 'درباره ما' : 'About') : (isRTL ? 'تماس با ما' : 'Contact');
  const getTypeLabel = (type) => { const t = blockTypes.find((b) => b.value === type); return t ? (isRTL ? t.labelFa : t.labelEn) : type; };

  const needsNoData = ['team', 'locations', 'contact-info'];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">{isRTL ? 'محتوای سایت' : 'Site Content'}</h1>
        <Button onClick={() => { resetForm(); setShowForm(!showForm); }} variant="primary" size="sm">
          {showForm ? (isRTL ? 'انصراف' : 'Cancel') : (isRTL ? 'افزودن بلوک' : 'Add Block')}
        </Button>
      </div>

      {message && <div className="mb-4 p-3 rounded-lg text-sm bg-green-50 dark:bg-green-900/20 text-green-600">{message}</div>}

      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div><label className="block text-sm font-medium mb-1">{isRTL ? 'بخش' : 'Section'}</label><select value={form.section} onChange={(e) => setForm({...form, section: e.target.value})} className="w-full px-3 py-2 rounded-lg border text-sm">{sections.map((s) => <option key={s} value={s}>{getSectionLabel(s)}</option>)}</select></div>
              <div><label className="block text-sm font-medium mb-1">{isRTL ? 'نوع' : 'Type'}</label><select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} className="w-full px-3 py-2 rounded-lg border text-sm">{blockTypes.map((b) => <option key={b.value} value={b.value}>{isRTL ? b.labelFa : b.labelEn}</option>)}</select></div>
              <div><label className="block text-sm font-medium mb-1">{isRTL ? 'ترتیب' : 'Order'}</label><input type="number" value={form.order} onChange={(e) => setForm({...form, order: parseInt(e.target.value)||0})} className="w-full px-3 py-2 rounded-lg border text-sm" /></div>
            </div>
            {!needsNoData.includes(form.type) && (
              <div className="space-y-3 border-t pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-medium mb-1">{isRTL ? 'عنوان (EN)' : 'Title (EN)'}</label><input type="text" value={form.data.titleEn} onChange={(e) => updateData('titleEn', e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm" /></div>
                  <div><label className="block text-xs font-medium mb-1">{isRTL ? 'عنوان (FA)' : 'Title (FA