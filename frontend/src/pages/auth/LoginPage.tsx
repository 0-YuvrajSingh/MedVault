import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/auth';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, role } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      login(res.data.token, res.data.fullName);
      // Navigate based on role after decode
      setTimeout(() => {
        const r = (window as any).__MEDVAULT_ROLE__ || role;
        if (r === 'ROLE_ADMIN') navigate('/admin');
        else if (r === 'ROLE_DOCTOR') navigate('/doctor');
        else navigate('/patient');
      }, 100);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-xl overflow-hidden shadow-md">
      {/* Left — branding */}
      <div className="hidden md:flex flex-col justify-center bg-gradient-to-br from-admin-500 to-admin-700 p-10 text-white">
        <h2 className="text-3xl font-bold mb-3">Welcome Back</h2>
        <p className="text-admin-100 text-sm leading-relaxed">
          Access your secure healthcare dashboard. Your medical records, assignments, and audit trails are protected by industry-standard authentication.
        </p>
        <div className="mt-8 space-y-3">
          {['JWT-secured sessions', 'Role-based dashboards', 'HIPAA-inspired access control'].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-admin-100">
              <svg className="w-4 h-4 text-admin-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div className="bg-white p-8 md:p-10">
        <h2 className="text-2xl font-bold text-text-primary mb-1">Log in</h2>
        <p className="text-sm text-text-muted mb-8">Enter your credentials to continue</p>

        {error && (
          <div className="mb-4 alert alert--danger">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
            <input type="email" className="input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Password</label>
            <input type="password" className="input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
              <input type="checkbox" className="rounded border-border text-admin-500 focus:ring-admin-500" />
              Remember me
            </label>
            <span className="text-sm text-text-muted cursor-not-allowed">Forgot password?</span>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in...' : 'Log in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Don't have an account?{' '}
          <Link to="/register" className="text-admin-500 font-medium hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
