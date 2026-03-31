import { useMemo, useState } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useUserData } from '@/contexts/UserDataContext';
import { FilterBar } from '@/components/FilterBar';
import { Footer } from '@/components/Footer';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, 
  Search, Download, ArrowUpDown, Filter, Database, FileSpreadsheet
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

import { SqlConsole } from '@/components/SqlConsole';
import { LayoutGrid, Terminal as SqlIcon } from 'lucide-react';

const COLUMN_COLORS = [
  'hsl(var(--primary))',
  'hsl(142, 70%, 45%)', // Green
  'hsl(24, 95%, 53%)',  // Orange
  'hsl(199, 89%, 48%)', // Blue
  'hsl(271, 91%, 65%)', // Purple
  'hsl(346, 84%, 61%)', // Pink
  'hsl(48, 96%, 53%)',  // Yellow
  'hsl(180, 70%, 45%)', // Cyan
];

const getColumnColor = (index: number) => COLUMN_COLORS[index % COLUMN_COLORS.length];

export default function TablesPage({ embedded = false }: { embedded?: boolean } = {}) {
  const { filteredData, sqlQuery } = useFilters();
  const { activeFileName } = useUserData();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [localSearch, setLocalSearch] = useState('');
  const [searchMode, setSearchMode] = useState<'standard' | 'sql'>(sqlQuery ? 'sql' : 'standard');

  // 1. All available columns
  const columns = useMemo(() => {
    if (!filteredData.length) return [];
    return Object.keys(filteredData[0]);
  }, [filteredData]);

  // 2. Local search and Sorting
  const processedData = useMemo(() => {
    let data = [...filteredData];
    
    // localSearch only applied in standard mode
    if (localSearch && searchMode === 'standard') {
      const s = localSearch.toLowerCase();
      data = data.filter(r => 
        Object.values(r).some(v => String(v).toLowerCase().includes(s))
      );
    }

    if (sortCol) {
      data.sort((a, b) => {
        const va = a[sortCol];
        const vb = b[sortCol];
        if (typeof va === 'number' && typeof vb === 'number') {
          return sortDir === 'asc' ? va - vb : vb - va;
        }
        const sa = String(va).toLowerCase();
        const sb = String(vb).toLowerCase();
        return sortDir === 'asc' ? sa.localeCompare(sb) : sb.localeCompare(sa);
      });
    }
    
    return data;
  }, [filteredData, localSearch, sortCol, sortDir, searchMode]);

  // 3. Pagination
  const totalPages = Math.ceil(processedData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  const toggleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
    setCurrentPage(1);
  };

  const handleExport = () => {
    toast.success('Экспорт CSV начат...');
    const csvContent = "data:text/csv;charset=utf-8," 
      + [columns.join(","), ...processedData.map(r => columns.map(c => `"${r[c]}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `data_export_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  if (!activeFileName) {
    if (embedded) return null;
    return (
      <div className="space-y-6 animate-fade-in pb-20">
        <h1 className="page-title text-3xl font-black">Табличный обзор</h1>
        <div className="flex flex-col items-center justify-center py-32 text-center bg-card rounded-3xl border-2 border-dashed border-primary/20">
           <FileSpreadsheet className="h-16 w-16 text-primary/20 mb-4" />
           <h2 className="text-xl font-bold">Файл не выбран</h2>
           <p className="text-muted-foreground max-w-sm mt-2">Загрузите или выберите файл в личном кабинете для просмотра таблицы.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${embedded ? 'space-y-6' : 'space-y-6 animate-fade-in pb-20'} w-full max-w-full min-w-0 overflow-x-hidden`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          {embedded ? (
            <h2 className="text-xl sm:text-2xl font-black tracking-tight break-words">Просмотр данных</h2>
          ) : (
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight break-words">Просмотр данных</h1>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-1">
             <Badge variant="outline" className="text-primary font-bold uppercase tracking-widest text-[8px] sm:text-[9px] px-2 sm:px-3 max-w-full break-all whitespace-normal text-left">{activeFileName}</Badge>
             <span className="text-xs text-muted-foreground">{processedData.length} записей</span>
             {searchMode === 'sql' && <Badge className="bg-primary/20 text-primary border-none text-[8px] h-4 uppercase shrink-0">Режим SQL</Badge>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto sm:shrink-0">
           <div className="bg-muted/30 p-1 rounded-xl flex gap-1">
              <button 
                onClick={() => setSearchMode('standard')}
                className={`p-1.5 rounded-lg transition-all ${searchMode === 'standard' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                title="Обычный поиск"
              >
                 <LayoutGrid className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setSearchMode('sql')}
                className={`p-1.5 rounded-lg transition-all ${searchMode === 'sql' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                title="SQL Консоль"
              >
                 <SqlIcon className="h-4 w-4" />
              </button>
           </div>
           <Button variant="outline" size="sm" onClick={handleExport} className="rounded-xl border-none shadow-lg bg-card hover:bg-primary/5 group grow sm:grow-0 min-w-0">
              <Download className="h-4 w-4 mr-1.5 shrink-0 group-hover:scale-110 transition-transform" /> CSV
           </Button>
        </div>
      </div>

      {searchMode === 'sql' && <SqlConsole />}

      <Card className="border-none shadow-2xl bg-card overflow-hidden rounded-[24px] sm:rounded-[32px] min-w-0 max-w-full">
        <CardHeader className="bg-muted/10 pb-6 px-3 sm:px-6">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between min-w-0">
            <div className="relative flex-1 w-full md:max-w-md min-w-0 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder={searchMode === 'sql' ? "Поиск отключен в режиме SQL" : "Поиск по таблице..."}
                disabled={searchMode === 'sql'}
                className="pl-9 h-11 bg-card/60 border-none shadow-sm focus-visible:ring-1 ring-primary/20 disabled:opacity-50"
                value={localSearch}
                onChange={(e) => { setLocalSearch(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-bold text-muted-foreground">
               <span className="shrink-0">Показывать по:</span>
               <div className="flex flex-wrap gap-1.5">
                  {[20, 50, 100].map(size => (
                    <button 
                      key={size} 
                      onClick={() => { setPageSize(size); setCurrentPage(1); }}
                      className={`px-3 py-1.5 rounded-lg transition-all ${pageSize === size ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-card hover:bg-muted border border-transparent'}`}
                    >
                      {size}
                    </button>
                  ))}
               </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 min-w-0 max-w-full">
          <div className="overflow-x-auto overflow-y-hidden max-w-full touch-pan-x">
            <Table className="min-w-max">
              <TableHeader className="bg-muted/[0.05]">
                <TableRow className="border-b-0">
                  {columns.map((col, idx) => (
                    <TableHead key={col} className="h-14 whitespace-nowrap p-0 border-b-2" style={{ borderBottomColor: getColumnColor(idx) }}>
                       <button 
                         onClick={() => toggleSort(col)}
                         className="flex items-center gap-1.5 hover:text-primary transition-colors group px-4 py-1.5 rounded-lg hover:bg-muted/50 w-full h-full text-left"
                       >
                          <span className="text-[10px] font-black uppercase tracking-tight" style={{ color: getColumnColor(idx) }}>{col}</span>
                          <ArrowUpDown className={`h-3 w-3 transition-opacity ${sortCol === col ? 'opacity-100' : 'opacity-20 group-hover:opacity-100'}`} />
                       </button>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row, rowIdx) => (
                    <TableRow key={rowIdx} className="hover:bg-primary/[0.02] border-b border-foreground/[0.03] last:border-0 transition-colors">
                      {columns.map((col, colIdx) => (
                        <TableCell key={col} className="py-4 text-xs font-medium text-foreground/80 px-4 border-l-2" style={{ borderLeftColor: `${getColumnColor(colIdx)}20` }}>
                           <span style={{ color: rowIdx % 2 === 0 ? 'inherit' : `${getColumnColor(colIdx)}dd` }}>
                              {String(row[col] ?? '-')}
                           </span>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                     <TableCell colSpan={columns.length || 1} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center gap-3 opacity-60">
                           <Filter className="h-10 w-10 text-muted-foreground" />
                           <p className="text-sm font-bold">Данных по выбранным фильтрам нет</p>
                           <Button variant="outline" size="sm" onClick={() => { setSearchMode('standard'); setLocalSearch(''); }} className="rounded-xl">
                              Сбросить поиск
                           </Button>
                        </div>
                     </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 bg-muted/5 gap-3 sm:gap-4">
             <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center sm:text-left">
                Страница {currentPage} из {totalPages || 1}
             </div>
             <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-full">
                <Button variant="ghost" size="icon" onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="h-9 w-9 rounded-xl hover:bg-primary/5">
                   <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="h-9 w-9 rounded-xl hover:bg-primary/5">
                   <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1 mx-2">
                   {[...Array(Math.min(5, totalPages))].map((_, i) => {
                     const pageNum = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                     return (
                       <Button 
                         key={pageNum} 
                         variant={currentPage === pageNum ? "default" : "ghost"}
                         size="icon"
                         className={`h-9 w-9 rounded-xl font-bold transition-all ${currentPage === pageNum ? 'shadow-lg shadow-primary/30 scale-110' : 'hover:bg-primary/5'}`}
                         onClick={() => setCurrentPage(pageNum)}
                       >
                         {pageNum}
                       </Button>
                     );
                   })}
                </div>

                <Button variant="ghost" size="icon" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages || totalPages === 0} className="h-9 w-9 rounded-xl hover:bg-primary/5">
                   <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || totalPages === 0} className="h-9 w-9 rounded-xl hover:bg-primary/5">
                   <ChevronsRight className="h-4 w-4" />
                </Button>
             </div>
          </div>
        </CardContent>
      </Card>
      
      {!embedded && <Footer />}
    </div>
  );
}
