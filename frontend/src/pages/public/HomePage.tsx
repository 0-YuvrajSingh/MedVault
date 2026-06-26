import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Database, Lock, Server, FileCode2, ArrowRight, Github, Terminal, Layers, Play } from 'lucide-react';

const coreFeatures = [
  { icon: <Lock className="w-8 h-8" />, name: '3-Role RBAC System', desc: 'Patient, Doctor, and Admin roles strictly enforced via JWT claims and @PreAuthorize.' },
  { icon: <ShieldAlert className="w-8 h-8" />, name: 'IDOR Prevention', desc: 'Domain-sensitive access control where patients can strictly view only their own records.' },
  { icon: <Database className="w-8 h-8" />, name: 'Immutable Audit Logging', desc: 'Every record mutation appended atomically within a single @Transactional boundary.' },
  { icon: <Server className="w-8 h-8" />, name: 'Docker Orchestration', desc: 'Full-stack containerization with health checks and zero local runtime dependencies.' },
];

const HomePage: React.FC = () => {
  return (
    <div className="bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-white pt-16 pb-32 border-b border-gray-200 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
           <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#EFF6FF] to-transparent"></div>
           <div className="absolute -top-48 -right-48 w-96 h-96 rounded-full border-[40px] border-[#EFF6FF]"></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#D2B48C] mb-3 tracking-tight">Portfolio-Grade Engineering.</h1>
          <h2 className="text-2xl md:text-3xl font-bold text-[#0F4C81] mb-6">Secure Healthcare Record Management Platform</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto font-medium mb-4">
            Built a HIPAA-inspired, JWT-secured healthcare REST API with 3-role RBAC, full audit logging, Flyway-managed schema, and Docker Compose deployment.
          </p>
          <a href="https://github.com/YuvrajSingh/MedVault" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-[#0369A1] hover:underline underline-offset-4 flex items-center justify-center gap-1">
            <Github className="w-4 h-4" /> View Source Code
          </a>
        </div>
      </section>

      {/* Action Widget (Overlapping Hero) */}
      <div className="max-w-5xl mx-auto px-4 relative z-20 -mt-20 mb-16">
        
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-[#0F4C81] mb-1">Explore the Live Platform</h3>
            <p className="text-sm text-gray-500 font-medium">Test the multi-role RBAC system by registering as a patient or doctor.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Link to="/login" className="flex-1 md:flex-none px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-lg shadow-sm transition-colors text-center">
              Login to Portal
            </Link>
            <Link to="/register" className="flex-1 md:flex-none px-8 py-3 bg-[#0F4C81] hover:bg-[#0A365C] text-white font-bold rounded-lg shadow-md transition-colors text-center">
              Register Account
            </Link>
          </div>
        </div>

        {/* Quick Tech Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Terminal className="w-8 h-8 text-[#0369A1]" />, title: 'Spring Boot 3', desc: 'Java REST API' },
            { icon: <Lock className="w-8 h-8 text-[#0369A1]" />, title: 'Spring Security', desc: 'Stateless JWT' },
            { icon: <Database className="w-8 h-8 text-[#0369A1]" />, title: 'PostgreSQL', desc: 'Flyway Migrations' },
            { icon: <FileCode2 className="w-8 h-8 text-[#0369A1]" />, title: 'React 18', desc: 'Vite & TailwindCSS' }
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <div className="mb-3 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
              <h4 className="font-bold text-[#0F4C81] text-sm mb-1">{item.title}</h4>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Core Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Features List */}
            <div className="lg:col-span-2">
              <div className="flex border-b border-gray-200 mb-8">
                <button className="px-6 py-3 border-b-2 border-[#0369A1] text-[#0369A1] font-bold text-lg">Core Features</button>
                <Link to="/security" className="px-6 py-3 text-gray-500 font-bold text-lg hover:text-gray-900 transition-colors">Security Architecture</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {coreFeatures.map((feat, i) => (
                  <Link to="/features" key={i} className="flex items-start gap-4 p-4 rounded-xl border border-transparent hover:border-gray-200 hover:shadow-sm transition-all group">
                    <div className="text-[#0369A1] group-hover:scale-110 transition-transform duration-300 flex-shrink-0 mt-1">{feat.icon}</div>
                    <div>
                      <span className="block font-bold text-gray-900 group-hover:text-[#0369A1] transition-colors mb-1">{feat.name}</span>
                      <span className="block text-xs font-medium text-gray-500 leading-relaxed">{feat.desc}</span>
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/features" className="inline-flex items-center gap-1 mt-8 font-bold text-[#0369A1] hover:underline">
                View all features <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Resume Callout Box */}
            <div className="bg-gradient-to-br from-[#0F4C81] to-[#0369A1] rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
              <h3 className="text-3xl font-extrabold mb-4 leading-tight">Production-Level Engineering</h3>
              <p className="text-blue-100 font-medium mb-8 leading-relaxed">
                Designed to provide top-quartile portfolio signal for Java backend roles by implementing real-world compliance patterns.
              </p>
              <Link to="/about" className="inline-flex items-center justify-between px-6 py-3 bg-[#0369A1] hover:bg-[#02598B] border border-blue-400/30 rounded-lg font-bold shadow-lg transition-colors w-full">
                View Project Goals <ArrowRight className="w-4 h-4" />
              </Link>
              
              <div className="absolute right-8 top-1/2 -translate-y-1/2 w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                <Layers className="w-8 h-8 text-white" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Production Architecture */}
      <section className="py-20 bg-slate-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-extrabold text-[#0F4C81]">Application Architecture</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col p-6 group hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-[#0369A1] mb-4">
                <FileCode2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-[#0369A1] transition-colors">React Frontend</h4>
              <p className="text-sm text-gray-600 font-medium leading-relaxed mb-4">
                Single Page Application served by Nginx. Manages stateless JWT authentication in React context. Features controlled forms, role-based route guards, and Axios interceptors.
              </p>
              <span className="text-xs font-bold text-gray-400 mt-auto uppercase">Port 3000</span>
            </div>

            <div className="bg-[#0F4C81] text-white rounded-xl shadow-md overflow-hidden flex flex-col p-6 transform scale-105 z-10 border border-blue-900">
              <div className="w-12 h-12 bg-[#0369A1] rounded-lg flex items-center justify-center text-white mb-4">
                <Terminal className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-lg mb-2">Spring Boot API</h4>
              <p className="text-sm text-blue-100 font-medium leading-relaxed mb-4">
                Strict layered architecture (Controller → Service → Repository). Implements @Transactional methods, Bean Validation, GlobalExceptionHandler, and OncePerRequestFilter JWT validation.
              </p>
              <span className="text-xs font-bold text-blue-300 mt-auto uppercase">Port 8080</span>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col p-6 group hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-[#0369A1] mb-4">
                <Database className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-[#0369A1] transition-colors">PostgreSQL Database</h4>
              <p className="text-sm text-gray-600 font-medium leading-relaxed mb-4">
                5-table schema strictly managed by Flyway migrations. Features an append-only audit_log table and secure BCrypt password hashing.
              </p>
              <span className="text-xs font-bold text-gray-400 mt-auto uppercase">Port 5432</span>
            </div>

          </div>
        </div>
      </section>

      {/* Deployment & DevOps */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-10">
            <h2 className="text-2xl font-extrabold text-[#0F4C81]">DevOps & Deployment</h2>
            <a href="https://github.com/YuvrajSingh/MedVault" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-[#0369A1] flex items-center gap-1 hover:underline">View Docker Compose <ArrowRight className="w-3 h-3" /></a>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-gray-900 rounded-xl p-6 shadow-inner font-mono text-sm text-gray-300 h-full flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4 border-b border-gray-700 pb-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="ml-2 text-gray-500 text-xs">terminal</span>
                </div>
                <p className="text-green-400">$ git clone https://github.com/YuvrajSingh/MedVault.git</p>
                <p className="text-green-400">$ cp .env.example .env</p>
                <p className="text-green-400">$ docker-compose up --build</p>
                <br/>
                <p>Creating network "medvault-net" with the default driver</p>
                <p>Building backend... [DONE]</p>
                <p>Building frontend... [DONE]</p>
                <p>Starting postgres_db... [OK]</p>
                <p>Starting medvault_api... [OK]</p>
                <p>Starting medvault_ui... [OK]</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-6">
              {[
                { title: 'Multi-stage Docker Builds', desc: 'maven:3.9 build → openjdk:17-alpine runtime to drastically reduce container image sizes.' },
                { title: 'Docker Compose Orchestration', desc: 'Single-command deployment linking all three services over a shared internal Docker network.' },
                { title: 'Health Checks & Dependencies', desc: 'API startup strictly gated by PostgreSQL pg_isready health checks using depends_on conditions.' },
                { title: 'Environment Variable Injection', desc: 'Zero hardcoded secrets. DB credentials and JWT signing keys injected securely at runtime.' },
              ].map((item, i) => (
                <div key={i} className="group">
                  <h4 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-[#0369A1] transition-colors leading-snug">{item.title}</h4>
                  <p className="text-xs font-medium text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
