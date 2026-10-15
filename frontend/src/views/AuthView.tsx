import React, { useState } from 'react';
import { 
  Sprout, 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Scale, 
  BadgeCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { Role } from '../types';
import { Language } from '../translations';

interface AuthViewProps {
  onSuccess: () => void;
  onExploreGuest?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess, onExploreGuest }) => {
  const { signUp, login, loginAsDemo, demoUsers } = useAuth();
  const { language, setLanguage, t } = useTranslation();

  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [selectedRole, setSelectedRole] = useState<Role>('farmer');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Farmer form state
  const [farmerForm, setFarmerForm] = useState({
    displayName: '',
    phone: '',
    email: '',
    state: 'Punjab',
    district: 'Ludhiana',
    village: 'Samrala',
    holdingAcres: 5.0,
    cropsGrown: ['Wheat', 'Paddy'],
    password: '',
    confirmPassword: ''
  });

  // Buyer form state
  const [buyerForm, setBuyerForm] = useState({
    displayName: '',
    organization: '',
    mandiLicenseNo: '',
    phone: '',
    email: '',
    state: 'Punjab',
    district: 'Khanna',
    businessType: 'Flour Mill & Agro Processing',
    password: '',
    confirmPassword: ''
  });

  // Admin form state
  const [adminForm, setAdminForm] = useState({
    displayName: '',
    email: '',
    organization: 'Regional Agricultural Marketing Board',
    designation: 'Senior Agricultural Quality Inspector',
    adminPin: '',
    password: '',
    confirmPassword: ''
  });

  // Sign In state
  const [signInForm, setSignInForm] = useState({
    emailOrPhone: '',
    password: '',
    role: 'farmer' as Role
  });

  const availableCrops = [
    { id: 'Wheat', label: 'Wheat (गेहूं)' },
    { id: 'Paddy', label: 'Paddy / Basmati (धान)' },
    { id: 'Mustard', label: 'Mustard (सरसों)' },
    { id: 'Maize', label: 'Maize (मक्का)' },
    { id: 'Gram', label: 'Gram (चना)' },
    { id: 'Soybean', label: 'Soybean (सोयाबीन)' }
  ];

  const toggleCrop = (crop: string) => {
    setFarmerForm(prev => {
      const exists = prev.cropsGrown.includes(crop);
      if (exists) {
        return { ...prev, cropsGrown: prev.cropsGrown.filter(c => c !== crop) };
      } else {
        return { ...prev, cropsGrown: [...prev.cropsGrown, crop] };
      }
    });
  };

  const handle1ClickDemo = (role: Role) => {
    loginAsDemo(role);
    setSuccessNotice(`Welcome! Signed in as ${demoUsers[role].displayName} (${role.toUpperCase()})`);
    setTimeout(() => {
      onSuccess();
    }, 400);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (selectedRole === 'farmer') {
      if (!farmerForm.displayName.trim()) {
        setErrorMessage('Please enter your full name (farmer name).');
        return;
      }
      if (!farmerForm.phone.trim()) {
        setErrorMessage('Please enter your 10-digit mobile phone number.');
        return;
      }
      if (farmerForm.password && farmerForm.password !== farmerForm.confirmPassword) {
        setErrorMessage('Passwords do not match. Please re-check.');
        return;
      }

      signUp({
        displayName: farmerForm.displayName.trim(),
        role: 'farmer',
        phone: farmerForm.phone.trim(),
        email: farmerForm.email.trim() || `${farmerForm.phone.trim()}@farmer.grainsaksham.ai`,
        state: farmerForm.state,
        district: farmerForm.district,
        village: farmerForm.village,
        holdingAcres: Number(farmerForm.holdingAcres) || 5.0,
        cropsGrown: farmerForm.cropsGrown.length ? farmerForm.cropsGrown : ['Wheat'],
        password: farmerForm.password
      });

      setSuccessNotice(`Registration successful! Welcome Farmer ${farmerForm.displayName}. Opening Home...`);
      setTimeout(() => onSuccess(), 500);

    } else if (selectedRole === 'buyer') {
      if (!buyerForm.displayName.trim() && !buyerForm.organization.trim()) {
        setErrorMessage('Please enter the Firm / Enterprise name or Contact person name.');
        return;
      }
      if (!buyerForm.mandiLicenseNo.trim()) {
        setErrorMessage('Please provide your APMC Mandi License number (e.g., PB-LDH-APMC-8842).');
        return;
      }
      if (buyerForm.password && buyerForm.password !== buyerForm.confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }

      signUp({
        displayName: buyerForm.displayName.trim() || buyerForm.organization.trim(),
        organization: buyerForm.organization.trim() || buyerForm.displayName.trim(),
        role: 'buyer',
        mandiLicenseNo: buyerForm.mandiLicenseNo.trim(),
        phone: buyerForm.phone.trim(),
        email: buyerForm.email.trim() || `buyer.${Date.now()}@grainsaksham.ai`,
        state: buyerForm.state,
        district: buyerForm.district,
        password: buyerForm.password
      });

      setSuccessNotice(`Registration successful! Welcome Buyer ${buyerForm.displayName || buyerForm.organization}. Opening Home...`);
      setTimeout(() => onSuccess(), 500);

    } else if (selectedRole === 'admin') {
      if (!adminForm.displayName.trim()) {
        setErrorMessage('Please enter the Officer Full Name.');
        return;
      }
      if (!adminForm.email.trim()) {
        setErrorMessage('Please enter official Government / Board email address.');
        return;
      }
      // Security PIN check for admin role
      const validPins = ['AGRI2026', 'ADMIN88', 'GRAIN2026', '1234'];
      const enteredPin = adminForm.adminPin.trim().toUpperCase();
      if (!enteredPin) {
        setErrorMessage('Please enter Admin Security PIN. (Hint: Use demo PIN "AGRI2026")');
        return;
      }
      if (!validPins.includes(enteredPin)) {
        setErrorMessage('Invalid Officer Authorization PIN. For hackathon testing, please enter "AGRI2026".');
        return;
      }
      if (adminForm.password && adminForm.password !== adminForm.confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }

      signUp({
        displayName: adminForm.displayName.trim(),
        role: 'admin',
        email: adminForm.email.trim(),
        organization: adminForm.organization.trim(),
        designation: adminForm.designation.trim(),
        password: adminForm.password
      });

      setSuccessNotice(`Authorized Quality Officer account created for ${adminForm.displayName}! Opening Home...`);
      setTimeout(() => onSuccess(), 500);
    }
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const credential = signInForm.emailOrPhone.trim();
    if (!credential) {
      setErrorMessage('Please enter your email or registered phone number.');
      return;
    }

    login(credential, signInForm.password, signInForm.role);
    setSuccessNotice(`Signed in successfully! Opening GrainSaksham AI Home...`);
    setTimeout(() => onSuccess(), 500);
  };

  const handleLoadDemoCredentials = (role: Role) => {
    const demo = demoUsers[role];
    setSignInForm({
      emailOrPhone: demo.email,
      password: 'password2026',
      role: role
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c2a1b] via-[#123824] to-[#1a442d] text-stone-100 flex flex-col justify-between relative overflow-hidden py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3"></div>

      {/* Top Header Bar */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between pb-6 border-b border-emerald-900/60 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-600 to-emerald-900 flex items-center justify-center shadow-lg shadow-emerald-950/40 border border-emerald-300/30">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tight text-white font-serif">
                GrainSaksham
              </span>
              <span className="bg-emerald-500 text-stone-950 font-black text-xs px-1.5 py-0.5 rounded shadow-sm">
                AI
              </span>
            </div>
            <p className="text-xs text-emerald-200/80 font-medium hidden sm:block">
              {t.tagline}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="bg-emerald-950/80 border border-emerald-700/50 rounded-lg px-2.5 py-1.5 text-xs flex items-center gap-1.5 shadow-inner">
            <span className="text-emerald-400 text-[11px] font-bold">LANG:</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent text-emerald-100 text-xs font-semibold focus:outline-none cursor-pointer pr-1"
              aria-label="Interface Language"
            >
              <option value="en" className="bg-stone-900 text-white">English (EN)</option>
              <option value="hi" className="bg-stone-900 text-white">हिंदी (HI)</option>
              <option value="mr" className="bg-stone-900 text-white">मराठी (MR)</option>
            </select>
          </div>

          {/* Skip / Guest button */}
          <button
            type="button"
            onClick={onExploreGuest || onSuccess}
            className="text-xs font-semibold text-emerald-200/90 hover:text-white bg-white/5 hover:bg-white/10 border border-emerald-600/30 px-3 py-1.5 rounded-lg transition-all"
          >
            Skip to Home →
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto w-full my-auto py-8 relative z-10">
        
        {/* Hackathon Badge & Welcome */}
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
            <Award className="w-3.5 h-3.5 text-emerald-300" />
            <span>AI Hackathon 2026 — AI in Agriculture & Rural Development</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-serif">
            Welcome to GrainSaksham AI
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/80 leading-relaxed">
            Please register or log in with your primary role (<strong>Farmer</strong>, <strong>Buyer / Trader</strong>, or <strong>Quality Admin</strong>) to experience personalized grain quality inspection, market price intelligence, and verifiable trading.
          </p>
        </div>

        {/* 1-Click Fast Demo Testing Cards (Judge Convenience) */}
        <div className="mb-8 bg-black/25 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-emerald-800/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Judge & Evaluator Fast Track: 1-Click Demo Logins</span>
            </div>
            <span className="text-[11px] text-stone-400">
              Instant login with seeded inspection lots & Mandi history
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Farmer Card */}
            <button
              type="button"
              onClick={() => handle1ClickDemo('farmer')}
              className="flex items-center gap-3 p-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-600/40 text-left transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-950/50 group"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-800/80 flex items-center justify-center text-xl shrink-0 group-hover:bg-emerald-700">
                👨‍🌾
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-emerald-200">
                    Ramesh Kumar
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded">
                    Farmer
                  </span>
                </div>
                <div className="text-[11px] text-emerald-200/70 truncate">
                  7.5 Acres • Samrala, Punjab
                </div>
              </div>
            </button>

            {/* Buyer Card */}
            <button
              type="button"
              onClick={() => handle1ClickDemo('buyer')}
              className="flex items-center gap-3 p-3 rounded-xl bg-blue-950/60 hover:bg-blue-900/80 border border-blue-600/40 text-left transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-950/50 group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-800/80 flex items-center justify-center text-xl shrink-0 group-hover:bg-blue-700">
                🏢
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-blue-200">
                    Sunil Agrotech Mills
                  </span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-1.5 py-0.5 rounded">
                    Buyer
                  </span>
                </div>
                <div className="text-[11px] text-blue-200/70 truncate">
                  APMC Lic #PB-LDH-8842 • Khanna
                </div>
              </div>
            </button>

            {/* Admin Card */}
            <button
              type="button"
              onClick={() => handle1ClickDemo('admin')}
              className="flex items-center gap-3 p-3 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 border border-amber-600/40 text-left transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-950/50 group"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-800/80 flex items-center justify-center text-xl shrink-0 group-hover:bg-amber-700">
                🏛️
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-amber-200">
                    Dr. Anjali Sharma
                  </span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded">
                    Admin
                  </span>
                </div>
                <div className="text-[11px] text-amber-200/70 truncate">
                  Sr. Quality Officer • Marketing Board
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Primary Auth Form Container */}
        <div className="bg-stone-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-emerald-700/40 overflow-hidden">
          
          {/* Top Switcher: Sign Up vs Sign In */}
          <div className="flex border-b border-emerald-800/40 bg-stone-950/50">
            <button
              type="button"
              onClick={() => { setAuthMode('signup'); setErrorMessage(null); }}
              className={`flex-1 py-4 text-center text-sm font-bold transition-all relative ${
                authMode === 'signup'
                  ? 'text-emerald-300 bg-emerald-950/40'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/40'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <UserCheck className="w-4 h-4" />
                <span>Create New Account (Sign Up)</span>
              </span>
              {authMode === 'signup' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_10px_#34d399]"></div>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setAuthMode('signin'); setErrorMessage(null); }}
              className={`flex-1 py-4 text-center text-sm font-bold transition-all relative ${
                authMode === 'signin'
                  ? 'text-emerald-300 bg-emerald-950/40'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/40'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" />
                <span>Existing User (Sign In)</span>
              </span>
              {authMode === 'signin' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_10px_#34d399]"></div>
              )}
            </button>
          </div>

          <div className="p-6 sm:p-8">
            
            {/* Feedback Notifications */}
            {errorMessage && (
              <div className="mb-6 p-3.5 bg-red-950/80 border border-red-500/50 rounded-xl text-red-200 text-xs sm:text-sm flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successNotice && (
              <div className="mb-6 p-3.5 bg-emerald-950/90 border border-emerald-400 rounded-xl text-emerald-200 text-xs sm:text-sm flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="font-semibold">{successNotice}</span>
              </div>
            )}

            {authMode === 'signup' ? (
              /* ================= SIGN UP FLOW ================= */
              <div>
                
                {/* 3-Role Selection Pills */}
                <div className="mb-6">
                  <label className="block text-xs font-bold text-stone-300 mb-2 uppercase tracking-wider">
                    Select Your Role:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    {/* Role: Farmer */}
                    <button
                      type="button"
                      onClick={() => { setSelectedRole('farmer'); setErrorMessage(null); }}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        selectedRole === 'farmer'
                          ? 'bg-emerald-950/80 border-emerald-400 text-white shadow-md shadow-emerald-950/50 ring-1 ring-emerald-400/50'
                          : 'bg-stone-950/40 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xl">👨‍🌾</span>
                        {selectedRole === 'farmer' && (
                          <BadgeCheck className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                      <div className="font-bold text-sm text-white">Farmer (किसान)</div>
                      <div className="text-[11px] text-stone-400 mt-1 leading-snug">
                        Inspect grain quality, get digital passports & fair price advice.
                      </div>
                    </button>

                    {/* Role: Buyer */}
                    <button
                      type="button"
                      onClick={() => { setSelectedRole('buyer'); setErrorMessage(null); }}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        selectedRole === 'buyer'
                          ? 'bg-blue-950/80 border-blue-400 text-white shadow-md shadow-blue-950/50 ring-1 ring-blue-400/50'
                          : 'bg-stone-950/40 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xl">🏢</span>
                        {selectedRole === 'buyer' && (
                          <BadgeCheck className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                      <div className="font-bold text-sm text-white">Buyer / Trader (व्यापारी)</div>
                      <div className="text-[11px] text-stone-400 mt-1 leading-snug">
                        Discover verified lots, verify QR passports & submit bids.
                      </div>
                    </button>

                    {/* Role: Admin */}
                    <button
                      type="button"
                      onClick={() => { setSelectedRole('admin'); setErrorMessage(null); }}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        selectedRole === 'admin'
                          ? 'bg-amber-950/80 border-amber-400 text-white shadow-md shadow-amber-950/50 ring-1 ring-amber-400/50'
                          : 'bg-stone-950/40 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xl">🏛️</span>
                        {selectedRole === 'admin' && (
                          <BadgeCheck className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                      <div className="font-bold text-sm text-white">Quality Admin (अधिकारी)</div>
                      <div className="text-[11px] text-stone-400 mt-1 leading-snug">
                        Govern AGMARK tolerances, verify records & audit disputes.
                      </div>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSignUpSubmit} className="space-y-4">
                  
                  {/* --- FARMER REGISTRATION FIELDS --- */}
                  {selectedRole === 'farmer' && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-stone-300 mb-1">
                            Farmer Full Name * (पूरा नाम)
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={farmerForm.displayName}
                              onChange={(e) => setFarmerForm({ ...farmerForm, displayName: e.target.value })}
                              placeholder="e.g., Ramesh Kumar"
                              required
                              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-stone-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-300 mb-1">
                            Mobile Number * (मोबाइल नंबर)
                          </label>
                          <div className="relative">
                            <input
                              type="tel"
                              value={farmerForm.phone}
                              onChange={(e) => setFarmerForm({ ...farmerForm, phone: e.target.value })}
                              placeholder="+91 98765 43210"
                              required
                              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-stone-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-stone-300 mb-1">
                            State (राज्य)
                          </label>
                          <select
                            value={farmerForm.state}
                            onChange={(e) => setFarmerForm({ ...farmerForm, state: e.target.value })}
                            className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-emerald-500"
                          >
                            <option value="Punjab">Punjab (पंजाब)</option>
                            <option value="Haryana">Haryana (हरियाणा)</option>
                            <option value="Madhya Pradesh">Madhya Pradesh (मध्य प्रदेश)</option>
                            <option value="Uttar Pradesh">Uttar Pradesh (उत्तर प्रदेश)</option>
                            <option value="Rajasthan">Rajasthan (राजस्थान)</option>
                            <option value="Maharashtra">Maharashtra (महाराष्ट्र)</option>
                            <option value="Gujarat">Gujarat (गुजरात)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-300 mb-1">
                            District (ज़िला)
                          </label>
                          <input
                            type="text"
                            value={farmerForm.district}
                            onChange={(e) => setFarmerForm({ ...farmerForm, district: e.target.value })}
                            placeholder="e.g., Ludhiana"
                            className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-300 mb-1">
                            Village / Tehsil (गांव / तहसील)
                          </label>
                          <input
                            type="text"
                            value={farmerForm.village}
                            onChange={(e) => setFarmerForm({ ...farmerForm, village: e.target.value })}
                            placeholder="e.g., Samrala"
                            className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-stone-300 mb-1">
                            Landholding Size (Acres / एकड़)
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            value={farmerForm.holdingAcres}
                            onChange={(e) => setFarmerForm({ ...farmerForm, holdingAcres: parseFloat(e.target.value) || 0 })}
                            placeholder="e.g., 7.5"
                            className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-300 mb-1">
                            Email (Optional / वैकल्पिक)
                          </label>
                          <input
                            type="email"
                            value={farmerForm.email}
                            onChange={(e) => setFarmerForm({ ...farmerForm, email: e.target.value })}
                            placeholder="farmer@example.com"
                            className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      {/* Primary Crops Toggle Chips */}
                      <div>
                        <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                          Primary Crops Grown (मुख्य फसलें)
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {availableCrops.map((c) => {
                            const isSelected = farmerForm.cropsGrown.includes(c.id);
                            return (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => toggleCrop(c.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                  isSelected
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-stone-950 border border-stone-700 text-stone-400 hover:text-stone-200'
                                }`}
                              >
                                {isSelected ? '✓ ' : '+ '} {c.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* --- BUYER REGISTRATION FIELDS --- */}
                  {selectedRole === 'buyer' && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-stone-300 mb-1">
                            Enterprise / Mill / Firm Name * (फर्म या मिल का नाम)
                          </label>
                          <input
                            type="text"
                            value={buyerForm.organization}
                            onChange={(e) => setBuyerForm({ ...buyerForm, organization: e.target.value })}
                            placeholder="e.g., Sunil Agrotech Mills Ltd"
                            required
                            className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-300 mb-1">
                            APMC Mandi License No. * (मंडी लाइसेंस संख्या)
                          </label>
                          <input
                            type="text"
                            value={buyerForm.mandiLicenseNo}
                            onChange={(e) => setBuyerForm({ ...buyerForm, mandiLicenseNo: e.target.value })}
                            placeholder="e.g., PB-LDH-APMC-8842"
                            required
                            className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-stone-300 mb-1">
                            Contact Person Name
                          </label>
                          <input
                            type="text"
                            value={buyerForm.displayName}
                            onChange={(e) => setBuyerForm({ ...buyerForm, displayName: e.target.value })}
                            placeholder="e.g., Sunil Verma"
                            className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-300 mb-1">
                            Official Mobile
                          </label>
                          <input
                            type="tel"
                            value={buyerForm.phone}
                            onChange={(e) => setBuyerForm({ ...buyerForm, phone: e.target.value })}
                            placeholder="+91 98123 45678"
                            className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-300 mb-1">
                            Business Email
                          </label>
                          <input
                            type="email"
                            value={buyerForm.email}
                            onChange={(e) => setBuyerForm({ ...buyerForm, email: e.target.value })}
                            placeholder="procurement@sunilagrotech.com"
                            className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-stone-300 mb-1">
                            Primary APMC Mandi Yard / City
                          </label>
                          <input
                            type="text"
                            value={buyerForm.district}
                            onChange={(e) => setBuyerForm({ ...buyerForm, district: e.target.value })}
                            placeholder="Khanna Mandi, Punjab"
                            className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-300 mb-1">
                            Business Category
                          </label>
                          <select
                            value={buyerForm.businessType}
                            onChange={(e) => setBuyerForm({ ...buyerForm, businessType: e.target.value })}
                            className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-blue-500"
                          >
                            <option value="Flour Mill & Agro Processing">Flour Mill & Agro Processing</option>
                            <option value="APMC Commission Agent (Arhtiya)">APMC Commission Agent (Arhtiya)</option>
                            <option value="Grain Exporter">Grain Exporter</option>
                            <option value="Corporate FMCG Buyer">Corporate FMCG Buyer</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* --- ADMIN REGISTRATION FIELDS --- */}
                  {selectedRole === 'admin' && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-amber-200 text-xs flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
                        <div>
                          <strong>Official Officer Onboarding:</strong> Administrative access allows tuning AGMARK grade tolerances and arbitrating disputes.
                          <div className="text-[11px] text-amber-300/80 mt-0.5">
                            For Hackathon Evaluator testing, enter Admin Security PIN: <code className="bg-amber-900/60 px-1.5 py-0.5 rounded font-mono font-bold text-white">AGRI2026</code>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-stone-300 mb-1">
                            Quality Officer Full Name * (अधिकारी का नाम)
                          </label>
                          <input
                            type="text"
                            value={adminForm.displayName}
                            onChange={(e) => setAdminForm({ ...adminForm, displayName: e.target.value })}
                            placeholder="e.g., Dr. Anjali Sharma"
                            required
                            className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-300 mb-1">
                            Official Government / Board Email *
                          </label>
                          <input
                            type="email"
                            value={adminForm.email}
                            onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                            placeholder="anjali.sharma@agri.gov.in"
                            required
                            className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-stone-300 mb-1">
                            Department / Marketing Board
                          </label>
                          <input
                            type="text"
                            value={adminForm.organization}
                            onChange={(e) => setAdminForm({ ...adminForm, organization: e.target.value })}
                            placeholder="Regional Agricultural Marketing Board"
                            className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-300 mb-1">
                            Official Designation
                          </label>
                          <input
                            type="text"
                            value={adminForm.designation}
                            onChange={(e) => setAdminForm({ ...adminForm, designation: e.target.value })}
                            placeholder="Senior Agricultural Quality Inspector"
                            className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-300 mb-1">
                          Admin Officer Security PIN * (गोपनीय पिन)
                        </label>
                        <input
                          type="password"
                          value={adminForm.adminPin}
                          onChange={(e) => setAdminForm({ ...adminForm, adminPin: e.target.value })}
                          placeholder="Enter Security PIN (Demo: AGRI2026)"
                          required
                          className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-amber-500 font-mono tracking-wider"
                        />
                      </div>
                    </div>
                  )}

                  {/* Password & Confirm Password (common) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1">
                        Create Password (पासवर्ड बनाएं)
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={
                            selectedRole === 'farmer'
                              ? farmerForm.password
                              : selectedRole === 'buyer'
                              ? buyerForm.password
                              : adminForm.password
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (selectedRole === 'farmer') setFarmerForm({ ...farmerForm, password: val });
                            else if (selectedRole === 'buyer') setBuyerForm({ ...buyerForm, password: val });
                            else setAdminForm({ ...adminForm, password: val });
                          }}
                          placeholder="••••••••"
                          className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-200"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1">
                        Confirm Password (पासवर्ड पुष्टि)
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={
                          selectedRole === 'farmer'
                            ? farmerForm.confirmPassword
                            : selectedRole === 'buyer'
                            ? buyerForm.confirmPassword
                            : adminForm.confirmPassword
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (selectedRole === 'farmer') setFarmerForm({ ...farmerForm, confirmPassword: val });
                          else if (selectedRole === 'buyer') setBuyerForm({ ...buyerForm, confirmPassword: val });
                          else setAdminForm({ ...adminForm, confirmPassword: val });
                        }}
                        placeholder="••••••••"
                        className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Terms & AGMARK Compliance checkbox */}
                  <div className="flex items-start gap-2.5 pt-2">
                    <input
                      type="checkbox"
                      id="terms"
                      defaultChecked
                      className="mt-1 rounded bg-stone-950 border-stone-700 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="terms" className="text-xs text-stone-400 leading-normal">
                      I agree to participate under AGMARK Schedule I grading protocols and platform fair-trading principles.
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className={`w-full mt-4 py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all ${
                      selectedRole === 'farmer'
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40'
                        : selectedRole === 'buyer'
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40'
                        : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/40'
                    }`}
                  >
                    <span>
                      Complete Registration as {selectedRole === 'farmer' ? 'Farmer' : selectedRole === 'buyer' ? 'Buyer' : 'Admin'} & Open Home
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ) : (
              /* ================= SIGN IN FLOW ================= */
              <div className="animate-fadeIn">
                <form onSubmit={handleSignInSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                      Account Type (खाते का प्रकार)
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['farmer', 'buyer', 'admin'] as Role[]).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setSignInForm({ ...signInForm, role: r })}
                          className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all border ${
                            signInForm.role === r
                              ? r === 'farmer'
                                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                                : r === 'buyer'
                                ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                                : 'bg-amber-600 text-white border-amber-500 shadow-md'
                              : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-white'
                          }`}
                        >
                          {r === 'farmer' ? '👨‍🌾 Farmer' : r === 'buyer' ? '🏢 Buyer' : '🏛️ Admin'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Email or Registered Mobile Phone (ईमेल या मोबाइल)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={signInForm.emailOrPhone}
                        onChange={(e) => setSignInForm({ ...signInForm, emailOrPhone: e.target.value })}
                        placeholder="e.g., ramesh.farmer@grainsaksham.ai or +91 98765 43210"
                        required
                        className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-stone-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-stone-300">
                        Password (पासवर्ड)
                      </label>
                      <button
                        type="button"
                        onClick={() => handleLoadDemoCredentials(signInForm.role)}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-medium"
                      >
                        Auto-fill Demo Credentials
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={signInForm.password}
                        onChange={(e) => setSignInForm({ ...signInForm, password: e.target.value })}
                        placeholder="••••••••"
                        className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-4 py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all"
                  >
                    <span>Sign In & Open Home Interface</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Footer Security / Trust Strip */}
          <div className="bg-stone-950 px-6 py-4 border-t border-emerald-900/40 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-400 gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>AGMARK Aligned</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-blue-400">
                <Scale className="w-3.5 h-3.5" />
                <span>e-NAM Compliant</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-400">
                <Lock className="w-3.5 h-3.5" />
                <span>256-Bit Encrypted</span>
              </span>
            </div>

            <div>
              <button
                type="button"
                onClick={onExploreGuest || onSuccess}
                className="text-emerald-400 hover:text-emerald-300 font-semibold underline"
              >
                Continue as Guest Explorer →
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* Page Footer */}
      <footer className="max-w-6xl mx-auto w-full text-center text-xs text-emerald-200/50 pt-6 border-t border-emerald-950/60 relative z-10">
        <div>GrainSaksham AI — AI-Powered Grain Quality Inspection & Fair-Price Assistance Platform</div>
        <div className="text-[11px] text-stone-400 mt-1">
          Designed for Indian Farmers, Mandi Traders, Millers & Agricultural Quality Officers • 2026
        </div>
      </footer>
    </div>
  );
};
