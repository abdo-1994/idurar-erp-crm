import { useState } from 'react';
import { Calculator, FileText, Layers, Building2, Receipt, Menu, X } from 'lucide-react';

interface SidebarProps {
  activeDocument: string;
  onNavigate: (id: string) => void;
}

const navItems = [
  {
    id: 'comprehensive-budget',
    title: 'الموازنة التقديرية الشاملة',
    subtitle: 'Comprehensive Budget',
    icon: Calculator,
  },
  {
    id: 'production-work-order',
    title: 'أمر تشغيل إنتاجي',
    subtitle: 'Production Work Order',
    icon: FileText,
  },
  {
    id: 'bom-costing-sheet',
    title: 'بطاقة التكاليف BOM',
    subtitle: 'BOM Costing Sheet',
    icon: Layers,
  },
  {
    id: 'cost-centers-budget',
    title: 'دليل مراكز التكلفة',
    subtitle: 'Cost Centers Budget',
    icon: Building2,
  },
  {
    id: 'financial-work-order',
    title: 'أمر تشغيل مالي',
    subtitle: 'Financial Work Order',
    icon: Receipt,
  },
];

export default function Sidebar({ activeDocument, onNavigate }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand header */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-sm shrink-0">
            RM
          </div>
          <div className="min-w-0">
            <div className="text-accent font-bold text-sm leading-tight">
              إعمار ريدي ميكس
            </div>
            <div className="text-gray-400 text-xs leading-tight mt-0.5">
              Onyx Pro Financial System
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <div className="text-gray-400 text-xs font-medium px-3 mb-3">
          القوالب والنماذج
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeDocument === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-right transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-accent text-gray-900'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon
                  className={`w-4.5 h-4.5 shrink-0 ${
                    isActive ? 'text-gray-900' : 'text-gray-400'
                  }`}
                />
                <div className="min-w-0 text-right">
                  <div
                    className={`text-sm font-medium leading-tight ${
                      isActive ? 'text-gray-900' : ''
                    }`}
                  >
                    {item.title}
                  </div>
                  <div
                    className={`text-xs mt-0.5 leading-tight ${
                      isActive ? 'text-gray-700' : 'text-gray-500'
                    }`}
                  >
                    {item.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 text-center">
        <div className="text-gray-400 text-xs leading-relaxed">
          نظام إدارة الوثائق المالية
        </div>
        <div className="text-gray-500 text-xs mt-1" dir="ltr">
          &copy; 2026 إعمار ريدي ميكس
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 right-4 z-50 md:hidden w-10 h-10 rounded-lg bg-sidebar text-white flex items-center justify-center shadow-lg cursor-pointer print-hidden"
        aria-label="فتح القائمة"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:right-0 w-60 bg-sidebar text-white print-hidden">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden print-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          {/* Sliding panel from right */}
          <aside className="absolute inset-y-0 right-0 w-64 bg-sidebar text-white shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 left-4 w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
              aria-label="إغلاق القائمة"
            >
              <X className="w-4 h-4" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
