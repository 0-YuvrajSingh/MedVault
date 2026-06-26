import React from 'react';
import { ShieldCheck, Lock, Database, Code2, AlertTriangle, Workflow, Network, Server, Key } from 'lucide-react';
import { Link } from 'react-router-dom';

const coreFeatures = [
  { icon: <Lock className="w-8 h-8 text-[#0369A1]" />, title: 'Multi-Actor RBAC', desc: 'Domain-sensitive Role-Based Access Control where a PATIENT can only view their own records, a DOCTOR views assigned patients, and an ADMIN manages accounts.' },
  { icon: <Key className="w-8 h-8 text-[#0369A1]" />, title: 'Stateless JWT Auth', desc: 'Token encodes userId and role. OncePerRequestFilter validates signature and expiry, setting the SecurityContext without database lookups.' },
  { icon: <ShieldCheck className="w-8 h-8 text-[#0369A1]" />, title: 'IDOR Prevention', desc: 'Patient identity is strictly derived from the JWT claims in the SecurityContext. URL path parameters are never trusted for authorization.' },
  { icon: <Database className="w-8 h-8 text-[#0369A1]" />, title: 'Immutable Audit Logging', desc: 'Every CREATE/UPDATE on medical_records is appended to the audit_log table. No UPDATE or DELETE is ever executed on the audit table.' },
  { icon: <Workflow className="w-8 h-8 text-[#0369A1]" />, title: 'Atomic Transactions', desc: 'Record creation and audit logging occur in a single @Transactional boundary. A failed audit write immediately rolls back the medical record.' },
  { icon: <Network className="w-8 h-8 text-[#0369A1]" />, title: 'Flyway Schema Migrations', desc: '5-table PostgreSQL schema strictly managed and versioned (V1 to V5) using Flyway, preventing manual database drift.' },
  { icon: <AlertTriangle className="w-8 h-8 text-[#0369A1]" />, title: 'Global Exception Handling', desc: '@RestControllerAdvice provides a consistent ErrorResponse schema for 400 (Validation), 403 (Access Denied), 404, and 409 (Conflict).' },
  { icon: <Code2 className="w-8 h-8 text-[#0369A1]" />, title: 'Clean REST API Design', desc: 'Strict separation of JPA entities and DTOs. Entities are never returned in responses. Nested resources express domain ownership.' },
  { icon: <Server className="w-8 h-8 text-[#0369A1]" />, title: 'Docker Compose', desc: 'Multi-stage Docker builds for Spring Boot and React/Nginx. Deploys with a single command with Postgres healthcheck gating.' },
];

const FeaturesPage: React.FC = () => (
  <div className="bg-slate-50 min-h-screen">
    {/* Page Header */}
    <div className="bg-[#0F4C81] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">Core Platform Features</h1>
        <p className="text-lg text-blue-100 max-w-2xl mx-auto font-medium">
          MedVault implements advanced backend engineering patterns required in compliance-heavy domains like healthcare and fintech.
        </p>
      </div>
    </div>

    {/* Features Grid */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coreFeatures.map((feat) => (
          <div key={feat.title} className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm hover:shadow-md hover:border-[#0369A1] transition-all duration-300 group">
            <div className="w-14 h-14 bg-[#EFF6FF] rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              {feat.icon}
            </div>
            <h3 className="text-xl font-bold text-[#0F4C81] mb-3 group-hover:text-[#0369A1] transition-colors">{feat.title}</h3>
            <p className="text-sm text-gray-600 font-medium leading-relaxed mb-6">{feat.desc}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-12 text-center">
         <Link to="/security" className="inline-flex items-center gap-2 px-6 py-3 bg-[#0369A1] hover:bg-[#02598B] text-white font-bold rounded-lg shadow-md transition-colors">
            Explore Security Architecture
         </Link>
      </div>
    </div>
  </div>
);

export default FeaturesPage;
