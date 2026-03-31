import { useMemo } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useUserData } from '@/contexts/UserDataContext';
import { COLORS } from '@/data/hepatitisData';
import { FilterBar } from '@/components/FilterBar';
import { Footer } from '@/components/Footer';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, Label, LabelList,
  LineChart, Line, ScatterChart, Scatter, ZAxis,
} from 'recharts';
import { Activity } from 'lucide-react';

const fmtPercent = (v: number) => `${v}%`;

const chartTooltipStyle = { backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))' };

export default function VaccinationPage() {
  const { filteredData } = useFilters();
  const { activeFileName } = useUserData();

  // Guard for missing data columns in universal mode
  const hasVaccData = useMemo(() => 
    filteredData.length > 0 && 'vaccinationCoverage' in filteredData[0],
  [filteredData]);

  const vaccByCountry = useMemo(() => {
    if (!hasVaccData) return [];
    const map = new Map<string, number[]>();
    filteredData.forEach(d => { if (!map.has(d.country)) map.set(d.country, []); map.get(d.country)!.push(d.vaccinationCoverage); });
    return Array.from(map.entries()).map(([country, vals]) => ({ country, coverage: +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) })).sort((a, b) => b.coverage - a.coverage);
  }, [filteredData]);

  const trendData = useMemo(() => {
    const byYear = new Map<number, number[]>();
    filteredData.forEach(d => { if (!byYear.has(d.year)) byYear.set(d.year, []); byYear.get(d.year)!.push(d.vaccinationCoverage); });
    return Array.from(byYear.entries()).map(([year, vals]) => ({ year, avg: +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) })).sort((a, b) => a.year - b.year);
  }, [filteredData]);

  const scatterData = useMemo(() => filteredData.map(d => ({ safeInjections: d.safeInjections, cases: d.cases, country: d.country, year: d.year })), [filteredData]);

  const getBarColor = (v: number) => v >= 90 ? '#2D9F5F' : v >= 70 ? '#E67E22' : '#E74C3C';

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="page-title">Вакцинация и профилактика</h1>
      <FilterBar />
      
      {!hasVaccData ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-2xl border border-dashed border-primary/20">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Activity className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Данные не найдены</h2>
          <p className="text-muted-foreground max-w-md">
            Эта страница специализирована для анализа программ вакцинации от Гепатита B. 
            Ваш текущий файл не содержит необходимых колонок.
          </p>
          <p className="text-sm text-primary mt-4 font-medium">
            Используйте «Основной Дашборд» или «Конструктор графиков» для анализа ваших данных.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="chart-container">
              <h3 className="section-title mb-3">Охват вакцинацией по странам</h3>
              <div className="chart-scroll-wrapper"><div className="min-w-[400px]">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={vaccByCountry} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
                    <XAxis type="number" domain={[0, 100]} fontSize={11} tick={{ fill: 'hsl(var(--chart-text))' }}>
                      <Label value="Охват вакцинацией (%)" position="insideBottom" offset={-3} fontSize={12} fill="hsl(var(--chart-text))" />
                    </XAxis>
                    <YAxis type="category" dataKey="country" fontSize={11} width={90} tick={{ fill: 'hsl(var(--chart-text))' }}>
                      <Label value="Страна" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: 'hsl(var(--chart-text))' }} fontSize={12} />
                    </YAxis>
                    <Tooltip formatter={(v: number) => `${v}%`} contentStyle={chartTooltipStyle} />
                    <Bar dataKey="coverage" name="Охват (%)" radius={[0, 4, 4, 0]}>
                      <LabelList dataKey="coverage" position="right" formatter={fmtPercent} style={{ fontSize: '10px', fill: 'hsl(var(--foreground))' }} />
                      {vaccByCountry.map((entry, i) => <Cell key={i} fill={getBarColor(entry.coverage)} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div></div>
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ background: '#2D9F5F' }} />≥90%</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ background: '#E67E22' }} />70–90%</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ background: '#E74C3C' }} />&lt;70%</span>
              </div>
            </div>
            <div className="chart-container">
              <h3 className="section-title mb-3">Тренд вакцинации по годам</h3>
              <div className="chart-scroll-wrapper"><div className="min-w-[400px]">
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
                    <XAxis dataKey="year" fontSize={12} tick={{ fill: 'hsl(var(--chart-text))' }}>
                      <Label value="Год" position="insideBottom" offset={-3} fontSize={12} fill="hsl(var(--chart-text))" />
                    </XAxis>
                    <YAxis domain={[40, 80]} fontSize={11} tick={{ fill: 'hsl(var(--chart-text))' }}>
                      <Label value="Охват вакцинацией (%)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: 'hsl(var(--chart-text))' }} fontSize={12} />
                    </YAxis>
                    <Tooltip formatter={(v: number) => `${v}%`} contentStyle={chartTooltipStyle} />
                    <Line type="monotone" dataKey="avg" stroke="#2D9F5F" strokeWidth={2.5} name="Средний охват (%)" dot={{ r: 4, fill: '#2D9F5F' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div></div>
            </div>
          </div>
          <div className="chart-container">
            <h3 className="section-title mb-3">Безопасность инъекций vs Заболеваемость</h3>
            <div className="chart-scroll-wrapper"><div className="min-w-[400px]">
              <ResponsiveContainer width="100%" height={350}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
                  <XAxis dataKey="safeInjections" name="Безопасные инъекции (%)" fontSize={11} tick={{ fill: 'hsl(var(--chart-text))' }}>
                    <Label value="Безопасные инъекции (%)" position="insideBottom" offset={-3} fontSize={12} fill="hsl(var(--chart-text))" />
                  </XAxis>
                  <YAxis dataKey="cases" name="Случаи" fontSize={11} tick={{ fill: 'hsl(var(--chart-text))' }} tickFormatter={v => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}>
                    <Label value="Количество случаев" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: 'hsl(var(--chart-text))' }} fontSize={12} />
                  </YAxis>
                  <ZAxis range={[40, 40]} />
                  <Tooltip formatter={(v: number) => v.toLocaleString()} contentStyle={chartTooltipStyle} />
                  <Scatter data={scatterData} fill="#2C7DA0" />
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
