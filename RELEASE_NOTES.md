# v1.0.0 — The Clean Release

This release marks the completion of the core MedVault MVP, transitioning from an exploratory build to a production-ready portfolio piece. The entire stack has been strictly aligned with healthcare compliance patterns (like HIPAA).

### 🔒 Security & Architecture
*   **JWT & Authentication**: Token secrets are strictly sourced from environment variables. Role claims and expiry are verified on every request using a stateless filter.
*   **IDOR Prevention**: Patient requests dynamically infer the `userId` via `SecurityContextHolder`. Even with a valid UUID, users cannot fetch unowned records.
*   **Atomic Audit Trails**: Integrated `@Transactional` boundaries. Every newly created `MedicalRecord` securely appends an immutable `AuditLog` entry. Failure to log rolls back the database insert.
*   **Role-Based Access**: Segregated capabilities into Patient, Doctor, and Admin roles. (Doctors are inactive pending admin approval).

### 🖥️ Frontend Rebuild
*   **Axe Legacy Code**: Flushed the bloated and overlapping `/src` folders (slots, appointments, documents).
*   **Architecture**: Built a unified `axios` layer mapped carefully to the backend. Consolidated React context routing.
*   **UI/UX**: Implemented modern glassmorphism panels, updated CSS variables, and styled fully functional dashboards for all three roles.

### 🐳 Infrastructure
*   Added `pg_isready` `healthcheck` in `docker-compose.yml` to prevent race conditions during Spring Boot container startup.
*   Integrated an H2 memory cluster for fast isolated integration testing during `mvn test`.
