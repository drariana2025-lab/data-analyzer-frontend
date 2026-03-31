/**
 * @deprecated Legacy Hepatitis B data. 
 * The application is now a Universal Data Analytics Platform.
 * This file is kept minimal for compatibility with any lingering type imports.
 */

export interface HepRecord {
  year: number;
  country: string;
  region: string;
  incomeLevel: string;
  population: number;
  cases: number;
  deaths: number;
  treatmentSuccess: number;
  healthcareAccess: number;
  vaccinationCoverage: number;
  smoking: number;
  malnutrition: number;
  urbanization: number;
  gdpPerCapita: number;
  riskFactorScore: number;
  [key: string]: any;
}

export const rawData: HepRecord[] = [];
export const years: number[] = [];
export const regions: string[] = [];
export const incomeLevels: string[] = [];
export const countries: string[] = [];

export const COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", 
  "#ec4899", "#06b6d4", "#f97316", "#84cc16", "#a855f7"
];
