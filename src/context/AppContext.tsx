import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface AppContextType {
  userName: string;
  userEmail: string;
  fontSize: number;
  highContrast: boolean;
  completedModules: string[];
  login: (name: string, email: string) => void;
  logout: () => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  toggleContrast: () => void;
  markModuleCompleted: (moduleId: string) => void;
  resetProgress: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [userName, setUserName] = useState(() => localStorage.getItem('benune_user_name') || '');
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('benune_user_email') || '');
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const [completedModules, setCompletedModules] = useState<string[]>(() => {
    const saved = localStorage.getItem('benune_completed_modules');
    if (saved) {
      try { return JSON.parse(saved); } catch(e) { return []; }
    }
    return [];
  });

  const login = (name: string, email: string) => {
    setUserName(name);
    setUserEmail(email);
    localStorage.setItem('benune_user_name', name);
    localStorage.setItem('benune_user_email', email);
  };

  const resetProgress = () => {
    setCompletedModules([]);
    localStorage.removeItem('benune_completed_modules');
    localStorage.removeItem('benune_score');
    localStorage.removeItem('benune_exam_history');
  };

  const logout = () => {
    setUserName('');
    setUserEmail('');
    resetProgress();
    localStorage.removeItem('benune_user_name');
    localStorage.removeItem('benune_user_email');
  };

  const increaseFontSize = () => setFontSize((prev) => Math.min(prev + 2, 24));
  const decreaseFontSize = () => setFontSize((prev) => Math.max(prev - 2, 12));
  const toggleContrast = () => setHighContrast((prev) => !prev);
  
  const markModuleCompleted = (moduleId: string) => {
    setCompletedModules((prev) => {
      if (prev.includes(moduleId)) return prev;
      const next = [...prev, moduleId];
      localStorage.setItem('benune_completed_modules', JSON.stringify(next));
      return next;
    });
  };

  // Apply DUA styling to body
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [fontSize, highContrast]);

  return (
    <AppContext.Provider value={{
      userName, userEmail, fontSize, highContrast, completedModules, 
      login, logout, increaseFontSize, decreaseFontSize, toggleContrast, markModuleCompleted, resetProgress
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
