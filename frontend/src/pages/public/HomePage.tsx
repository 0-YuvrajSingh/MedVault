import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Database, Lock, User, UserPlus, ShieldCheck, ArrowRight } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section - What & Why */}
      <section className="relative bg-white pt-20 pb-32 border-b border-gray-200 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
           <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#EFF6FF] to-transparent"></div>
           <div className="absolute -top-48 -right-48 w-96 h-96 rounded-full border-[40px] border-[#EFF6FF]"></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#0369A1] rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#0F4C81] mb-6 tracking-tight">
            Your Health Records, Safe and Secure
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium mb-4 leading-relaxed">
            MedVault is a modern platform that connects you directly to your care team while keeping your personal data completely private.
          </p>
          <p className="text-lg text-gray-500 max-w-3xl mx-auto mb-10 leading-relaxed">
            We use bank-level encryption and strict privacy controls to ensure that only you and your authorized doctors can access your health information.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/login" className="px-8 py-3.5 bg-[#0F4C81] hover:bg-[#0A365C] text-white font-bold rounded-lg shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2">
              Login to Portal <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/register" className="px-8 py-3.5 bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-bold rounded-lg shadow-sm transition-all flex items-center gap-2">
              Register Test Account
            </Link>
          </div>
        </div>
      </section>

      {/* Who it is for - Personas */}
      <section className="py-20 bg-slate-50 relative z-20 -mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#0F4C81]">Who It Is For</h2>
            <p className="text-gray-500 mt-2 font-medium">Distinct workflows governed by strict role-based access.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Patient */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mb-6">
                <User className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Patient</h3>
              <p className="text-gray-600 font-medium leading-relaxed mb-6">
                View your own medical records securely. You have full visibility into your health history, knowing your data is private.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li className="flex items-center gap-2">• View personal records</li>
                <li className="flex items-center gap-2">• See doctor assignments</li>
                <li className="flex items-center gap-2">• Guaranteed privacy controls</li>
              </ul>
            </div>

            {/* Doctor */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow transform md:-translate-y-4 border-t-4 border-t-[#0369A1]">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#0369A1] mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Doctor</h3>
              <p className="text-gray-600 font-medium leading-relaxed mb-6">
                Manage care for assigned patients. Doctors can create new medical records and review histories solely for patients under their care.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li className="flex items-center gap-2">• View assigned patients</li>
                <li className="flex items-center gap-2">• Create medical records</li>
                <li className="flex items-center gap-2">• Review patient history</li>
              </ul>
            </div>

            {/* Admin */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-6">
                <UserPlus className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Admin</h3>
              <p className="text-gray-600 font-medium leading-relaxed mb-6">
                Govern the platform. Administrators verify and activate doctor accounts, manage patient assignments, and oversee system audits.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li className="flex items-center gap-2">• Approve/deactivate doctors</li>
                <li className="flex items-center gap-2">• Assign doctors to patients</li>
                <li className="flex items-center gap-2">• View system audit logs</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Security Promise */}
      <section className="py-20 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#0F4C81] to-[#0369A1] rounded-3xl p-10 md:p-14 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
            
            <h2 className="text-3xl font-extrabold text-white mb-8 relative z-10">The Security Promise</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <Lock className="w-8 h-8 text-blue-200 mb-4" />
                <h4 className="text-lg font-bold text-white mb-2">Secure Access</h4>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Every sign-in is protected with industry-standard security. Your session is completely private and expires automatically when you leave.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <ShieldAlert className="w-8 h-8 text-blue-200 mb-4" />
                <h4 className="text-lg font-bold text-white mb-2">Your Privacy Assured</h4>
                <p className="text-blue-100 text-sm leading-relaxed">
                  We enforce strict privacy controls. Our system is built from the ground up to guarantee that your records are never exposed to unauthorized individuals.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <Database className="w-8 h-8 text-blue-200 mb-4" />
                <h4 className="text-lg font-bold text-white mb-2">Full Transparency</h4>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Every time a doctor views or updates your medical record, the system securely logs the action. You'll always have a trustworthy history of your care.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
