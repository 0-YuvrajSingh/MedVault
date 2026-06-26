import React from 'react';
import { Target, ShieldCheck, ChevronRight, Briefcase } from 'lucide-react';

const AboutPage: React.FC = () => (
  <div className="bg-slate-50 min-h-screen">
    {/* Header */}
    <div className="bg-[#0F4C81] py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">About The Project</h1>
        <p className="text-lg text-blue-100 max-w-2xl mx-auto font-medium leading-relaxed">
          A portfolio-grade engineering project demonstrating production-level Java Spring Boot backend development.
        </p>
      </div>
    </div>

    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      
      {/* Positioning */}
      <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#0369A1]">
                <Target className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-[#0F4C81]">Project Goals</h2>
            </div>
            <p className="text-gray-600 font-medium leading-relaxed">
              MedVault was built as a fixed-scope, 8-week execution project targeting SDE Internship and SDE-1 Off-Campus hiring signals. It aims to exceed the "average CRUD app" bar by implementing real-world access controls in a compliance-regulated domain.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#0369A1]">
                <Briefcase className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-[#0F4C81]">Hiring Signal</h2>
            </div>
            <p className="text-gray-600 font-medium leading-relaxed">
              Healthcare data security + atomic audit trails + Spring Security depth + Flyway migrations + Docker orchestration = top-quartile portfolio signal for Java backend engineering roles.
            </p>
          </div>
        </div>
      </div>

      {/* Why Healthcare? */}
      <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
          <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#0369A1]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-[#0F4C81]">Why The Healthcare Domain?</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
             <ChevronRight className="w-5 h-5 text-[#0369A1] mt-0.5 flex-shrink-0" />
             <p className="text-gray-600 font-medium">Healthcare is one of the most compliance-regulated domains. Implementing controlled record access shows awareness of real-world data security concerns.</p>
          </div>
          <div className="flex items-start gap-3">
             <ChevronRight className="w-5 h-5 text-[#0369A1] mt-0.5 flex-shrink-0" />
             <p className="text-gray-600 font-medium">RBAC with domain-scoped data access goes beyond simple role checks — it demonstrates context-aware authorization.</p>
          </div>
          <div className="flex items-start gap-3">
             <ChevronRight className="w-5 h-5 text-[#0369A1] mt-0.5 flex-shrink-0" />
             <p className="text-gray-600 font-medium">An immutable <code className="bg-gray-100 px-1 py-0.5 rounded text-sm text-gray-800">audit_log</code> table is a direct analog to what fintech and legal SaaS companies implement, making it highly recognizable in interviews.</p>
          </div>
        </div>
      </div>

    </div>
  </div>
);

export default AboutPage;
