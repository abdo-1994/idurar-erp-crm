import React, { useEffect, useRef, useState } from 'react';
import { useDocumentModel, type DocumentSnapshot } from '../lib/documentModel';

/* ───── hex-only palette (no oklch/oklab — html2canvas breaks) ───── */
const BLUE_900 = '#1e3a8a';
const ORANGE_500 = '#f97316';
const WHITE = '#ffffff';
const SLATE_800 = '#1e293b';
const SLATE_200 = '#e2e8f0';
const SLATE_50 = '#f8fafc';
const SLATE_100 = '#f1f5f9';

export default function PrintDocument() {
  const { config, getSnapshot, printRefreshRef, printNodeRef, printFormatRef } =
    useDocumentModel();

  const [snapshot, setSnapshot] = useState<DocumentSnapshot | null>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    printRefreshRef.current = () => {
      setSnapshot(getSnapshot());
    };
    printNodeRef.current = nodeRef.current;
    return () => {
      printRefreshRef.current = null;
    };
  }, [getSnapshot, printRefreshRef, printNodeRef]);

  /* keep printNodeRef in sync after every render (ref may shift) */
  useEffect(() => {
    printNodeRef.current = nodeRef.current;
  });

  if (!snapshot) return <div ref={nodeRef} style={{ position: 'absolute', left: -9999, top: 0 }} />;

  const isHorizontal = printFormatRef.current === 'horizontal';
  const pageWidth = isHorizontal ? 1800 : 1300;

  const { header, fields, tables } = snapshot;
  const nowStr = new Date().toLocaleString('ar-EG');

  /* ───── helper: sum a column if all values are numeric ───── */
  const sumColumn = (rows: string[][], colIdx: number): string => {
    let total = 0;
    let allNumeric = true;
    for (const row of rows) {
      const raw = (row[colIdx] ?? '').replace(/,/g, '');
      const n = parseFloat(raw);
      if (isNaN(n)) {
        allNumeric = false;
        break;
      }
      total += n;
    }
    if (!allNumeric || rows.length === 0) return '';
    return total.toLocaleString('ar-EG', { maximumFractionDigits: 2 });
  };

  return (
    <div
      ref={nodeRef}
      dir="rtl"
      style={{
        position: 'absolute',
        left: -9999,
        top: 0,
        width: pageWidth,
        fontFamily: 'Cairo, Tajawal, sans-serif',
        color: '#000000',
        backgroundColor: WHITE,
      }}
    >
      {/* ═══════ HEADER ═══════ */}
      <div
        style={{
          backgroundColor: BLUE_900,
          color: WHITE,
          padding: '28px 36px 20px',
          borderBottom: `4px solid ${ORANGE_500}`,
        }}
      >
        {/* top row: logo + company name */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>
              شركة إعمار ريدي ميكس للخرسانة الجاهزة
            </div>
            <div style={{ fontSize: 22, fontWeight: 600, marginTop: 4 }}>
              {header.title}
            </div>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
              Emaar Ready Mix Co. — Onyx Pro Financial System
            </div>
          </div>

          {header.logoUrl && (
            <img
              src={header.logoUrl}
              alt="Logo"
              style={{ height: 80, objectFit: 'contain' }}
            />
          )}
        </div>

        {/* fields row */}
        <div
          style={{
            display: 'flex',
            gap: 32,
            fontSize: 14,
            marginTop: 8,
            flexWrap: 'wrap',
          }}
        >
          {header.docNumber && (
            <span>
              <strong>رقم المستند:</strong> {header.docNumber}
            </span>
          )}
          {header.date && (
            <span>
              <strong>التاريخ:</strong> {header.date}
            </span>
          )}
          {header.location && (
            <span>
              <strong>الموقع:</strong> {header.location}
            </span>
          )}
          {header.fiscalYear && (
            <span>
              <strong>السنة المالية:</strong> {header.fiscalYear}
            </span>
          )}
        </div>
      </div>

      {/* ═══════ SUMMARY CARDS ═══════ */}
      {config.summary && config.summary.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(config.summary.length, 4)}, 1fr)`,
            gap: 16,
            padding: '20px 36px',
          }}
        >
          {config.summary.map((card, i) => (
            <div
              key={i}
              style={{
                border: `1px solid ${SLATE_200}`,
                borderRadius: 8,
                padding: '16px 20px',
                backgroundColor: SLATE_50,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>
                {card.label}
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: BLUE_900 }}>
                {card.value}
                {card.unit && (
                  <span style={{ fontSize: 13, fontWeight: 400, marginRight: 4 }}>
                    {card.unit}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════ INFO FIELDS ═══════ */}
      {fields.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px 24px',
            padding: '16px 36px',
          }}
        >
          {fields.map((f) => (
            <div key={f.id} style={{ fontSize: 14 }}>
              <span style={{ color: '#64748b' }}>{f.label}: </span>
              <span
                style={{
                  fontWeight: 600,
                  fontFamily: f.mono ? 'monospace' : 'inherit',
                }}
              >
                {f.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ═══════ TABLES ═══════ */}
      {tables.map((table) => (
        <div key={table.id} style={{ padding: '12px 36px' }}>
          {/* title bar */}
          <div
            style={{
              backgroundColor: SLATE_800,
              color: WHITE,
              padding: '10px 20px',
              fontSize: 15,
              fontWeight: 700,
              borderRadius: '6px 6px 0 0',
            }}
          >
            {table.title}
            {table.subtitle && (
              <span style={{ fontWeight: 400, fontSize: 13, marginRight: 12, opacity: 0.8 }}>
                {table.subtitle}
              </span>
            )}
          </div>

          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 13,
            }}
          >
            {/* header row */}
            <thead>
              <tr>
                {table.columns.map((col, ci) => (
                  <th
                    key={ci}
                    style={{
                      backgroundColor: SLATE_200,
                      color: '#000000',
                      padding: '10px 12px',
                      textAlign: 'right',
                      fontWeight: 700,
                      border: `1px solid ${SLATE_200}`,
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            {/* data rows */}
            <tbody>
              {table.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      style={{
                        backgroundColor: ri % 2 === 0 ? SLATE_50 : SLATE_100,
                        padding: '8px 12px',
                        border: `1px solid ${SLATE_200}`,
                        color: '#000000',
                        textAlign: 'right',
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}

              {/* total row */}
              {table.rows.length > 0 && (
                <tr>
                  {table.columns.map((_, ci) => {
                    const total = sumColumn(table.rows, ci);
                    return (
                      <td
                        key={ci}
                        style={{
                          backgroundColor: SLATE_200,
                          padding: '10px 12px',
                          border: `1px solid ${SLATE_200}`,
                          fontWeight: 700,
                          color: '#000000',
                          textAlign: 'right',
                        }}
                      >
                        {ci === 0 && !total ? 'الإجمالي' : total}
                      </td>
                    );
                  })}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ))}

      {/* ═══════ EXTRA BLOCKS ═══════ */}
      {config.extras &&
        config.extras.map((block, bi) => (
          <div key={bi} style={{ padding: '12px 36px' }}>
            {block.title && (
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: BLUE_900,
                  marginBottom: 8,
                  borderBottom: `2px solid ${ORANGE_500}`,
                  paddingBottom: 4,
                }}
              >
                {block.title}
              </div>
            )}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '6px 24px',
              }}
            >
              {block.rows.map((r, ri) => (
                <div key={ri} style={{ fontSize: 14 }}>
                  <span style={{ color: '#64748b' }}>{r.label}: </span>
                  <span style={{ fontWeight: 600 }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

      {/* ═══════ SIGNATURES ═══════ */}
      {config.signatures && config.signatures.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${config.signatures.reduce((a, g) => a + g.names.length, 0)}, 1fr)`,
            gap: 24,
            padding: '32px 36px 20px',
          }}
        >
          {config.signatures.flatMap((group) =>
            group.names.map((name, ni) => (
              <div
                key={`${name}-${ni}`}
                style={{
                  textAlign: 'center',
                  paddingTop: 48,
                  borderTop: `2px solid ${SLATE_200}`,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 600 }}>{name}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                  التوقيع / الختم
                </div>
              </div>
            )),
          )}
        </div>
      )}

      {/* ═══════ DOCUMENT STAMP ═══════ */}
      <div
        style={{
          borderTop: `1px solid ${SLATE_200}`,
          padding: '14px 36px',
          textAlign: 'center',
          fontSize: 11,
          color: '#94a3b8',
          marginTop: 16,
        }}
      >
        وثيقة رسمية — {config.documentName} · شركة إعمار ريدي ميكس للخرسانة الجاهزة
        · نظام Onyx Pro المالي · صدرت في {nowStr}
      </div>
    </div>
  );
}
