import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserProfile = {
  email: string;
  name: string;
  age?: number;
  heightCm?: number;
  weightKg?: number;
  // Campos opcionales adicionales
  gender?: string;
  city?: string;
  country?: string;
  phone?: string;
  profession?: string;
  avatarUrl?: string;
};

type User = UserProfile | null;

type StoredUser = UserProfile & { password: string };

type AuthState = {
  user: User;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; age?: number; heightCm?: number; weightKg?: number }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('sui:auth');
        if (stored) {
          const parsed = JSON.parse(stored) as UserProfile;
          const profile: UserProfile = { ...parsed, name: 'Marcos Cardoza', age: 20, heightCm: 170, weightKg: 150 };
          setUser(profile);
          await AsyncStorage.setItem('sui:auth', JSON.stringify(profile));
        }
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const persist = async (u: User) => {
    if (u) {
      const normalized: UserProfile = { ...u, name: 'Marcos Cardoza', age: 20, heightCm: 170, weightKg: 150 };
      await AsyncStorage.setItem('sui:auth', JSON.stringify(normalized));
    } else {
      await AsyncStorage.removeItem('sui:auth');
    }
  };

  const login = async (email: string, password: string) => {
    // Login permisivo: si no existe el usuario, se crea automáticamente
    const emailKey = email.toLowerCase();
    const raw = await AsyncStorage.getItem('sui:users');
    const users: Record<string, StoredUser> = raw ? JSON.parse(raw) : {};
    let found = users[emailKey];
    if (!found) {
      const defaultName = emailKey.includes('@') ? emailKey.split('@')[0] : 'Sui User';
      found = { email: emailKey, name: defaultName, password };
      users[emailKey] = found;
      await AsyncStorage.setItem('sui:users', JSON.stringify(users));
    }
  // Siempre forzar reconfiguración de meta tras login (demo)
  await AsyncStorage.setItem(`sui:onboarded:${emailKey}`, '0');
  // Limpiar metas previas namespaced
  await AsyncStorage.removeItem(`sui:goals:${emailKey}`);
    // Si existía y la contraseña no coincide, igualmente permitimos (demo)
    const { password: _pw, ...profile0 } = found;
    const profile: UserProfile = { ...profile0, name: 'Marcos Cardoza', age: 20, heightCm: 170, weightKg: 150 };
    setUser(profile);
    await persist(profile);
  };
  const register = async (data: { email: string; password: string; name: string; age?: number; heightCm?: number; weightKg?: number }) => {
    const email = data.email.toLowerCase();
    const raw = await AsyncStorage.getItem('sui:users');
    const users: Record<string, StoredUser> = raw ? JSON.parse(raw) : {};
    if (users[email]) {
      throw new Error('El correo ya está registrado');
    }
  const toStore: StoredUser = { email, name: data.name || 'Marcos Cardoza', age: 20, heightCm: 170, weightKg: 150, password: data.password };
    users[email] = toStore;
    await AsyncStorage.setItem('sui:users', JSON.stringify(users));
    // Forzar onboarding por usuario (namespaced)
    await AsyncStorage.setItem(`sui:onboarded:${email}`, '0');
    const { password: _pw, ...profile0 } = toStore;
    const profile: UserProfile = { ...profile0, name: 'Marcos Cardoza', age: 20, heightCm: 170, weightKg: 150 };
    setUser(profile);
    await persist(profile);
  };
  const logout = async () => {
    setUser(null);
    await persist(null);
  };

  const updateProfile = async (patch: Partial<UserProfile>) => {
    if (!user) return;
    const email = user.email.toLowerCase();
    const raw = await AsyncStorage.getItem('sui:users');
    const users: Record<string, StoredUser> = raw ? JSON.parse(raw) : {};
    const current = users[email];
    if (!current) return;
    const updated: StoredUser = { ...current, ...patch } as StoredUser;
    users[email] = updated;
    await AsyncStorage.setItem('sui:users', JSON.stringify(users));
    const { password: _pw, ...profile } = updated;
    setUser(profile);
    await persist(profile);
  };

  const value = useMemo(() => ({ user, hydrated, login, register, logout, updateProfile }), [user, hydrated]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
