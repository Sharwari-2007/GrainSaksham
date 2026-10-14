import React, { useState } from 'react';
import { 
  Sprout, 
  Scan, 
  TrendingUp, 
  Scale, 
  Lightbulb, 
  ShoppingBag, 
  History, 
  ShieldCheck, 
  Menu, 
  X, 
  Globe, 
  UserCheck, 
  Wifi, 
  WifiOff 
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Language } from '../translations';
import { Role } from '../types';

interface NavbarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  offlineDraftsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeView, 
  setActiveView,
  offlineDraftsCount = 0 
}) => {
  const { language, setLanguage, t } = useTranslation();
  const { currentUser, switchRole, isFarmer, isBuyer, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const navItems = [
    { id: 'home', label: t.nav.home, icon: Sprout },
    { id: 'scanner', label: t.nav.scanner, icon: Scan, primary: true },
    { id: 'mandi', label: t.nav.mandiPrices, icon: TrendingUp },
    { id: 'disputes', label: t.nav.disputes, icon: Scale },
    { id: 'coach', label: t.nav.coach, icon: Lightbulb },
    { id: 'marketplace', label: t.nav.marketplace, icon: ShoppingBag },
    { id: 'history', label: t.nav.history, icon: History },
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: t.nav.admin, icon: ShieldCheck });
  }

  const handleNavClick = (id: string) => {
    setActiveView(id);
    setMobileMenuOpen(false);
  };

  const handleRoleSelect = (role: Role) => {
    switchRole(role);
    setRoleDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-soft-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand Name */}
          <button 
            type="button"
            onClick={() => handleNavClick('home')} 
            className="flex items-center gap-3 text-left group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-agri-700 via-agri-800 to-agri-950 flex items-center justify-center shadow-md shadow-agri-900/10 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-agri-950 block leading-tight font-serif">
                GrainSaksham <span className="text-emerald-600 font-sans font-bold text-sm bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 ml-0.5">AI</span>
              </span>
              <span className="text-[10px] sm:text-xs text-stone-700 font-medium tracking-normal block line-clamp-1">
                {t.tagline}
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-agri-800 text-white shadow-soft-sm'
                      : item.primary
                      ? 'bg-agri-50 text-agri-800 hover:bg-agri-100 border border-agri-200'
                      : 'text-stone-700 hover:text-agri-900 hover:bg-stone-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.primary ? 'text-agri-600' : 'text-stone-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Language Selector, Demo Role Switcher, Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Language Selector */}
            <div className="relative inline-flex items-center bg-stone-100 rounded-lg p-1 border border-stone-200">
              <Globe className="w-3.5 h-3.5 text-stone-500 ml-1.5 mr-1" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-transparent text-xs font-semibold text-stone-700 focus:outline-none cursor-pointer pr-1"
                aria-label="Language Selector"
              >
                <option value="en">English (EN)</option>
                <option value="hi">हिंदी (HI)</option>
                <option value="mr">मराठी (MR)</option>
              </select>
            </div>

            {/* Quick Demo Role Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                  isFarmer 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                    : isBuyer 
                    ? 'bg-blue-50 text-blue-800 border-blue-300' 
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}
                title="Switch active role for Hackathon Testing"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="capitalize">{currentUser.role}: {currentUser.displayName.split(' ')[0]}</span>
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50 animate-fadeIn">
                  <div className="px-3 py-1.5 border-b border-stone-100 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                    Test As Role (Hackathon Demo)
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('farmer')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-stone-800">👨‍🌾 Ramesh Kumar (Farmer)</div>
                      <div className="text-stone-500 text-[11px]">7.5 Acres, Samrala, Punjab</div>
                    </div>
                    {isFarmer && <span className="text-emerald-600 font-bold">✓</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('buyer')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-stone-800">🏢 Sunil Agrotech (Buyer)</div>
                      <div className="text-stone-500 text-[11px]">Procurement Merchant, Khanna</div>
                    </div>
                    {isBuyer && <span className="text-blue-600 font-bold">✓</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('admin')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-amber-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-stone-800">🏛️ Dr. Anjali Sharma (Admin)</div>
                      <div className="text-stone-500 text-[11px]">Senior Quality Inspector</div>
                    </div>
                    {isAdmin && <span className="text-amber-600 font-bold">✓</span>}
                  </button>

                  <div className="border-t border-stone-100 my-1 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setRoleDropdownOpen(false);
                        handleNavClick('auth');
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 flex items-center gap-2 text-emerald-800 font-bold"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Sign Up / Switch Account</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRoleDropdownOpen(false);
                        logout();
                        sessionStorage.removeItem('grainsaksham_session_entered');
                        handleNavClick('auth');
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 flex items-center gap-2 text-red-600 font-semibold"
                    >
                      <X className="w-3.5 h-3.5 text-red-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Offline Drafts Pill (if any) */}
            {offlineDraftsCount > 0 && (
              <div 
                onClick={() => handleNavClick('history')}
                className="hidden sm:inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer"
                title={`${offlineDraftsCount} inspection draft(s) stored locally`}
              >
                <WifiOff className="w-3 h-3 text-amber-700" />
                <span>{offlineDraftsCount} Draft</span>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold ${
                  isActive
                    ? 'bg-agri-800 text-white'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-2 border-t border-stone-200 space-y-2">
            <button
              onClick={() => handleNavClick('auth')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
            >
              <UserCheck className="w-5 h-5 text-emerald-600" />
              <span>Sign Up / Switch Account</span>
            </button>
            <button
              onClick={() => {
                logout();
                sessionStorage.removeItem('grainsaksham_session_entered');
                handleNavClick('auth');
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              <X className="w-5 h-5 text-red-500" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
