import React, { createContext, useContext, useState, useMemo, useEffect, useTransition } from 'react';
import { useUserData } from '@/contexts/UserDataContext';
import { toast } from 'sonner';

import alasql from 'alasql';

export type FilterValue = string | number;

interface FilterState {
  // Key is column name, value is array of selected unique values
  activeFilters: Record<string, FilterValue[]>;
  searchText: string;
  sqlQuery: string;
}

interface FilterContextType extends FilterState {
  setFilter: (column: string, values: FilterValue[]) => void;
  setSearchText: (text: string) => void;
  setSqlQuery: (query: string) => void;
  resetFilters: () => void;
  filteredData: any[];
  isFiltering: boolean;
  isFiltered: boolean;
  sqlError: string | null;
}

const STORAGE_KEY = 'universal-data-filters-v2';

function loadFilters(): Partial<FilterState> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { activeFilters: {}, searchText: '', sqlQuery: '' };
}

function saveFilters(state: FilterState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

const FilterContext = createContext<FilterContextType | null>(null);

export const useFilters = () => {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilters must be inside FilterProvider');
  return ctx;
};

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const saved = loadFilters();
  const [activeFilters, setActiveFilters] = useState<Record<string, FilterValue[]>>(saved.activeFilters || {});
  const [searchText, setSearchTextRaw] = useState(saved.searchText || '');
  const [sqlQuery, setSqlQueryRaw] = useState(saved.sqlQuery || '');
  const [sqlError, setSqlError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const { customData, analysisMetadata } = useUserData();

  // Reset filters when the dataset changes
  useEffect(() => {
    setActiveFilters({});
    setSearchTextRaw('');
    setSqlQueryRaw('');
    setSqlError(null);
  }, [analysisMetadata]);

  const setFilter = (column: string, values: FilterValue[]) => {
    startTransition(() => {
      setActiveFilters(prev => ({
        ...prev,
        [column]: values
      }));
    });
  };

  const setSearchText = (text: string) => {
    startTransition(() => setSearchTextRaw(text));
  };

  const setSqlQuery = (query: string) => {
    startTransition(() => {
      setSqlQueryRaw(query);
      setSqlError(null);
    });
  };

  const resetFilters = () => {
    startTransition(() => {
      setActiveFilters({});
      setSearchTextRaw('');
      setSqlQueryRaw('');
      setSqlError(null);
    });
  };

  useEffect(() => {
    saveFilters({ activeFilters, searchText, sqlQuery });
  }, [activeFilters, searchText, sqlQuery]);

  const sourceData = useMemo(() => customData || [], [customData]);

  const filteredData = useMemo<any[]>(() => {
    if (!sourceData || !Array.isArray(sourceData) || sourceData.length === 0) return [];
    
    // 1. If SQL query is present, use alasql
    if (sqlQuery && sqlQuery.trim()) {
      try {
        const results = alasql(`SELECT * FROM ? WHERE ${sqlQuery}`, [sourceData]);
        return Array.isArray(results) ? results : (results ? [results] : []);
      } catch (err: any) {
        console.error('SQL Error:', err);
        return sourceData;
      }
    }

    // 2. Otherwise use standard filtering
    return sourceData.filter(item => {
      // a. Text Search Filter
      if (searchText) {
        const itemStr = Object.values(item).join(' ').toLowerCase();
        if (!itemStr.includes(searchText.toLowerCase())) return false;
      }

      // b. Dynamic Column Filters
      for (const [column, selectedValues] of Object.entries(activeFilters)) {
        if (!selectedValues || selectedValues.length === 0) continue;
        
        const itemValue = item[column];
        if (!selectedValues.includes(String(itemValue))) return false;
      }

      return true;
    });
  }, [sourceData, activeFilters, searchText, sqlQuery]);

  // Validation for SQL error in a separate effect to avoid re-render loops
  useEffect(() => {
    if (sqlQuery.trim() && sourceData.length) {
      try {
        alasql(`SELECT * FROM ? WHERE ${sqlQuery} LIMIT 0`, [sourceData]);
        setSqlError(null);
      } catch (err: any) {
        setSqlError(err.message || 'Invalid SQL query');
      }
    } else {
      setSqlError(null);
    }
  }, [sqlQuery, sourceData]);

  const isFiltered = useMemo(() => {
    return Object.values(activeFilters).some(vals => vals.length > 0) || !!searchText || !!sqlQuery;
  }, [activeFilters, searchText, sqlQuery]);

  return (
    <FilterContext.Provider value={{
      activeFilters,
      setFilter,
      searchText,
      setSearchText,
      sqlQuery,
      setSqlQuery,
      resetFilters,
      filteredData,
      isFiltering: isPending,
      isFiltered,
      sqlError
    }}>
      {children}
    </FilterContext.Provider>
  );
};
