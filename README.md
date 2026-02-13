# Multi-Tenant SaaS Platform

A production-ready, fully Dockerized SaaS application for project and task management. This platform features strict multi-tenancy architecture, Role-Based Access Control (RBAC), and automated environment setup.

## 🚀 Features

* **Multi-Tenancy:** Complete data isolation using a shared-database/shared-schema approach (`tenant_id` row-level security).
* **Authentication:** Secure JWT-based auth with bcrypt password hashing.
* **RBAC System:** Three distinct roles:
    * **Super Admin:** Manages tenants.
    * **Tenant Admin:** Manages users and projects within their organization.
    * **User:** Manages tasks assigned to them.
* **Automated Setup:** Database migrations and seed data run automatically on startup.
* **Audit Logging:** Tracks critical actions (Create, Update, Delete) for security and compliance.
* **Responsive UI:** Built with React and Vite for a fast, modern user experience.

## 🛠️ Technology Stack

* **Frontend:** React.js, Vite, Axios, React Router, React Toastify
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL 15
* **DevOps:** Docker, Docker Compose, Nginx
* **Tools:** Postman, Swagger (API Docs)

## 🏗️ Architecture

The system follows a containerized 3-tier architecture:
1.  **Frontend Container (Port 3000):** Nginx serving the React SPA.
2.  **Backend Container (Port 5000):** Node.js API handling business logic.
3.  **Database Container (Port 5432):** PostgreSQL with persistent volume storage.



---

## 📦 Installation & Setup

### Prerequisites
* Docker Desktop installed and running.
* Git installed.

### Quick Start (Mandatory for Evaluation)
This project is configured to run with a single command.

1.  **Clone the Repository**
    ```bash
    git clone <your-repo-url>
    cd multi-tenant-saas
    ```

2.  **Start the Application**
    ```bash
    docker-compose up -d --build
    ```

3.  **Wait for Initialization**
    * Wait approx. 30 seconds for the database to initialize, run migrations, and seed data.
    * You can check the status with: `docker-compose logs -f backend`

4.  **Access the App**
    * **Frontend:** [http://localhost:3000](http://localhost:3000)
    * **Backend Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🧪 Test Credentials

The database is automatically seeded with these accounts for testing purposes.

| Role | Email | Password | Tenant |
| :--- | :--- | :--- | :--- |
| **Tenant Admin** | `admin@demo.com` | `Demo@123` | Demo Company |
| **Regular User** | `user1@demo.com` | `User@123` | Demo Company |
| **Super Admin** | `superadmin@system.com` | `Admin@123` | *System Wide* |

*Note: You can also register a new tenant organization via the "Register" page on the frontend.*

---

## 📚 Documentation

Detailed documentation is available in the `docs/` folder:

* **[Research & Analysis](docs/research.md):** Justification of the multi-tenancy approach and tech stack.
* **[Product Requirements (PRD)](docs/PRD.md):** Detailed breakdown of functional and non-functional requirements.
* **[System Architecture](docs/architecture.md):** Diagrams and database schema explanation.
* **[Technical Specification](docs/technical-spec.md):** Folder structure and environment setup guide.
* **[API Documentation](docs/API.md):** List of all 22 API endpoints.


