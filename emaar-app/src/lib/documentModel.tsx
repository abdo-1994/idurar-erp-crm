import React, { createContext, useContext, useRef, useCallback, useState } from 'react';

export interface HeaderModel {
  title: string;
  docNumber: string;
  date: string;
  location: string;
  fiscalYear: string;
  logoUrl: string | null;
}

export interface FieldModel {
  id: string;
  seq: number;
  label: string;
  value: string;
  mono?: boolean;
}

export interface TableModel {
  id: string;
  seq: number;
  title: string;
  subtitle?: string;
  columns: string[];
  rows: string[][];
  transposed: boolean;
}

export interface DocumentSnapshot {
  header: HeaderModel;
  fields: FieldModel[];
  tables: TableModel[];
}

export interface SummaryCard {
  label: string;
  value: string;
  unit?: string;
}

export interface SignatureGroup {
  names: string[];
}

export interface ExtraBlock {
  title?: string;
  rows: { label: string; value: string }[];
}

export interface PrintConfig {
  documentName: string;
  documentType?: string;
  companyName?: string;
  systemLine?: string;
  summary?: SummaryCard[];
  signatures?: SignatureGroup[];
  extras?: ExtraBlock[];
}

interface TableEntry {
  data: TableModel;
}

interface FieldEntry {
  data: FieldModel;
}

interface DocumentContextValue {
  config: PrintConfig;
  registerTable: (id: string, data: TableModel) => void;
  unregisterTable: (id: string) => void;
  registerField: (id: string, data: FieldModel) => void;
  unregisterField: (id: string) => void;
  setHeader: (partial: Partial<HeaderModel>) => void;
  getSnapshot: () => DocumentSnapshot;
  headerRef: React.MutableRefObject<HeaderModel>;
  printRefreshRef: React.MutableRefObject<(() => void) | null>;
  printNodeRef: React.MutableRefObject<HTMLDivElement | null>;
  printFormatRef: React.MutableRefObject<'vertical' | 'horizontal'>;
  resetKey: number;
  triggerReset: () => void;
}

const DocumentContext = createContext<DocumentContextValue | null>(null);

const defaultHeader: HeaderModel = {
  title: '',
  docNumber: '',
  date: new Date().toISOString().split('T')[0],
  location: '',
  fiscalYear: '2026',
  logoUrl: null,
};

export function DocumentProvider({ config, children }: { config: PrintConfig; children: React.ReactNode }) {
  const tablesRef = useRef<Record<string, TableEntry>>({});
  const fieldsRef = useRef<Record<string, FieldEntry>>({});
  const headerRef = useRef<HeaderModel>({ ...defaultHeader, title: config.documentName });
  const printRefreshRef = useRef<(() => void) | null>(null);
  const printNodeRef = useRef<HTMLDivElement | null>(null);
  const printFormatRef = useRef<'vertical' | 'horizontal'>('vertical');
  const [resetKey, setResetKey] = useState(0);

  const registerTable = useCallback((id: string, data: TableModel) => {
    tablesRef.current[id] = { data };
  }, []);

  const unregisterTable = useCallback((id: string) => {
    delete tablesRef.current[id];
  }, []);

  const registerField = useCallback((id: string, data: FieldModel) => {
    fieldsRef.current[id] = { data };
  }, []);

  const unregisterField = useCallback((id: string) => {
    delete fieldsRef.current[id];
  }, []);

  const setHeader = useCallback((partial: Partial<HeaderModel>) => {
    headerRef.current = { ...headerRef.current, ...partial };
  }, []);

  const getSnapshot = useCallback((): DocumentSnapshot => {
    const tables = Object.values(tablesRef.current)
      .map(e => e.data)
      .sort((a, b) => a.seq - b.seq);
    const fields = Object.values(fieldsRef.current)
      .map(e => e.data)
      .sort((a, b) => a.seq - b.seq);
    return {
      header: { ...headerRef.current },
      fields,
      tables,
    };
  }, []);

  const triggerReset = useCallback(() => {
    tablesRef.current = {};
    fieldsRef.current = {};
    headerRef.current = { ...defaultHeader, title: config.documentName };
    setResetKey(k => k + 1);
  }, [config.documentName]);

  return (
    <DocumentContext.Provider value={{
      config,
      registerTable, unregisterTable,
      registerField, unregisterField,
      setHeader, getSnapshot,
      headerRef,
      printRefreshRef, printNodeRef, printFormatRef,
      resetKey, triggerReset,
    }}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocumentModel() {
  const ctx = useContext(DocumentContext);
  if (!ctx) throw new Error('useDocumentModel must be used within DocumentProvider');
  return ctx;
}

export function FieldPublisher({ id, seq, label, value, mono }: FieldModel) {
  const { registerField, unregisterField } = useDocumentModel();
  React.useEffect(() => {
    registerField(id, { id, seq, label, value, mono });
    return () => unregisterField(id);
  }, [id, seq, label, value, mono, registerField, unregisterField]);
  return null;
}
