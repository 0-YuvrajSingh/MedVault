import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegister } from '../../hooks/useAuthQuery';
import { Mail, Lock, User, Shield, Stethoscope } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { jwtDecode } from 'jwt-decode';

const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const [role, setRole] = useState('ROLE_PATIENT');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const navigate = useNavigate();
  const registerMutation = useRegister();

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const res = await registerMutation.mutateAsync({ ...formData, role });
      if (role === 'ROLE_DOCTOR') {
        setSuccess('Registration successful! Your account requires admin approval before you can log in.');
      } else {
        const token = res.token;
        if (token) {
          login(token, res.fullName);
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
    <div className="w-full max-w-md">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-primary-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Create Account</h1>
          <p className="text-sm text-slate-500 mt-1">Register to get started with MedVault</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-danger-50 border border-danger-100 rounded-lg text-sm text-danger-700 font-medium">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-success-50 border border-success-100 rounded-lg text-sm text-success-700 font-medium">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={e => updateField('fullName', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                placeholder="you@hospital.com"
                value={formData.email}
                onChange={e => updateField('email', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => updateField('password', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={e => updateField('confirmPassword', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                  role === 'ROLE_PATIENT'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                }`}
                onClick={() => setRole('ROLE_PATIENT')}
              >
                <User className="w-5 h-5 mx-auto mb-1" />
                Patient
              </button>
              <button
                type="button"
                className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                  role === 'ROLE_DOCTOR'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                }`}
                onClick={() => setRole('ROLE_DOCTOR')}
              >
                <Stethoscope className="w-5 h-5 mx-auto mb-1" />
                Doctor
              </button>
            </div>
          </div>

          {role === 'ROLE_DOCTOR' && (
            <div className="p-3 bg-warning-50 border border-warning-100 rounded-lg text-xs text-warning-700 font-medium">
              Doctor accounts require admin approval before login is permitted.
            </div>
          )}

          <Button type="submit" loading={registerMutation.isPending} className="w-full">
            {!registerMutation.isPending && 'Create account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
