import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeftRight, Plus, Trash2, Pencil } from 'lucide-react';
import { useDocumentModel } from '@/lib/documentModel';

interface EditableTableProps {
  id: string;
  title: string;
  subtitle?: string;
  headerColor?: 'navy' | 'teal' | 'amber' | 'slate';
  initialColumns: string[];
  initialRows: string[][];
}

const headerColorMap = {
  navy: 'bg-[#1B2E4B] text-white',
  teal: 'bg-teal-800 text-white',
  amber: 'bg-amber-700 text-white',
  slate: 'bg-slate-700 text-white',
} as const;

function parseNumber(val: string): number | null {
  if (!val || val.trim() === '') return null;
  const cleaned = val.replace(/,/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function formatArabicNumber(num: number): string {
  return num.toLocaleString('ar-SA');
}

let seqCounter = Date.now();

export default function EditableTable({
  id,
  title: initialTitle,
  subtitle: initialSubtitle,
  headerColor = 'navy',
  initialColumns,
  initialRows,
}: EditableTableProps) {
  const { registerTable, unregisterTable } = useDocumentModel();

  const [columns, setColumns] = useState<string[]>(initialColumns);
  const [rows, setRows] = useState<string[][]>(initialRows);
  const [title, setTitle] = useState(initialTitle);
  const [subtitle, setSubtitle] = useState(initialSubtitle ?? '');
  const [transposed, setTransposed] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSubtitle, setEditingSubtitle] = useState(false);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  const seqRef = useRef(seqCounter++);

  // Register table data on every change
  useEffect(() => {
    registerTable(id, {
      id,
      seq: seqRef.current,
      title,
      subtitle: subtitle || undefined,
      columns,
      rows,
      transposed,
    });
  }, [id, title, subtitle, columns, rows, transposed, registerTable]);

  // Unregister on unmount
  useEffect(() => {
    return () => unregisterTable(id);
  }, [id, unregisterTable]);

  // --- Cell editing ---
  const updateCell = useCallback((rowIdx: number, colIdx: number, value: string) => {
    setRows(prev => {
      const next = prev.map(r => [...r]);
      // Ensure the row has enough columns
      while (next[rowIdx].length <= colIdx) {
        next[rowIdx].push('');
      }
      next[rowIdx][colIdx] = value;
      return next;
    });
  }, []);

  // --- Column editing ---
  const updateColumn = useCallback((colIdx: number, value: string) => {
    setColumns(prev => {
      const next = [...prev];
      next[colIdx] = value;
      return next;
    });
  }, []);

  // --- Add column ---
  const addColumn = useCallback(() => {
    setColumns(prev => [...prev, `عمود ${prev.length + 1}`]);
    setRows(prev => prev.map(row => [...row, '']));
  }, []);

  // --- Add row ---
  const addRow = useCallback(() => {
    setRows(prev => [...prev, new Array(columns.length).fill('')]);
  }, [columns.length]);

  // --- Delete column ---
  const deleteColumn = useCallback((colIdx: number) => {
    if (colIdx === 0) return; // Never delete first column
    setColumns(prev => prev.filter((_, i) => i !== colIdx));
    setRows(prev => prev.map(row => row.filter((_, i) => i !== colIdx)));
  }, []);

  // --- Delete row ---
  const deleteRow = useCallback((rowIdx: number) => {
    setRows(prev => prev.filter((_, i) => i !== rowIdx));
  }, []);

  // --- Compute totals ---
  const computeTotals = useCallback((): (string | null)[] => {
    return columns.map((_, colIdx) => {
      if (colIdx === 0) return 'الإجمالي';
      let sum = 0;
      let hasNumeric = false;
      let hasNonNumeric = false;

      for (const row of rows) {
        const val = row[colIdx] ?? '';
        if (val.trim() === '') continue;
        const num = parseNumber(val);
        if (num !== null) {
          sum += num;
          hasNumeric = true;
        } else {
          hasNonNumeric = true;
        }
      }

      // If there are any non-numeric non-empty values, show dash
      if (hasNonNumeric && !hasNumeric) return '—';
      if (hasNonNumeric) return '—';
      if (!hasNumeric) return '—';
      return formatArabicNumber(sum);
    });
  }, [columns, rows]);

  // --- Toggle transpose ---
  const toggleTranspose = useCallback(() => {
    setTransposed(prev => !prev);
  }, []);

  // --- Header bar color ---
  const colorClasses = headerColorMap[headerColor];

  // --- Render transposed view ---
  if (transposed) {
    // In transposed mode: each original column becomes a row,
    // and each original row becomes a column.
    // First original column values become row headers.
    return (
      <div className="mb-6 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header bar */}
        <div className={`flex items-center justify-between px-4 py-2.5 ${colorClasses}`}>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTranspose}
              className="flex items-center gap-1 rounded bg-white/20 px-2 py-1 text-xs hover:bg-white/30 transition-colors"
              title="أفقي / عمودي"
            >
              <ArrowLeftRight size={14} />
              <span>أفقي / عمودي</span>
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {editingSubtitle ? (
              <input
                type="text"
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                onBlur={() => setEditingSubtitle(false)}
                onKeyDown={e => e.key === 'Enter' && setEditingSubtitle(false)}
                className="bg-white/20 rounded px-2 py-0.5 text-sm outline-none text-inherit"
                autoFocus
              />
            ) : subtitle ? (
              <span
                className="cursor-pointer opacity-80 hover:opacity-100"
                onClick={() => setEditingSubtitle(true)}
              >
                {subtitle}
              </span>
            ) : null}
            {editingTitle ? (
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={e => e.key === 'Enter' && setEditingTitle(false)}
                className="bg-white/20 rounded px-2 py-0.5 text-sm font-bold outline-none text-inherit"
                autoFocus
              />
            ) : (
              <span
                className="cursor-pointer font-bold hover:underline"
                onClick={() => setEditingTitle(true)}
              >
                {title}
              </span>
            )}
          </div>
        </div>

        {/* Transposed table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <tbody>
              {columns.map((colHeader, colIdx) => (
                <tr
                  key={colIdx}
                  className={colIdx === 0 ? 'bg-gray-100 font-semibold' : colIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                >
                  <td className="sticky right-0 z-10 border border-gray-200 px-3 py-2 font-semibold bg-gray-100 whitespace-nowrap">
                    {colHeader}
                  </td>
                  {rows.map((row, rowIdx) => (
                    <td key={rowIdx} className="border border-gray-200 px-3 py-2">
                      {row[colIdx] ?? ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
          <div />
          <span>{rows.length} صف · {columns.length} عمود</span>
        </div>
      </div>
    );
  }

  // --- Normal (non-transposed) view ---
  const totals = computeTotals();

  return (
    <div className="mb-6 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className={`flex items-center justify-between px-4 py-2.5 ${colorClasses}`}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTranspose}
            className="flex items-center gap-1 rounded bg-white/20 px-2 py-1 text-xs hover:bg-white/30 transition-colors"
            title="أفقي / عمودي"
          >
            <ArrowLeftRight size={14} />
            <span>أفقي / عمودي</span>
          </button>
          <button
            type="button"
            onClick={addColumn}
            className="flex items-center gap-1 rounded bg-white/20 px-2 py-1 text-xs hover:bg-white/30 transition-colors"
          >
            <Plus size={14} />
            <span>+ عمود</span>
          </button>
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-1 rounded bg-white/20 px-2 py-1 text-xs hover:bg-white/30 transition-colors"
          >
            <Plus size={14} />
            <span>+ صف</span>
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {editingSubtitle ? (
            <input
              type="text"
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
              onBlur={() => setEditingSubtitle(false)}
              onKeyDown={e => e.key === 'Enter' && setEditingSubtitle(false)}
              className="bg-white/20 rounded px-2 py-0.5 text-sm outline-none text-inherit"
              autoFocus
            />
          ) : subtitle ? (
            <span
              className="cursor-pointer opacity-80 hover:opacity-100"
              onClick={() => setEditingSubtitle(true)}
            >
              {subtitle}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSubtitle('عنوان فرعي');
                setEditingSubtitle(true);
              }}
              className="opacity-50 hover:opacity-80 text-xs"
              title="إضافة عنوان فرعي"
            >
              <Pencil size={12} />
            </button>
          )}
          {editingTitle ? (
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={e => e.key === 'Enter' && setEditingTitle(false)}
              className="bg-white/20 rounded px-2 py-0.5 text-sm font-bold outline-none text-inherit"
              autoFocus
            />
          ) : (
            <span
              className="cursor-pointer font-bold hover:underline"
              onClick={() => setEditingTitle(true)}
            >
              {title}
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          {/* Column headers */}
          <thead>
            <tr className="bg-gray-100">
              {/* Empty cell for delete-row button column */}
              <th className="w-8 border border-gray-200" />
              {columns.map((col, colIdx) => (
                <th
                  key={colIdx}
                  className={`relative border border-gray-200 px-3 py-2 text-right font-semibold ${
                    colIdx === 0 ? 'sticky right-0 z-10 bg-gray-100' : ''
                  }`}
                  onMouseEnter={() => setHoveredCol(colIdx)}
                  onMouseLeave={() => setHoveredCol(null)}
                >
                  <input
                    type="text"
                    value={col}
                    onChange={e => updateColumn(colIdx, e.target.value)}
                    className="w-full bg-transparent text-right font-semibold outline-none focus:bg-blue-50 rounded px-1"
                  />
                  {hoveredCol === colIdx && colIdx !== 0 && (
                    <button
                      type="button"
                      onClick={() => deleteColumn(colIdx)}
                      className="absolute top-1 left-1 text-red-400 hover:text-red-600 transition-colors"
                      title="حذف العمود"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* Data rows */}
            {rows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className={`group ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
                {/* Delete row button */}
                <td className="w-8 border border-gray-200 text-center">
                  <button
                    type="button"
                    onClick={() => deleteRow(rowIdx)}
                    className="text-red-300 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-all"
                    title="حذف الصف"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
                {columns.map((_, colIdx) => (
                  <td
                    key={colIdx}
                    className={`border border-gray-200 px-1 py-0.5 ${
                      colIdx === 0 ? 'sticky right-0 z-10 font-medium' : ''
                    } ${colIdx === 0 && rowIdx % 2 === 0 ? 'bg-white' : ''} ${
                      colIdx === 0 && rowIdx % 2 !== 0 ? 'bg-gray-50' : ''
                    }`}
                  >
                    <input
                      type="text"
                      value={row[colIdx] ?? ''}
                      onChange={e => updateCell(rowIdx, colIdx, e.target.value)}
                      className="w-full bg-transparent px-2 py-1.5 text-right outline-none focus:bg-blue-50 rounded"
                    />
                  </td>
                ))}
              </tr>
            ))}

            {/* Total row */}
            {rows.length > 0 && (
              <tr className="bg-gray-100 font-bold">
                <td className="w-8 border border-gray-200" />
                {totals.map((total, colIdx) => (
                  <td
                    key={colIdx}
                    className={`border border-gray-200 px-3 py-2 text-right ${
                      colIdx === 0 ? 'sticky right-0 z-10 bg-gray-100' : ''
                    }`}
                  >
                    {total}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={addRow}
            className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
          >
            + إضافة صف
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={addColumn}
            className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
          >
            + إضافة عمود
          </button>
        </div>
        <span>{rows.length} صف · {columns.length} عمود</span>
      </div>
    </div>
  );
}
