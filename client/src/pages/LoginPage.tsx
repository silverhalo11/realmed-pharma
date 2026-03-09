import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import logoImg from '@assets/realmed_bird_logo.png';

const RealMedLogo = () => (
  <div className="flex flex-col items-center space-y-3">
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
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    login(name.trim());
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
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              data-testid="input-name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              autoFocus
            />
            {error && <p className="text-sm text-destructive" data-testid="text-error">{error}</p>}
          </div>
          <Button type="submit" className="w-full" data-testid="button-login">
            Sign In
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          Serving & Preserving Eye Health
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
