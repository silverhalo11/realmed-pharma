import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const RealMedLogo = () => (
  <div className="flex flex-col items-center space-y-2">
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 8C28 16 20 20 20 28C20 36 26 42 32 44C38 42 44 36 44 28C44 20 36 16 32 8Z" fill="url(#flame-gradient)" />
      <path d="M28 18C26 24 22 26 22 30C22 34 26 38 30 38C30 34 28 30 28 26C30 28 32 32 32 36C36 34 38 30 38 26C38 22 34 18 28 18Z" fill="url(#flame-inner)" />
      <path d="M18 38C14 42 12 48 18 54C20 50 24 48 28 46C24 44 20 42 18 38Z" fill="#1a96c8" opacity="0.8" />
      <path d="M46 38C50 42 52 48 46 54C44 50 40 48 36 46C40 44 44 42 46 38Z" fill="#1a96c8" opacity="0.8" />
      <defs>
        <linearGradient id="flame-gradient" x1="32" y1="8" x2="32" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f59e0b" />
          <stop offset="1" stopColor="#ea580c" />
        </linearGradient>
        <linearGradient id="flame-inner" x1="30" y1="18" x2="30" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fbbf24" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
    </svg>
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
