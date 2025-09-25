import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const supabaseUrl = process.env.EXPO_PUBLIC_PROJECT_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_API_KEY as string;

// Create a custom storage that handles SSR
const customStorage = {
  getItem: async (key: string) => {
    if (typeof window === 'undefined') {
      return null; // Return null during SSR
    }
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (typeof window === 'undefined') {
      return; // Do nothing during SSR
    }
    return AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    if (typeof window === 'undefined') {
      return; // Do nothing during SSR
    }
    return AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
