import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import type { User, Resident, Collector, Authority, Language } from "@/types";

interface AppContextType {
  user: User | null;
  profile: Resident | Collector | Authority | null;
  login: (user: User, profile: Resident | Collector | Authority) => void;
  logout: () => void;

  language: Language;
  setLanguage: (lang: Language) => void;

  isDarkMode: boolean;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Resident | Collector | Authority | null>(null);
  const [language, setLanguage] = useState<Language>("en");
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load from localStorage on app open
  useEffect(() => {
    const savedUser = localStorage.getItem("binbeacon_user");
    const savedProfile = localStorage.getItem("binbeacon_profile");

    if (savedUser && savedProfile) {
      setUser(JSON.parse(savedUser));
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  const login = (newUser: User, newProfile: Resident | Collector | Authority) => {
    setUser(newUser);
    setProfile(newProfile);

    // Save session to browser
    localStorage.setItem("binbeacon_user", JSON.stringify(newUser));
    localStorage.setItem("binbeacon_profile", JSON.stringify(newProfile));
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem("binbeacon_user");
    localStorage.removeItem("binbeacon_profile");
  };

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        profile,
        login,
        logout,
        language,
        setLanguage,
        isDarkMode,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
