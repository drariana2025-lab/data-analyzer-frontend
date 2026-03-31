import { useMemo } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { FilterBar } from '@/components/FilterBar';
import { Footer } from '@/components/Footer';
import { useUserData } from '@/contexts/UserDataContext';
import { COLORS } from '@/data/hepatitisData';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Label, LabelList, Cell, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { Activity } from 'lucide-react';

const fmtNum = (v: number) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v);

const cts = { backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))' };
const tickStyle = { fill: 'hsl(var(--chart-text))' };

export default function RiskFactorsPage() {
  const { filteredData } = useFilters();
  const { activeFileName } = useUserData();

  // Guard for missing data columns in universal mode
  const hasRiskData = useMemo(() => 
    filteredData.length > 0 && 'malnutrition' in filteredData[0],
  [filteredData]);

  const bubbleData = useMemo(() => {
    if (!hasRiskData) return [];
    const byCountry = new Map<string, { mal: number[]; smoking: number[]; deaths: number[] }>();
    filteredData.forEach(d => {
      if (!byCountry.has(d.country)) byCountry.set(d.country, { mal: [], smoking: [], deaths: [] });
      const c = byCountry.get(d.country)!;
      c.mal.push(d.malnutrition); c.smoking.push(d.smoking); c.deaths.push(d.deaths);
    });
    return Array.from(byCountry.entries()).map(([country, v]) => ({
      country, mal: +(v.mal.reduce((a, b) => a + b, 0) / v.mal.length).toFixed(1),
      smoking: +(v.smoking.reduce((a, b) => a + b, 0) / v.smoking.length).toFixed(1),
      deaths: +(v.deaths.reduce((a, b) => a + b, 0) / v.deaths.length).toFixed(0),
    }));
  }, [filteredData, hasRiskData]);

  const riskFactors = useMemo(() => {
    if (!hasRiskData) return [];
    return [
      { name: 'Недоедание', value: +(filteredData.reduce((s, d) => s + d.malnutrition, 0) / filteredData.length).toFixed(1) },
      { name: 'Курение', value: +(filteredData.reduce((s, d) => s + d.smoking, 0) / filteredData.length).toFixed(1) },
      { name: 'Урбанизация', value: +(filteredData.reduce((s, d) => s + d.urbanization, 0) / filteredData.length).toFixed(1) },
    ];
  }, [filteredData, hasRiskData]);

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="page-title">Факторы риска</h1>
      <FilterBar />
      
      {!hasRiskData ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-2xl border border-dashed border-primary/20">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Activity className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Данные не найдены</h2>
          <p className="text-muted-foreground max-w-md">
            Эта страница специализирована для анализа факторов риска при Гепатите B. 
            Ваш текущий файл не содержит необходимых колонок (недоедание, курение и др.).
          </p>
          <p className="text-sm text-primary mt-4 font-medium">
            Используйте «Основной Дашборд» или «Конструктор графиков» для анализа ваших данных.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="chart-container">
              <h3 className="section-title mb-4 text-center">Профиль факторов риска</h3>
              <div className="flex flex-col gap-6 py-6">
                {riskFactors.map(f => (
                  <div key={f.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{f.name}</span>
                      <span className="text-primary">{f.value}%</span>
                    </div>
                    <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${f.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="chart-container">
              <h3 className="section-title mb-3 text-center">Недоедание vs Курение</h3>
              <p className="text-xs text-muted-foreground text-center mb-2">Размер пузырька = Количество смертей</p>
              <div className="chart-scroll-wrapper"><div className="min-w-[400px]">
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
                    <XAxis dataKey="mal" name="Недоедание (%)" stroke="hsl(var(--chart-text))" fontSize={11}>
                      <Label value="Недоедание (%)" position="insideBottom" offset={-4} fill="hsl(var(--chart-text))" />
                    </XAxis>
                    <YAxis dataKey="smoking" name="Курение (%)" stroke="hsl(var(--chart-text))" fontSize={11}>
                      <Label value="Курение (%)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: 'hsl(var(--chart-text))' }} />
                    </YAxis>
                    <ZAxis dataKey="deaths" range={[50, 600]} name="Смерти" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={cts} />
                    <Scatter data={bubbleData} fill="#2C7DA0">
                      {bubbleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div></div>
            </div>
          </div>
        </>
      )}
      <Footer />
    </div>
  );
}
