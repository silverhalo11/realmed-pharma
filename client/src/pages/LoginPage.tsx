import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const RealMedLogo = () => (
  <div className="flex flex-col items-center space-y-3">
    <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Bird body swooping right */}
      <path d="M25 55 C30 40, 45 25, 65 20 C55 28, 50 35, 48 45 C46 52, 48 58, 55 62 C45 62, 35 60, 25 55Z" fill="url(#bird-body)" />
      {/* Upper wing - sweeping up and back */}
      <path d="M65 20 C58 15, 48 8, 35 10 C42 14, 47 18, 50 24 C55 18, 60 17, 65 20Z" fill="url(#wing-upper)" />
      {/* Flame tail flowing left */}
      <path d="M25 55 C20 60, 15 68, 18 78 C22 72, 28 67, 35 65 C30 63, 27 59, 25 55Z" fill="#ea580c" />
      <path d="M28 58 C24 64, 22 72, 26 80 C28 74, 32 69, 38 66 C34 64, 30 61, 28 58Z" fill="#f59e0b" />
      {/* Bird head */}
      <circle cx="63" cy="22" r="3.5" fill="#1a6fa0" />
      {/* Eye */}
      <circle cx="64.5" cy="21" r="1" fill="white" />
      {/* Beak */}
      <path d="M66 22 L72 20 L67 24Z" fill="#f59e0b" />
      <defs>
        <linearGradient id="bird-body" x1="25" y1="35" x2="55" y2="62" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1a96c8" />
          <stop offset="1" stopColor="#1a6fa0" />
        </linearGradient>
        <linearGradient id="wing-upper" x1="35" y1="10" x2="65" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f59e0b" />
          <stop offset="1" stopColor="#ea580c" />
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
