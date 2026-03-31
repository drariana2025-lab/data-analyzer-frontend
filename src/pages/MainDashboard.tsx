import { useMemo, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFilters } from '@/contexts/FilterContext';
import { useUserData } from '@/contexts/UserDataContext';
import { Download, Activity, TrendingUp, Calculator, ChevronDown, ChevronUp, Database, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/Footer';
import ChartsPage from '@/pages/ChartsPage';
import TablesPage from '@/pages/TablesPage';
import { toast } from 'sonner';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, ScatterChart, Scatter,
} from 'recharts';

export default function MainDashboard() {
  const { filteredData } = useFilters();
  const { analysisMetadata, activeFileName } = useUserData();
  const [showAllStats, setShowAllStats] = useState(false);

  const fmtNum = (v: number) => {
    if (typeof v !== 'number' || isNaN(v)) return '0';
    if (Math.abs(v) >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(0)}K`;
    if (Math.abs(v) % 1 !== 0) return v.toFixed(2);
    return String(v);
  };

  // Dynamic Statistics based on numerical columns
  const columnStats = useMemo(() => {
    if (!filteredData.length || !analysisMetadata) return [];

    const numericCols = Object.entries(analysisMetadata.columns_info)
      .filter(([_, type]) => type === 'numeric')
      .map(([name]) => name);

    return numericCols.map(col => {
      const vals = filteredData.map(d => Number(d[col])).filter(v => !isNaN(v));
      const sum = vals.reduce((a, b) => a + b, 0);
      const avg = vals.length ? sum / vals.length : 0;
      const min = vals.length ? Math.min(...vals) : 0;
      const max = vals.length ? Math.max(...vals) : 0;

      return {
        name: col,
        sum: fmtNum(sum),
        avg: fmtNum(avg),
        min: fmtNum(min),
        max: fmtNum(max),
        count: vals.length
      };
    });
  }, [filteredData, analysisMetadata]);

  const displayedStats = showAllStats ? columnStats : columnStats.slice(0, 4);

  const handleDownloadPDF = useCallback(async () => {
    toast.info('Генерация PDF...');
    const { default: jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(16);
    doc.text(`Отчёт по данным: ${activeFileName || 'Демо-данные'}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Дата: ${new Date().toLocaleDateString('ru-RU')}`, 14, 22);

    if (filteredData.length > 0) {
      const headers = Object.keys(filteredData[0]).slice(0, 8);
      const rows = filteredData.slice(0, 200).map(d => headers.map(h => String(d[h] || '')));
      (doc as any).autoTable({
        head: [headers], body: rows, startY: 28,
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [59, 130, 246] },
      });
    }
    doc.save('report.pdf');
    toast.success('Отчёт скачан');
  }, [filteredData, activeFileName]);

  if (!activeFileName) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 text-center px-3 max-w-full min-w-0">
        <div className="relative group">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 group-hover:bg-primary/30 transition-all duration-700" />
          <div className="relative p-8 rounded-full bg-primary/10 transition-all hover:scale-110 duration-500">
            <Activity className="h-20 w-20 text-primary animate-pulse" />
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tight text-foreground">Ваш анализатор данных</h2>
          <p className="text-muted-foreground max-w-sm mx-auto mt-3 font-medium">
            Никаких шаблонов. Сайт мгновенно подстроится под любую структуру данных из вашего файла.
          </p>
        </div>
        <Button onClick={() => window.location.href='/profile'} className="h-12 w-full max-w-sm px-6 sm:px-8 rounded-full shadow-2xl shadow-primary/40 hover:scale-105 transition-transform font-bold text-base sm:text-lg">
           Начать анализ
        </Button>
      </div>
    );
  }

  const typeMap: Record<string, string> = {
    'line': 'Линейный',
    'bar': 'Столбчатый',
    'scatter': 'Точечный'
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-20 w-full max-w-full min-w-0 overflow-x-hidden">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between min-w-0">
        <div className="min-w-0">
           <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
             <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-2 sm:px-3 font-bold uppercase tracking-widest text-[8px] sm:text-[9px]">Данные в реальном времени</Badge>
             <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">{new Date().toLocaleTimeString()}</span>
           </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent break-words">
            {activeFileName || 'Анализ данных'}
          </h1>
          {analysisMetadata && (
            <p className="text-xs font-semibold text-muted-foreground/60 flex items-center gap-1.5 mt-2 uppercase tracking-wide">
              <Database className="h-3 w-3" /> {analysisMetadata.row_count} строк · {Object.keys(analysisMetadata.columns_info).length} факторов обнаружено
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 w-full md:w-auto md:shrink-0">
          <QRCodeGenerator />
          <Button variant="outline" size="lg" onClick={handleDownloadPDF} className="rounded-2xl border-none shadow-xl bg-card hover:bg-primary/5 group min-w-0">
            <Download className="h-5 w-5 mr-1.5 shrink-0 group-hover:translate-y-0.5 transition-transform" />Экспорт
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-1 min-w-0">
           <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2 min-w-0">
             <Calculator className="h-4 w-4 text-primary shrink-0" /> <span className="break-words">Статистика характеристик</span>
           </h3>
           {columnStats.length > 4 && (
             <Button variant="ghost" size="sm" onClick={() => setShowAllStats(!showAllStats)} className="text-[10px] font-bold uppercase">
               {showAllStats ? 'Свернуть' : 'Все характеристики'} {showAllStats ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
             </Button>
           )}
        </div>
        
        {columnStats.length === 0 ? (
          <div className="p-8 text-center bg-muted/20 border-2 border-dashed rounded-3xl text-sm font-medium text-muted-foreground">
             Числовые колонки для расчета статистики не найдены.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayedStats.map((stat, idx) => (
              <Card key={idx} className="border-none shadow-2xl bg-card/60 backdrop-blur-md group hover:bg-primary/[0.02] transition-colors duration-500 rounded-3xl overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="p-2 w-fit rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors mb-2">
                     <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-sm font-black truncate text-foreground/90 uppercase tracking-tight">{stat.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black mb-4 group-hover:scale-105 origin-left transition-transform">{stat.sum}</div>
                  <div className="grid grid-cols-3 gap-2 border-t pt-4 border-foreground/5">
                     <div className="text-center">
                        <p className="text-[9px] font-black text-muted-foreground uppercase">Среднее</p>
                        <p className="text-xs font-bold text-primary">{stat.avg}</p>
                     </div>
                     <div className="text-center">
                        <p className="text-[9px] font-black text-muted-foreground uppercase">Мин</p>
                        <p className="text-xs font-bold">{stat.min}</p>
                     </div>
                     <div className="text-center">
                        <p className="text-[9px] font-black text-muted-foreground uppercase">Макс</p>
                        <p className="text-xs font-bold">{stat.max}</p>
                     </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Dynamic Charts Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 min-w-0">
        {analysisMetadata?.chart_configs.slice(0, 4).map((config, idx) => (
          <Card key={idx} className="border-none shadow-2xl bg-card/40 backdrop-blur-xl rounded-[24px] sm:rounded-[32px] overflow-hidden min-w-0">
            <CardHeader className="pb-0 pt-4 px-4 sm:pt-8 sm:px-8 min-w-0">
               <div className="flex items-center gap-3 mb-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse shrink-0" />
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest truncate">Анализ: {typeMap[config.type] || config.type}</CardDescription>
               </div>
               <CardTitle className="text-lg sm:text-2xl font-black tracking-tighter break-words">{config.title || `Зависимость ${config.y}`}</CardTitle>
            </CardHeader>
            <CardContent className="h-[280px] sm:h-[340px] lg:h-[400px] p-3 sm:p-4 lg:p-8 min-w-0 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {config.type === 'line' ? (
                  <LineChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted)/0.2)" />
                    <XAxis dataKey={config.x} fontSize={10} axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))'}} />
                    <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={fmtNum} tick={{fill: 'hsl(var(--muted-foreground))'}} />
                    <RechartsTooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', backgroundColor: 'hsl(var(--card))' }} />
                    <Line type="monotone" dataKey={config.y} stroke="hsl(var(--primary))" strokeWidth={5} dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 0 }} activeDot={{ r: 8, stroke: 'white', strokeWidth: 4 }} />
                  </LineChart>
                ) : (
                  <BarChart data={filteredData.slice(0, 15)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted)/0.2)" />
                    <XAxis dataKey={config.x} fontSize={10} axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))'}} />
                    <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={fmtNum} tick={{fill: 'hsl(var(--muted-foreground))'}} />
                    <RechartsTooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', backgroundColor: 'hsl(var(--card))' }} />
                    <Bar dataKey={config.y} fill="hsl(var(--primary))" radius={[12, 12, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-6 pt-6 sm:pt-10 mt-2 border-t border-border/40 min-w-0">
        <ChartsPage embedded />
      </section>

      <section className="space-y-6 pt-6 sm:pt-10 border-t border-border/40 min-w-0">
        <TablesPage embedded />
      </section>

      <section className="pt-6 sm:pt-10 border-t border-border/40 min-w-0">
        <Card className="border-none shadow-xl bg-card/60 backdrop-blur-sm rounded-[24px] sm:rounded-[32px] overflow-hidden min-w-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tight">
              <User className="h-5 w-5 text-primary" /> Личный кабинет
            </CardTitle>
            <CardDescription className="font-medium">
              Загрузка файлов, запуск анализа и библиотека данных
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-xl font-bold">
              <Link to="/profile">Открыть личный кабинет</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <Footer />
    </div>
  );
}
