import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { supabase } from '../lib/supabase';
import { getBizLabel } from '../data/laws';

export interface User {
  name: string;
  email: string;
}

export interface BusinessProfile {
  // Step 0 — Who you are
  name: string;        // business name
  ownerName: string;
  designation: string;
  phone: string;
  // Step 1 — Business & Location
  type: string;        // bizType value e.g. 'retail'
  typeLabel: string;
  province: string;
  city: string;
  address: string;
  // Step 2 — Size & Registration
  regType: string;
  ntn: string;
  revM: number;        // revenue band value
  revLabel: string;
  emp: number;         // employee band value
  empLabel: string;
  // Step 3 — Licences
  licences: string[];
  products: string;
  // Step 4 — Business Activities
  doesImport: boolean;
  doesExport: boolean;
  handlesFood: boolean;
  hasFactory: boolean;
  hasWarehouse: boolean;
  sellsOnline: boolean;
  hasMultipleLocations: boolean;
  dealsForeignCurrency: boolean;
  // Step 5 — Specific Details
  hasLongTermEmployees: boolean;
  hasGenerator: boolean;
  hasSignboard: boolean;
  acceptsDigitalPayments: boolean;
  hasBoiler: boolean;
  hasVehicles: boolean;
}

export function getBizTypeName(bizType: string): string {
  return getBizLabel(bizType);
}

// Legacy alias used by some screens
export const getBizTypeName2 = getBizTypeName;

interface AuthContextType {
  user: User | null;
  profile: BusinessProfile | null;
  setUser: (user: User | null) => Promise<void>;
  setProfile: (profile: BusinessProfile | null) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [profile, setProfileState] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const [storedUser, storedProfile] = await Promise.all([
        AsyncStorage.getItem('@user'),
        AsyncStorage.getItem('@biz'),
      ]);
      if (storedUser) setUserState(JSON.parse(storedUser));
      if (storedProfile) setProfileState(JSON.parse(storedProfile));
    } catch {}
    setLoading(false);
  };

  const setUser = async (u: User | null) => {
    setUserState(u);
    if (u) await AsyncStorage.setItem('@user', JSON.stringify(u));
    else await AsyncStorage.removeItem('@user');
  };

  const setProfile = async (p: BusinessProfile | null) => {
    setProfileState(p);
    if (p) await AsyncStorage.setItem('@biz', JSON.stringify(p));
    else await AsyncStorage.removeItem('@biz');
  };

  const signOut = async () => {
    try { await GoogleSignin.signOut(); } catch {}
    try { await supabase.auth.signOut(); } catch {}
    await Promise.all([
      AsyncStorage.removeItem('@user'),
      AsyncStorage.removeItem('@biz'),
      AsyncStorage.removeItem('@checklist'),
      AsyncStorage.removeItem('@premium'),
    ]);
    setUserState(null);
    setProfileState(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, setUser, setProfile, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
