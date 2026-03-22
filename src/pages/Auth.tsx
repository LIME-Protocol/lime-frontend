import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Citrus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Auth() {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8 animate-reveal-up">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-xl bg-primary/15 border border-primary/20 items-center justify-center mx-auto">
            <Citrus className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold">Lime</h1>
          <p className="text-sm text-muted-foreground">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        <AuthForm mode={mode} />

        <p className="text-center text-sm text-muted-foreground">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-primary hover:underline font-medium">
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}

function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === 'signup') {
        await signUp(email, password);
        toast.success('Check your email to verify your account');
      } else {
        await signIn(email, password);
        toast.success('Welcome back');
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === 'signup' && (
        <div className="space-y-1.5">
          <Label htmlFor="username" className="text-xs">Username (optional)</Label>
          <Input id="username" placeholder="satoshi" value={username} onChange={(e) => setUsername(e.target.value)} className="bg-secondary/50 border-border" />
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs">Email</Label>
        <Input id="email" type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-secondary/50 border-border" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-xs">Password</Label>
        <Input id="password" type="password" required minLength={6} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-secondary/50 border-border" />
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === 'login' ? 'Sign In' : 'Create Account'}
      </Button>
    </form>
  );
}
