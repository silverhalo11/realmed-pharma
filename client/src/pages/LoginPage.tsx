import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import logoImg from '@assets/realmed_bird_logo.png';

const RealMedLogo = () => (
  <div className="flex flex-col items-center space-y-1">
    <img src={logoImg} alt="RealMed Pharma" className="w-24 h-24 object-contain" data-testid="img-logo" />
    <div className="text-center">
      <h1 className="text-3xl font-bold" data-testid="text-company-name">
        <span className="text-primary">Real</span><span className="text-amber-500">Med</span>
      </h1>
      <p className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">Pharma</p>
    </div>
  </div>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const login = useAppStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Login failed');
      return;
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <RealMedLogo />
          <p className="text-sm text-muted-foreground">Field Sales Hub</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              data-testid="input-email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                data-testid="input-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
              />
              <button
                type="button"
                data-testid="button-toggle-password"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-destructive" data-testid="text-error">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading} data-testid="button-login">
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-sm text-center text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary font-medium hover:underline" data-testid="link-signup">
            Sign Up
          </Link>
        </p>

        <p className="text-xs text-center text-muted-foreground">
          Serving & Preserving Eye Health
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
