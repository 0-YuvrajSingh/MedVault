import React from 'react';

const AboutPage: React.FC = () => (
  <div className="section">
    <div className="container-narrow">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-text-primary mb-4">About MedVault</h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          A portfolio project demonstrating production-grade healthcare software engineering.
        </p>
      </div>

      <div className="space-y-12">
        {/* Purpose */}
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Purpose</h2>
          <p className="text-text-secondary leading-relaxed">
            MedVault is a full-stack patient record management platform built to demonstrate secure, role-based healthcare data handling. It showcases real-world patterns like JWT authentication, IDOR prevention, atomic audit logging, and Docker deployment — the kind of engineering decisions that matter in production healthcare systems.
          </p>
        </div>

        {/* Tech Stack */}
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Tech Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-text-primary mb-2">Backend</h3>
              <ul className="space-y-1.5 text-sm text-text-secondary">
                <li>• Java 17 + Spring Boot 3.2</li>
                <li>• Spring Security + JWT (jjwt)</li>
                <li>• Spring Data JPA + Hibernate</li>
                <li>• PostgreSQL 15</li>
                <li>• Flyway Migrations</li>
                <li>• Swagger / OpenAPI 3</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-text-primary mb-2">Frontend</h3>
              <ul className="space-y-1.5 text-sm text-text-secondary">
                <li>• React 18 + TypeScript</li>
                <li>• Vite Build System</li>
                <li>• React Router v7</li>
                <li>• Tailwind CSS 3</li>
                <li>• Axios HTTP Client</li>
                <li>• jwt-decode for token parsing</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Architecture */}
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Architecture Decisions</h2>
          <div className="space-y-4 text-sm text-text-secondary">
            <div>
              <h3 className="font-semibold text-text-primary">Stateless JWT Authentication</h3>
              <p>No server-side sessions. The JWT carries userId and role claims. The JwtAuthenticationFilter populates the SecurityContext principal directly from the token, bypassing database lookups on every request.</p>
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">IDOR-Safe Design</h3>
              <p>Patient identity is always derived from the JWT SecurityContext, never from URL path parameters. Even if a patient guesses another patient's record UUID, the server rejects the request.</p>
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">Atomic Audit Logging</h3>
              <p>Record creation and audit trail writes happen within a single @Transactional boundary. If either operation fails, both are rolled back — guaranteeing data consistency.</p>
            </div>
          </div>
        </div>

        {/* Challenges */}
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Challenges & Lessons</h2>
          <div className="space-y-3 text-sm text-text-secondary">
            <p>• <strong>Identity normalization:</strong> Migrated from firstName/lastName to fullName across all layers — entity, SQL migration, DTOs, and frontend forms.</p>
            <p>• <strong>Role string consistency:</strong> Standardized on ROLE_PATIENT, ROLE_DOCTOR, ROLE_ADMIN across JWT claims, Spring Security authorities, and frontend route guards.</p>
            <p>• <strong>Scope discipline:</strong> Removed features that weren't backed by real endpoints (appointments, notifications, file uploads) to keep the frontend honest to the backend surface.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default AboutPage;
