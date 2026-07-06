import { useState } from 'react';
import { DocumentProvider } from '@/lib/documentModel';
import ExportToolbar from '@/components/ExportToolbar';
import DocumentHeader from '@/components/DocumentHeader';
import EditableTable from '@/components/EditableTable';
import PrintDocument from '@/components/PrintDocument';
import DocumentStamp from '@/components/DocumentStamp';
import { TrendingUp, ShoppingCart, Users, Settings, Plus, Trash2 } from 'lucide-react';

/* ───── Print Config ───── */
const printConfig = {
  documentName: 'الموازنة التقديرية الشاملة',
  documentType: 'comprehensive-budget',
  companyName: 'شركة إعمار ريدي ميكس للخرسانة الجاهزة',
  systemLine: 'Emaar Ready Mix Co. — Onyx Pro Financial System — السنة المالية 2026',
};

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

/* ───── Summary Cards Data ───── */
const summaryCards = [
  {
    label: 'إجمالي المبيعات',
    value: '1,070,000',
    unit: 'ر.ي',
    icon: TrendingUp,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    label: 'إجمالي المشتريات',
    value: '940,000',
    unit: 'ر.ي',
    icon: ShoppingCart,
    color: 'bg-green-100 text-green-600',
  },
  {
    label: 'إجمالي الأجور',
    value: '208,800',
    unit: 'ر.ي',
    icon: Users,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    label: 'إجمالي المصاريف التشغيلية',
    value: '113,500',
    unit: 'ر.ي',
    icon: Settings,
    color: 'bg-orange-100 text-orange-600',
  },
];

/* ───── Table Data ───── */

const t1Columns = [
  'رقم الحساب', 'رقم التكلفة', 'الصنف', 'اسم الصنف', 'المخزن', 'مركز التكلفة',
  'Q1-كمية', 'Q1-قيمة', 'Q2-كمية', 'Q2-قيمة', 'Q3-كمية', 'Q3-قيمة',
  'Q4-كمية', 'Q4-قيمة', 'الإجمالي-كمية', 'الإجمالي-قيمة',
];

const t1Rows = [
  ['4010', 'CC-01', 'MIX-C25', 'خرسانة C25', 'مخزن عدن', 'CC-01', '500', '125,000', '600', '150,000', '550', '137,500', '500', '125,000', '2,150', '537,500'],
  ['4010', 'CC-01', 'MIX-C30', 'خرسانة C30', 'مخزن عدن', 'CC-01', '300', '90,000', '350', '105,000', '300', '90,000', '250', '75,000', '1,200', '360,000'],
  ['4010', 'CC-01', 'MIX-C35', 'خرسانة C35', 'مخزن عدن', 'CC-01', '100', '35,000', '120', '42,000', '80', '28,000', '100', '35,000', '400', '140,000'],
  ['4020', 'CC-07', 'SVC-P', 'خدمات الضخ', '—', 'CC-07', '—', '8,000', '—', '8,500', '—', '8,000', '—', '8,000', '—', '32,500'],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
];

const t2Columns = [
  'رقم الحساب', 'رقم التكلفة', 'رقم الصنف', 'اسم الصنف', 'المخزن', 'مركز التكلفة',
  'كود الصنف', 'إجمالي الكمية', 'وحدة', 'سعر الشراء', 'مصاريف جمارك', 'تكلفة النقل', 'الإجمالي',
];

const t2Rows = [
  ['1210', 'CC-02', 'RM-01', 'أسمنت بورتلاند 42.5N', 'مخزن المواد', 'CC-02', 'CEM-425', '3,750', 'طن', '45', '5', '3', '198,750'],
  ['1220', 'CC-02', 'RM-02', 'ركام خشن (بحص)', 'مخزن المواد', 'CC-02', 'AGG-C20', '7,500', 'طن', '25', '2', '3', '225,000'],
  ['1230', 'CC-02', 'RM-03', 'رمل ناعم', 'مخزن المواد', 'CC-02', 'SND-F', '5,625', 'طن', '20', '1', '2', '129,375'],
  ['1250', 'CC-02', 'RM-04', 'مياه معالجة', 'مخزن المواد', 'CC-02', 'WTR-T', '2,625', 'م³', '5', '0', '0', '13,125'],
  ['1240', 'CC-02', 'RM-05', 'بلاستيسايزر', 'مخزن المواد', 'CC-02', 'ADD-PL', '375', 'لتر', '120', '15', '5', '52,500'],
  ['1240', 'CC-02', 'RM-06', 'سوبر بلاستيسايزر', 'مخزن المواد', 'CC-02', 'ADD-SP', '250', 'لتر', '180', '20', '8', '52,000'],
  ['1240', 'CC-02', 'RM-07', 'سيليكا فيوم', 'مخزن المواد', 'CC-02', 'ADD-SF', '100', 'كجم', '350', '25', '10', '38,500'],
  ['1240', 'CC-02', 'RM-08', 'ألياف بولي بروبيلين', 'مخزن المواد', 'CC-02', 'ADD-FB', '50', 'كجم', '500', '30', '12', '27,100'],
  ['', '', '', '', '', '', '', '', '', '', '', '', ''],
];

const t3Columns = [
  'رقم الحساب', 'رقم التكلفة', 'مركز التكلفة', 'الاسم', 'رقم الموظف', 'المسمى الوظيفي',
  'عدد الموظفين', 'الراتب الأساسي', 'بدل سكن', 'بدل نقل', 'بدل طبيعة عمل', 'الإجمالي الشهري', 'إجمالي السنة',
];

const t3Rows = [
  ['5020', 'CC-01', 'CC-01', 'أحمد محمد', 'EMP-001', 'مشغل محطة خلط', '2', '3,500', '500', '300', '200', '9,000', '108,000'],
  ['5020', 'CC-01', 'CC-01', 'خالد عبدالله', 'EMP-002', 'فني مختبر جودة', '1', '4,000', '600', '300', '300', '5,200', '62,400'],
  ['5020', 'CC-07', 'CC-07', 'سالم حسن', 'EMP-003', 'سائق خلاطة', '3', '2,800', '400', '200', '150', '10,650', '127,800'],
  ['5020', 'CC-04', 'CC-04', 'عمر سعيد', 'EMP-004', 'فني صيانة', '1', '3,800', '500', '300', '250', '4,850', '58,200'],
  ['5020', 'CC-02', 'CC-02', 'ماجد علي', 'EMP-005', 'أمين مخزن', '1', '3,000', '400', '200', '150', '3,750', '45,000'],
  ['5020', 'CC-05', 'CC-05', 'فيصل أحمد', 'EMP-006', 'محاسب', '1', '5,000', '700', '300', '300', '6,300', '75,600'],
  ['5020', 'CC-06', 'CC-06', 'ياسر محمود', 'EMP-007', 'مندوب مبيعات', '1', '3,500', '500', '400', '200', '4,600', '55,200'],
  ['', '', '', '', '', '', '', '', '', '', '', '', ''],
];

const t4Columns = [
  'رقم الحساب', 'رقم التكلفة', 'بيان المصروف', 'مركز التكلفة',
  'Q1', 'Q2', 'Q3', 'Q4', 'الإجمالي السنوي', 'ملاحظات',
];

const t4Rows = [
  ['6010', 'CC-05', 'إيجار المكاتب والإدارة', 'CC-05', '6,000', '6,000', '6,000', '6,000', '24,000', 'عقد سنوي'],
  ['6050', 'CC-01', 'وقود ومحروقات — محطة', 'CC-01', '4,500', '5,000', '4,500', '4,000', '18,000', 'ديزل'],
  ['6050', 'CC-07', 'وقود ومحروقات — شاحنات', 'CC-07', '5,000', '5,500', '5,000', '4,500', '20,000', 'ديزل'],
  ['6010', 'CC-05', 'كهرباء ومياه', 'CC-05', '3,000', '3,500', '4,000', '3,000', '13,500', '—'],
  ['6010', 'CC-05', 'اتصالات وإنترنت', 'CC-05', '2,000', '2,000', '2,000', '2,000', '8,000', '—'],
  ['6020', 'CC-06', 'تسويق ودعاية', 'CC-06', '3,000', '4,000', '2,000', '3,000', '12,000', 'حملات'],
  ['', '', '', '', '', '', '', '', '', ''],
];

const t5Columns = [
  'رقم الحساب', 'رقم التكلفة', 'بيان المصروف', 'مركز التكلفة',
  'Q1', 'Q2', 'Q3', 'Q4', 'الإجمالي السنوي', 'نوع الصيانة',
];

const t5Rows = [
  ['6040', 'CC-04', 'صيانة محطة الخلط', 'CC-04', '3,000', '2,500', '3,000', '2,500', '11,000', 'وقائية'],
  ['6040', 'CC-04', 'صيانة الخلاطات (Mixers)', 'CC-04', '2,000', '1,500', '2,000', '1,500', '7,000', 'دورية'],
  ['6040', 'CC-04', 'صيانة المضخات', 'CC-04', '1,500', '1,000', '1,500', '1,000', '5,000', 'تصحيحية'],
  ['6040', 'CC-04', 'قطع غيار ولوازم', 'CC-04', '2,000', '2,500', '2,000', '2,000', '8,500', 'مخزون'],
  ['6030', 'CC-04', 'استهلاك أصول — معدات', 'CC-04', '1,500', '1,500', '1,500', '1,500', '6,000', 'إهلاك'],
  ['6040', 'CC-04', 'صيانة طوارئ', 'CC-04', '500', '500', '500', '500', '2,000', 'طارئة'],
  ['', '', '', '', '', '', '', '', '', ''],
];

/* ───── Default columns for new dynamic tables ───── */
const defaultNewColumns = [
  'رقم الحساب', 'رقم التكلفة', 'البيان', 'مركز التكلفة',
  'Q1', 'Q2', 'Q3', 'Q4',
];

interface DynamicTable {
  id: string;
  title: string;
  columns: string[];
  rows: string[][];
}

/* ═══════════════════════════════════════════════════════
   ComprehensiveBudget Page
   ═══════════════════════════════════════════════════════ */
export default function ComprehensiveBudget() {
  const [resetKey, setResetKey] = useState(0);
  const [dynamicTables, setDynamicTables] = useState<DynamicTable[]>([]);

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

  return (
    <DocumentProvider config={printConfig}>
      <div dir="rtl" className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-[1400px] mx-auto">

          {/* ── Export Toolbar ── */}
          <ExportToolbar key={`export-${resetKey}`} />

          {/* ── Document Header ── */}
          <DocumentHeader
            key={`header-${resetKey}`}
            title="الموازنة التقديرية الشاملة"
            docNumber="BUD-2026-001"
            location="عدن، بئر أحمد، الكريتر"
            fiscalYear="2026"
          />

          {/* ── Summary Cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {summaryCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="bg-white rounded-xl shadow-sm p-4 flex items-start gap-3"
                >
                  <div className={`rounded-lg p-2.5 ${card.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm text-gray-500 mb-1">{card.label}</div>
                    <div className="text-xl font-bold text-gray-900">
                      {card.value}{' '}
                      <span className="text-sm font-normal text-gray-500">{card.unit}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ══════════════════════════════════════
             Table 1 - موازنة المبيعات والإنتاج
             ══════════════════════════════════════ */}
          <SectionDivider title="موازنة المبيعات والإنتاج" />
          <EditableTable
            key={`t1-${resetKey}`}
            id="t1"
            title="موازنة المبيعات والإنتاج"
            subtitle="Sales & Production Volume Budget"
            headerColor="navy"
            initialColumns={t1Columns}
            initialRows={t1Rows}
          />

          {/* ══════════════════════════════════════
             Table 2 - موازنة المشتريات والمواد الخام
             ══════════════════════════════════════ */}
          <SectionDivider title="موازنة المشتريات والمواد الخام" />
          <EditableTable
            key={`t2-${resetKey}`}
            id="t2"
            title="موازنة المشتريات والمواد الخام"
            subtitle="Direct Materials Budget"
            headerColor="teal"
            initialColumns={t2Columns}
            initialRows={t2Rows}
          />

          {/* ══════════════════════════════════════
             Table 3 - موازنة الأجور والمرتبات
             ══════════════════════════════════════ */}
          <SectionDivider title="موازنة الأجور والمرتبات" />
          <EditableTable
            key={`t3-${resetKey}`}
            id="t3"
            title="موازنة الأجور والمرتبات"
            subtitle="Salaries & Wages Budget"
            headerColor="slate"
            initialColumns={t3Columns}
            initialRows={t3Rows}
          />

          {/* ══════════════════════════════════════
             Table 4 - موازنة المصاريف التشغيلية
             ══════════════════════════════════════ */}
          <SectionDivider title="موازنة المصاريف التشغيلية" />
          <EditableTable
            key={`t4-${resetKey}`}
            id="t4"
            title="موازنة المصاريف التشغيلية"
            subtitle="Operating Expenses Budget"
            headerColor="amber"
            initialColumns={t4Columns}
            initialRows={t4Rows}
          />

          {/* ══════════════════════════════════════
             Table 5 - موازنة الصيانة والمعدات
             ══════════════════════════════════════ */}
          <SectionDivider title="موازنة الصيانة والمعدات" />
          <EditableTable
            key={`t5-${resetKey}`}
            id="t5"
            title="موازنة الصيانة والمعدات"
            subtitle="Maintenance & Equipment Budget"
            headerColor="navy"
            initialColumns={t5Columns}
            initialRows={t5Rows}
          />

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
             Approvals Section
             ══════════════════════════════════════ */}
          <SectionDivider title="اعتمادات الموازنة التقديرية الشاملة لعام 2026" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { role: 'أعده', title: 'مدير المالية' },
              { role: 'راجعه', title: 'المدير التنفيذي' },
              { role: 'اعتمده', title: 'رئيس مجلس الإدارة' },
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

          {/* ── Print Document (off-screen render for PDF export) ── */}
          <PrintDocument key={`print-${resetKey}`} />

          {/* ── Document Stamp (visible in print only) ── */}
          <DocumentStamp documentName="الموازنة التقديرية الشاملة" />

        </div>
      </div>
    </DocumentProvider>
  );
}
