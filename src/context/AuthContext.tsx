import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { getUsers, registerUser } from '../services/storage';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, phone: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchUserRoleDemo: (role: 'admin' | 'customer') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('dsa_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('dsa_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('dsa_current_user');
    }
  }, [user]);

  const login = async (email: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    const users = getUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!found) {
      return { success: false, message: 'এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি।' };
    }
    if (found.password && found.password !== pass) {
      return { success: false, message: 'ভুল পাসওয়ার্ড দিয়েছেন। আবার চেষ্টা করুন।' };
    }
    setUser(found);
    return { success: true };
  };

  const register = async (
    name: string,
    email: string,
    phone: string,
    pass: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const newUser = registerUser({
        name,
        email,
        phone,
        password: pass,
        role: 'customer'
      });
      setUser(newUser);
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err?.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।' };
    }
  };

  const logout = () => {
    setUser(null);
  };

  const switchUserRoleDemo = (role: 'admin' | 'customer') => {
    const users = getUsers();
    if (role === 'admin') {
      const admin = users.find((u) => u.role === 'admin');
      if (admin) setUser(admin);
    } else {
      const customer = users.find((u) => u.role === 'customer');
      if (customer) setUser(customer);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        switchUserRoleDemo
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
