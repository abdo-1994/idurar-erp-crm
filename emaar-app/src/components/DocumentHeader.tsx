import { useState, useEffect, useRef, useCallback } from 'react';
import { Pencil } from 'lucide-react';
import { useDocumentModel } from '@/lib/documentModel';

interface DocumentHeaderProps {
  title: string;
  docNumber?: string;
  location?: string;
  fiscalYear?: string;
  onTitleChange?: (t: string) => void;
}

export default function DocumentHeader({
  title,
  docNumber = '',
  location = '',
  fiscalYear = '2026',
  onTitleChange,
}: DocumentHeaderProps) {
  const { setHeader, headerRef } = useDocumentModel();

  const [editingTitle, setEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(title);
  const [localDocNumber, setLocalDocNumber] = useState(docNumber);
  const [localDate, setLocalDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [localLocation, setLocalLocation] = useState(location);
  const [localFiscalYear, setLocalFiscalYear] = useState(fiscalYear);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync to document model
  const syncHeader = useCallback(() => {
    setHeader({
      title: localTitle,
      docNumber: localDocNumber,
      date: localDate,
      location: localLocation,
      fiscalYear: localFiscalYear,
      logoUrl,
    });
  }, [localTitle, localDocNumber, localDate, localLocation, localFiscalYear, logoUrl, setHeader]);

  useEffect(() => {
    syncHeader();
  }, [syncHeader]);

  // Initialize from headerRef on mount
  useEffect(() => {
    const h = headerRef.current;
    if (h.logoUrl) setLogoUrl(h.logoUrl);
  }, [headerRef]);

  // Focus title input when editing
  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitle]);

  const handleTitleSave = () => {
    setEditingTitle(false);
    onTitleChange?.(localTitle);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setLogoUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
      <div className="flex items-start justify-between gap-6">
        {/* Text section (right side in RTL) */}
        <div className="flex-1 min-w-0">
          {/* Editable title */}
          <div className="group mb-2">
            {editingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSave();
                  if (e.key === 'Escape') {
                    setLocalTitle(title);
                    setEditingTitle(false);
                  }
                }}
                className="text-2xl font-bold text-navy bg-transparent border-b-2 border-accent outline-none w-full"
              />
            ) : (
              <button
                onClick={() => setEditingTitle(true)}
                className="flex items-center gap-2 text-right cursor-pointer bg-transparent border-none p-0"
              >
                <h1 className="text-2xl font-bold text-navy">
                  {localTitle}
                </h1>
                <Pencil className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </button>
            )}
          </div>

          {/* Company name */}
          <div className="text-lg font-semibold text-gray-700 mb-1">
            شركة إعمار ريدي ميكس للخرسانة الجاهزة
          </div>

          {/* Subtitle */}
          <div className="text-sm text-gray-500 mb-4" dir="ltr">
            Emaar Ready Mix Co. — Onyx Pro Financial System — السنة المالية{' '}
            {localFiscalYear}
          </div>

          {/* Fields grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Document number */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                رقم الوثيقة
              </label>
              <input
                type="text"
                value={localDocNumber}
                onChange={(e) => setLocalDocNumber(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                placeholder="DOC-001"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                التاريخ
              </label>
              <input
                type="date"
                value={localDate}
                onChange={(e) => setLocalDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                الموقع / الفرع
              </label>
              <input
                type="text"
                value={localLocation}
                onChange={(e) => setLocalLocation(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                placeholder="الرياض"
              />
            </div>

            {/* Fiscal year */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                السنة المالية
              </label>
              <input
                type="text"
                value={localFiscalYear}
                onChange={(e) => setLocalFiscalYear(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                placeholder="2026"
              />
            </div>
          </div>
        </div>

        {/* Logo area (left side in RTL) */}
        <div className="shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 hover:border-accent flex items-center justify-center overflow-hidden transition-colors cursor-pointer bg-gray-50"
            title="انقر لرفع الشعار"
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="شعار الشركة"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center p-2">
                <div className="text-navy font-bold text-xs leading-tight">
                  READY
                </div>
                <div className="text-accent font-bold text-lg leading-tight">
                  MIX
                </div>
                <div className="text-gray-400 text-[10px] mt-1">
                  انقر لرفع الشعار
                </div>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
