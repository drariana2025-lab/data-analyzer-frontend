import { useFilters } from '@/contexts/FilterContext';
import { useUserData } from '@/contexts/UserDataContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Filter, X, Search, Terminal } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';

export function FilterBar() {
  const { 
    activeFilters, 
    setFilter, 
    searchText, 
    setSearchText, 
    resetFilters, 
    isFiltering 
  } = useFilters();
  
  const { customData, analysisMetadata } = useUserData();

  const categoricalCols = useMemo(() => {
    if (!analysisMetadata) return [];
    return Object.entries(analysisMetadata.columns_info)
      .filter(([_, type]) => type === 'categorical')
      .map(([name]) => name);
  }, [analysisMetadata]);

  // Extract unique values for each categorical column (dependent/chained filters)
  const columnOptions = useMemo(() => {
    if (!customData || !categoricalCols.length) return {};
    
    const options: Record<string, string[]> = {};
    categoricalCols.forEach(currentCol => {
      // To show ONLY possible values for this dropdown:
      // Filter the data by all other active filters (except the current column's filter)
      let filteredForThisCol = customData;
      
      // Apply Search filter if any
      if (searchText) {
        const s = searchText.toLowerCase();
        filteredForThisCol = filteredForThisCol.filter(item => 
          Object.values(item).join(' ').toLowerCase().includes(s)
        );
      }

      // Apply all other categorical filters except current one
      Object.entries(activeFilters).forEach(([otherCol, selectedValues]) => {
        if (otherCol !== currentCol && selectedValues.length > 0) {
          filteredForThisCol = filteredForThisCol.filter(item => 
            selectedValues.includes(String(item[otherCol]))
          );
        }
      });

      const vals = new Set(filteredForThisCol.map(d => String(d[currentCol] || '')));
      options[currentCol] = Array.from(vals).filter(v => v !== '').sort();
    });
    return options;
  }, [customData, categoricalCols, activeFilters, searchText]);

  const hasActiveFilters = Object.values(activeFilters).some(vals => vals.length > 0) || searchText !== '';

  if (!analysisMetadata && !customData?.length) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center min-w-0">
        {/* Global Search */}
        <div className="relative w-full md:w-64 group shrink-0 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Поиск по всем полям..." 
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-9 h-9 bg-card border-none shadow-sm focus-visible:ring-1 ring-primary/20"
          />
        </div>

        {/* Dynamic Categorical Filters */}
        <div className="flex flex-wrap gap-2 items-center flex-1 min-w-0">
          {categoricalCols.length > 0 ? (
            categoricalCols.map(col => (
              <Select 
                key={col}
                value={(activeFilters[col]?.[0] as string) || 'all'} 
                onValueChange={(val) => setFilter(col, val === 'all' ? [] : [val])}
              >
                <SelectTrigger className="h-9 w-full min-w-0 sm:min-w-[120px] sm:max-w-[200px] border-none bg-card shadow-sm hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-2 truncate">
                    <Filter className="h-3 w-3 text-muted-foreground shrink-0" />
                    <SelectValue placeholder={col} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все: {col}</SelectItem>
                  {columnOptions[col]?.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                  {(!columnOptions[col] || columnOptions[col].length === 0) && (
                    <SelectItem value="none" disabled>Нет доступных вариантов</SelectItem>
                  )}
                </SelectContent>
              </Select>
            ))
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30 border border-dashed text-[10px] text-muted-foreground uppercase tracking-widest">
               <Terminal className="h-3 w-3" /> Нет колонок для фильтрации
            </div>
          )}

          {hasActiveFilters && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={resetFilters} 
              className="h-9 px-3 sm:px-4 font-bold text-[10px] sm:text-xs uppercase shadow-lg shadow-destructive/20 w-full sm:w-auto sm:ml-auto whitespace-normal sm:whitespace-nowrap text-center"
            >
              <X className="h-4 w-4 mr-2 shrink-0 inline" /> Сбросить все фильтры
            </Button>
          )}
        </div>
      </div>

      {/* Filter Summary Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
           {searchText && (
             <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 gap-1.5 flex items-center">
                <Search className="h-3 w-3" /> Поиск: {searchText}
                <X className="h-3 w-3 cursor-pointer hover:text-foreground" onClick={() => setSearchText('')} />
             </Badge>
           )}
           {Object.entries(activeFilters).map(([col, vals]) => vals.length > 0 && (
             <Badge key={col} variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20 px-3 py-1 gap-1.5 flex items-center">
                <span className="font-bold opacity-50">{col}:</span> {vals[0]}
                <X className="h-3 w-3 cursor-pointer hover:text-foreground" onClick={() => setFilter(col, [])} />
             </Badge>
           ))}
        </div>
      )}
    </div>
  );
}
