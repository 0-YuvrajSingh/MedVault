import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/auth';
import { Mail, Lock, ArrowRight, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import Logo from '../../components/common/Logo';
import { jwtDecode } from 'jwt-decode';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const [error, setError] = useState('');
  const { login, role } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    setError('');
    try {
      const res = await authAPI.login(data);
      login(res.data.token, res.data.fullName);

      const decoded: any = jwtDecode(res.data.token);
      const r = decoded.role;
      if (r === 'ROLE_ADMIN') navigate('/admin');
      else if (r === 'ROLE_DOCTOR') navigate('/doctor');
      else navigate('/patient');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please verify your credentials.');
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
            Secure healthcare records management.
          </p>

          <div className="space-y-4">
            {[
              'Role-based access control',
              'Immutable audit trail',
              'JWT-secured sessions'
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

      {/* Right — Clinical Blue Form */}
      <div className="p-8 md:p-10 flex flex-col justify-center bg-white">
        <h2 className="text-2xl font-bold text-gray-900 mb-1.5 tracking-tight">Sign in to your account</h2>
        <p className="text-sm text-gray-500 mb-8 font-medium">Enter your credentials to access your portal</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-md flex items-start">
            <div className="flex-1 text-sm text-red-700 font-medium">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300 text-[#0369A1] focus:ring-[#0369A1]" />
              <span className="font-medium">Remember me</span>
            </label>
            <span className="text-sm text-[#0369A1] font-semibold hover:underline cursor-not-allowed opacity-90">
              Forgot password?
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary w-full mt-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              <span className="flex items-center justify-center">
                Sign in
                <ArrowRight className="w-4 h-4 ml-1" />
              </span>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#0369A1] font-semibold hover:underline transition-colors">
            Create one now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
