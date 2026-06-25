import React from 'react';
import { Link } from 'react-router-dom';

const techBadges = ['Spring Boot', 'Spring Security', 'JWT', 'PostgreSQL', 'React', 'Docker', 'Flyway'];

const features = [
  { title: 'JWT Authentication', desc: 'Stateless token-based authentication with secure claims and expiry enforcement.', icon: '🔐' },
  { title: 'Role-Based Access', desc: 'Three-tier access control separating Admin, Doctor, and Patient permissions.', icon: '🛡️' },
  { title: 'Medical Records', desc: 'Append-only medical records with IDOR prevention and ownership verification.', icon: '📋' },
  { title: 'Audit Logging', desc: 'Immutable audit trail for every record operation, atomically committed.', icon: '📊' },
  { title: 'Docker Deployment', desc: 'Full containerized setup with PostgreSQL health checks and zero local dependencies.', icon: '🐳' },
  { title: 'REST APIs', desc: 'Clean RESTful endpoints documented with Swagger/OpenAPI specifications.', icon: '⚡' },
];

const HomePage: React.FC = () => {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-blue-50" />
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-primary-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-40 w-48 h-48 bg-primary-300 rounded-full blur-2xl" />
        </div>
        <div className="relative container-wide py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-medium mb-6 animate-fade-in">
              <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse-soft" />
              HIPAA-Inspired Architecture
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-text-primary leading-tight mb-6 animate-slide-up">
              Secure Healthcare
              <br />
              <span className="text-gradient">Record Management</span>
            </h1>
            <p className="text-lg text-text-secondary max-w-xl mb-8 animate-slide-up animate-delay-100">
              A full-stack healthcare platform built with Spring Boot, JWT authentication,
              React, and PostgreSQL. Designed with real-world security patterns and role-based access control.
            </p>
            <div className="flex flex-wrap gap-4 animate-slide-up animate-delay-200">
              <Link to="/register" className="btn-primary btn-lg">
                Get Started
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </Link>
              <a href="https://github.com/YuvrajSingh/MedVault" target="_blank" rel="noopener noreferrer" className="btn-secondary btn-lg">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Tech badges */}
      <section className="py-12 bg-white border-y border-border">
        <div className="container-wide">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-text-muted mb-6">Trusted Technologies</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {techBadges.map((tech) => (
              <span key={tech} className="px-4 py-2 bg-gray-50 border border-border rounded-full text-sm font-medium text-text-secondary">{tech}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section bg-surface">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-3">Built for Security</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">Every layer of MedVault is designed with healthcare-grade security patterns and modern engineering practices.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card-elevated p-6 hover:-translate-y-1 transition-transform duration-300">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">{f.title}</h3>
                <p className="text-sm text-text-secondary">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/features" className="btn-secondary">
              View All Features
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Architecture mini */}
      <section className="section bg-white">
        <div className="container-narrow text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-3">Architecture</h2>
          <p className="text-text-secondary mb-10">A clean three-tier architecture designed for clarity and maintainability.</p>
          <div className="flex flex-col items-center gap-4 max-w-xs mx-auto">
            {[
              { label: 'React', sub: 'Frontend SPA', color: 'bg-primary-500' },
              { label: 'Spring Boot', sub: 'REST API + Security', color: 'bg-primary-600' },
              { label: 'PostgreSQL', sub: 'Persistent Storage', color: 'bg-primary-700' },
            ].map((tier, i) => (
              <React.Fragment key={tier.label}>
                {i > 0 && (
                  <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                )}
                <div className={`w-full ${tier.color} text-white rounded-lg p-4`}>
                  <div className="font-semibold">{tier.label}</div>
                  <div className="text-sm opacity-80">{tier.sub}</div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-gradient-to-r from-primary-500 to-primary-700">
        <div className="container-narrow text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to explore?</h2>
          <p className="text-primary-100 mb-8 max-w-xl mx-auto">Create an account to see the platform in action. Patient accounts are active immediately.</p>
          <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary-600 font-semibold rounded-md hover:bg-primary-50 transition-colors shadow-elevated">
            Create Free Account
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
