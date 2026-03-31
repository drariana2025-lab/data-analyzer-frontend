import { useMemo } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { FilterBar } from '@/components/FilterBar';
import { Footer } from '@/components/Footer';
import { useUserData } from '@/contexts/UserDataContext';
import { COLORS } from '@/data/hepatitisData';
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Legend, Label, LabelList,
} from 'recharts';
import { Activity } from 'lucide-react';

const fmtNum = (v: number) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v);

const cts = { backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))' };
const tickStyle = { fill: 'hsl(var(--chart-text))' };

export default function HealthcarePage() {
  const { filteredData } = useFilters();
  const { activeFileName } = useUserData();

  // Guard for missing data columns in universal mode
  const hasHealthcareData = useMemo(() => 
    filteredData.length > 0 && 'treatmentSuccess' in filteredData[0],
  [filteredData]);

  const boxPlotData = useMemo(() => {
    if (!hasHealthcareData) return [];
    const byIncome = new Map<string, number[]>();
    filteredData.forEach(d => { if (!byIncome.has(d.incomeLevel)) byIncome.set(d.incomeLevel, []); byIncome.get(d.incomeLevel)!.push(d.treatmentSuccess); });
    return Array.from(byIncome.entries()).map(([income, vals]) => {
      const sorted = [...vals].sort((a, b) => a - b);
      return { income, min: sorted[0], median: sorted[Math.floor(sorted.length * 0.5)], max: sorted[sorted.length - 1], avg: +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1), count: vals.length };
    });
  }, [filteredData, hasHealthcareData]);

  const bubbleData = useMemo(() => {
    if (!hasHealthcareData) return [];
    const byCountry = new Map<string, { doctors: number[]; treatment: number[]; facilities: number[] }>();
    filteredData.forEach(d => {
      if (!byCountry.has(d.country)) byCountry.set(d.country, { doctors: [], treatment: [], facilities: [] });
      const c = byCountry.get(d.country)!;
      c.doctors.push(d.doctorsPer100k); c.treatment.push(d.treatmentSuccess); c.facilities.push(d.facilitiesPerMln);
    });
    return Array.from(byCountry.entries()).map(([country, v]) => ({
      country, doctors: +(v.doctors.reduce((a, b) => a + b, 0) / v.doctors.length).toFixed(2),
      treatment: +(v.treatment.reduce((a, b) => a + b, 0) / v.treatment.length).toFixed(1),
      facilities: +(v.facilities.reduce((a, b) => a + b, 0) / v.facilities.length).toFixed(2),
    }));
  }, [filteredData, hasHealthcareData]);

  const accessData = useMemo(() => {
    if (!hasHealthcareData) return [];
    return filteredData.map(d => ({ access: d.healthcareAccess, treatment: d.treatmentSuccess, country: d.country }));
  }, [filteredData, hasHealthcareData]);

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="page-title">Эффективность здравоохранения</h1>
      <FilterBar />
      
      {!hasHealthcareData ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-2xl border border-dashed border-primary/20">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Activity className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Данные не найдены</h2>
          <p className="text-muted-foreground max-w-md">
            Эта страница специализирована для анализа эффективности систем здравоохранения при Гепатите B. 
            Ваш текущий файл не содержит необходимых колонок (успешность лечения, врачи и др.).
          </p>
          <p className="text-sm text-primary mt-4 font-medium">
            Используйте «Основной Дашборд» или «Конструктор графиков» для анализа ваших данных.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="chart-container">
              <h3 className="section-title mb-3">Успешность лечения по уровням дохода</h3>
              <div className="chart-scroll-wrapper"><div className="min-w-[400px]">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={boxPlotData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
                    <XAxis dataKey="income" fontSize={11} tick={tickStyle}>
                      <Label value="Уровень дохода" position="insideBottom" offset={-3} fontSize={12} fill="hsl(var(--chart-text))" />
                    </XAxis>
                    <YAxis domain={[60, 100]} fontSize={11} tick={tickStyle}>
                      <Label value="Успешность лечения (%)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: 'hsl(var(--chart-text))' }} fontSize={12} />
                    </YAxis>
                    <Tooltip formatter={(v: number) => `${v}%`} contentStyle={cts} />
                    <Legend />
                    <Bar dataKey="min" fill="#E74C3C" name="Мин" radius={[2, 2, 0, 0]}>
                      <LabelList dataKey="min" position="top" formatter={fmtNum} style={{ fontSize: '10px', fill: 'hsl(var(--foreground))' }} />
                    </Bar>
                    <Bar dataKey="median" fill="#2C7DA0" name="Медиана" radius={[2, 2, 0, 0]}>
                      <LabelList dataKey="median" position="top" formatter={fmtNum} style={{ fontSize: '10px', fill: 'hsl(var(--foreground))' }} />
                    </Bar>
                    <Bar dataKey="max" fill="#2D9F5F" name="Макс" radius={[2, 2, 0, 0]}>
                      <LabelList dataKey="max" position="top" formatter={fmtNum} style={{ fontSize: '10px', fill: 'hsl(var(--foreground))' }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div></div>
            </div>
            <div className="chart-container">
              <h3 className="section-title mb-3">Врачи vs Успешность лечения</h3>
              <p className="text-xs text-muted-foreground mb-2">Размер = учреждения на млн</p>
              <div className="chart-scroll-wrapper"><div className="min-w-[400px]">
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
                    <XAxis dataKey="doctors" name="Врачи на 100тыс" fontSize={11} tick={tickStyle}>
                      <Label value="Врачи на 100 тыс." position="insideBottom" offset={-3} fontSize={12} fill="hsl(var(--chart-text))" />
                    </XAxis>
                    <YAxis dataKey="treatment" name="Успешность (%)" domain={[65, 100]} fontSize={11} tick={tickStyle}>
                      <Label value="Успешность лечения (%)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: 'hsl(var(--chart-text))' }} fontSize={12} />
                    </YAxis>
                    <ZAxis dataKey="facilities" range={[50, 500]} name="Учреждения на млн" />
                    <Tooltip formatter={(v: number) => v.toLocaleString()} contentStyle={cts} />
                    <Scatter data={bubbleData} fill="#2C7DA0">
                      {bubbleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div></div>
            </div>
          </div>
          <div className="chart-container">
            <h3 className="section-title mb-3">Доступ к медицине vs Успешность лечения</h3>
            <div className="chart-scroll-wrapper"><div className="min-w-[400px]">
              <ResponsiveContainer width="100%" height={350}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
                  <XAxis dataKey="access" name="Доступ к медицине (%)" fontSize={11} tick={tickStyle}>
                    <Label value="Доступ к медицине (%)" position="insideBottom" offset={-3} fontSize={12} fill="hsl(var(--chart-text))" />
                  </XAxis>
                  <YAxis dataKey="treatment" name="Успешность лечения (%)" domain={[60, 100]} fontSize={11} tick={tickStyle}>
                    <Label value="Успешность лечения (%)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: 'hsl(var(--chart-text))' }} fontSize={12} />
                  </YAxis>
                  <ZAxis range={[40, 40]} />
                  <Tooltip contentStyle={cts} />
                  <Scatter data={accessData} fill="#2D9F5F" />
                </ScatterChart>
              </ResponsiveContainer>
            </div></div>
          </div>
        </>
      )}
      <Footer />
    </div>
  );
}
