import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer } from '../types';

interface AuthContextType {
  customer: Customer | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  sendOtp: (phone: string) => Promise<{ success: boolean; message?: string; error?: string; resendCooldownSeconds?: number; debugOtp?: string }>;
  verifyOtp: (phone: string, code: string) => Promise<{ success: boolean; isNewUser?: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Customer>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('4she_customer_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Check saved session on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('4she_customer_token');
      if (savedToken) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${savedToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            setCustomer(data.customer);
            setToken(savedToken);
          } else {
            // Token expired
            localStorage.removeItem('4she_customer_token');
            localStorage.removeItem('4she_customer_data');
            setCustomer(null);
            setToken(null);
            // Open gate for mandatory login
            setIsAuthModalOpen(true);
          }
        } catch (err) {
          console.error('Failed to verify token', err);
        }
      } else {
        // Mandatory login on first visit
        setIsAuthModalOpen(true);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const sendOtp = async (phone: string) => {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'فشل إرسال رمز التحقق' };
      }
      return {
        success: true,
        message: data.message,
        resendCooldownSeconds: data.resendCooldownSeconds,
        debugOtp: data.debugOtp
      };
    } catch (err) {
      return { success: false, error: 'تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت' };
    }
  };

  const verifyOtp = async (phone: string, code: string) => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'رمز التحقق غير صحيح' };
      }

      const receivedCustomer = data.customer;
      setCustomer(receivedCustomer);
      if (receivedCustomer.token) {
        setToken(receivedCustomer.token);
        localStorage.setItem('4she_customer_token', receivedCustomer.token);
      }
      localStorage.setItem('4she_customer_data', JSON.stringify(receivedCustomer));
      setIsAuthModalOpen(false);

      return {
        success: true,
        isNewUser: data.isNewUser
      };
    } catch (err) {
      return { success: false, error: 'حدث خطأ أثناء التحقق. يرجى المحاولة ثانية' };
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error('Logout error', err);
      }
    }
    localStorage.removeItem('4she_customer_token');
    localStorage.removeItem('4she_customer_data');
    setCustomer(null);
    setToken(null);
    setIsAuthModalOpen(true);
  };

  const updateProfile = async (data: Partial<Customer>) => {
    if (!token) return false;
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const resData = await res.json();
        setCustomer(resData.customer);
        localStorage.setItem('4she_customer_data', JSON.stringify(resData.customer));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Update profile error', err);
      return false;
    }
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCustomer(data.customer);
      }
    } catch (err) {
      console.error('Refresh profile error', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        token,
        isAuthenticated: !!customer,
        isLoading,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => {
          if (customer) {
            setIsAuthModalOpen(false);
          }
        },
        sendOtp,
        verifyOtp,
        logout,
        updateProfile,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
