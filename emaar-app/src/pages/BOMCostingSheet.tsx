import { useState } from 'react';
import { DocumentProvider, FieldPublisher } from '@/lib/documentModel';
import ExportToolbar from '@/components/ExportToolbar';
import DocumentHeader from '@/components/DocumentHeader';
import EditableTable from '@/components/EditableTable';
import PrintDocument from '@/components/PrintDocument';
import DocumentStamp from '@/components/DocumentStamp';
import { Plus, Trash2, Package, Users, Wrench } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   بطاقة التكاليف BOM — BOM Costing Sheet
   ═══════════════════════════════════════════════════════════════ */

/* ── Table data ────────────────────────────────────────────────── */

const t1Columns = [
  'رقم الحساب', 'رقم التكلفة', 'الصنف', 'اسم المادة', 'الوحدة',
  'الكمية المعيارية للـ م³', 'السعر المعياري', 'التكلفة المعيارية الإجمالية', 'المخزن',
];
const t1Rows = [
  ['5010', 'CC-02', 'RM-01', 'أسمنت بورتلاند 42.5N', 'طن', '0.350', '45.00', '15.75', 'مخزن المواد'],
  ['5010', 'CC-02', 'RM-02', 'ركام خشن 20mm', 'طن', '0.700', '25.00', '17.50', 'مخزن المواد'],
  ['5010', 'CC-02', 'RM-03', 'ركام خشن 10mm', 'طن', '0.280', '28.00', '7.84', 'مخزن المواد'],
  ['5010', 'CC-02', 'RM-04', 'رمل ناعم', 'طن', '0.530', '20.00', '10.60', 'مخزن المواد'],
  ['5010', 'CC-02', 'RM-05', 'مياه معالجة', 'م³', '0.180', '5.00', '0.90', 'مخزن المواد'],
  ['5010', 'CC-02', 'RM-06', 'بلاستيسايزر SP430', 'لتر', '3.500', '8.00', '28.00', 'مخزن المواد'],
  ['5010', 'CC-02', 'RM-07', 'سيليكا فيوم', 'كجم', '17.500', '0.44', '7.61', 'مخزن المواد'],
  ['', '', '', '', '', '', '', '', ''],
];

const t2Columns = [
  'رقم الحساب', 'رقم التكلفة', 'مركز التكلفة', 'الاسم', 'رقم الموظف',
  'بيان العمالة', 'الوحدة', 'الكمية', 'سعر الوحدة', 'التكلفة الإجمالية',
];
const t2Rows = [
  ['5020', 'CC-01', 'CC-01', '—', '—', 'مشغل محطة الخلط', 'ساعة', '0.25', '50.00', '12.50'],
  ['5020', 'CC-01', 'CC-01', '—', '—', 'مساعد مشغل', 'ساعة', '0.25', '30.00', '7.50'],
  ['5020', 'CC-07', 'CC-07', '—', '—', 'سائق خلاطة (نقل)', 'رحلة', '0.50', '20.00', '10.00'],
  ['5020', 'CC-03', 'CC-03', '—', '—', 'فني مختبر (فحص)', 'عينة', '1.00', '2.50', '2.50'],
  ['', '', '', '', '', '', '', '', '', ''],
];

const t3Columns = [
  'رقم الحساب', 'رقم التكلفة', 'رقم المعدة', 'بيان المعدة', 'الوحدة',
  'الكمية', 'سعر الوحدة', 'التكلفة الإجمالية', 'طريقة التحميل',
];
const t3Rows = [
  ['5030', 'CC-04', 'EQ-001', 'لودر تحميل المواد', 'ساعة', '0.15', '80.00', '12.00', 'ساعات تشغيل'],
  ['5030', 'CC-04', 'EQ-002', 'محطة الخلط المركزية', 'م³', '1.00', '15.00', '15.00', 'لكل م³'],
  ['5030', 'CC-04', 'EQ-003', 'مضخة خرسانة', 'ساعة', '0.20', '50.00', '10.00', 'ساعات تشغيل'],
  ['', '', '', '', '', '', '', '', ''],
];

const t4Columns = [
  'رقم الحساب', 'رقم التكلفة', 'بند التكلفة', 'المعياري (ر.ي/م³)',
  'الفعلي (ر.ي/م³)', 'الانحراف', 'نسبة الانحراف %', 'حالة الانحراف',
];
const t4Rows = [
  ['5010', 'CC-02', 'المواد الخام', '88.20', '90.50', '2.30', '2.6%', 'تجاوز بسيط'],
  ['5020', 'CC-01', 'العمالة المباشرة', '32.50', '31.00', '-1.50', '-4.6%', 'وفر'],
  ['5030', 'CC-04', 'المعدات والآليات', '37.00', '38.50', '1.50', '4.1%', 'تجاوز بسيط'],
  ['—', '—', 'الإجمالي', '157.70', '160.00', '2.30', '1.5%', 'تجاوز مقبول'],
];

/* ── Inner content (uses document context) ─────────────────────── */

function BOMCostingContent() {
  const [concreteType, setConcreteType] = useState<'عادي' | 'مقاوم'>('مقاوم');

  /* Dynamic table list for "Add Table" functionality */
  const [extraTables, setExtraTables] = useState<
    { id: string; title: string; columns: string[]; rows: string[][] }[]
  >([]);

  const addTable = () => {
    const idx = extraTables.length + 1;
    setExtraTables((prev) => [
      ...prev,
      {
        id: `extra-t${idx}`,
        title: `جدول إضافي ${idx}`,
        columns: ['عمود 1', 'عمود 2', 'عمود 3'],
        rows: [['', '', '']],
      },
    ]);
  };

  const removeExtraTable = (id: string) => {
    setExtraTables((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── FieldPublishers (register fields in document model) ── */}
        <FieldPublisher id="f-product"       seq={1} label="اسم المنتج"              value="خرسانة جاهزة" />
        <FieldPublisher id="f-mix-code"      seq={2} label="كود الخلطة"              value="MIX-35-SRC" mono />
        <FieldPublisher id="f-qty"           seq={3} label="الكمية المطلوبة (م³)" value="1" />
        <FieldPublisher id="f-approval-date" seq={4} label="تاريخ الاعتماد"           value="2026-01-01" />
        <FieldPublisher id="f-concrete-type" seq={5} label="نوع الخرسانة"             value={concreteType} />
        <FieldPublisher id="f-grade"         seq={6} label="درجة المقاومة (N/mm²)" value="35" />
        <FieldPublisher id="f-po-ref"        seq={7} label="رقم أمر الإنتاج المرجعي"  value="PO-2026-112" mono />
        <FieldPublisher id="f-cc"            seq={8} label="رقم حساب التكلفة"         value="CC-35-2026" mono />

        {/* ── 1. Export Toolbar ── */}
        <ExportToolbar />

        {/* ── 2. Document Header ── */}
        <DocumentHeader
          title="بطاقة التكاليف BOM"
          docNumber="BOM-2026-035"
          location="عدن، بئر أحمد"
        />

        {/* ── 3. Mix Info Fields ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-bold text-navy mb-4">بيانات الخلطة</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* اسم المنتج */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">اسم المنتج</label>
              <input
                type="text"
                defaultValue="خرسانة جاهزة"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
            </div>

            {/* كود الخلطة */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">كود الخلطة</label>
              <input
                type="text"
                defaultValue="MIX-35-SRC"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
            </div>

            {/* الكمية المطلوبة */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">الكمية المطلوبة (م&sup3;)</label>
              <input
                type="number"
                defaultValue={1}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
            </div>

            {/* تاريخ الاعتماد */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">تاريخ الاعتماد</label>
              <input
                type="date"
                defaultValue="2026-01-01"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
            </div>

            {/* درجة المقاومة */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">درجة المقاومة (N/mm&sup2;)</label>
              <input
                type="number"
                defaultValue={35}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
            </div>

            {/* رقم أمر الإنتاج المرجعي */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">رقم أمر الإنتاج المرجعي</label>
              <input
                type="text"
                defaultValue="PO-2026-112"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
            </div>

            {/* رقم حساب التكلفة */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">رقم حساب التكلفة</label>
              <input
                type="text"
                defaultValue="CC-35-2026"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
            </div>

            {/* نوع الخرسانة — Toggle */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">نوع الخرسانة</label>
              <div className="flex rounded-lg overflow-hidden border border-gray-300">
                <button
                  type="button"
                  onClick={() => setConcreteType('مقاوم')}
                  className={`flex-1 px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                    concreteType === 'مقاوم'
                      ? 'bg-navy text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  مقاوم
                </button>
                <button
                  type="button"
                  onClick={() => setConcreteType('عادي')}
                  className={`flex-1 px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                    concreteType === 'عادي'
                      ? 'bg-navy text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  عادي
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. Cost Summary Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* تكلفة المواد الخام */}
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xs text-blue-600 mb-0.5">تكلفة المواد الخام</div>
              <div className="text-xl font-bold text-blue-900">88.20 <span className="text-sm font-normal">ر.ي/م&sup3;</span></div>
            </div>
          </div>

          {/* تكلفة العمالة */}
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-xs text-green-600 mb-0.5">تكلفة العمالة</div>
              <div className="text-xl font-bold text-green-900">32.50 <span className="text-sm font-normal">ر.ي/م&sup3;</span></div>
            </div>
          </div>

          {/* تكلفة المعدات */}
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <Wrench className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-xs text-amber-600 mb-0.5">تكلفة المعدات</div>
              <div className="text-xl font-bold text-amber-900">37.00 <span className="text-sm font-normal">ر.ي/م&sup3;</span></div>
            </div>
          </div>
        </div>

        {/* ── 5. Tables ── */}

        {/* Table 1 — المواد الخام */}
        <EditableTable
          id="t1"
          title="المواد الخام"
          subtitle="Raw Materials — Standard Cost per m³"
          headerColor="navy"
          initialColumns={t1Columns}
          initialRows={t1Rows}
        />

        {/* Table 2 — تكاليف العمالة المباشرة */}
        <EditableTable
          id="t2"
          title="تكاليف العمالة المباشرة"
          subtitle="Direct Labor Costs per m³"
          headerColor="teal"
          initialColumns={t2Columns}
          initialRows={t2Rows}
        />

        {/* Table 3 — تكاليف المعدات والآليات */}
        <EditableTable
          id="t3"
          title="تكاليف المعدات والآليات"
          subtitle="Equipment & Machinery Costs per m³"
          headerColor="slate"
          initialColumns={t3Columns}
          initialRows={t3Rows}
        />

        {/* Table 4 — جدول المقارنة */}
        <EditableTable
          id="t4"
          title="جدول المقارنة (الفعلي vs المعياري)"
          subtitle="Variance Analysis — Standard vs Actual"
          headerColor="amber"
          initialColumns={t4Columns}
          initialRows={t4Rows}
        />

        {/* Extra (dynamically added) tables */}
        {extraTables.map((table) => (
          <div key={table.id} className="relative">
            <button
              type="button"
              onClick={() => removeExtraTable(table.id)}
              className="absolute top-2 left-2 z-10 p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors cursor-pointer print-hidden"
              title="حذف الجدول"
            >
              <Trash2 size={16} />
            </button>
            <EditableTable
              id={table.id}
              title={table.title}
              headerColor="navy"
              initialColumns={table.columns}
              initialRows={table.rows}
            />
          </div>
        ))}

        {/* ── 6. Total Cost Banner ── */}
        <div className="flex items-center justify-between bg-navy rounded-xl p-6 mb-6 shadow-sm">
          <div className="text-right">
            <div className="text-white text-lg font-bold">
              إجمالي التكاليف المعيارية للمتر المكعب
            </div>
            <div className="text-white/70 text-sm" dir="ltr">
              Standard Cost per Cubic Metre (m&sup3;)
            </div>
          </div>
          <div className="text-left flex items-baseline gap-2">
            <span className="text-4xl font-bold text-accent">157.70</span>
            <span className="text-white text-sm">ر.ي / م&sup3;</span>
          </div>
        </div>

        {/* ── 7. Approvals ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="grid grid-cols-3 gap-8">
            {/* أعده */}
            <div className="text-center">
              <div className="text-sm font-bold text-navy mb-1">أعده</div>
              <div className="text-xs text-gray-500 mb-8">(محاسب التكاليف)</div>
              <div className="border-t-2 border-gray-300 pt-2">
                <div className="text-xs text-gray-400">التوقيع / الختم</div>
              </div>
            </div>

            {/* راجعه */}
            <div className="text-center">
              <div className="text-sm font-bold text-navy mb-1">راجعه</div>
              <div className="text-xs text-gray-500 mb-8">(المدير المالي)</div>
              <div className="border-t-2 border-gray-300 pt-2">
                <div className="text-xs text-gray-400">التوقيع / الختم</div>
              </div>
            </div>

            {/* اعتمده */}
            <div className="text-center">
              <div className="text-sm font-bold text-navy mb-1">اعتمده</div>
              <div className="text-xs text-gray-500 mb-8">(المدير العام)</div>
              <div className="border-t-2 border-gray-300 pt-2">
                <div className="text-xs text-gray-400">التوقيع / الختم</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 8. Add Table button ── */}
        <button
          type="button"
          onClick={addTable}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-navy text-sm font-medium rounded-lg border border-dashed border-gray-300 hover:border-navy hover:bg-navy/5 transition-colors cursor-pointer mb-6 print-hidden"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة جدول جديد</span>
        </button>

        {/* ── 9. Print Document (off-screen render for PDF export) ── */}
        <PrintDocument />

        {/* ── 10. Document Stamp ── */}
        <DocumentStamp documentName="بطاقة التكاليف BOM" />
      </div>
    </div>
  );
}

/* ── Page wrapper with DocumentProvider ─────────────────────────── */

export default function BOMCostingSheet() {
  return (
    <DocumentProvider
      config={{
        documentName: 'بطاقة التكاليف BOM',
        documentType: 'bom-costing-sheet',
        signatures: [
          { names: ['أعده (محاسب التكاليف)', 'راجعه (المدير المالي)', 'اعتمده (المدير العام)'] },
        ],
        summary: [
          { label: 'تكلفة المواد الخام', value: '88.20', unit: 'ر.ي/م³' },
          { label: 'تكلفة العمالة', value: '32.50', unit: 'ر.ي/م³' },
          { label: 'تكلفة المعدات', value: '37.00', unit: 'ر.ي/م³' },
        ],
      }}
    >
      <BOMCostingContent />
    </DocumentProvider>
  );
}
