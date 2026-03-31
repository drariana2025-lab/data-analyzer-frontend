import { useState, useMemo } from 'react';
import { rawData, countries } from '@/data/hepatitisData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, TrendingDown, Shield } from 'lucide-react';

export function VaccinationCalculator() {
  const [country, setCountry] = useState(countries[0]);

  const result = useMemo(() => {
    const data = rawData.filter(d => d.country === country);
    const latest = data.reduce((a, b) => a.year > b.year ? a : b);
    const currentCoverage = latest.vaccinationCoverage;
    const targetCoverage = 90;
    if (currentCoverage >= targetCoverage) return { prevented: 0, currentCoverage, cases: latest.cases, already: true };
    const coverageGap = (targetCoverage - currentCoverage) / 100;
    const prevented = Math.round(latest.cases * coverageGap * 0.85);
    return { prevented, currentCoverage, cases: latest.cases, already: false };
  }, [country]);

  return (
    <div className="chart-container">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="h-5 w-5 text-primary" />
        <h3 className="section-title">Калькулятор «Цена невакцинации»</h3>
      </div>
      <div className="flex gap-3 items-center mb-4">
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger className="w-[180px] h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">→ цель: 90% охват</span>
      </div>
      {result.already ? (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-accent/10">
          <Shield className="h-8 w-8 text-accent" />
          <div>
            <p className="font-medium text-accent">Охват уже ≥ 90%</p>
            <p className="text-sm text-muted-foreground">Текущий: {result.currentCoverage}%</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-secondary">
            <p className="text-xs text-muted-foreground">Текущий охват</p>
            <p className="text-xl font-semibold text-foreground">{result.currentCoverage}%</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary">
            <p className="text-xs text-muted-foreground">Текущие случаи</p>
            <p className="text-xl font-semibold text-foreground">{result.cases.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-accent/10">
            <div className="flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-accent" />
              <p className="text-xs text-accent">Можно предотвратить</p>
            </div>
            <p className="text-xl font-bold text-accent">{result.prevented.toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}
