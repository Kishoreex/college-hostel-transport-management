import { login } from '../../../api/authService';
import { useState } from 'react';
import { Building2, Bus, Users, Shield, ArrowLeft, Eye, EyeOff, ChevronRight, Mail, Phone, CheckCircle, Lock } from 'lucide-react';
import { toast } from 'sonner';
import type { User, UserRole, ServiceType } from '../../types';
import Registration from './Registration';
import { Dialog } from '@mui/material';
import logo from '../../../assets/logo.png';
interface LoginProps {
  onLogin: (user: User) => void;
}

type AuthScreen = 'main' | 'studentLogin' | 'adminLogin' | 'registration';

export default function Login({ onLogin }: LoginProps) {
  const [screen, setScreen] = useState<AuthScreen>('main');
  const [serviceType, setServiceType] = useState<ServiceType>('hostel');
  const [selectedAdminRole, setSelectedAdminRole] = useState<UserRole | null>(null);
  const [credentials, setCredentials] = useState({ id: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordType, setForgotPasswordType] = useState<'student' | 'admin'>('student');
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [newPasswordStep, setNewPasswordStep] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const closeForgot = () => {
    setForgotPasswordOpen(false);
    setResetSent(false); setOtpStep(false); setNewPasswordStep(false); setResetDone(false);
    setForgotPasswordEmail(''); setOtpValue(''); setNewPassword(''); setConfirmNewPassword('');
  };

 const handleStudentLogin = async (
  e: React.FormEvent
) => {
  e.preventDefault();

  try {
    setLoading(true);
const result = await login(
  credentials.id,
  credentials.password,
  serviceType === "hostel"
    ? "Hostel"
    : "Transport"
);
console.log("STUDENT LOGIN RESULT");
console.log(result);
if (result.role !== "Student") {
  toast.error("Please use Admin Login");
  return;
}

const studentUser: User = {
  id: result.id.toString(),
  userId: result.userId,
  name: result.fullName,
  role: "student",
  email: result.email,
  studentId: result.userId,
  serviceType: serviceType,

  profilePhoto: result.profilePhoto
};

onLogin(studentUser);

    toast.success("Login Successful");
  }
  catch (error: any) {

    console.log(error);

    toast.error(
        error.message || "Login Failed"
    );
}
  finally {
    setLoading(false);
  }
};

const handleAdminLogin = async (
  e: React.FormEvent
) => {
  e.preventDefault();

  try {
    setLoading(true);

 const result = await login(
  credentials.id,
  credentials.password,
  "Admin"
);

console.log("============== LOGIN RESPONSE ==============");
console.log(result);

console.log("result.id =", result.id);
console.log("result.userId =", result.userId);
console.log("result.UserId =", result.UserId);
console.log("Object Keys =", Object.keys(result));
if (result.role !== "Admin") {
  toast.error("Please use Student Login");
  return;
}

const adminUser = {
    id: result.id.toString(),

    // Accept either camelCase or PascalCase
    userId: result.userId ?? result.UserId,

    name: result.fullName ?? result.FullName,
    role: "admin",

    email: result.email ?? result.Email,
    phoneNumber: result.phoneNumber ?? result.PhoneNumber,

    isSystemAdmin: result.isSystemAdmin ?? result.IsSystemAdmin,
    canManageTransport: result.canManageTransport ?? result.CanManageTransport,
    canManageBoysHostel: result.canManageBoysHostel ?? result.CanManageBoysHostel,
    canManageGirlsHostel: result.canManageGirlsHostel ?? result.CanManageGirlsHostel,

    profilePhoto: result.profilePhoto ?? result.ProfilePhoto
};

console.log("ADMIN USER");
console.log(adminUser);

onLogin(adminUser as User);

    toast.success("Login Successful");
  }
catch (error: any) {

    console.log(error);

    toast.error(
        error.message || "Login Failed"
    );
}
  finally {
    setLoading(false);
  }
};
  const resetToMain = () => {
    setScreen('main');
    setCredentials({ id: '', password: '' });
    setShowPassword(false);
    setSelectedAdminRole(null);
    setLoading(false);
  };

  if (screen === 'registration') {
    return (
      <Registration
        serviceType={serviceType}
        onBack={() => setScreen('studentLogin')}
        onSuccess={() => setScreen('studentLogin')}
      />
    );
  }

  // Main Landing Screen
  if (screen === 'main') {
    return (
     <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-blue-50 flex flex-col">
 <div className="bg-white border-b border-gray-100 shadow-sm py-3 md:py-5">

  <div className="flex flex-col items-center">

<img
  src={logo}
  alt="Madha Logo"
  className="w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-blue-100 shadow-xl object-cover"
/>

    <h1 className="mt-3 text-2xl md:text-4xl font-bold text-blue-700 text-center">
      Madha Group of Institutions
    </h1>

   <p className="text-sm md:text-lg text-gray-500 mt-1 text-center px-4">
      Campus Hostel & Transport Management System
    </p>

  </div>

</div>

        <div className="flex-1 flex flex-col justify-center px-6 py-10">
          <div className="text-center mb-10">
    <h2 className="text-3xl md:text-5xl font-extrabold text-slate-800 mb-2">
  Welcome
</h2>
           <p className="text-gray-500 text-lg">
  Choose your portal to continue
</p>
          </div>

          <div className="space-y-4 max-w-lg mx-auto w-full">
            <button
              onClick={() => setScreen('studentLogin')}
             className="w-full bg-white rounded-3xl border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 p-5 md:p-7"  >
              <div className="flex items-center space-x-4">
          <div className="bg-blue-50 border-2 border-blue-200 p-3 md:p-5 rounded-2xl">
  <Users size={28} className="text-blue-600" />
</div>
                <div className="flex-1 text-left">
                 <h3 className="text-xl md:text-2xl font-bold text-blue-700">
  Student Portal
</h3>
                  <p className="text-base text-gray-600 mt-1">
  Hostel • Transport • Outpass • Leave
</p>
                </div>
               <ChevronRight
  size={27}
  className="text-blue-600"
/>
              </div>
            </button>

            <button
              onClick={() => {
                setSelectedAdminRole('admin');
                setScreen('adminLogin');
              }}
className="w-full bg-white rounded-3xl border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 p-5 md:p-7"            >
              <div className="flex items-center space-x-4">
                <div className="bg-slate-100 border-2 border-slate-300 p-3 md:p-5 rounded-2xl">
  <Shield size={28} className="text-slate-700" />
</div>
                <div className="flex-1 text-left">
                 <h3 className="text-xl md:text-2xl font-bold text-slate-800">
  Staff & Admin Portal
</h3>
                 <p className="text-base text-gray-600 mt-1">
  Admin • Warden • Security • Transport
</p>
                </div>
                <ChevronRight
  size={30}
  className="text-slate-700"
/>
              </div>
            </button>
          </div>
        </div>

       <div className="text-center pb-8">

  <p className="text-xs text-gray-400">
    Version 1.0.0
  </p>

  <p className="text-xs text-gray-400 mt-1">
    © 2026 Madha Group of Institutions
  </p>

</div>
      </div>
    );
  }

  // Student Login Form with Service Selection
  if (screen === 'studentLogin') {
    const bgGradient = serviceType === 'hostel' ? 'from-blue-500 to-blue-700' : 'from-green-500 to-green-700';

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className={`bg-gradient-to-r ${bgGradient} pt-12 pb-8 px-6 shadow-md relative`}>
          <button onClick={resetToMain} className="absolute top-4 left-4 flex items-center text-white/80 active:text-white">
            <ArrowLeft size={20} className="mr-1" />
            <span className="text-sm">Back</span>
          </button>
          <div className="text-center mt-2">
            <div className={`inline-flex bg-white/20 p-4 rounded-2xl mb-3 shadow-lg`}>
              {serviceType === 'hostel' ? <Building2 size={40} className="text-white" /> : <Bus size={40} className="text-white" />}
            </div>
            <h2 className="text-white text-2xl font-bold">Student Login</h2>
            <p className="text-white/80 text-sm mt-1">
              {serviceType === 'hostel' ? 'Hostel Student Portal' : 'Transport Student Portal'}
            </p>
          </div>
        </div>

        <div className="flex-1 px-5 py-6 -mt-2 bg-gray-50 rounded-t-3xl">
          <form onSubmit={handleStudentLogin} className="space-y-4 max-w-md mx-auto w-full">
            {/* Service Type Selection */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Select Service
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setServiceType('hostel')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    serviceType === 'hostel' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <Building2 size={22} className={`mx-auto mb-1.5 ${serviceType === 'hostel' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <p className={`text-sm font-semibold ${serviceType === 'hostel' ? 'text-blue-600' : 'text-gray-500'}`}>
                    Hostel
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setServiceType('transport')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    serviceType === 'transport' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <Bus size={22} className={`mx-auto mb-1.5 ${serviceType === 'transport' ? 'text-green-600' : 'text-gray-400'}`} />
                  <p className={`text-sm font-semibold ${serviceType === 'transport' ? 'text-green-600' : 'text-gray-500'}`}>
                    Transport
                  </p>
                </button>
              </div>
            </div>

            {/* Student ID */}
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Student ID 
              </label>
              <input
                type="text"
                value={credentials.id}
                onChange={(e) => setCredentials({ ...credentials, id: e.target.value })}
                className="w-full py-2 bg-transparent border-0 focus:outline-none text-gray-800 text-base placeholder-gray-300"
                placeholder="e.g. 2111222104010"
                required
              />
            </div>

            {/* Password */}
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full py-2 bg-transparent border-0 focus:outline-none text-gray-800 text-base placeholder-gray-300 pr-10"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 text-gray-400 p-1"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r ${
                serviceType === 'hostel' ? 'from-blue-500 to-blue-600' : 'from-green-500 to-green-600'
              } text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform text-base mt-2`}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div className="flex justify-between items-center px-1 pt-1">
             
              <button
                type="button"
                onClick={() => setScreen('registration')}
                className="text-blue-600 font-semibold text-sm"
              >
                New Registration
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Admin Login Form
  if (screen === 'adminLogin' && selectedAdminRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 flex flex-col">
        {/* Mobile-First Header */}
        <div className="pt-8 pb-12 px-6 relative">
          <button onClick={resetToMain} className="absolute top-6 left-4 flex items-center text-white/90 active:text-white active:scale-95 transition-transform">
            <ArrowLeft size={22} className="mr-1" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="text-center mt-12">
            <div className="inline-flex bg-white/10 backdrop-blur-md p-5 rounded-3xl mb-4 shadow-2xl border border-white/20">
              <Shield size={50} className="text-white" />
            </div>
            <h1 className="text-white text-3xl font-bold mb-2">Admin Portal</h1>
            <p className="text-white/70 text-sm">Staff & Management Access</p>
          </div>
        </div>

        {/* Mobile Login Form Card */}
        <div className="flex-1 bg-white rounded-t-[2.5rem] px-6 py-8 shadow-2xl">
          <form onSubmit={handleAdminLogin} className="space-y-4 max-w-lg mx-auto w-full px-4">
            <div className="text-center mb-6">
              <h2 className="text-gray-800 text-xl font-bold">Welcome Back</h2>
              <p className="text-gray-500 text-sm mt-1">Sign in to continue</p>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 ml-1">
                Email / Username
              </label>
              <div className="bg-gray-50 rounded-2xl px-5 py-4 border-2 border-gray-200 focus-within:border-slate-600 transition-colors">
                <input
                  type="text"
                  value={credentials.id}
                  onChange={(e) => setCredentials({ ...credentials, id: e.target.value })}
                  className="w-full bg-transparent border-0 focus:outline-none text-gray-800 text-base placeholder-gray-400"
                  placeholder="admin@madha.edu.in"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 ml-1">Password</label>
              <div className="bg-gray-50 rounded-2xl px-5 py-4 border-2 border-gray-200 focus-within:border-slate-600 transition-colors">
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="w-full bg-transparent border-0 focus:outline-none text-gray-800 text-base placeholder-gray-400 pr-10"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 text-gray-400 hover:text-gray-600 p-1 active:scale-95 transition-transform"
                  >
                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-slate-700 to-slate-800 text-white font-bold py-5 rounded-2xl shadow-xl active:scale-95 transition-transform text-base mt-6 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : 'Login to Dashboard'}
            </button>

            {/* Forgot Password */}
           {/* <div className="text-center pt-2">
              <button type="button" onClick={() => { setForgotPasswordType('admin'); setForgotPasswordOpen(true); setResetSent(false); setForgotPasswordEmail(''); }} className="text-slate-600 text-sm font-semibold hover:text-slate-800 active:scale-95 transition-all"> Forgot Password? </button>
            </div> */}
          </form>

          {/* Footer */}
          <div className="text-center mt-8 pb-4">
            <p className="text-gray-400 text-xs">© 2026 Madha Group of Institutions</p>
            <p className="text-gray-400 text-xs mt-1"></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Forgot Password Dialog — 4 steps: enter ID → OTP → new password → done */}
      <Dialog open={forgotPasswordOpen} onClose={closeForgot} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, m: 2 } }}>
        <div className="p-6">

          {/* Step 1: Enter ID/Email */}
          {!resetSent && !otpStep && !newPasswordStep && !resetDone && (
            <>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-100 p-3 rounded-2xl"><Mail size={24} className="text-blue-600" /></div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Forgot Password</h2>
                  <p className="text-sm text-gray-500">{forgotPasswordType === 'student' ? 'Student Account Recovery' : 'Admin Account Recovery'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 mb-4">
                {['Enter ID', 'Verify OTP', 'New Password', 'Done'].map((s, i) => (
                  <div key={s} className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{i + 1}</div>
                    {i < 3 && <div className="w-6 h-0.5 bg-gray-200 mx-0.5" />}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 mb-4">Enter your registered {forgotPasswordType === 'student' ? 'Student ID, email or phone' : 'email address'}. We'll send a 6-digit OTP.</p>
              <input type="text" value={forgotPasswordEmail} onChange={e => setForgotPasswordEmail(e.target.value)}
                placeholder={forgotPasswordType === 'student' ? 'Student ID / Email / Phone' : 'admin@madha.edu.in'}
                className="w-full bg-gray-50 border-2 border-gray-200 focus:border-blue-400 rounded-2xl px-4 py-3 text-gray-800 outline-none mb-4" />
              <div className="flex gap-3">
                <button onClick={closeForgot} className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-2xl active:scale-95">Cancel</button>
                <button onClick={() => { if (forgotPasswordEmail.trim()) { setResetSent(true); toast.info('OTP sent!', { description: `A 6-digit OTP has been sent to ${forgotPasswordEmail}` }); } }}
                  disabled={!forgotPasswordEmail.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 rounded-2xl active:scale-95 disabled:opacity-50">
                  Send OTP
                </button>
              </div>
            </>
          )}

          {/* Step 2: Enter OTP */}
          {resetSent && !otpStep && !newPasswordStep && !resetDone && (
            <>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-amber-100 p-3 rounded-2xl"><Phone size={24} className="text-amber-600" /></div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Enter OTP</h2>
                  <p className="text-sm text-gray-500">Sent to {forgotPasswordEmail}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 mb-4">
                {['Enter ID', 'Verify OTP', 'New Password', 'Done'].map((s, i) => (
                  <div key={s} className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i <= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{i < 1 ? <CheckCircle size={12} /> : i + 1}</div>
                    {i < 3 && <div className={`w-6 h-0.5 mx-0.5 ${i < 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 mb-4">Enter the 6-digit OTP. For demo use <span className="font-bold text-blue-600">123456</span>.</p>
              <input type="text" maxLength={6} value={otpValue} onChange={e => setOtpValue(e.target.value.replace(/\D/g, ''))}
                placeholder="_ _ _ _ _ _"
                className="w-full bg-gray-50 border-2 border-gray-200 focus:border-amber-400 rounded-2xl px-4 py-3 text-gray-800 outline-none text-center text-2xl font-bold tracking-widest mb-4" />
              <div className="flex gap-3">
                <button onClick={() => setResetSent(false)} className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-2xl active:scale-95">Back</button>
                <button onClick={() => {
                  if (otpValue === '123456') { setOtpStep(true); }
                  else { toast.error('Invalid OTP', { description: 'Please enter the correct 6-digit OTP' }); }
                }} disabled={otpValue.length !== 6}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold py-3 rounded-2xl active:scale-95 disabled:opacity-50">
                  Verify OTP
                </button>
              </div>
            </>
          )}

          {/* Step 3: Set New Password */}
          {otpStep && !newPasswordStep && !resetDone && (
            <>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-green-100 p-3 rounded-2xl"><Lock size={24} className="text-green-600" /></div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">New Password</h2>
                  <p className="text-sm text-gray-500">Set a strong new password</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 mb-4">
                {['Enter ID', 'Verify OTP', 'New Password', 'Done'].map((s, i) => (
                  <div key={s} className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i <= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{i < 2 ? <CheckCircle size={12} /> : i + 1}</div>
                    {i < 3 && <div className={`w-6 h-0.5 mx-0.5 ${i < 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />}
                  </div>
                ))}
              </div>
              <div className="space-y-3 mb-4">
                <div className="relative">
                  <input type={showNewPwd ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    placeholder="New password (min 8 chars)"
                    className="w-full bg-gray-50 border-2 border-gray-200 focus:border-green-400 rounded-2xl px-4 py-3 pr-12 text-gray-800 outline-none" />
                  <button type="button" onClick={() => setShowNewPwd(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    {showNewPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <input type={showNewPwd ? 'text' : 'password'} value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full bg-gray-50 border-2 border-gray-200 focus:border-green-400 rounded-2xl px-4 py-3 text-gray-800 outline-none" />
                {confirmNewPassword && newPassword !== confirmNewPassword && (
                  <p className="text-xs text-red-500 font-medium">Passwords do not match</p>
                )}
              </div>
              <button onClick={() => {
                if (newPassword.length < 8) { toast.error('Password too short', { description: 'Minimum 8 characters required' }); return; }
                if (newPassword !== confirmNewPassword) { toast.error('Passwords do not match'); return; }
                setNewPasswordStep(true); setResetDone(true);
                toast.success('Password reset successful!', { description: 'You can now log in with your new password' });
              }} disabled={!newPassword || !confirmNewPassword}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 rounded-2xl active:scale-95 disabled:opacity-50">
                Set New Password
              </button>
            </>
          )}

          {/* Step 4: Done */}
          {resetDone && (
            <div className="text-center py-4">
              <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle size={40} className="text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Password Reset!</h2>
              <p className="text-sm text-gray-600 mb-4">Your password has been changed successfully. Please log in with your new password.</p>
              <button onClick={closeForgot} className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 rounded-2xl active:scale-95">
                Back to Login
              </button>
            </div>
          )}

        </div>
      </Dialog>
    </>
  );
}
