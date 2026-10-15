import React, { createContext, useContext, useState } from 'react';
import { User, Role } from '../types';

interface AuthContextType {
  currentUser: User;
  isAuthenticated: boolean;
  switchRole: (role: Role) => void;
  signUp: (userData: Partial<User> & { password?: string }) => void;
  login: (email: string, password?: string, role?: Role) => boolean;
  loginAsDemo: (role: Role) => void;
  updateProfile: (updated: Partial<User>) => void;
  logout: () => void;
  isFarmer: boolean;
  isBuyer: boolean;
  isAdmin: boolean;
  demoUsers: Record<Role, User>;
}

const DEMO_PROFILES: Record<Role, User> = {
  farmer: {
    uid: "farmer-ramesh-01",
    displayName: "Ramesh Kumar",
    email: "ramesh.farmer@grainsaksham.ai",
    role: "farmer",
    state: "Punjab",
    district: "Ludhiana",
    village: "Samrala",
    phone: "+91 98765 43210",
    cropsGrown: ["Wheat", "Paddy", "Mustard"],
    holdingAcres: 7.5,
    createdAt: "2026-02-10T10:00:00Z"
  },
  buyer: {
    uid: "buyer-sunil-02",
    displayName: "Sunil Agrotech Mills Ltd",
    email: "procurement@sunilagrotech.com",
    role: "buyer",
    organization: "Sunil Agrotech Pvt Ltd",
    mandiLicenseNo: "PB-LDH-APMC-8842",
    state: "Punjab",
    district: "Khanna",
    phone: "+91 98123 45678",
    createdAt: "2026-01-15T09:30:00Z"
  },
  admin: {
    uid: "admin-anjali-03",
    displayName: "Dr. Anjali Sharma",
    email: "anjali.sharma@agri.gov.in",
    role: "admin",
    designation: "Senior Agricultural Quality Officer",
    organization: "Regional Agricultural Marketing Board",
    state: "Punjab & Haryana Region",
    phone: "+91 94111 22334",
    createdAt: "2026-01-01T08:00:00Z"
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('grainsaksham_is_authenticated') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedUser = localStorage.getItem('grainsaksham_current_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {}
    }
    const savedRole = localStorage.getItem('grainsaksham_active_role') as Role;
    if (savedRole && DEMO_PROFILES[savedRole]) {
      return DEMO_PROFILES[savedRole];
    }
    return DEMO_PROFILES.farmer;
  });

  const switchRole = (role: Role) => {
    if (DEMO_PROFILES[role]) {
      const user = DEMO_PROFILES[role];
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('grainsaksham_active_role', role);
      localStorage.setItem('grainsaksham_is_authenticated', 'true');
      localStorage.setItem('grainsaksham_current_user', JSON.stringify(user));
    }
  };

  const loginAsDemo = (role: Role) => {
    switchRole(role);
  };

  const signUp = (userData: Partial<User> & { password?: string }) => {
    const role = (userData.role || 'farmer') as Role;
    const newUser: User = {
      uid: `user-${role}-${Date.now()}`,
      displayName: userData.displayName || (role === 'farmer' ? 'New Farmer' : role === 'buyer' ? 'New Buyer' : 'Officer'),
      email: userData.email || `${role}@grainsaksham.ai`,
      role: role,
      state: userData.state || 'Punjab',
      district: userData.district || 'Ludhiana',
      village: userData.village || '',
      phone: userData.phone || '',
      organization: userData.organization || '',
      designation: userData.designation || '',
      cropsGrown: userData.cropsGrown || ['Wheat'],
      holdingAcres: userData.holdingAcres || 5.0,
      mandiLicenseNo: userData.mandiLicenseNo || '',
      createdAt: new Date().toISOString()
    };

    setCurrentUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('grainsaksham_active_role', role);
    localStorage.setItem('grainsaksham_is_authenticated', 'true');
    localStorage.setItem('grainsaksham_current_user', JSON.stringify(newUser));
  };

  const login = (email: string, _password?: string, role?: Role) => {
    const selectedRole = role || 'farmer';
    // Match demo profile or create session
    let matched = DEMO_PROFILES[selectedRole];
    if (email && email.toLowerCase() !== matched.email.toLowerCase()) {
      matched = {
        ...matched,
        displayName: email.split('@')[0],
        email: email,
        role: selectedRole
      };
    }
    setCurrentUser(matched);
    setIsAuthenticated(true);
    localStorage.setItem('grainsaksham_active_role', selectedRole);
    localStorage.setItem('grainsaksham_is_authenticated', 'true');
    localStorage.setItem('grainsaksham_current_user', JSON.stringify(matched));
    return true;
  };

  const updateProfile = (updated: Partial<User>) => {
    if (updated.role === 'admin' && currentUser.role !== 'admin') {
      alert("Unauthorized: Administrative roles cannot be granted via standard profile edits.");
      delete updated.role;
    }
    setCurrentUser(prev => {
      const merged = { ...prev, ...updated };
      localStorage.setItem('grainsaksham_current_user', JSON.stringify(merged));
      return merged;
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('grainsaksham_is_authenticated');
  };

  const isFarmer = currentUser.role === 'farmer';
  const isBuyer = currentUser.role === 'buyer';
  const isAdmin = currentUser.role === 'admin';

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated,
      switchRole,
      signUp,
      login,
      loginAsDemo,
      updateProfile,
      logout,
      isFarmer,
      isBuyer,
      isAdmin,
      demoUsers: DEMO_PROFILES
    }}>
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
