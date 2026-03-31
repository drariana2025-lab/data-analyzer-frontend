import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Mail, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function translateError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'Неверный email или пароль';
  if (msg.includes('Email not confirmed')) return 'Email не подтверждён. Проверьте почту';
  if (msg.includes('User already registered')) return 'Пользователь с таким email уже зарегистрирован';
  if (msg.includes('Password should be at least')) return 'Пароль должен быть не менее 6 символов';
  if (msg.includes('Unable to validate email')) return 'Неверный формат email';
  if (msg.includes('signup is disabled')) return 'Регистрация временно отключена';
  if (msg.includes('rate limit')) return 'Слишком много попыток. Попробуйте позже';
  return msg;
}

export default function AuthPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Заполните все поля'); return; }
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) {
      toast.error(translateError(error.message));
    } else {
      toast.success('Вы вошли в систему');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Заполните все поля'); return; }
    if (password.length < 6) { toast.error('Пароль должен быть не менее 6 символов'); return; }
    setSubmitting(true);
    const { error } = await signUp(email, password);
    setSubmitting(false);
    if (error) {
      toast.error(translateError(error.message));
    } else {
      toast.success('Регистрация успешна! Проверьте email для подтверждения.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Мониторинг болезней</CardTitle>
          <CardDescription>Войдите или зарегистрируйтесь для доступа к личному кабинету</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} className="pl-10" />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Войти
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="register">
              <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="password" placeholder="Пароль (мин. 6 символов)" value={password} onChange={e => setPassword(e.target.value)} className="pl-10" />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Зарегистрироваться
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
