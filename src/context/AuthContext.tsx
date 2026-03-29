import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  role: 'surveyor' | 'surveyee';
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (role: 'surveyor' | 'surveyee', name: string, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('survesg_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = (role: 'surveyor' | 'surveyee', name: string, email: string) => {
    const newUser = { role, name, email };
    setUser(newUser);
    localStorage.setItem('survesg_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('survesg_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
