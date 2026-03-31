import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFilters } from '@/contexts/FilterContext';
import { useUserData, validateAndParseData } from '@/contexts/UserDataContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { Upload, Download, Trash2, FileSpreadsheet, Loader2, User, LogOut, FileText, Sparkles, CheckCircle2 } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { CONFIG, getApiUrl } from '../config';

interface UserFile {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  file_type: string;
  uploaded_at: string;
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { resetFilters } = useFilters();
  const { activeFileName, analysisMetadata, clearCustomData, applyAnalyzedDataset } = useUserData();
  const [files, setFiles] = useState<UserFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzingFileId, setAnalyzingFileId] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('user_files')
      .select('*')
      .order('uploaded_at', { ascending: false });
    if (!error && data) setFiles(data as UserFile[]);
    setLoadingFiles(false);
  }, [user]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const parseFile = async (file: File): Promise<Record<string, any>[]> => {
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'csv') {
      const text = await file.text();
      const lines = text.trim().split('\n');
      if (lines.length < 1) return [];
      
      // Handle both comma and semicolon
      const firstLine = lines[0];
      const sep = firstLine.includes(';') ? ';' : ',';
      
      const headers = firstLine.split(sep).map(h => h.trim().replace(/^"|"$/g, ''));
      return lines.slice(1).map(line => {
        const vals = line.split(sep);
        const obj: Record<string, any> = {};
        headers.forEach((h, i) => { 
          const val = vals[i]?.trim().replace(/^"|"$/g, '');
          obj[h] = isNaN(Number(val)) ? val : Number(val);
        });
        return obj;
      });
    }

    if (ext === 'json') {
      const text = await file.text();
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : [parsed];
    }

    if (ext === 'xlsx' || ext === 'xls') {
      const { read, utils } = await import('xlsx');
      const buf = await file.arrayBuffer();
      const wb = read(buf);
      const ws = wb.Sheets[wb.SheetNames[0]];
      return utils.sheet_to_json(ws);
    }

    throw new Error('Формат не поддерживается. Используйте CSV, Excel или JSON');
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls', 'json'].includes(ext || '')) {
      toast.error('Ошибка: Недопустимый формат файла');
      return;
    }

    setUploading(true);
    try {
      const rows = await parseFile(file);
      const { error: validError } = validateAndParseData(rows);
      if (validError) throw new Error(validError);

      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: storageError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);

      if (storageError) throw new Error('Ошибка хранилища: ' + storageError.message);

      const { error: dbError } = await supabase.from('user_files').insert({
        user_id: user.id,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: ext || 'csv',
      });

      if (dbError) throw new Error('Ошибка БД: ' + dbError.message);

      clearCustomData({ silent: true });
      resetFilters();
      await fetchFiles();
      toast.success('Файл загружен. Нажмите «Начать анализ» в библиотеке данных.');
    } catch (err: any) {
      toast.error(err.message || 'Ошибка при загрузке');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteFile = async (fileRecord: UserFile) => {
    try {
      await supabase.storage.from('uploads').remove([fileRecord.file_path]);
      await supabase.from('user_files').delete().eq('id', fileRecord.id);
      if (activeFileName === fileRecord.file_name) clearCustomData();
      await fetchFiles();
      toast.success('Файл удален');
    } catch (err) {
      toast.error('Не удалось удалить файл');
    }
  };

  const runAnalysis = async (fileRecord: UserFile) => {
    setAnalyzing(true);
    setAnalyzingFileId(fileRecord.id);
    clearCustomData({ silent: true });
    resetFilters();
    try {
      const { data, error } = await supabase.storage.from('uploads').download(fileRecord.file_path);
      if (error || !data) throw new Error('Файл не найден в хранилище');

      const file = new File([data], fileRecord.file_name);
      const formData = new FormData();
      formData.append('file', file);
      
      // 1. Check if backend is reachable
      try {
        const ping = await fetch(CONFIG.API_URL, { signal: AbortSignal.timeout(2000) }).catch(() => null);
        if (!ping) throw new Error(`Бэкенд недоступен по адресу ${CONFIG.API_URL}. Пожалуйста, запустите backend/main.py`);
      } catch (e: any) {
        if (e.name === 'TimeoutError') { /* ignore timeout on root ping if server is slow but alive */ }
        else throw e;
      }

      // 2. Upload to Backend
      const uploadUrl = `${getApiUrl(CONFIG.ENDPOINTS.UPLOAD)}?user_id=${user?.id || '1'}`;
      const uploadRes = await fetch(uploadUrl, { method: 'POST', body: formData }).catch(err => {
        throw new Error(`Ошибка подключения к серверу (${CONFIG.API_URL}). Убедитесь, что бэкенд запущен.`);
      });
      
      if (!uploadRes.ok) {
        const errJson = await uploadRes.json().catch(() => ({}));
        throw new Error(errJson.detail || 'Сервер анализа вернул ошибку при загрузке');
      }
      const uploadData = await uploadRes.json();
      
      // 3. Trigger Analysis
      const analyzeUrl = `${getApiUrl(CONFIG.ENDPOINTS.ANALYZE)}?file_path=${uploadData.path}`;
      const analysisRes = await fetch(analyzeUrl, { method: 'POST' }).catch(err => {
        throw new Error('Не удалось связаться с сервером для анализа. Убедитесь, что бэкенд запущен.');
      });
      
      const analysisJson = await analysisRes.json().catch(() => ({}));
      if (!analysisRes.ok) throw new Error(analysisJson.detail || 'Ошибка сервера при анализе данных. Проверьте содержимое файла.');

      const rows = await parseFile(file);
      applyAnalyzedDataset(rows, fileRecord.file_name, analysisJson.analysis_results);

      toast.success('Анализ завершен! Платформа адаптирована под ваши данные.');
    } catch (err: any) {
      console.error('Analysis error:', err);
      toast.error(err.message || 'Сбой анализа');
    } finally {
      setAnalyzing(false);
      setAnalyzingFileId(null);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-20 w-full max-w-6xl mx-auto px-1 sm:px-2 min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-4xl font-black tracking-tighter break-words">Личный кабинет</h1>
          <p className="text-muted-foreground font-medium mt-1 uppercase text-[10px] tracking-widest">Управление потоками данных</p>
        </div>
        <Button variant="outline" size="lg" onClick={signOut} className="w-full sm:w-auto rounded-2xl border-none shadow-xl bg-card hover:bg-destructive/10 hover:text-destructive group transition-all shrink-0">
          <LogOut className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" /> Выход
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 min-w-0">
        {/* Left Column: Profile & Upload */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-2xl bg-card/60 backdrop-blur-xl rounded-[32px] overflow-hidden">
            <CardHeader className="pb-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                <User className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl font-bold">Профиль</CardTitle>
              <CardDescription className="text-xs font-medium uppercase tracking-tight opacity-60">Авторизованный пользователь</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-2xl bg-background/50 border border-foreground/5 shadow-inner">
                 <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Электронная почта</p>
                 <p className="text-sm font-bold truncate">{user?.email}</p>
              </div>
              
              {activeFileName && analysisMetadata && (
                <div className="p-3 sm:p-4 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between group min-w-0">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary animate-pulse shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-primary uppercase">Активный файл</p>
                      <p className="text-xs font-bold break-all sm:break-words line-clamp-3">{activeFileName}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={clearCustomData} className="h-8 w-8 shrink-0 self-end sm:self-auto hover:bg-destructive/10 hover:text-destructive" aria-label="Сбросить активный файл">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-2xl bg-gradient-to-br from-primary to-blue-700 text-white rounded-[32px] overflow-hidden relative group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-2 text-2xl font-black">
                <Upload className="h-6 w-6" /> Загрузка
              </CardTitle>
              <CardDescription className="text-white/70 font-medium">Новый источник данных (CSV, XLSX, JSON)</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 pt-4">
               <div className="relative group/input">
                 <Input
                  type="file"
                  accept=".csv,.xlsx,.xls,.json"
                  onChange={handleUpload}
                  disabled={uploading || analyzing}
                  className="cursor-pointer bg-white/10 border-white/20 h-16 text-white file:hidden hover:bg-white/20 transition-all rounded-2xl"
                />
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl backdrop-blur-sm animate-in fade-in">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
               </div>
               <p className="text-[9px] mt-4 font-bold text-white/40 text-center uppercase tracking-tighter italic">Размер файла до 50MB · Кодировка UTF-8</p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Files List */}
        <div className="lg:col-span-2">
          <Card className="border-none shadow-2xl bg-card rounded-[32px] min-h-[500px] flex flex-col">
            <CardHeader className="pb-6 border-b border-foreground/5 px-4 sm:px-6">
               <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between min-w-0">
                  <div className="min-w-0">
                    <CardTitle className="text-xl sm:text-2xl font-black tracking-tight break-words">Библиотека данных</CardTitle>
                    <CardDescription className="font-medium text-xs mt-1">Всего доступно: {files.length} файлов</CardDescription>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-2xl shrink-0 self-start sm:self-auto">
                     <FileSpreadsheet className="h-6 w-6 text-muted-foreground/40" />
                  </div>
               </div>
            </CardHeader>
            <CardContent className="flex-1 p-3 sm:p-6 min-w-0 overflow-x-hidden">
              {loadingFiles ? (
                <div className="flex flex-col items-center justify-center h-48 opacity-20">
                   <Loader2 className="h-10 w-10 animate-spin mb-2" />
                   <p className="text-xs font-bold uppercase">Синхронизация...</p>
                </div>
              ) : files.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-20 text-center space-y-4 opacity-40">
                  <div className="p-6 rounded-full bg-muted">
                    <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">Хранилище пусто</p>
                    <p className="text-xs font-medium">Загрузите первый файл для начала работы</p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-3 sm:gap-4 min-w-0">
                  {files.map(f => {
                    const fileIsReady =
                      Boolean(analysisMetadata && activeFileName === f.file_name);
                    const isAnalyzingThis = analyzing && analyzingFileId === f.id;
                    return (
                    <div 
                      key={f.id} 
                      className={`group relative flex flex-col gap-4 p-4 sm:p-5 rounded-[24px] border-2 transition-all duration-300 min-w-0 sm:flex-row sm:items-center ${fileIsReady ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5' : 'border-transparent bg-muted/20 hover:bg-muted/40'}`}
                    >
                      <div className="flex items-start gap-3 min-w-0 sm:flex-1">
                        <div className={`p-3 rounded-2xl transition-colors shrink-0 ${fileIsReady ? 'bg-primary text-white shadow-lg' : 'bg-card text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'}`}>
                          <FileSpreadsheet className="h-6 w-6" />
                        </div>
                        
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                             <h3 className="font-black text-xs sm:text-sm break-words uppercase tracking-tight">{f.file_name}</h3>
                             {fileIsReady && <CheckCircle2 className="h-3 w-3 text-primary shrink-0" aria-hidden />}
                          </div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 break-words">
                            {new Date(f.uploaded_at).toLocaleDateString('ru-RU')} · {f.file_size ? `${(f.file_size / 1024).toFixed(1)} KB` : 'N/A'} · {f.file_type}
                          </p>
                        </div>
                      </div>

                      <div
                        className="flex flex-row flex-wrap items-stretch gap-2 w-full min-w-0 rounded-xl border border-border/80 bg-muted/40 p-2 sm:w-auto sm:flex-nowrap sm:justify-end sm:bg-muted/25"
                        data-testid="file-row-actions"
                      >
                         <Button 
                           type="button"
                           disabled={isAnalyzingThis}
                           onClick={() => runAnalysis(f)}
                           className={`h-11 min-h-[2.75rem] flex-1 min-w-0 opacity-100 sm:flex-initial px-3 sm:px-6 rounded-lg font-black text-xs uppercase tracking-widest transition-all whitespace-normal text-center sm:whitespace-nowrap shadow-sm ${fileIsReady ? 'bg-primary text-primary-foreground shadow-primary/30 sm:scale-[1.02] active:scale-[0.98]' : 'bg-background text-foreground border border-border hover:bg-primary/10 hover:border-primary/40'}`}
                         >
                            {isAnalyzingThis ? (
                              <Loader2 className="h-4 w-4 animate-spin mx-auto sm:mx-0" />
                            ) : fileIsReady ? (
                              <span className="flex flex-wrap items-center justify-center gap-2"><Sparkles className="h-4 w-4 shrink-0" /> Анализ готов</span>
                            ) : (
                              'Начать анализ'
                            )}
                         </Button>
                         <Button 
                           type="button"
                           variant="outline"
                           size="icon"
                           onClick={() => handleDeleteFile(f)}
                           className="h-11 w-11 shrink-0 rounded-lg border-destructive/40 bg-background text-destructive opacity-100 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/60"
                           aria-label="Удалить файл"
                         >
                            <Trash2 className="h-5 w-5" />
                         </Button>
                      </div>
                    </div>
                  );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
