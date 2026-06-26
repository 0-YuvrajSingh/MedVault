# MedVault

A secure, role-based healthcare management system built with Spring Boot and React.

## Features
- **Role-Based Dashboards**: Distinct experiences for Admins, Doctors, and Patients.
- **Secure Authentication**: JWT-based session management and stateless authentication.
- **Immutable Audit Logs**: Healthcare compliance through append-only audit trails.
- **Patient Management**: Doctors can view and create medical records for assigned patients.
- **Responsive UI**: Built with modern Tailwind CSS and glassmorphism elements.

## Architecture
MedVault follows a classic client-server architecture with strict separation of concerns. The backend exposes a RESTful API protected by Spring Security, and the frontend consumes these APIs using Axios. Data persistence is handled via PostgreSQL, and database schema migrations are managed automatically through Flyway.

## Tech Stack
**Frontend**: React, TypeScript, Vite, Tailwind CSS, React Router, Axios, NGINX
**Backend**: Java 17, Spring Boot (Web, Security, Data JPA), PostgreSQL, Flyway, JJWT, SpringDoc OpenAPI (Swagger)
**Infrastructure**: Docker, Docker Compose, GitHub Actions

## Screenshots
*(Add screenshots of the application here)*
- Homepage (`screenshots/homepage.png`)
- Login Page (`screenshots/login.png`)
- Admin Dashboard (`screenshots/admin.png`)
- Doctor Portal (`screenshots/doctor.png`)
- Patient Portal (`screenshots/patient.png`)
- Swagger UI (`screenshots/swagger.png`)

## API
Interactive API documentation is available via Swagger UI. Once the backend is running, navigate to:
`http://localhost:8080/swagger-ui.html`

## Running
### Using Docker (Recommended)
1. Copy the `.env.example` file to `.env.docker` and configure your `JWT_SECRET`.
2. Start the services:
   ```bash
   docker compose up --build -d
   ```
3. The frontend is accessible at `http://localhost:3000` and the backend at `http://localhost:8080`.

### Local Development
1. Ensure PostgreSQL is running and a database named `medvault` is created.
2. Start the backend: `cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=dev`
3. Start the frontend: `cd frontend && npm install && npm run dev`

## Testing
Run backend unit and integration tests (uses an in-memory H2 database):
```bash
cd backend
mvn test
```

## Future Improvements
- Email verification during registration
- Refresh tokens for extended session management
- Real-time notifications and alerts
- Appointment scheduling module
- File uploads for medical documents and lab results
