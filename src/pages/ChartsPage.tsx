import { useMemo, useState, useEffect } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useUserData } from '@/contexts/UserDataContext';
import { FilterBar } from '@/components/FilterBar';
import { Footer } from '@/components/Footer';
import { COLORS } from '@/data/hepatitisData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, Label, LabelList,
  LineChart, Line,
  ScatterChart, Scatter, ZAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartBar, LineChart as LineIcon, BarChart3, ScatterChart as ScatterIcon, Settings2, Info, Database, AlertCircle } from 'lucide-react';

const cts = { backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', color: 'hsl(var(--foreground))' };
const tickStyle = { fill: 'hsl(var(--chart-text))', fontSize: 10 };

export default function ChartsPage({ embedded = false }: { embedded?: boolean } = {}) {
  const { filteredData } = useFilters();
  const { analysisMetadata, activeFileName } = useUserData();
  
  const [chartType, setChartType] = useState<'bar' | 'line' | 'scatter'>('bar');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');

  const numericCols = useMemo(() => {
    if (!analysisMetadata) return [];
    return Object.entries(analysisMetadata.columns_info)
      .filter(([_, t]) => t === 'numeric')
      .map(([n]) => n);
  }, [analysisMetadata]);

  const allCols = useMemo(() => {
    if (!analysisMetadata) return [];
    return Object.keys(analysisMetadata.columns_info);
  }, [analysisMetadata]);

  // Set default axes on load
  useEffect(() => {
    if (analysisMetadata && !xAxis) {
      const cats = Object.entries(analysisMetadata.columns_info).filter(([_, t]) => t === 'categorical');
      const timeCols = Object.entries(analysisMetadata.columns_info).filter(([_, t]) => t === 'temporal');
      
      setXAxis(timeCols[0]?.[0] || cats[0]?.[0] || allCols[0]);
      setYAxis(numericCols[0] || allCols[1]);
    }
  }, [analysisMetadata, xAxis, numericCols, allCols]);

  // Aggregate data for Bar/Line charts if X is categorical
  const processedData = useMemo(() => {
    if (!filteredData.length || !xAxis || !yAxis) return [];
    
    const xType = analysisMetadata?.columns_info[xAxis];
    
    if (xType === 'categorical' && (chartType === 'bar' || chartType === 'line')) {
      const aggMap = new Map<string, number>();
      filteredData.forEach(item => {
        const xVal = String(item[xAxis] || 'N/A');
        const yVal = Number(item[yAxis]) || 0;
        aggMap.set(xVal, (aggMap.get(xVal) || 0) + yVal);
      });
      return Array.from(aggMap.entries())
        .map(([key, val]) => ({ [xAxis]: key, [yAxis]: val }))
        .sort((a,b) => (Number(b[yAxis]) || 0) - (Number(a[yAxis]) || 0))
        .slice(0, 50); // Limit to top 50 for readability
    }
    
    // For scatter or numerical X, just use raw data (limited)
    return filteredData.slice(0, 500);
  }, [filteredData, xAxis, yAxis, chartType, analysisMetadata]);

  const fmtNum = (v: number) => {
    if (typeof v !== 'number') return v;
    return v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v);
  };

  if (!activeFileName || !filteredData.length) {
    if (embedded) return null;
    return (
      <div className="space-y-6 animate-fade-in pb-20 w-full max-w-full min-w-0 px-2">
        <h1 className="page-title">Интерактивная аналитика</h1>
        <div className="flex flex-col items-center justify-center py-16 sm:py-32 px-4 text-center bg-card rounded-3xl border-2 border-dashed border-primary/20">
           <Database className="h-16 w-16 text-primary/20 mb-4" />
           <h2 className="text-xl font-bold">Нет данных для анализа</h2>
           <p className="text-muted-foreground max-w-sm mt-2">Загрузите файл в личном кабинете, чтобы начать строить динамические графики.</p>
           <button onClick={() => window.location.href='/profile'} className="mt-6 px-6 py-2 bg-primary text-white rounded-full font-bold shadow-lg shadow-primary/20">Перейти к загрузке</button>
        </div>
      </div>
    );
  }

  const hasNumericData = numericCols.length > 0;

  return (
    <div className={`${embedded ? 'space-y-6' : 'space-y-6 animate-fade-in pb-20'} w-full max-w-full min-w-0 overflow-x-hidden`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          {embedded ? (
            <h2 className="text-xl sm:text-2xl font-black tracking-tight break-words">Конструктор визуализаций</h2>
          ) : (
            <h1 className="page-title text-2xl sm:text-3xl font-black break-words">Конструктор визуализаций</h1>
          )}
          <p className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-widest mt-1 break-words">
             Анализ файла: {activeFileName}
          </p>
        </div>
        <div className="p-3 bg-primary/10 rounded-2xl shrink-0 self-start sm:self-auto">
           <ChartBar className="h-6 w-6 text-primary" />
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur-md border rounded-2xl p-3 sm:p-4 shadow-sm min-w-0 overflow-x-hidden">
        <FilterBar />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 min-w-0">
        {/* Controls */}
        <Card className="lg:col-span-1 border-none shadow-xl bg-card">
          <CardHeader className="pb-4">
             <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-primary" /> Настройки графика
             </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Тип отображения</label>
                <div className="grid grid-cols-3 gap-2">
                   <button 
                     onClick={() => setChartType('bar')}
                     className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${chartType === 'bar' ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' : 'bg-muted/30 border-transparent hover:bg-muted'}`}
                   >
                      <BarChart3 className="h-4 w-4" />
                      <span className="text-[9px] font-bold">Столбцы</span>
                   </button>
                   <button 
                     onClick={() => setChartType('line')}
                     className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${chartType === 'line' ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' : 'bg-muted/30 border-transparent hover:bg-muted'}`}
                   >
                      <LineIcon className="h-4 w-4" />
                      <span className="text-[9px] font-bold">Линия</span>
                   </button>
                   <button 
                     onClick={() => setChartType('scatter')}
                     className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${chartType === 'scatter' ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' : 'bg-muted/30 border-transparent hover:bg-muted'}`}
                   >
                      <ScatterIcon className="h-4 w-4" />
                      <span className="text-[9px] font-bold">Точки</span>
                   </button>
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Ось X (Категория/Время)</label>
                <Select value={xAxis} onValueChange={setXAxis}>
                   <SelectTrigger className="bg-muted/30 border-none h-11"><SelectValue /></SelectTrigger>
                   <SelectContent>
                      {allCols.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                   </SelectContent>
                </Select>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Ось Y (Значение)</label>
                <Select value={yAxis} onValueChange={setYAxis}>
                   <SelectTrigger className="bg-muted/30 border-none h-11"><SelectValue /></SelectTrigger>
                   <SelectContent>
                      {numericCols.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      {!hasNumericData && allCols.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                   </SelectContent>
                </Select>
             </div>

             {!hasNumericData && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-2">
                   <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                   <p className="text-[10px] text-amber-700 font-medium">В файле не обнаружены числовые колонки. Графики могут отображаться некорректно.</p>
                </div>
             )}
          </CardContent>
        </Card>

        {/* Chart Area */}
        <Card className="lg:col-span-3 border-none shadow-xl overflow-hidden bg-card min-w-0">
           <CardHeader className="pb-0 px-3 sm:px-6 pt-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between min-w-0">
                 <div className="min-w-0">
                    <CardTitle className="text-lg sm:text-xl font-bold break-words">{xAxis} и {yAxis}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">{chartType === 'scatter' ? 'Точечная диаграмма (сырые данные)' : 'Группировка и сумма'}</CardDescription>
                 </div>
                 <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="rounded-full px-2 sm:px-3 text-[10px] sm:text-xs whitespace-nowrap">{processedData.length} точек</Badge>
                 </div>
              </div>
           </CardHeader>
           <CardContent className="h-[280px] sm:h-[400px] lg:h-[500px] pt-4 sm:pt-6 px-2 sm:px-6 min-w-0 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 {chartType === 'bar' ? (
                   <BarChart data={processedData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted)/0.3)" />
                      <XAxis dataKey={xAxis} tick={tickStyle} axisLine={false} tickLine={false} />
                      <YAxis tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={fmtNum} />
                      <Tooltip contentStyle={cts} formatter={(v: any) => fmtNum(v)} />
                      <Legend />
                      <Bar dataKey={yAxis} fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name={`Сумма: ${yAxis}`} />
                   </BarChart>
                 ) : chartType === 'line' ? (
                   <LineChart data={processedData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted)/0.3)" />
                      <XAxis dataKey={xAxis} tick={tickStyle} axisLine={false} tickLine={false} />
                      <YAxis tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={fmtNum} />
                      <Tooltip contentStyle={cts} formatter={(v: any) => fmtNum(v)} />
                      <Legend />
                      <Line type="monotone" dataKey={yAxis} stroke="hsl(var(--primary))" strokeWidth={4} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 8 }} name={`Значение: ${yAxis}`} />
                   </LineChart>
                 ) : (
                   <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted)/0.3)" />
                      <XAxis dataKey={xAxis} name={xAxis} tick={tickStyle} label={{ value: xAxis, position: 'insideBottom', offset: -5 }} />
                      <YAxis dataKey={yAxis} name={yAxis} tick={tickStyle} tickFormatter={fmtNum} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={cts} />
                      <Scatter name="Набор данных" data={processedData} fill="hsl(var(--primary))" />
                   </ScatterChart>
                 )}
              </ResponsiveContainer>
           </CardContent>
        </Card>
      </div>

      {!embedded && <Footer />}
    </div>
  );
}
