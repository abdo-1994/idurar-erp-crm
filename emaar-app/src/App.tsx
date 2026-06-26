import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ComprehensiveBudget from '@/pages/ComprehensiveBudget';
import ProductionWorkOrder from '@/pages/ProductionWorkOrder';
import BOMCostingSheet from '@/pages/BOMCostingSheet';
import CostCentersBudget from '@/pages/CostCentersBudget';
import FinancialWorkOrder from '@/pages/FinancialWorkOrder';

const pages: Record<string, () => React.JSX.Element> = {
  'comprehensive-budget': ComprehensiveBudget,
  'production-work-order': ProductionWorkOrder,
  'bom-costing-sheet': BOMCostingSheet,
  'cost-centers-budget': CostCentersBudget,
  'financial-work-order': FinancialWorkOrder,
};

const pageIds = Object.keys(pages);

export default function App() {
  const [active, setActive] = useState('comprehensive-budget');

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <Sidebar activeDocument={active} onNavigate={setActive} />

      {/* Main content area — offset for the sidebar */}
      <main className="md:mr-60 min-h-screen">
        {pageIds.map((id) => {
          const Page = pages[id];
          return (
            <div key={id} style={{ display: active === id ? 'block' : 'none' }}>
              <Page />
            </div>
          );
        })}
      </main>
    </div>
  );
}
