import { useState } from 'react';
import { DocumentProvider, FieldPublisher } from '@/lib/documentModel';
import ExportToolbar from '@/components/ExportToolbar';
import DocumentHeader from '@/components/DocumentHeader';
import EditableTable from '@/components/EditableTable';
import PrintDocument from '@/components/PrintDocument';
import DocumentStamp from '@/components/DocumentStamp';
import { Plus, Trash2, CheckCircle2, XCircle } from 'lucide-react';

/* ───── Print Config ───── */
const printConfig = {
  documentName: 'أمر تشغيل مالي',
  documentType: 'financial-work-order',
  companyName: 'شركة إعمار ريدي ميكس للخرسانة الجاهزة',
  systemLine: 'Emaar Ready Mix Co. — Onyx Pro Financial System — السنة المالية 2026',
};

/* ───── Table 1 - القيود المحاسبية الرئيسية ───── */
const t1Columns = [
  'رقم القيد', 'رقم الحساب', 'اسم الحساب',
  'مركز التكلفة المدين', 'رقم التكلفة المدين',
  'مركز التكلفة الدائن', 'رقم التكلفة الدائن',
  'البيان/الشرح', 'مدين', 'دائن',
];

const t1Rows = [
  ['JE-001', '5010', 'تكلفة مواد خام', 'أمر إنتاج 112', 'CC-42', 'مخزن المواد', 'CC-10', 'صرف مواد خام للإنتاج', '70,000', ''],
  ['JE-002', '1210', 'مخزون أسمنت', '', 'CC-10-STK', '', '', 'تخفيض مخزون أسمنت', '', '32,000'],
  ['JE-003', '1220', 'مخزون ركام', '', 'CC-10-STK', '', '', 'تخفيض مخزون ركام', '', '22,000'],
  ['JE-004', '1230', 'مخزون رمل', '', 'CC-10-STK', '', '', 'تخفيض مخزون رمل', '', '10,000'],
  ['JE-005', '1240', 'مخزون إضافات', '', 'CC-10-STK', '', '', 'تخفيض مخزون إضافات', '', '6,000'],
  ['JE-006', '5020', 'أجور مباشرة', 'أمر إنتاج 112', 'CC-42', 'مستحقات عمال', 'CC-20', 'أجور عمالة الإنتاج', '5,000', ''],
  ['JE-007', '2110', 'مستحقات أجور', '', 'CC-20', '', '', 'استحقاق أجور', '', '5,000'],
  ['JE-008', '5030', 'تشغيل آليات', 'أمر إنتاج 112', 'CC-42', 'إهلاك معدات', 'CC-41', 'تحميل تكلفة آليات', '8,000', ''],
  ['JE-009', '6050', 'وقود وتزويد', 'أمر إنتاج 112', 'CC-42', 'مخزن وقود', 'CC-41', 'صرف وقود الإنتاج', '3,500', ''],
  ['JE-010', '2120', 'مستحقات موردين', '', 'CC-42-STK', '', '', 'إقفال مستحقات', '', '17,500'],
  ['', '', '', '', '', '', '', '', '', ''],
];

/* ───── Table 2 - مطابقة مراكز التكلفة ───── */
const t2Columns = [
  'رقم التكلفة', 'اسم مركز التكلفة',
  'إجمالي المدين', 'إجمالي الدائن', 'الفارق', 'حالة المطابقة',
];

const t2Rows = [
  ['CC-10', 'مركز المواد الخام', '0', '0', '0', 'متطابق'],
  ['CC-20', 'مركز محطة الخلط', '0', '5,000', '-5,000', 'متطابق'],
  ['CC-41', 'مركز حركة المعدات', '0', '0', '0', 'متطابق'],
  ['CC-42', 'أمر إنتاج 112 (مدين)', '86,500', '0', '86,500', 'متطابق'],
  ['CC-10-STK', 'مخزون المواد (دائن)', '0', '70,000', '-70,000', 'متطابق'],
  ['CC-42-STK', 'مستحقات أمر 112', '0', '17,500', '-17,500', 'متطابق'],
  ['—', 'الإجمالي', '86,500', '86,500', '0', 'متطابق'],
  ['', '', '', '', '', ''],
];

/* ───── Default columns for new dynamic tables ───── */
const defaultNewColumns = [
  'رقم القيد', 'رقم الحساب', 'اسم الحساب', 'البيان',
  'مدين', 'دائن',
];

interface DynamicTable {
  id: string;
  title: string;
  columns: string[];
  rows: string[][];
}

/* ───── Section Divider ───── */
function SectionDivider({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4 my-8">
      <div className="flex-1 h-px bg-gray-300" />
      <span className="text-lg font-bold text-navy whitespace-nowrap">{title}</span>
      <div className="flex-1 h-px bg-gray-300" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   FinancialWorkOrder Page
   ═══════════════════════════════════════════════════════ */
export default function FinancialWorkOrder() {
  const [resetKey, setResetKey] = useState(0);
  const [dynamicTables, setDynamicTables] = useState<DynamicTable[]>([]);
  const [isMatched, setIsMatched] = useState(true);
  const [statusChecks, setStatusChecks] = useState({
    review: false,
    posting: false,
    closing: false,
  });

  const addTable = () => {
    const id = `dynamic-${Date.now()}`;
    setDynamicTables(prev => [
      ...prev,
      {
        id,
        title: 'جدول جديد',
        columns: [...defaultNewColumns],
        rows: [
          new Array(defaultNewColumns.length).fill(''),
          new Array(defaultNewColumns.length).fill(''),
          new Array(defaultNewColumns.length).fill(''),
        ],
      },
    ]);
  };

  const removeTable = (id: string) => {
    setDynamicTables(prev => prev.filter(t => t.id !== id));
  };

  const toggleStatusCheck = (key: keyof typeof statusChecks) => {
    setStatusChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <DocumentProvider config={printConfig}>
      <div dir="rtl" className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-[1400px] mx-auto">

          {/* ── Field Publishers for Print ── */}
          <FieldPublisher id="f-doc" seq={1} label="رقم القيد المركب بالنظام" value="JE-2026-0542" mono />
          <FieldPublisher id="f-po" seq={2} label="رقم أمر الإنتاج المرجعي" value="PO-2026-112" mono />
          <FieldPublisher id="f-close-date" seq={3} label="تاريخ الإقفال" value="2026-03-15" />
          <FieldPublisher id="f-cycle" seq={4} label="رقم دورة المحاسبة" value="2026-Q1" mono />
          <FieldPublisher id="f-cc" seq={5} label="مركز التكلفة المدين الرئيسي" value="أمر إنتاج 112" />
          <FieldPublisher id="f-project" seq={6} label="اسم المشروع/الطلبية" value="مشروع أبراج السكنية" />
          <FieldPublisher id="f-qty" seq={7} label="الكمية المنتجة الفعلية (م³)" value="500" />
          <FieldPublisher id="f-match" seq={8} label="حالة مطابقة المدين/الدائن" value={isMatched ? 'متطابق' : 'غير متطابق'} />

          {/* ── Export Toolbar ── */}
          <ExportToolbar key={`export-${resetKey}`} />

          {/* ── Document Header ── */}
          <DocumentHeader
            key={`header-${resetKey}`}
            title="أمر تشغيل مالي"
            docNumber="JE-2026-0542"
            location="إدارة التكاليف والمحاسبة"
            fiscalYear="2026"
          />

          {/* ══════════════════════════════════════
             Order Info Fields
             ══════════════════════════════════════ */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {/* رقم القيد المركب بالنظام */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">رقم القيد المركب بالنظام</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono font-semibold text-gray-800">
                  JE-2026-0542
                </div>
              </div>

              {/* رقم أمر الإنتاج المرجعي */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">رقم أمر الإنتاج المرجعي</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono font-semibold text-gray-800">
                  PO-2026-112
                </div>
              </div>

              {/* تاريخ الإقفال */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">تاريخ الإقفال</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-800">
                  2026-03-15
                </div>
              </div>

              {/* رقم دورة المحاسبة */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">رقم دورة المحاسبة</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono font-semibold text-gray-800">
                  2026-Q1
                </div>
              </div>

              {/* مركز التكلفة المدين الرئيسي */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">مركز التكلفة المدين الرئيسي</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-800">
                  أمر إنتاج 112
                </div>
              </div>

              {/* اسم المشروع/الطلبية */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">اسم المشروع/الطلبية</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-800">
                  مشروع أبراج السكنية
                </div>
              </div>

              {/* الكمية المنتجة الفعلية */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">الكمية المنتجة الفعلية (م³)</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-800">
                  500
                </div>
              </div>

              {/* حالة مطابقة المدين/الدائن - Toggle */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">حالة مطابقة المدين/الدائن</label>
                <button
                  type="button"
                  onClick={() => setIsMatched(!isMatched)}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                    isMatched
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}
                >
                  {isMatched ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>متطابق</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>غير متطابق</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════
             Table 1 - القيود المحاسبية الرئيسية
             ══════════════════════════════════════ */}
          <SectionDivider title="القيود المحاسبية الرئيسية" />
          <EditableTable
            key={`t1-${resetKey}`}
            id="t1"
            title="القيود المحاسبية الرئيسية"
            subtitle="Cost Accounting Journal Entries & Cost Center Mapping"
            headerColor="navy"
            initialColumns={t1Columns}
            initialRows={t1Rows}
          />

          {/* ══════════════════════════════════════
             Table 2 - مطابقة مراكز التكلفة
             ══════════════════════════════════════ */}
          <SectionDivider title="مطابقة مراكز التكلفة" />
          <EditableTable
            key={`t2-${resetKey}`}
            id="t2"
            title="مطابقة مراكز التكلفة"
            subtitle="Cost Center Reconciliation"
            headerColor="teal"
            initialColumns={t2Columns}
            initialRows={t2Rows}
          />

          {/* ══════════════════════════════════════
             Summary Panels (side by side)
             ══════════════════════════════════════ */}
          <SectionDivider title="ملخص التكاليف والتحليل" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Panel 1 - إجمالي التكاليف المباشرة الفعلية */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-[#1B2E4B] text-white px-5 py-3 text-sm font-bold">
                إجمالي التكاليف المباشرة الفعلية
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">مواد خام</span>
                  <span className="font-semibold text-gray-800">70,000</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">أجور مباشرة</span>
                  <span className="font-semibold text-gray-800">5,000</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">تشغيل آليات</span>
                  <span className="font-semibold text-gray-800">8,000</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">وقود وتزويد</span>
                  <span className="font-semibold text-gray-800">3,500</span>
                </div>
                <div className="flex items-center justify-between text-sm pt-3 border-t-2 border-gray-300">
                  <span className="font-bold text-gray-900">الإجمالي الكلي</span>
                  <span className="font-bold text-gray-900 text-lg">86,500</span>
                </div>
              </div>
            </div>

            {/* Panel 2 - تحليل انحراف التكلفة */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-[#1B2E4B] text-white px-5 py-3 text-sm font-bold">
                تحليل انحراف التكلفة
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">إجمالي التكلفة الفعلية</span>
                  <span className="font-semibold text-red-600">86,500</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">التكلفة المعيارية المقدرة</span>
                  <span className="font-semibold text-green-600">85,000</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">الكمية المنتجة (م³)</span>
                  <span className="font-semibold text-gray-800">500</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">تكلفة الوحدة الفعلية</span>
                  <span className="font-semibold text-gray-800">173 ر.ي/م³</span>
                </div>
                <div className="flex items-center justify-between text-sm pt-3 border-t-2 border-gray-300">
                  <span className="font-bold text-gray-900">انحراف التكلفة</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-red-600 text-lg">1,500</span>
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">تجاوز بسيط</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════
             Dynamic Tables
             ══════════════════════════════════════ */}
          {dynamicTables.map((dt) => (
            <div key={`dynamic-wrapper-${dt.id}-${resetKey}`} className="relative">
              <SectionDivider title={dt.title} />
              <button
                type="button"
                onClick={() => removeTable(dt.id)}
                className="absolute top-6 left-0 inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-100 transition-colors cursor-pointer print-hidden"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف الجدول</span>
              </button>
              <EditableTable
                key={`${dt.id}-${resetKey}`}
                id={dt.id}
                title={dt.title}
                headerColor="navy"
                initialColumns={dt.columns}
                initialRows={dt.rows}
              />
            </div>
          ))}

          {/* ── Add Table Button ── */}
          <div className="flex justify-center my-8 print-hidden">
            <button
              type="button"
              onClick={addTable}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-navy text-sm font-medium rounded-xl border-2 border-dashed border-gray-300 hover:border-navy hover:bg-navy/5 transition-colors cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>+ إضافة جدول جديد</span>
            </button>
          </div>

          {/* ══════════════════════════════════════
             Signatures Section
             ══════════════════════════════════════ */}
          <SectionDivider title="الاعتمادات والتوقيعات" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { role: 'أعده', title: 'محاسب التكاليف' },
              { role: 'راجعه', title: 'رئيس الحسابات' },
              { role: 'اعتمده', title: 'المدير المالي' },
              { role: 'ترحيل النظام', title: 'ERP' },
            ].map((sig) => (
              <div
                key={sig.role}
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-24 flex flex-col items-center justify-center text-center"
              >
                <div className="text-sm font-bold text-navy mb-1">{sig.role}</div>
                <div className="text-xs text-gray-500">({sig.title})</div>
                <div className="mt-4 w-full border-t border-gray-200 pt-2 text-xs text-gray-400">
                  التوقيع / الختم
                </div>
              </div>
            ))}
          </div>

          {/* ══════════════════════════════════════
             Status Checkboxes
             ══════════════════════════════════════ */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-8">
            <div className="flex items-center gap-8">
              <label className="flex items-center gap-2 cursor-pointer" onClick={() => toggleStatusCheck('review')}>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${statusChecks.review ? 'bg-navy border-navy text-white' : 'border-gray-300 bg-white'}`}>
                  {statusChecks.review && <span className="text-xs">&#10003;</span>}
                </div>
                <span className="text-sm font-medium text-gray-700">مراجعة</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer" onClick={() => toggleStatusCheck('posting')}>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${statusChecks.posting ? 'bg-navy border-navy text-white' : 'border-gray-300 bg-white'}`}>
                  {statusChecks.posting && <span className="text-xs">&#10003;</span>}
                </div>
                <span className="text-sm font-medium text-gray-700">ترحيل</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer" onClick={() => toggleStatusCheck('closing')}>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${statusChecks.closing ? 'bg-navy border-navy text-white' : 'border-gray-300 bg-white'}`}>
                  {statusChecks.closing && <span className="text-xs">&#10003;</span>}
                </div>
                <span className="text-sm font-medium text-gray-700">إقفال أمر التكلفة</span>
              </label>
            </div>
          </div>

          {/* ── Print Document (off-screen render for PDF export) ── */}
          <PrintDocument key={`print-${resetKey}`} />

          {/* ── Document Stamp (visible in print only) ── */}
          <DocumentStamp documentName="أمر تشغيل مالي" />

        </div>
      </div>
    </DocumentProvider>
  );
}
