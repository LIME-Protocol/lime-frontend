import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import AuthForm from '@/components/auth/AuthForm';
import { Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import logoIcon from '@/assets/logo-icon.png';
import logoFull from '@/assets/logo-full.png';

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
    <div className="min-h-screen flex bg-background">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[480px] bg-primary/5 border-r border-border flex-col justify-between p-10">
        <div>
          <div className="mb-8">
            <img src={logoFull} alt="LIME" className="h-8" />
          </div>
          <h2 className="text-2xl font-bold leading-tight mb-4">Trade expectations on future variables</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8">
            LIME lets you buy and sell contracts on quantitative outcomes — interest rates, inflation, temperature, and more.
          </p>
          <div className="space-y-4">
            {[
              'Linear, sigmoid & binary payoff structures',
              'Real-time order book and trade execution',
              'Track positions and P&L in your portfolio',
              'Transparent settlement from official sources',
            ].map((feat, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-primary/15 flex items-center justify-center mt-0.5 shrink-0">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                <span className="text-sm text-foreground">{feat}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">© {new Date().getFullYear()} LIME · Linear Index Market Exchange</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8 animate-reveal-up">
          <div className="text-center space-y-2 lg:hidden">
            <img src={logoIcon} alt="LIME" className="h-12 w-12 rounded-xl mx-auto" />
          </div>

          <div className="lg:text-left text-center">
            <h1 className="text-xl font-bold mb-1">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === 'login' ? 'Sign in to start trading' : 'Complete your profile to get started'}
            </p>
          </div>

          <div className="flex bg-secondary rounded-lg p-0.5">
            <button onClick={() => setMode('login')} className={cn('flex-1 py-2 rounded-md text-sm font-medium transition-all', mode === 'login' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>Sign In</button>
            <button onClick={() => setMode('signup')} className={cn('flex-1 py-2 rounded-md text-sm font-medium transition-all', mode === 'signup' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>Create Account</button>
          </div>

          <AuthForm mode={mode} />

          <p className="text-center text-[11px] text-muted-foreground">
            By continuing, you agree to LIME's Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
