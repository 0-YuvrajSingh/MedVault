import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/auth';
import { Mail, Lock, User, ArrowRight, ShieldCheck, CheckCircle2, Loader2, Stethoscope } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('ROLE_PATIENT');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authAPI.register({ fullName, email, password, role });
      if (role === 'ROLE_DOCTOR') {
        setSuccess('Registration successful! Your account requires admin approval before you can log in.');
      } else {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl bg-white">
      {/* Left — Clinical Navy Branding Panel */}
      <div className="hidden md:flex flex-col justify-center bg-[#0F4C81] p-10 text-white relative">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
          {/* Abstract subtle background pattern */}
          <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full border-[20px] border-white"></div>
          <div className="absolute bottom-12 -right-12 w-32 h-32 rounded-full border-[10px] border-white"></div>
        </div>

        <div className="relative z-10">
          <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 border border-white/20 shadow-sm">
            <ShieldCheck className="w-8 h-8 text-blue-100" />
          </div>
          <h2 className="text-3xl font-bold mb-3 tracking-tight">Join MedVault</h2>
          <p className="text-blue-200 text-sm leading-relaxed mb-10 font-medium">
            Create your account to access secure healthcare management tools.
          </p>
          
          <div className="space-y-4">
            {[
              'Instant patient portal access',
              'Secure document storage',
              'Streamlined provider communication'
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-blue-100 font-medium">
                <div className="w-5 h-5 rounded-full bg-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-300" />
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Registration Form */}
      <div className="p-8 md:p-10 flex flex-col justify-center bg-white h-full overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-1.5 tracking-tight">Create Account</h2>
        <p className="text-sm text-gray-500 mb-6 font-medium">Register to get started with MedVault</p>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-md flex items-start">
            <div className="flex-1 text-sm text-red-700 font-medium">{error}</div>
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-md flex items-start">
            <div className="flex-1 text-sm text-emerald-700 font-medium">{success}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="text" 
                className="input block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0369A1] focus:border-[#0369A1] sm:text-sm bg-gray-50 focus:bg-white transition-colors outline-none" 
                placeholder="John Doe" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                required 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="email" 
                className="input block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0369A1] focus:border-[#0369A1] sm:text-sm bg-gray-50 focus:bg-white transition-colors outline-none" 
                placeholder="you@hospital.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="password" 
                  className="input block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0369A1] focus:border-[#0369A1] sm:text-sm bg-gray-50 focus:bg-white transition-colors outline-none" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  minLength={6}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="password" 
                  className="input block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0369A1] focus:border-[#0369A1] sm:text-sm bg-gray-50 focus:bg-white transition-colors outline-none" 
                  placeholder="••••••••" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-sm font-medium transition-all ${
                  role === 'ROLE_PATIENT' 
                  ? 'border-[#0369A1] bg-[#EFF6FF] text-[#0369A1]' 
                  : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'
                }`}
                onClick={() => setRole('ROLE_PATIENT')}
              >
                <User className="w-5 h-5" />
                Patient
              </button>
              <button
                type="button"
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-sm font-medium transition-all ${
                  role === 'ROLE_DOCTOR' 
                  ? 'border-[#0369A1] bg-[#EFF6FF] text-[#0369A1]' 
                  : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'
                }`}
                onClick={() => setRole('ROLE_DOCTOR')}
              >
                <Stethoscope className="w-5 h-5" />
                Doctor
              </button>
            </div>
          </div>

          {role === 'ROLE_DOCTOR' && (
            <div className="p-3 bg-amber-50 border-l-4 border-amber-500 text-amber-700 text-xs rounded-r-md font-medium mt-3">
              ⚠️ Doctor accounts require admin approval before login is permitted.
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#0369A1] hover:bg-[#02598B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0369A1] transition-all disabled:opacity-70 mt-6"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Create account
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-[#0369A1] font-semibold hover:underline transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
