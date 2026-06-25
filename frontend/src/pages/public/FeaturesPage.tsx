import React from 'react';

const features = [
  { title: 'JWT Authentication', desc: 'Stateless, signed tokens carry userId and role claims. Secrets sourced from environment variables only. Expiry strictly enforced on every request.', icon: '🔐' },
  { title: 'Role-Based Access Control', desc: 'Three distinct roles — Patient, Doctor, Admin — each with precisely scoped permissions. Access decisions derived from JWT claims, never from client input.', icon: '🛡️' },
  { title: 'Medical Records Management', desc: 'Append-only records created by assigned doctors for their patients. Every read verifies ownership via SecurityContext to prevent IDOR attacks.', icon: '📋' },
  { title: 'Immutable Audit Logging', desc: 'Every record creation atomically appends an audit trail entry in the same transaction. The audit log is append-only — no updates, no deletions.', icon: '📊' },
  { title: 'Docker Deployment', desc: 'Complete containerized environment with PostgreSQL health checks gating backend startup. Zero local Java or Node required for the full workflow.', icon: '🐳' },
  { title: 'RESTful API Design', desc: 'Clean REST endpoints organized by domain (auth, admin, doctor, patient). Swagger UI available for interactive exploration and testing.', icon: '⚡' },
];

const FeaturesPage: React.FC = () => (
  <div className="section">
    <div className="container-wide">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-text-primary mb-4">Features</h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          Every feature is implemented end-to-end — from React UI to Spring Boot controller to PostgreSQL storage.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((f) => (
          <div key={f.title} className="card p-8 hover:shadow-card transition-shadow duration-300">
            <div className="text-4xl mb-5">{f.icon}</div>
            <h3 className="text-xl font-semibold text-text-primary mb-3">{f.title}</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default FeaturesPage;
