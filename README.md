# MedVault

MedVault is a secure patient record management platform with strict role-based access control and comprehensive audit logging. It enforces hardened domain rules to ensure patient privacy, robust assignment logic, and immutable audit trails.

![Java](https://img.shields.io/badge/Java-17-007396?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-6DB33F?logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)

---

## 🏛 Architecture Diagram

```text
                  +--------------------------------+
                  |         React Frontend         |
                  |  (Vite, Axios, Tailwind CSS)   |
                  +---------------+----------------+
                                  |
                                  | Stateless JWT
                                  | (Authorization Header)
                                  v
                  +---------------+----------------+
                  |    Spring Boot Backend         |
                  |--------------------------------|
                  |  - Spring Security (Filters)   |
                  |  - Controllers & DTOs          |
                  |  - Services (@Transactional)   |
                  |  - Spring Data JPA             |
                  +---------------+----------------+
                                  |
                                  | JDBC / Hibernate
                                  v
                  +---------------+----------------+
                  |    PostgreSQL Database         |
                  |--------------------------------|
                  |  - users                       |
                  |  - medical_records             |
                  |  - patient_doctor_assignments  |
                  |  - audit_log                   |
                  +--------------------------------+
```

## 🔐 Role-Based Access Control (RBAC)

The system leverages JWT-derived roles and identity context. Path parameters are strictly untrusted for authorization (preventing IDOR).

| Role | Access Level & Permissions |
|---|---|
| **PATIENT** | Read-only access exclusively to their *own* medical records. Identity is securely extracted from the JWT token. |
| **DOCTOR** | Can list assigned patients and append records to assigned patients. *Must be activated by an admin before login is permitted.* |
| **ADMIN** | Can view all system users, manually activate/deactivate DOCTOR accounts, map DOCTOR <-> PATIENT assignments, and view immutable audit trails. |

## 🚀 Getting Started (Cold Start)

The easiest way to boot the entire stack is via Docker. 

### Prerequisites
- Docker & Docker Compose installed.
- Ports `8080`, `5173`, and `5432` available.

### Setup Flow

1. **Clone & Boot Stack**
```bash
docker-compose up --build -d
```
*Note: The backend service will automatically wait for the PostgreSQL `pg_isready` healthcheck before booting.*

2. **Access the Services**
- **Frontend Dashboard**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:8080/api](http://localhost:8080/api)
- **Swagger Documentation**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

3. **Stop the Stack**
```bash
docker-compose down
```

## 📡 API Endpoints

All endpoints beneath `/api` (excluding `/auth/**`) strictly require a valid Bearer token.

| Domain | Method | Endpoint | Description | Role Required |
|---|---|---|---|---|
| **Auth** | POST | `/api/auth/register` | Register a new PATIENT or DOCTOR. | *Public* |
| **Auth** | POST | `/api/auth/login` | Authenticate and retrieve JWT. | *Public* |
| **Patient** | GET | `/api/patient/records` | Fetch all records for the caller. | `PATIENT` |
| **Patient** | GET | `/api/patient/records/{id}` | Fetch a specific record for the caller. | `PATIENT` |
| **Doctor** | GET | `/api/doctor/patients` | List all patients assigned to caller. | `DOCTOR` |
| **Doctor** | GET | `/api/doctor/patients/{id}/records` | View records of assigned patient. | `DOCTOR` |
| **Doctor** | POST | `/api/doctor/patients/{id}/records` | Create record for assigned patient. | `DOCTOR` |
| **Admin** | GET | `/api/admin/users` | List all users in the system. | `ADMIN` |
| **Admin** | PATCH | `/api/admin/doctors/{id}/activate` | Approve an inactive doctor. | `ADMIN` |
| **Admin** | PATCH | `/api/admin/doctors/{id}/deactivate`| Suspend a doctor. | `ADMIN` |
| **Admin** | POST | `/api/admin/assignments` | Assign a DOCTOR to a PATIENT. | `ADMIN` |
| **Admin** | GET | `/api/admin/records/{id}/audit` | View audit trail for a record. | `ADMIN` |

## 📸 Screenshots

*(Replace placeholders with actual UI screenshots before release)*

### Patient Dashboard
> `![Patient Dashboard Placeholder](./assets/screenshots/patient-dashboard.png)`

### Doctor Dashboard
> `![Doctor Dashboard Placeholder](./assets/screenshots/doctor-dashboard.png)`

### Admin Management
> `![Admin View Placeholder](./assets/screenshots/admin-dashboard.png)`

---

## 💻 Local Development (Without Docker)

1. Ensure a local PostgreSQL instance is running on `5432` with user `medvault_user` / `medvault_password` and DB `medvault_db`.
2. Boot Backend: `cd backend && ./mvnw spring-boot:run`
3. Boot Frontend: `cd frontend && npm install && npm run dev`
