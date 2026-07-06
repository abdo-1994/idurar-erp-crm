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
  documentName: 'دليل مراكز التكلفة والموازنات',
  documentType: 'cost-centers-budget',
  companyName: 'شركة إعمار ريدي ميكس للخرسانة الجاهزة',
  systemLine: 'Emaar Ready Mix Co. — Onyx Pro Financial System — السنة المالية 2026',
};

/* ───── Cost Center Tree Data ───── */
const costCenters = [
  { code: 'CC-10', nameAr: 'مركز المواد الخام', nameEn: 'Yard & Raw Materials' },
  { code: 'CC-20', nameAr: 'مركز محطة الخلط', nameEn: 'Batching Plant' },
  { code: 'CC-21', nameAr: 'مركز النقل والتسليم', nameEn: 'Trucks & Delivery' },
  { code: 'CC-22', nameAr: 'مركز الساحة والمعدات', nameEn: 'Yard Equipment & Loader' },
  { code: 'CC-41', nameAr: 'مركز حركة المعدات', nameEn: 'Equipment Operations' },
  { code: 'CC-23', nameAr: 'مركز الإدارة العامة', nameEn: 'Administration' },
];

/* ───── Shared Columns for All Cost Center Tables ───── */
const ccColumns = [
  'البيان', 'رقم الحساب', 'رقم التكلفة',
  'عدن', 'بئر أحمد', 'الكريتر', 'الشيخ عثمان', 'المنصورة',
  'الإجمالي', 'ملاحظات',
];

/* ───── Table Data per Cost Center ───── */
const cc10Rows = [
  ['أسمنت بورتلاند', '1210', 'CC-10', '50,000', '30,000', '20,000', '15,000', '10,000', '125,000', '—'],
  ['ركام خشن', '1220', 'CC-10', '40,000', '25,000', '15,000', '12,000', '8,000', '100,000', '—'],
  ['رمل ناعم', '1230', 'CC-10', '25,000', '18,000', '10,000', '8,000', '5,000', '66,000', '—'],
  ['مياه معالجة', '1250', 'CC-10', '3,000', '2,000', '1,500', '1,000', '800', '8,300', '—'],
  ['إضافات كيميائية', '1240', 'CC-10', '15,000', '10,000', '8,000', '5,000', '3,000', '41,000', '—'],
  ['معدات ساحة', '6040', 'CC-10', '5,000', '3,000', '2,000', '1,500', '1,000', '12,500', '—'],
  ['عمالة ساحة', '5020', 'CC-10', '8,000', '5,000', '3,000', '2,500', '2,000', '20,500', '—'],
  ['', '', '', '', '', '', '', '', '', ''],
];

const cc22Rows = [
  ['صيانة لودر', '6040', 'CC-22', '3,000', '2,000', '1,500', '1,000', '500', '8,000', '—'],
  ['وقود لودر', '6050', 'CC-22', '4,000', '2,500', '2,000', '1,500', '1,000', '11,000', '—'],
  ['سائق لودر', '5020', 'CC-22', '5,000', '3,000', '2,500', '2,000', '1,500', '14,000', '—'],
  ['قطع غيار', '6040', 'CC-22', '2,000', '1,500', '1,000', '800', '500', '5,800', '—'],
  ['إهلاك معدات', '6030', 'CC-22', '3,000', '2,000', '1,500', '1,000', '500', '8,000', '—'],
  ['', '', '', '', '', '', '', '', '', ''],
];

const cc20Rows = [
  ['صيانة محطة', '6040', 'CC-20', '4,000', '3,000', '2,000', '1,500', '1,000', '11,500', '—'],
  ['كهرباء محطة', '6010', 'CC-20', '5,000', '3,500', '2,500', '2,000', '1,500', '14,500', '—'],
  ['مشغلو محطة', '5020', 'CC-20', '8,000', '5,000', '4,000', '3,000', '2,500', '22,500', '—'],
  ['مواد استهلاكية', '6010', 'CC-20', '2,000', '1,500', '1,000', '800', '500', '5,800', '—'],
  ['قطع غيار محطة', '6040', 'CC-20', '3,000', '2,000', '1,500', '1,000', '500', '8,000', '—'],
  ['ضبط جودة', '6010', 'CC-20', '2,000', '1,500', '1,000', '800', '500', '5,800', '—'],
  ['', '', '', '', '', '', '', '', '', ''],
];

const cc21Rows = [
  ['وقود شاحنات', '6050', 'CC-21', '8,000', '5,000', '4,000', '3,000', '2,000', '22,000', '—'],
  ['صيانة شاحنات', '6040', 'CC-21', '5,000', '3,000', '2,500', '2,000', '1,500', '14,000', '—'],
  ['سائقون', '5020', 'CC-21', '10,000', '6,000', '5,000', '4,000', '3,000', '28,000', '—'],
  ['تأمين مركبات', '6010', 'CC-21', '3,000', '2,000', '1,500', '1,200', '800', '8,500', '—'],
  ['رسوم طرق', '6010', 'CC-21', '1,000', '800', '600', '500', '400', '3,300', '—'],
  ['إهلاك شاحنات', '6030', 'CC-21', '5,000', '3,000', '2,500', '2,000', '1,500', '14,000', '—'],
  ['', '', '', '', '', '', '', '', '', ''],
];

const cc41Rows = [
  ['وقود مضخات', '6050', 'CC-41', '5,000', '3,000', '2,500', '2,000', '1,500', '14,000', '—'],
  ['صيانة مضخات', '6040', 'CC-41', '4,000', '2,500', '2,000', '1,500', '1,000', '11,000', '—'],
  ['مشغلو مضخات', '5020', 'CC-41', '6,000', '4,000', '3,000', '2,500', '2,000', '17,500', '—'],
  ['قطع غيار', '6040', 'CC-41', '2,000', '1,500', '1,000', '800', '500', '5,800', '—'],
  ['إهلاك مضخات', '6030', 'CC-41', '3,000', '2,000', '1,500', '1,000', '500', '8,000', '—'],
  ['', '', '', '', '', '', '', '', '', ''],
];

const cc23Rows = [
  ['رواتب إدارية', '5020', 'CC-23', '12,000', '8,000', '6,000', '5,000', '4,000', '35,000', '—'],
  ['إيجار مكاتب', '6010', 'CC-23', '5,000', '3,000', '2,500', '2,000', '1,500', '14,000', '—'],
  ['اتصالات', '6010', 'CC-23', '1,500', '1,000', '800', '600', '500', '4,400', '—'],
  ['مصاريف مكتبية', '6010', 'CC-23', '1,000', '800', '600', '500', '400', '3,300', '—'],
  ['تأمينات', '6010', 'CC-23', '2,000', '1,500', '1,000', '800', '500', '5,800', '—'],
  ['خدمات مشتركة', '6010', 'CC-23', '3,000', '2,000', '1,500', '1,200', '1,000', '8,700', '—'],
  ['', '', '', '', '', '', '', '', '', ''],
];

/* ───── Default columns for new dynamic cost centers ───── */
const defaultNewColumns = [...ccColumns];

interface DynamicTable {
  id: string;
  title: string;
  columns: string[];
  rows: string[][];
}

/* ───── Collapsible Card Component ───── */
function CollapsibleCard({ code, nameAr, nameEn, children, defaultOpen = true }: { code: string; nameAr: string; nameEn: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl shadow-sm border mb-6 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
        <div className="flex items-center gap-3">
          <span className="bg-primary text-white px-2 py-1 rounded text-sm font-mono font-bold">{code}</span>
          <div className="text-right">
            <p className="font-bold text-gray-800">{nameAr}</p>
            <p className="text-xs text-gray-500">{nameEn}</p>
          </div>
        </div>
        <span className="text-gray-400">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   CostCentersBudget Page
   ═══════════════════════════════════════════════════════ */
export default function CostCentersBudget() {
  const [resetKey, setResetKey] = useState(0);
  const [dynamicTables, setDynamicTables] = useState<DynamicTable[]>([]);

  const addCostCenter = () => {
    const id = `dynamic-${Date.now()}`;
    setDynamicTables(prev => [
      ...prev,
      {
        id,
        title: 'مركز تكلفة جديد',
        columns: [...defaultNewColumns],
        rows: [
          new Array(defaultNewColumns.length).fill(''),
          new Array(defaultNewColumns.length).fill(''),
          new Array(defaultNewColumns.length).fill(''),
        ],
      },
    ]);
  };

  const removeCostCenter = (id: string) => {
    setDynamicTables(prev => prev.filter(t => t.id !== id));
  };

  return (
    <DocumentProvider config={printConfig}>
      <div dir="rtl" className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-[1400px] mx-auto">

          {/* ── Field Publishers ── */}
          <FieldPublisher id="f-doc" seq={1} label="رقم الوثيقة" value="CCB-2026-001" mono />
          <FieldPublisher id="f-loc" seq={2} label="الموقع" value="جميع المواقع" />

          {/* ── Export Toolbar ── */}
          <ExportToolbar key={`export-${resetKey}`} />

          {/* ── Document Header ── */}
          <DocumentHeader
            key={`header-${resetKey}`}
            title="دليل مراكز التكلفة والموازنات"
            docNumber="CCB-2026-001"
            location="جميع المواقع"
            fiscalYear="2026"
          />

          {/* ══════════════════════════════════════
             Cost Center Tree - 3x2 Grid
             ══════════════════════════════════════ */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {costCenters.map((cc) => (
              <div
                key={cc.code}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3"
              >
                <span className="bg-navy text-white px-2.5 py-1.5 rounded-lg text-sm font-mono font-bold shrink-0">
                  {cc.code}
                </span>
                <div className="min-w-0">
                  <div className="font-bold text-gray-800 text-sm">{cc.nameAr}</div>
                  <div className="text-xs text-gray-500">{cc.nameEn}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ══════════════════════════════════════
             Card 1 - CC-10 مركز الساحة والمواد الخام
             ══════════════════════════════════════ */}
          <CollapsibleCard code="CC-10" nameAr="مركز الساحة والمواد الخام" nameEn="Yard & Raw Materials">
            <EditableTable
              key={`cc10-${resetKey}`}
              id="cc10"
              title="CC-10 مركز الساحة والمواد الخام"
              subtitle="Yard & Raw Materials Cost Center"
              headerColor="navy"
              initialColumns={ccColumns}
              initialRows={cc10Rows}
            />
          </CollapsibleCard>

          {/* ══════════════════════════════════════
             Card 2 - CC-22 مركز معدات الساحة واللودر
             ══════════════════════════════════════ */}
          <CollapsibleCard code="CC-22" nameAr="مركز معدات الساحة واللودر" nameEn="Yard Equipment & Loader">
            <EditableTable
              key={`cc22-${resetKey}`}
              id="cc22"
              title="CC-22 مركز معدات الساحة واللودر"
              subtitle="Yard Equipment & Loader Cost Center"
              headerColor="teal"
              initialColumns={ccColumns}
              initialRows={cc22Rows}
            />
          </CollapsibleCard>

          {/* ══════════════════════════════════════
             Card 3 - CC-20 مركز محطة الخلط
             ══════════════════════════════════════ */}
          <CollapsibleCard code="CC-20" nameAr="مركز محطة الخلط" nameEn="Batching Plant">
            <EditableTable
              key={`cc20-${resetKey}`}
              id="cc20"
              title="CC-20 مركز محطة الخلط"
              subtitle="Batching Plant Cost Center"
              headerColor="slate"
              initialColumns={ccColumns}
              initialRows={cc20Rows}
            />
          </CollapsibleCard>

          {/* ══════════════════════════════════════
             Card 4 - CC-21 مركز شاحنات التسليم والنقل
             ══════════════════════════════════════ */}
          <CollapsibleCard code="CC-21" nameAr="مركز شاحنات التسليم والنقل" nameEn="Trucks & Delivery">
            <EditableTable
              key={`cc21-${resetKey}`}
              id="cc21"
              title="CC-21 مركز شاحنات التسليم والنقل"
              subtitle="Trucks & Delivery Cost Center"
              headerColor="amber"
              initialColumns={ccColumns}
              initialRows={cc21Rows}
            />
          </CollapsibleCard>

          {/* ══════════════════════════════════════
             Card 5 - CC-41 مركز المضخات وحركة المعدات
             ══════════════════════════════════════ */}
          <CollapsibleCard code="CC-41" nameAr="مركز المضخات وحركة المعدات" nameEn="Equipment Operations">
            <EditableTable
              key={`cc41-${resetKey}`}
              id="cc41"
              title="CC-41 مركز المضخات وحركة المعدات"
              subtitle="Pumps & Equipment Operations Cost Center"
              headerColor="navy"
              initialColumns={ccColumns}
              initialRows={cc41Rows}
            />
          </CollapsibleCard>

          {/* ══════════════════════════════════════
             Card 6 - CC-23 مركز الإدارة والخدمات المشتركة
             ══════════════════════════════════════ */}
          <CollapsibleCard code="CC-23" nameAr="مركز الإدارة والخدمات المشتركة" nameEn="Administration & Shared Services">
            <EditableTable
              key={`cc23-${resetKey}`}
              id="cc23"
              title="CC-23 مركز الإدارة والخدمات المشتركة"
              subtitle="Administration & Shared Services Cost Center"
              headerColor="slate"
              initialColumns={ccColumns}
              initialRows={cc23Rows}
            />
          </CollapsibleCard>

          {/* ══════════════════════════════════════
             Dynamic Cost Centers
             ══════════════════════════════════════ */}
          {dynamicTables.map((dt) => (
            <div key={`dynamic-wrapper-${dt.id}-${resetKey}`} className="relative">
              <CollapsibleCard code="NEW" nameAr={dt.title} nameEn="New Cost Center">
                <button
                  type="button"
                  onClick={() => removeCostCenter(dt.id)}
                  className="absolute top-4 left-4 inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-100 transition-colors cursor-pointer print-hidden z-10"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>حذف المركز</span>
                </button>
                <EditableTable
                  key={`${dt.id}-${resetKey}`}
                  id={dt.id}
                  title={dt.title}
                  headerColor="navy"
                  initialColumns={dt.columns}
                  initialRows={dt.rows}
                />
              </CollapsibleCard>
            </div>
          ))}

          {/* ── Add Cost Center Button ── */}
          <div className="flex justify-center my-8 print-hidden">
            <button
              type="button"
              onClick={addCostCenter}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-navy text-sm font-medium rounded-xl border-2 border-dashed border-gray-300 hover:border-navy hover:bg-navy/5 transition-colors cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>+ إضافة مركز تكلفة جديد</span>
            </button>
          </div>

          {/* ── Print Document (off-screen render for PDF export) ── */}
          <PrintDocument key={`print-${resetKey}`} />

          {/* ── Document Stamp (visible in print only) ── */}
          <DocumentStamp documentName="دليل مراكز التكلفة والموازنات" />

        </div>
      </div>
    </DocumentProvider>
  );
}
