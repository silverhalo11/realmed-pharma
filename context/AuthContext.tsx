import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { User } from '@/types';

const USERS_KEY = '@realmed/users';
const CURRENT_USER_KEY = '@realmed/currentUser';

function genId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (username: string, email: string, phone: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(CURRENT_USER_KEY).then((raw) => {
      if (raw) {
        try { setUser(JSON.parse(raw)); } catch {}
      }
      setIsLoading(false);
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    const users: User[] = raw ? JSON.parse(raw) : [];
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!found) return { error: 'Invalid email or password' };
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(found));
    setUser(found);
    return {};
  }, []);

  const register = useCallback(async (username: string, email: string, phone: string, password: string) => {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    const users: User[] = raw ? JSON.parse(raw) : [];
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { error: 'Email already registered' };
    }
    const newUser: User = { id: genId(), username, email, phone, password };
    users.push(newUser);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    setUser(newUser);
    return {};
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
