import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/auth';

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
    <div className="w-full max-w-lg">
      <div className="bg-white rounded-xl shadow-elevated p-8 md:p-10">
        <h2 className="text-2xl font-bold text-text-primary mb-1">Create Account</h2>
        <p className="text-sm text-text-muted mb-8">Join MedVault to access your healthcare dashboard</p>

        {error && (
          <div className="mb-4 p-3 bg-danger-50 border border-danger-200 text-danger-700 text-sm rounded-md">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-success-50 border border-success-400 text-success-700 text-sm rounded-md">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Full Name</label>
            <input type="text" className="input" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
            <input type="email" className="input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Password</label>
            <input type="password" className="input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Confirm Password</label>
            <input type="password" className="input" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className={`p-3 rounded-lg border text-sm font-medium transition-all ${role === 'ROLE_PATIENT' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-border text-text-secondary hover:border-gray-300'}`}
                onClick={() => setRole('ROLE_PATIENT')}
              >
                🏥 Patient
              </button>
              <button
                type="button"
                className={`p-3 rounded-lg border text-sm font-medium transition-all ${role === 'ROLE_DOCTOR' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-border text-text-secondary hover:border-gray-300'}`}
                onClick={() => setRole('ROLE_DOCTOR')}
              >
                🩺 Doctor
              </button>
            </div>
          </div>

          {role === 'ROLE_DOCTOR' && (
            <div className="p-3 bg-warning-50 border border-warning-400 text-warning-600 text-xs rounded-md">
              ⚠️ Doctor accounts require admin approval before login is permitted.
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-500 font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
