import React, { useState } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Play, RotateCcw, HelpCircle, AlertCircle, Terminal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export const SqlConsole: React.FC = () => {
  const { sqlQuery, setSqlQuery, sqlError } = useFilters();
  const [localQuery, setLocalQuery] = useState(sqlQuery);

  const handleRun = () => {
    setSqlQuery(localQuery);
    if (!sqlError) {
      toast.success('Запрос выполнен');
    }
  };

  const handleReset = () => {
    setLocalQuery('');
    setSqlQuery('');
    toast.info('Фильтры сброшены');
  };

  return (
    <Card className="border-none shadow-lg bg-card/40 backdrop-blur-md overflow-hidden rounded-2xl">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">SQL Консоль</span>
           </div>
           <div className="group relative">
              <HelpCircle className="h-4 w-4 text-muted-foreground/50 hover:text-primary cursor-help transition-colors" />
              <div className="absolute right-0 top-6 w-64 p-3 bg-popover text-popover-foreground text-[10px] rounded-xl shadow-xl border border-border opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50">
                 Введите условие WHERE. <br/>
                 Например: <code className="text-primary">[Возраст] &gt; 30 AND [Пол] = 'М'</code> <br/>
                 Имена колонок с пробелами берите в квадратные скобки.
              </div>
           </div>
        </div>

        <div className="relative group">
           <Textarea 
             value={localQuery}
             onChange={(e) => setLocalQuery(e.target.value)}
             placeholder="Введите SQL условие (например: [Возраст] > 20)..."
             className={`min-h-[80px] bg-background/50 border-none focus-visible:ring-1 transition-all font-mono text-xs ${sqlError ? 'ring-1 ring-destructive' : 'focus-visible:ring-primary/30'}`}
           />
           {sqlError && (
             <div className="absolute right-3 bottom-3 flex items-center gap-1.5 text-destructive animate-pulse">
                <AlertCircle className="h-3 w-3" />
                <span className="text-[9px] font-bold uppercase truncate max-w-[200px]">{sqlError}</span>
             </div>
           )}
        </div>

        <div className="flex flex-wrap gap-2">
           <Button 
             onClick={handleRun} 
             size="sm" 
             className="flex-1 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2 font-bold"
           >
              <Play className="h-3 w-3 fill-current" /> Выполнить
           </Button>
           <Button 
             onClick={handleReset} 
             variant="outline" 
             size="sm" 
             className="px-3 rounded-xl border-none bg-muted/50 hover:bg-muted font-bold"
           >
              <RotateCcw className="h-3 w-3" />
           </Button>
        </div>
      </CardContent>
    </Card>
  );
};
