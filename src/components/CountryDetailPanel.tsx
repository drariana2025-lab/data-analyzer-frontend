import { useFilters } from '@/contexts/FilterContext';
import { rawData } from '@/data/hepatitisData';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useMemo } from 'react';

export function CountryDetailPanel() {
  const { detailCountry, setDetailCountry } = useFilters();

  const countryData = useMemo(() => {
    if (!detailCountry) return [];
    return rawData.filter(d => d.country === detailCountry).sort((a, b) => a.year - b.year);
  }, [detailCountry]);

  const regionAvg = useMemo(() => {
    if (!detailCountry || countryData.length === 0) return [];
    const region = countryData[0].region;
    const regionData = rawData.filter(d => d.region === region);
    const byYear = new Map<number, { cases: number[]; deaths: number[]; treatment: number[]; vacc: number[] }>();
    regionData.forEach(d => {
      if (!byYear.has(d.year)) byYear.set(d.year, { cases: [], deaths: [], treatment: [], vacc: [] });
      const y = byYear.get(d.year)!;
      y.cases.push(d.cases); y.deaths.push(d.deaths);
      y.treatment.push(d.treatmentSuccess); y.vacc.push(d.vaccinationCoverage);
    });
    return Array.from(byYear.entries()).map(([year, v]) => ({
      year,
      avgCases: Math.round(v.cases.reduce((a, b) => a + b, 0) / v.cases.length),
      avgDeaths: Math.round(v.deaths.reduce((a, b) => a + b, 0) / v.deaths.length),
      avgTreatment: +(v.treatment.reduce((a, b) => a + b, 0) / v.treatment.length).toFixed(1),
      avgVacc: +(v.vacc.reduce((a, b) => a + b, 0) / v.vacc.length).toFixed(1),
    })).sort((a, b) => a.year - b.year);
  }, [detailCountry, countryData]);

  const chartData = useMemo(() => {
    return countryData.map(d => {
      const avg = regionAvg.find(a => a.year === d.year);
      return {
        year: d.year,
        cases: d.cases,
        avgCases: avg?.avgCases ?? 0,
        treatment: d.treatmentSuccess,
        avgTreatment: avg?.avgTreatment ?? 0,
        vaccination: d.vaccinationCoverage,
        avgVacc: avg?.avgVacc ?? 0,
        deaths: d.deaths,
        avgDeaths: avg?.avgDeaths ?? 0,
      };
    });
  }, [countryData, regionAvg]);

  return (
    <Sheet open={!!detailCountry} onOpenChange={() => setDetailCountry(null)}>
      <SheetContent className="w-[520px] sm:max-w-[520px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">{detailCountry} — Детализация</SheetTitle>
          <p className="text-sm text-muted-foreground">Сравнение со средним по региону ({countryData[0]?.region})</p>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="chart-container">
            <h4 className="section-title mb-3">Случаи заболеваний</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" fontSize={12} />
                <YAxis fontSize={11} tickFormatter={v => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
                <Tooltip formatter={(v: number) => v.toLocaleString()} />
                <Legend />
                <Line type="monotone" dataKey="cases" stroke="#2C7DA0" name={detailCountry || ''} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="avgCases" stroke="#2C7DA0" name="Среднее по региону" strokeDasharray="5 5" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-container">
            <h4 className="section-title mb-3">Успешность лечения (%)</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" fontSize={12} />
                <YAxis fontSize={11} domain={[60, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="treatment" stroke="#2D9F5F" name={detailCountry || ''} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="avgTreatment" stroke="#2D9F5F" name="Среднее по региону" strokeDasharray="5 5" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-container">
            <h4 className="section-title mb-3">Охват вакцинацией (%)</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" fontSize={12} />
                <YAxis fontSize={11} domain={[30, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="vaccination" stroke="#E67E22" name={detailCountry || ''} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="avgVacc" stroke="#E67E22" name="Среднее по региону" strokeDasharray="5 5" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
