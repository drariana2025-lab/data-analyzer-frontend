import React, { createContext, useContext, useState, useMemo, useEffect, useTransition } from 'react';
import { rawData, years, HepRecord } from '@/data/hepatitisData';
import { useUserData } from '@/contexts/UserDataContext';
import { toast } from 'sonner';

interface FilterState {
  selectedYears: number[];
  selectedRegion: string;
  selectedIncome: string;
  selectedCountry: string;
  detailCountry: string | null;
}

interface FilterContextType extends FilterState {
  setSelectedYears: (y: number[]) => void;
  setSelectedRegion: (r: string) => void;
  setSelectedIncome: (i: string) => void;
  setSelectedCountry: (c: string) => void;
  setDetailCountry: (c: string | null) => void;
  filteredData: HepRecord[];
  isFiltering: boolean;
}

const STORAGE_KEY = 'hepb-filters';

function loadFilters(): Partial<FilterState> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return {};
}

function saveFilters(state: Omit<FilterState, 'detailCountry'>) {
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
  const [selectedYears, setSelectedYearsRaw] = useState<number[]>(saved.selectedYears?.length ? saved.selectedYears : years);
  const [selectedRegion, setSelectedRegionRaw] = useState(saved.selectedRegion || 'all');
  const [selectedIncome, setSelectedIncomeRaw] = useState(saved.selectedIncome || 'all');
  const [selectedCountry, setSelectedCountryRaw] = useState(saved.selectedCountry || 'all');
  const [detailCountry, setDetailCountry] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const wrap = <T,>(setter: React.Dispatch<React.SetStateAction<T>>) => (val: T) => {
    startTransition(() => setter(val));
  };

  const setSelectedYears = wrap(setSelectedYearsRaw);
  const setSelectedRegion = wrap(setSelectedRegionRaw);
  const setSelectedIncome = wrap(setSelectedIncomeRaw);
  const setSelectedCountry = wrap(setSelectedCountryRaw);

  useEffect(() => {
    saveFilters({ selectedYears, selectedRegion, selectedIncome, selectedCountry });
  }, [selectedYears, selectedRegion, selectedIncome, selectedCountry]);

  const { customData } = useUserData();
  const sourceData = customData || rawData;

  const filteredData = useMemo(() => {
    return sourceData.filter(d => {
      if (!selectedYears.includes(d.year)) return false;
      if (selectedRegion !== 'all' && d.region !== selectedRegion) return false;
      if (selectedIncome !== 'all' && d.incomeLevel !== selectedIncome) return false;
      if (selectedCountry !== 'all' && d.country !== selectedCountry) return false;
      return true;
    });
  }, [sourceData, selectedYears, selectedRegion, selectedIncome, selectedCountry]);

  return (
    <FilterContext.Provider value={{
      selectedYears, setSelectedYears,
      selectedRegion, setSelectedRegion,
      selectedIncome, setSelectedIncome,
      selectedCountry, setSelectedCountry,
      detailCountry, setDetailCountry,
      filteredData,
      isFiltering: isPending,
    }}>
      {children}
    </FilterContext.Provider>
  );
};
