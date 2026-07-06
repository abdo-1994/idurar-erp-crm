import { useState, useCallback } from 'react';
import { LayoutGrid, List, FileDown, Printer, RotateCcw, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useDocumentModel } from '@/lib/documentModel';

type BusyFormat = 'horizontal' | 'vertical' | null;

export default function ExportToolbar() {
  const {
    config,
    printNodeRef,
    printFormatRef,
    printRefreshRef,
    triggerReset,
  } = useDocumentModel();

  const [busy, setBusy] = useState<BusyFormat>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const setPrintPageSize = useCallback(
    (format: 'horizontal' | 'vertical') => {
      printFormatRef.current = format;
    },
    [printFormatRef]
  );

  const handleExportPDF = useCallback(
    async (format: 'horizontal' | 'vertical') => {
      if (busy) return;

      setBusy(format);

      // Set format and refresh
      printFormatRef.current = format;
      printRefreshRef.current?.();

      // Wait for layout
      await new Promise<void>((r) =>
        requestAnimationFrame(() => requestAnimationFrame(() => r()))
      );
      await document.fonts.ready;
      await new Promise<void>((r) => setTimeout(r, 500));

      const node = printNodeRef.current;
      if (!node) {
        setBusy(null);
        return;
      }

      try {
        const nodeWidth = format === 'horizontal' ? 1800 : 1300;
        const scale = 2.0;

        // Temporarily set the node width for capture
        const origWidth = node.style.width;
        node.style.width = `${nodeWidth}px`;

        // Wait for reflow
        await new Promise<void>((r) =>
          requestAnimationFrame(() => requestAnimationFrame(() => r()))
        );
        await new Promise<void>((r) => setTimeout(r, 200));

        const canvas = await html2canvas(node, {
          scale,
          useCORS: true,
          backgroundColor: '#ffffff',
        });

        // Restore original width
        node.style.width = origWidth;

        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        // Create PDF with custom page size matching the content
        const pdfWidth = imgWidth / scale;
        const pdfHeight = imgHeight / scale;

        const pdf = new jsPDF({
          orientation: format === 'horizontal' ? 'landscape' : 'portrait',
          unit: 'px',
          format: [pdfWidth, pdfHeight],
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

        // Download via blob + anchor
        const blob = pdf.output('blob');
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        const suffix = format === 'horizontal' ? '(أفقي)' : '(عمودي)';
        anchor.href = url;
        anchor.download = `${config.documentName}_${suffix}.pdf`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('PDF export error:', err);
      } finally {
        setBusy(null);
      }
    },
    [busy, config.documentName, printFormatRef, printNodeRef, printRefreshRef]
  );

  const handlePrint = useCallback(() => {
    setPrintPageSize('vertical');
    window.print();
  }, [setPrintPageSize]);

  const handleResetConfirm = useCallback(() => {
    triggerReset();
    setShowResetDialog(false);
  }, [triggerReset]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-6 print-hidden">
        {/* PDF Landscape */}
        <button
          onClick={() => handleExportPDF('horizontal')}
          disabled={busy !== null}
          className="inline-flex items-center gap-2 px-4 py-2 bg-navy text-white text-sm font-medium rounded-lg hover:bg-navy/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {busy === 'horizontal' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LayoutGrid className="w-4 h-4" />
          )}
          <FileDown className="w-4 h-4" />
          <span>PDF أفقي</span>
        </button>

        {/* PDF Portrait */}
        <button
          onClick={() => handleExportPDF('vertical')}
          disabled={busy !== null}
          className="inline-flex items-center gap-2 px-4 py-2 bg-navy text-white text-sm font-medium rounded-lg hover:bg-navy/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {busy === 'vertical' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <List className="w-4 h-4" />
          )}
          <FileDown className="w-4 h-4" />
          <span>PDF عمودي</span>
        </button>

        {/* Print */}
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-navy text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>طباعة</span>
        </button>

        {/* Reset */}
        <button
          onClick={() => setShowResetDialog(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-600 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>استعادة الافتراضي</span>
        </button>
      </div>

      {/* Reset confirmation dialog */}
      {showResetDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center print-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowResetDialog(false)}
          />

          {/* Dialog card */}
          <div className="relative bg-white rounded-xl shadow-2xl p-6 mx-4 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              استعادة الإعدادات الافتراضية؟
            </h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              سيتم مسح جميع التعديلات التي أجريتها واستعادة البيانات الافتراضية.
            </p>
            <div className="flex items-center gap-3 justify-start">
              <button
                onClick={handleResetConfirm}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
              >
                نعم، استعادة
              </button>
              <button
                onClick={() => setShowResetDialog(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
