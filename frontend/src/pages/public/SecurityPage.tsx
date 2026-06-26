import React from 'react';
import { ShieldAlert, CheckCircle2, Lock, FileKey2 } from 'lucide-react';

const securitySections = [
  { 
    title: 'Stateless JWT Authentication', 
    icon: <FileKey2 className="w-6 h-6 text-[#0369A1]" />,
    items: [
      'Token payload contains only userId and role claims.',
      'Secret sourced strictly from environment variables, never hardcoded.',
      'Expiry strictly enforced on every request via custom JwtAuthenticationFilter.',
      'Token is stored in memory in the React frontend, avoiding localStorage XSS vulnerabilities.'
    ] 
  },
  { 
    title: 'Domain-Scoped RBAC', 
    icon: <Lock className="w-6 h-6 text-[#0369A1]" />,
    items: [
      'Three authoritative roles: ROLE_PATIENT, ROLE_DOCTOR, ROLE_ADMIN.',
      'Spring Security @PreAuthorize applied at the controller level.',
      'Doctor accounts are inactive by default until explicit admin activation.',
      'Programmatic ownership assertion at the service layer acts as defense-in-depth.'
    ] 
  },
  { 
    title: 'IDOR Prevention', 
    icon: <ShieldAlert className="w-6 h-6 text-[#0369A1]" />,
    items: [
      'Patient record access uses the JWT-derived userId from the SecurityContext.',
      'URL path parameters are treated as untrusted for authorization decisions.',
      'Patient A cannot access Patient B\'s records, even with the correct UUID.',
      'Doctor access requires an active patient assignment verified server-side.'
    ] 
  },
];

const SecurityPage: React.FC = () => (
  <div className="bg-slate-50 min-h-screen">
    {/* Page Header */}
    <div className="bg-[#0F4C81] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">Security Architecture</h1>
        <p className="text-lg text-blue-100 max-w-2xl mx-auto font-medium">
          How data flows through MedVault — every step is authenticated, authorized, and immutably audited to mimic real-world compliance.
        </p>
      </div>
    </div>

    {/* Details */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      <div className="bg-gradient-to-br from-[#0F4C81] to-[#0369A1] rounded-2xl p-8 text-white mb-12 shadow-md">
         <h2 className="text-2xl font-bold mb-3">Defense in Depth</h2>
         <p className="text-blue-100 font-medium leading-relaxed max-w-3xl">
           MedVault employs a layered security model. From BCrypt strength 12 password hashing at the database layer to CORS origin restrictions at the API gateway, no single layer is entirely trusted.
         </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {securitySections.map((section) => (
          <div key={section.title} className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
                {section.icon}
              </div>
              <h3 className="text-lg font-bold text-[#0F4C81] leading-tight">{section.title}</h3>
            </div>
            <ul className="space-y-4">
              {section.items.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-600 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-[#0369A1] flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default SecurityPage;
