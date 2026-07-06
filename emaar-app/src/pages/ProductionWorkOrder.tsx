import { useState } from 'react';
import { DocumentProvider, FieldPublisher } from '@/lib/documentModel';
import ExportToolbar from '@/components/ExportToolbar';
import DocumentHeader from '@/components/DocumentHeader';
import EditableTable from '@/components/EditableTable';
import PrintDocument from '@/components/PrintDocument';
import DocumentStamp from '@/components/DocumentStamp';
import { Plus, Trash2 } from 'lucide-react';

/* ───── Print Config ───── */
const printConfig = {
  documentName: 'أمر تشغيل إنتاجي',
  documentType: 'production-work-order',
};

/* ───── Inline helper: Signature Row ───── */
function SignatureRow({ names }: { names: string[] }) {
  return (
    <div className="grid gap-4 my-4" style={{ gridTemplateColumns: `repeat(${names.length}, 1fr)` }}>
      {names.map((name, i) => (
        <div key={i} className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center min-h-20">
          <p className="text-sm font-bold text-gray-700">{name}</p>
          <div className="mt-6 border-t border-gray-300 pt-1">
            <p className="text-xs text-gray-400">التوقيع والتاريخ</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ───── Order Info Fields ───── */
const orderFields = [
  { id: 'f1', seq: 1, label: 'رقم أمر الإنتاج', value: 'PO-2026-112' },
  { id: 'f2', seq: 2, label: 'مركز التكلفة المدين', value: 'أمر إنتاج 112' },
  { id: 'f3', seq: 3, label: 'مركز الساحة', value: 'الساحة الرئيسية — عدن' },
  { id: 'f4', seq: 4, label: 'اسم المشروع', value: 'مشروع أبراج السكنية' },
  { id: 'f5', seq: 5, label: 'اسم العميل المعتمد', value: 'شركة المقاولات الحديثة' },
  { id: 'f6', seq: 6, label: 'الكمية المطلوبة الإجمالية (م³)', value: '500' },
  { id: 'f7', seq: 7, label: 'موقع المشروع', value: 'خور مكسر — الكورنيش' },
  { id: 'f8', seq: 8, label: 'تاريخ الإصدار', value: '2026-01-15' },
  { id: 'f9', seq: 9, label: 'وقت البدء المتوقع', value: '08:00' },
];

/* ───── Table 1: Raw Materials ───── */
const t1Columns = ['رقم الحساب', 'رقم التكلفة', 'الصنف', 'المواد الخام', 'الوحدة', 'الكمية الفعلية المصروفة للساحة', 'الكمية المعيارية المعتمد', 'الفارق'];
const t1Rows = [
  ['5010', 'CC-02', 'RM-01', 'أسمنت بورتلاند 42.5N', 'طن', '175', '170', '5'],
  ['5010', 'CC-02', 'RM-02', 'ركام خشن 20mm', 'طن', '360', '350', '10'],
  ['5010', 'CC-02', 'RM-03', 'ركام خشن 10mm', 'طن', '140', '135', '5'],
  ['5010', 'CC-02', 'RM-04', 'رمل ناعم', 'طن', '265', '260', '5'],
  ['5010', 'CC-02', 'RM-05', 'مياه معالجة', 'م³', '95', '90', '5'],
  ['5010', 'CC-02', 'RM-06', 'بلاستيسايزر', 'لتر', '18', '17.5', '0.5'],
  ['5010', 'CC-02', 'RM-07', 'سوبر بلاستيسايزر', 'لتر', '12', '11', '1'],
  ['5010', 'CC-02', 'RM-08', 'ألياف بولي بروبيلين', 'كجم', '3', '2.5', '0.5'],
  ['', '', '', '', '', '', '', ''],
];

/* ───── Table 2: Direct Labor ───── */
const t2Columns = ['مركز التكلفة', 'الاسم', 'رقم الموظف', 'الوظيفة/التكليف', 'وقت البدء', 'وقت الانتهاء', 'إجمالي الساعات', 'وحدة الأجر', 'مبلغ الوحدة', 'الإجمالي'];
const t2Rows = [
  ['CC-01', 'أحمد محمد علي', 'EMP-101', 'مشغل محطة الخلط', '06:00', '14:00', '8', 'ساعة', '150', '1,200'],
  ['CC-01', 'خالد عبدالله سالم', 'EMP-102', 'مساعد مشغل', '06:00', '14:00', '8', 'ساعة', '100', '800'],
  ['CC-07', 'سالم حسن أحمد', 'EMP-103', 'سائق خلاطة', '07:00', '16:00', '9', 'ساعة', '120', '1,080'],
  ['CC-07', 'عمر سعيد محمد', 'EMP-104', 'سائق خلاطة', '07:00', '15:00', '8', 'ساعة', '120', '960'],
  ['CC-03', 'ماجد علي حسن', 'EMP-105', 'فني مختبر', '06:30', '14:30', '8', 'ساعة', '130', '1,040'],
  ['', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', ''],
];

/* ───── Table 3: Equipment Operation ───── */
const t3Columns = ['رقم الحساب', 'رقم التكلفة', 'رقم المعدة', 'نوع المعدة', 'اسم السائق/المشغل', 'وقت البدء', 'وقت الانتهاء', 'إجمالي الساعات', 'وحدة الأجر', 'مبلغ الوحدة', 'الإجمالي'];
const t3Rows = [
  ['5030', 'CC-04', 'EQ-001', 'لودر كاتربلر 950H', 'فهد سالم', '06:00', '14:00', '8', 'ساعة', '200', '1,600'],
  ['5030', 'CC-04', 'EQ-002', 'خلاطة مركزية SIMEM', 'أحمد خالد', '06:00', '16:00', '10', 'ساعة', '150', '1,500'],
  ['5030', 'CC-04', 'EQ-003', 'مضخة خرسانة 42m', 'حسن عمر', '08:00', '15:00', '7', 'ساعة', '350', '2,450'],
  ['5030', 'CC-04', 'EQ-004', 'شاحنة خلاطة 10م³', 'سالم أحمد', '07:00', '16:00', '9', 'ساعة', '180', '1,620'],
  ['', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', ''],
];

/* ───── Table 4: Fuel Dispensing ───── */
const t4Columns = ['رقم الحساب', 'رقم التكلفة', 'رقم المعدة', 'نوع المعدة', 'اسم السائق/المشغل', 'قراءة العداد عند التعبئة', 'كمية الوقود الفعلي (لتر)', 'سعر اللتر', 'الإجمالي'];
const t4Rows = [
  ['6050', 'CC-04', 'EQ-001', 'لودر كاتربلر', 'فهد سالم', '12,450', '80', '12', '960'],
  ['6050', 'CC-04', 'EQ-003', 'مضخة خرسانة', 'حسن عمر', '8,200', '120', '12', '1,440'],
  ['6050', 'CC-07', 'TRK-01', 'شاحنة خلاطة 1', 'سالم أحمد', '45,600', '60', '12', '720'],
  ['6050', 'CC-07', 'TRK-02', 'شاحنة خلاطة 2', 'عمر سعيد', '38,900', '55', '12', '660'],
  ['', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', ''],
];

/* ───── Table 5: Direct Site Operating Expenses ───── */
const t5Columns = ['رقم الحساب', 'رقم التكلفة', 'بيان ومبرر المصروف المباشر الميداني', 'رقم سند الصرف الفرعي', 'المبلغ المصروف فعلياً'];
const t5Rows = [
  ['6010', 'CC-01', 'نقل معدات إضافية للموقع', 'EXP-001', '500'],
  ['6010', 'CC-01', 'مواد تنظيف وتعقيم الخلاطة', 'EXP-002', '150'],
  ['6010', 'CC-01', 'أدوات سلامة وحماية ميدانية', 'EXP-003', '300'],
  ['6010', 'CC-07', 'رسوم عبور ومواقف شاحنات', 'EXP-004', '200'],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
];

/* ═══════════════════════════════════════════════════════════
   Main Page Component
   ═══════════════════════════════════════════════════════════ */
export default function ProductionWorkOrder() {
  const [tables, setTables] = useState([
    { id: 't1', visible: true },
    { id: 't2', visible: true },
    { id: 't3', visible: true },
    { id: 't4', visible: true },
    { id: 't5', visible: true },
  ]);

  /* Track field values locally for the editable info grid */
  const [fields, setFields] = useState(orderFields);

  const updateFieldValue = (id: string, value: string) => {
    setFields(prev => prev.map(f => (f.id === id ? { ...f, value } : f)));
  };

  /* Add a new blank table */
  const addTable = () => {
    const nextId = `t${tables.length + 1}`;
    setTables(prev => [...prev, { id: nextId, visible: true }]);
  };

  return (
    <DocumentProvider config={printConfig}>
      <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
        <div className="max-w-7xl mx-auto">

          {/* ──── Export Toolbar ──── */}
          <ExportToolbar />

          {/* ──── Document Header ──── */}
          <DocumentHeader
            title="أمر تشغيل إنتاجي"
            docNumber="PO-2026-112"
            location="خور مكسر — الكورنيش"
          />

          {/* ──── Publish all fields to document model ──── */}
          {fields.map(f => (
            <FieldPublisher key={f.id} id={f.id} seq={f.seq} label={f.label} value={f.value} />
          ))}

          {/* ──── Order Info Fields (9 fields, 3-col grid) ──── */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {fields.map(f => (
                <div key={f.id}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                    {f.label}
                  </label>
                  <input
                    type="text"
                    value={f.value}
                    onChange={e => updateFieldValue(f.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ════════════════════════════════════════════
              Table 1 - Raw Materials Dispensing Control
              ════════════════════════════════════════════ */}
          <EditableTable
            id="t1"
            title="مراقبة وصرف المواد الخام"
            subtitle="Raw Materials Dispensing Control"
            headerColor="navy"
            initialColumns={t1Columns}
            initialRows={t1Rows}
          />
          <SignatureRow names={['أمين مخزن المواد الخام', 'مشغل الخلاطة المركزية', 'اعتماد فحص الجودة']} />

          {/* ════════════════════════════════════════════
              Table 2 - Direct Labor Wages & Operating Expenses
              ════════════════════════════════════════════ */}
          <EditableTable
            id="t2"
            title="أجور ومصاريف العمالة والتشغيل المباشر"
            subtitle="Direct Labor Wages & Operating Expenses"
            headerColor="teal"
            initialColumns={t2Columns}
            initialRows={t2Rows}
          />
          <SignatureRow names={['مدير الموقع', 'مشرف الإنتاج', 'مدير الموارد البشرية']} />

          {/* ════════════════════════════════════════════
              Table 3 - Equipment Operation Log
              ════════════════════════════════════════════ */}
          <EditableTable
            id="t3"
            title="تشغيل الآليات والمعدات"
            subtitle="Equipment Operation Log"
            headerColor="slate"
            initialColumns={t3Columns}
            initialRows={t3Rows}
          />
          <SignatureRow names={['مدير الموقع', 'مدير الحركة']} />

          {/* ════════════════════════════════════════════
              Table 4 - Fuel Dispensing Log
              ════════════════════════════════════════════ */}
          <EditableTable
            id="t4"
            title="صرف وتزويد الوقود"
            subtitle="Fuel Dispensing Log"
            headerColor="amber"
            initialColumns={t4Columns}
            initialRows={t4Rows}
          />
          <SignatureRow names={['مدير محطة الوقود', 'مدير الحركة']} />

          {/* ════════════════════════════════════════════
              Table 5 - Direct Site Operating Expenses
              ════════════════════════════════════════════ */}
          <EditableTable
            id="t5"
            title="المصاريف التشغيلية المباشرة للطلبية"
            subtitle="Direct Site Operating Expenses"
            headerColor="navy"
            initialColumns={t5Columns}
            initialRows={t5Rows}
          />

          {/* ════════════════════════════════════════════
              Final Approval Section
              ════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
            {/* Card 1 - Site Manager Approval */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-base font-bold text-navy mb-4 border-b border-gray-200 pb-2">
                اعتماد مدير الموقع
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">الاسم</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 min-h-10" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">التاريخ</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 min-h-10" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">التوقيع</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 min-h-10" />
                </div>
              </div>
            </div>

            {/* Card 2 - Cost Accountant & ERP */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-base font-bold text-navy mb-4 border-b border-gray-200 pb-2">
                خاص بمحاسب التكاليف والـ ERP
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                    رقم القيد المركب بالنظام
                  </label>
                  <div className="border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm bg-gray-50">
                    JE-2026-0542
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                    حالة مطابقة مراكز التكلفة
                  </label>
                  <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700">
                    متطابق
                  </span>
                </div>
                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-navy rounded" />
                    <span>مراجعة</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-navy rounded" />
                    <span>ترحيل</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-navy rounded" />
                    <span>إقفال أمر التكلفة</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* ──── Add Table Button ──── */}
          <div className="flex justify-center my-6 print-hidden">
            <button
              type="button"
              onClick={addTable}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-navy text-sm font-medium rounded-lg border-2 border-dashed border-gray-300 hover:border-accent hover:bg-accent/5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة جدول جديد</span>
            </button>
          </div>

          {/* ──── Dynamically added tables ──── */}
          {tables.filter(t => !['t1', 't2', 't3', 't4', 't5'].includes(t.id)).map(t => (
            <EditableTable
              key={t.id}
              id={t.id}
              title={`جدول ${t.id.replace('t', '')}`}
              headerColor="navy"
              initialColumns={['عمود 1', 'عمود 2', 'عمود 3']}
              initialRows={[['', '', ''], ['', '', '']]}
            />
          ))}

          {/* ──── Print Document (off-screen render for PDF) ──── */}
          <PrintDocument />

          {/* ──── Document Stamp ──── */}
          <DocumentStamp documentName="أمر تشغيل إنتاجي" />
        </div>
      </div>
    </DocumentProvider>
  );
}
