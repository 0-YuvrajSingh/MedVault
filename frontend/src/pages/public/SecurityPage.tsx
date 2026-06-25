import React from 'react';

const timelineSteps = [
  { title: 'Patient Registers', desc: 'Account is created and immediately active. Identity is stored with bcrypt-hashed password.' },
  { title: 'Admin Assigns Doctor', desc: 'Admin creates a patient-doctor assignment. Duplicate assignments return 409 Conflict.' },
  { title: 'Doctor Creates Record', desc: 'Doctor can only write records for assigned patients. Assignment is verified server-side.' },
  { title: 'Audit Trail Logged', desc: 'Record creation and audit entry are committed in a single transaction. Failure rolls back both.' },
  { title: 'Patient Retrieves Record', desc: 'Patient identity is derived from JWT claims in SecurityContext. Path parameters are never trusted for ownership.' },
];

const securitySections = [
  { title: 'JWT Token Security', items: ['Token contains only userId and role claims', 'Secret sourced from environment variable, never hardcoded', 'Expiry enforced on every request via JwtAuthenticationFilter', 'Token stored in memory only — no localStorage'] },
  { title: 'Role-Based Access Control', items: ['Three roles: ROLE_PATIENT, ROLE_DOCTOR, ROLE_ADMIN', 'Spring Security @PreAuthorize on every controller', 'Doctor accounts inactive by default until admin activation', 'Inactive doctor login returns 403 AccountNotActiveException'] },
  { title: 'IDOR Prevention', items: ['Patient record access uses JWT-derived userId from SecurityContext', 'Path parameters are untrusted for authorization decisions', 'Patient A cannot access Patient B records, even with the correct UUID', 'Doctor access requires an active assignment verified server-side'] },
  { title: 'Atomic Transactions', items: ['Record creation and audit logging in a single @Transactional boundary', 'Failed audit write rolls back the medical record insertion', 'Audit log is append-only — no UPDATE or DELETE operations', 'Every state change is traceable through the audit trail'] },
];

const SecurityPage: React.FC = () => (
  <div>
    {/* Timeline */}
    <section className="section bg-surface">
      <div className="container-narrow">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-text-primary mb-4">Security Architecture</h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            How data flows through MedVault — every step is authenticated, authorized, and audited.
          </p>
        </div>
        <div className="relative max-w-lg mx-auto">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-primary-200" />
          {timelineSteps.map((step, i) => (
            <div key={i} className="relative pl-16 pb-10 last:pb-0">
              <div className="absolute left-4 top-1 w-5 h-5 bg-primary-500 rounded-full border-4 border-primary-100" />
              <h3 className="text-lg font-semibold text-text-primary mb-1">{step.title}</h3>
              <p className="text-sm text-text-secondary">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Security details */}
    <section className="section bg-white">
      <div className="container-wide">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {securitySections.map((section) => (
            <div key={section.title} className="card p-8">
              <h3 className="text-xl font-semibold text-text-primary mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-text-secondary">
                    <svg className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default SecurityPage;
