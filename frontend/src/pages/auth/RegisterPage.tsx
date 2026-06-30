import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/auth';
import { Mail, Lock, User, ArrowRight, ShieldCheck, CheckCircle2, Loader2, Stethoscope } from 'lucide-react';
import Logo from '../../components/common/Logo';
import { useAuth } from '../../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm Password must be at least 6 characters'),
  role: z.enum(['ROLE_PATIENT', 'ROLE_DOCTOR'])
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const [role, setRole] = useState('ROLE_PATIENT'); // For visual state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'ROLE_PATIENT'
    }
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError('');
    setSuccess('');

    try {
      const res = await authAPI.register(data);
      if (data.role === 'ROLE_DOCTOR') {
        setSuccess('Registration successful! Your account requires admin approval before you can log in.');
      } else {
        // Auto-login since they are active immediately
        const token = res.data.token;
        if (token) {
          login(token, res.data.fullName);
          const decoded: any = jwtDecode(token);
          const r = decoded.role;
          if (r === 'ROLE_ADMIN') navigate('/admin');
          else if (r === 'ROLE_DOCTOR') navigate('/doctor');
          else navigate('/patient');
        } else {
          setSuccess('Registration successful! Redirecting to login...');
          setTimeout(() => navigate('/login'), 2000);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    }
  };

  return (
    <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-xl overflow-hidden border border-slate-200 bg-white" style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)" }}>
      {/* Left — Vibrant Panel */}
      <div className="hidden md:flex flex-col justify-center bg-[#9747FF] border-r-4 border-slate-200 p-10 text-white relative">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
          {/* Abstract subtle background pattern */}
          <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full border-[20px] border-white"></div>
          <div className="absolute bottom-12 -right-12 w-32 h-32 rounded-full border-[10px] border-white"></div>
        </div>

        <div className="relative z-10">
          <div className="mb-8 scale-125 origin-left">
            <Logo variant="dark" />
          </div>
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className={`input block w-full pl-10 pr-3 py-2.5 border ${errors.fullName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#0369A1] focus:border-[#0369A1]'} rounded-lg sm:text-sm bg-gray-50 focus:bg-white transition-colors outline-none`}
                placeholder="John Doe"
                {...register('fullName')}
              />
            </div>
            {errors.fullName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                className={`input block w-full pl-10 pr-3 py-2.5 border ${errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#0369A1] focus:border-[#0369A1]'} rounded-lg sm:text-sm bg-gray-50 focus:bg-white transition-colors outline-none`}
                placeholder="you@hospital.com"
                {...register('email')}
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>}
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
                  className={`input block w-full pl-10 pr-3 py-2.5 border ${errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#0369A1] focus:border-[#0369A1]'} rounded-lg sm:text-sm bg-gray-50 focus:bg-white transition-colors outline-none`}
                  placeholder="••••••••"
                  {...register('password')}
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  className={`input block w-full pl-10 pr-3 py-2.5 border ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#0369A1] focus:border-[#0369A1]'} rounded-lg sm:text-sm bg-gray-50 focus:bg-white transition-colors outline-none`}
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-medium">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-sm font-medium transition-all ${role === 'ROLE_PATIENT'
                    ? 'border-[#0369A1] bg-[#EFF6FF] text-[#0369A1]'
                    : 'border border-slate-200 text-gray-500 hover:border-gray-300 bg-white'
                  }`}
                onClick={() => { setRole('ROLE_PATIENT'); setValue('role', 'ROLE_PATIENT'); }}
              >
                <User className="w-5 h-5" />
                Patient
              </button>
              <button
                type="button"
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-sm font-medium transition-all ${role === 'ROLE_DOCTOR'
                    ? 'border-[#0369A1] bg-[#EFF6FF] text-[#0369A1]'
                    : 'border border-slate-200 text-gray-500 hover:border-gray-300 bg-white'
                  }`}
                onClick={() => { setRole('ROLE_DOCTOR'); setValue('role', 'ROLE_DOCTOR'); }}
              >
                <Stethoscope className="w-5 h-5" />
                Doctor
              </button>
            </div>
            {errors.role && <p className="text-red-500 text-xs mt-1 font-medium">{errors.role.message}</p>}
          </div>

          {role === 'ROLE_DOCTOR' && (
            <div className="p-3 bg-amber-50 border-l-4 border-amber-500 text-amber-700 text-xs rounded-r-md font-medium mt-3">
              ⚠️ Doctor accounts require admin approval before login is permitted.
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary w-full mt-6"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              <span className="flex items-center justify-center">
                Create account
                <ArrowRight className="w-4 h-4 ml-1" />
              </span>
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
