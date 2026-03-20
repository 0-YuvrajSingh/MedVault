# MedVault

MedVault is a full-stack patient record management and appointment scheduling platform with secure role-based access control.

![Java](https://img.shields.io/badge/Java-17-007396?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-6DB33F?logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)

## Features

- Authentication with JWT and role-based access control (PATIENT, DOCTOR, ADMIN)
- Appointment booking and slot management
- Medical record upload and management
- Document permission sharing between patients and doctors
- Audit logging via AOP
- Database-backed notifications
- Doctor profile verification workflow
- Admin panel for users, doctors, patients, and reports

## Project Structure

```text
medvault/
├── backend/        # Spring Boot (Java 17)
│   ├── src/main/java/com/medvault
│   ├── src/main/resources
│   └── pom.xml
├── frontend/       # React 18 + Vite
│   ├── src/
│   └── package.json
├── .gitignore
└── README.md
```

## Getting Started

### Backend Setup

1. Go to backend folder.
2. Configure environment variables (see table below).
3. Run the Spring Boot app:

```bash
cd backend
./mvnw spring-boot:run
```

Windows PowerShell:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

### Frontend Setup

1. Go to frontend folder.
2. Install dependencies.
3. Start development server.

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `DB_URL` | MySQL JDBC URL |
| `DB_USERNAME` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRATION` | JWT expiration time in milliseconds |
| `MAIL_HOST` | SMTP host |
| `MAIL_PORT` | SMTP port |
| `MAIL_USERNAME` | SMTP username/email |
| `MAIL_PASSWORD` | SMTP password/app password |
| `FILE_UPLOAD_DIR` | Base upload directory |
| `MEDICAL_RECORDS_DIR` | Medical records upload directory |
| `DOCUMENTS_DIR` | General documents upload directory |
| `PROFILE_IMAGES_DIR` | Profile image upload directory |
| `MAX_FILE_SIZE` | Max single upload size |
| `MAX_REQUEST_SIZE` | Max multipart request size |
| `JPA_DDL_AUTO` | Hibernate schema mode (`update` recommended for local dev) |
| `JPA_SHOW_SQL` | Toggle SQL logging |
| `HIBERNATE_FORMAT_SQL` | Toggle SQL formatting |
| `LOG_LEVEL_ROOT` | Root logging level |
| `LOG_LEVEL_APP` | Application package logging level |
| `LOG_FILE` | Log output file path |
| `LOG_PATTERN_CONSOLE` | Console log pattern |

## API Overview

- `/api/auth` - authentication and token workflows
- `/api/patients` - patient profile and patient domain actions
- `/api/doctors` - doctor profile and doctor domain actions
- `/api/appointments` - appointment lifecycle management
- `/api/slots` - doctor availability slots
- `/api/records` - medical records operations
- `/api/documents` - document upload and verification workflows
- `/api/notifications` - user notifications
- `/api/audit` - audit trail endpoints
- `/api/admin` - admin-only management operations

## Author

Built by Yuvraj Singh.
