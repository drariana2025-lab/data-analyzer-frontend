import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface AnalysisMetadata {
  columns_info: Record<string, "numeric" | "temporal" | "categorical">;
  statistics: Record<string, { min: number; max: number; mean: number; median: number; std: number }>;
  chart_configs: Array<{ id: string; title: string; type: "bar" | "line" | "scatter"; x: string; y: string }>;
  row_count: number;
  preview: any[];
}

interface UserDataContextType {
  customData: any[] | null;
  activeFileName: string | null;
  analysisMetadata: AnalysisMetadata | null;
  /** Загрузка сырых данных без бэкенд-анализа (сбрасывает метаданные). */
  setCustomData: (data: any[] | null, fileName?: string | null) => void;
  setAnalysisMetadata: (metadata: AnalysisMetadata | null) => void;
  /** Результат анализа с бэкенда: строки + имя файла + метаданные одним шагом. */
  applyAnalyzedDataset: (data: any[], fileName: string, metadata: AnalysisMetadata) => void;
  clearCustomData: (options?: { silent?: boolean }) => void;
}

const UserDataContext = createContext<UserDataContextType | null>(null);

export const useUserData = () => {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error('useUserData must be inside UserDataProvider');
  return ctx;
};

/**
 * Parses and maps rows. In the new "Universal" mode, this is more of a pass-through
 * or a soft validator.
 */
export function validateAndParseData(rows: Record<string, any>[]): { data: any[] | null; error: string | null } {
  if (!rows.length) return { data: null, error: 'Файл пуст' };
  
  // In Universal mode, we treat all rows as valid data. 
  // We can add basic sanitization here if needed.
  return { data: rows, error: null };
}

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customData, setCustomDataState] = useState<any[] | null>(null);
  const [activeFileName, setActiveFileName] = useState<string | null>(null);
  const [analysisMetadata, setAnalysisMetadata] = useState<AnalysisMetadata | null>(null);

  const setCustomData = useCallback((data: any[] | null, fileName?: string | null) => {
    setAnalysisMetadata(null);
    setCustomDataState(data);
    setActiveFileName(fileName ?? null);
    if (data) toast.success(`Данные из файла "${fileName}" загружены`);
  }, []);

  const applyAnalyzedDataset = useCallback((data: any[], fileName: string, metadata: AnalysisMetadata) => {
    setCustomDataState(data);
    setActiveFileName(fileName);
    setAnalysisMetadata(metadata);
  }, []);

  const clearCustomData = useCallback((options?: { silent?: boolean }) => {
    setCustomDataState(null);
    setActiveFileName(null);
    setAnalysisMetadata(null);
    if (!options?.silent) toast.info('Все данные и настройки сброшены');
  }, []);

  return (
    <UserDataContext.Provider value={{ 
      customData, 
      activeFileName, 
      analysisMetadata, 
      setCustomData, 
      setAnalysisMetadata,
      applyAnalyzedDataset,
      clearCustomData 
    }}>
      {children}
    </UserDataContext.Provider>
  );
};
