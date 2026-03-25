import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Citrus, Loader2, Eye, EyeOff, Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const COUNTRIES = [
  'United States', 'United Kingdom', 'Brazil', 'Canada', 'Germany', 'France', 'Japan',
  'Australia', 'Switzerland', 'Singapore', 'Netherlands', 'South Korea', 'India',
  'Mexico', 'Argentina', 'Portugal', 'Spain', 'Italy', 'Sweden', 'Norway',
];

const DOC_TYPES = [
  { value: 'passport', label: 'Passport' },
  { value: 'national_id', label: 'National ID' },
  { value: 'drivers_license', label: "Driver's License" },
];

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
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
              <Citrus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="text-lg font-bold">LIME</span>
              <p className="text-[9px] font-medium text-muted-foreground tracking-widest uppercase">Linear Index Market Exchange</p>
            </div>
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
            <div className="inline-flex h-12 w-12 rounded-xl bg-primary/15 border border-primary/20 items-center justify-center mx-auto">
              <Citrus className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold">LIME</h1>
            <p className="text-[9px] font-medium text-muted-foreground tracking-widest uppercase">Linear Index Market Exchange</p>
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

function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const { signIn, signUp } = useAuth();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [country, setCountry] = useState('');
  const [docType, setDocType] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const passwordStrength = getPasswordStrength(password);
  const totalSteps = mode === 'signup' ? 2 : 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signup' && step === 1) {
      if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
      if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
      setStep(2);
      return;
    }
    if (mode === 'signup' && !country) { toast.error('Please select your country'); return; }
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
      {mode === 'signup' && totalSteps > 1 && (
        <div className="flex items-center gap-2 mb-2">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={cn(
                'h-1.5 flex-1 rounded-full transition-colors',
                s <= step ? 'bg-primary' : 'bg-border'
              )} />
            </div>
          ))}
          <span className="text-[10px] text-muted-foreground ml-1">Step {step}/2</span>
        </div>
      )}

      {(mode === 'login' || step === 1) && (
        <>
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-xs">Display Name</Label>
              <Input id="username" placeholder="e.g. satoshi" value={username} onChange={(e) => setUsername(e.target.value)} className="bg-secondary/50 border-border" autoComplete="username" />
              <p className="text-[10px] text-muted-foreground">Optional — shown on your profile</p>
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs">Email Address</Label>
            <Input id="email" type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-secondary/50 border-border" autoComplete="email" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs">Password</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? 'text' : 'password'} required minLength={mode === 'signup' ? 8 : 6} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-secondary/50 border-border pr-10" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {mode === 'signup' && password.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div key={level} className={cn('h-1 flex-1 rounded-full transition-colors', level <= passwordStrength.level ? passwordStrength.level <= 1 ? 'bg-negative' : passwordStrength.level <= 2 ? 'bg-warning' : 'bg-positive' : 'bg-border')} />
                  ))}
                </div>
                <p className={cn('text-[10px]', passwordStrength.level <= 1 ? 'text-negative' : passwordStrength.level <= 2 ? 'text-warning' : 'text-positive')}>{passwordStrength.label}</p>
              </div>
            )}
          </div>
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password" className="text-xs">Confirm Password</Label>
              <Input id="confirm-password" type={showPassword ? 'text' : 'password'} required placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={cn('bg-secondary/50 border-border', confirmPassword && confirmPassword !== password && 'border-negative focus-visible:ring-negative')} autoComplete="new-password" />
              {confirmPassword && confirmPassword !== password && <p className="text-[10px] text-negative">Passwords don't match</p>}
            </div>
          )}
        </>
      )}

      {mode === 'signup' && step === 2 && (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="country" className="text-xs">Country of Residence *</Label>
            <select id="country" required value={country} onChange={(e) => setCountry(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 text-foreground">
              <option value="">Select your country</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="doc-type" className="text-xs">Document Type</Label>
            <select id="doc-type" value={docType} onChange={(e) => setDocType(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 text-foreground">
              <option value="">Select document type</option>
              {DOC_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
            <p className="text-[10px] text-muted-foreground">Required for KYC verification</p>
          </div>
          {docType && (
            <div className="space-y-1.5 animate-fade-in">
              <Label htmlFor="doc-number" className="text-xs">Document Number</Label>
              <Input id="doc-number" placeholder="Enter your document number" value={docNumber} onChange={(e) => setDocNumber(e.target.value)} className="bg-secondary/50 border-border" />
            </div>
          )}
          <button type="button" onClick={() => setStep(1)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-3 w-3" /> Back to credentials
          </button>
        </>
      )}

      <Button type="submit" className="w-full h-11" disabled={submitting}>
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> :
          mode === 'login' ? 'Sign In' :
          step === 1 ? <span className="flex items-center gap-1">Continue <ChevronRight className="h-4 w-4" /></span> :
          'Create Account'
        }
      </Button>
    </form>
  );
}

function getPasswordStrength(password: string): { level: number; label: string } {
  if (password.length === 0) return { level: 0, label: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { level: 1, label: 'Weak' };
  if (score <= 2) return { level: 2, label: 'Fair' };
  if (score <= 3) return { level: 3, label: 'Strong' };
  return { level: 4, label: 'Very Strong' };
}
