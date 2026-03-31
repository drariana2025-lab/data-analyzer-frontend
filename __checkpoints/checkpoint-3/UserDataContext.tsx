import React, { createContext, useContext, useState, useCallback } from 'react';
import { HepRecord } from '@/data/hepatitisData';
import { toast } from 'sonner';

interface UserDataContextType {
  customData: HepRecord[] | null;
  activeFileName: string | null;
  setCustomData: (data: HepRecord[] | null, fileName?: string | null) => void;
  clearCustomData: () => void;
}

const UserDataContext = createContext<UserDataContextType | null>(null);

export const useUserData = () => {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error('useUserData must be inside UserDataProvider');
  return ctx;
};

const REQUIRED_COLUMNS = [
  'год', 'страна', 'регион', 'население',
  'случаи_заболевания', 'смерти',
  'успешность_лечения_проц', 'охват_вакцинацией_проц',
];

const COLUMN_MAP: Record<string, keyof HepRecord> = {
  'год': 'year',
  'страна': 'country',
  'регион': 'region',
  'уровень_дохода': 'incomeLevel',
  'население': 'population',
  'ввп_на_душу': 'gdpPerCapita',
  'расходы_на_здравоохранение': 'healthExpenditure',
  'случаи_заболевания': 'cases',
  'смерти': 'deaths',
  'осложненные_случаи': 'complicatedCases',
  'успешность_лечения_проц': 'treatmentSuccess',
  'врачей_на_100к': 'doctorsPer100k',
  'учреждений_на_млн': 'facilitiesPerMln',
  'доступ_к_здравоохранению': 'healthcareAccess',
  'недоедание': 'malnutrition',
  'курение': 'smoking',
  'урбанизация': 'urbanization',
  'охват_вакцинацией_проц': 'vaccinationCoverage',
  'доза_при_рождении': 'birthDoseCoverage',
  'безопасные_инъекции': 'safeInjections',
  'скрининг_крови': 'bloodScreening',
};

export function validateAndParseData(rows: Record<string, any>[]): { data: HepRecord[] | null; error: string | null } {
  if (!rows.length) return { data: null, error: 'Файл пуст' };

  const headers = Object.keys(rows[0]).map(h => h.trim().toLowerCase());
  const missing = REQUIRED_COLUMNS.filter(col => !headers.includes(col));

  if (missing.length) {
    return {
      data: null,
      error: `Неверный формат данных. Отсутствуют колонки: ${missing.join(', ')}. Убедитесь, что файл содержит колонки: ${REQUIRED_COLUMNS.join(', ')}`,
    };
  }

  const records: HepRecord[] = rows.map(row => {
    const mapped: any = {};
    for (const [ruKey, enKey] of Object.entries(COLUMN_MAP)) {
      const val = row[ruKey] ?? row[ruKey.toLowerCase()];
      if (val !== undefined) {
        mapped[enKey] = typeof val === 'string' ? (isNaN(Number(val)) ? val : Number(val)) : val;
      }
    }
    // Defaults
    mapped.year = mapped.year || 2020;
    mapped.country = mapped.country || 'Неизвестно';
    mapped.region = mapped.region || 'Неизвестно';
    mapped.incomeLevel = mapped.incomeLevel || 'Неизвестно';
    mapped.population = mapped.population || 0;
    mapped.gdpPerCapita = mapped.gdpPerCapita || 0;
    mapped.healthExpenditure = mapped.healthExpenditure || 0;
    mapped.cases = mapped.cases || 0;
    mapped.deaths = mapped.deaths || 0;
    mapped.complicatedCases = mapped.complicatedCases || 0;
    mapped.treatmentSuccess = mapped.treatmentSuccess || 0;
    mapped.doctorsPer100k = mapped.doctorsPer100k || 0;
    mapped.facilitiesPerMln = mapped.facilitiesPerMln || 0;
    mapped.healthcareAccess = mapped.healthcareAccess || 0;
    mapped.malnutrition = mapped.malnutrition || 0;
    mapped.smoking = mapped.smoking || 0;
    mapped.urbanization = mapped.urbanization || 0;
    mapped.vaccinationCoverage = mapped.vaccinationCoverage || 0;
    mapped.birthDoseCoverage = mapped.birthDoseCoverage || 0;
    mapped.safeInjections = mapped.safeInjections || 0;
    mapped.bloodScreening = mapped.bloodScreening || 0;
    // Computed
    mapped.economicIndex = +(mapped.gdpPerCapita * 0.6 + mapped.healthExpenditure * 0.4).toFixed(2);
    mapped.incidencePer100k = mapped.population ? +((mapped.cases / mapped.population) * 100000).toFixed(2) : 0;
    mapped.mortalityPer100k = mapped.population ? +((mapped.deaths / mapped.population) * 100000).toFixed(2) : 0;
    mapped.caseFatalityPct = mapped.cases ? +((mapped.deaths / mapped.cases) * 100).toFixed(2) : 0;
    mapped.riskIndex = +(mapped.smoking * 0.5 + mapped.malnutrition * 0.5).toFixed(2);
    mapped.preventionIndex = +(100 - mapped.riskIndex).toFixed(2);
    return mapped as HepRecord;
  });

  return { data: records, error: null };
}

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customData, setCustomDataState] = useState<HepRecord[] | null>(null);
  const [activeFileName, setActiveFileName] = useState<string | null>(null);

  const setCustomData = useCallback((data: HepRecord[] | null, fileName?: string | null) => {
    setCustomDataState(data);
    setActiveFileName(fileName ?? null);
    if (data) toast.success(`Данные из файла "${fileName}" загружены`);
  }, []);

  const clearCustomData = useCallback(() => {
    setCustomDataState(null);
    setActiveFileName(null);
    toast.info('Переключено на демо-данные');
  }, []);

  return (
    <UserDataContext.Provider value={{ customData, activeFileName, setCustomData, clearCustomData }}>
      {children}
    </UserDataContext.Provider>
  );
};
