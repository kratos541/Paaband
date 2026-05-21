import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

type RedeemResult = 'success' | 'invalid' | 'error';

interface PremiumContextType {
  isPremium: boolean;
  checkPremium: () => Promise<void>;
  setPremiumLocal: (val: boolean) => Promise<void>;
  redeemCode: (code: string) => Promise<RedeemResult>;
}

const PremiumContext = createContext<PremiumContextType>({
  isPremium: false,
  checkPremium: async () => {},
  setPremiumLocal: async () => {},
  redeemCode: async () => 'error',
});

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    loadPremium();
  }, []);

  const loadPremium = async () => {
    // Check local cache first for instant UI
    const cached = await AsyncStorage.getItem('@premium');
    if (cached === 'true') setIsPremium(true);
    // Then verify with Supabase
    await checkPremium();
  };

  const checkPremium = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const premium = user?.user_metadata?.is_premium === true;
      setIsPremium(premium);
      await AsyncStorage.setItem('@premium', premium ? 'true' : 'false');
    } catch {}
  };

  const setPremiumLocal = async (val: boolean) => {
    setIsPremium(val);
    await AsyncStorage.setItem('@premium', val ? 'true' : 'false');
  };

  const redeemCode = async (code: string): Promise<RedeemResult> => {
    try {
      const trimmed = code.trim().toUpperCase();
      if (!trimmed) return 'invalid';

      const { data, error } = await supabase
        .from('unlock_codes')
        .select('code')
        .eq('code', trimmed)
        .maybeSingle();

      if (error) return 'error';
      if (!data) return 'invalid';

      await supabase.from('unlock_codes').delete().eq('code', trimmed);
      await supabase.auth.updateUser({ data: { is_premium: true } });

      setIsPremium(true);
      await AsyncStorage.setItem('@premium', 'true');
      return 'success';
    } catch {
      return 'error';
    }
  };

  return (
    <PremiumContext.Provider value={{ isPremium, checkPremium, setPremiumLocal, redeemCode }}>
      {children}
    </PremiumContext.Provider>
  );
}

export const usePremium = () => useContext(PremiumContext);
