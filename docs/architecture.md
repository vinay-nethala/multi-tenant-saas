# System Architecture

## 1. High-Level Architecture
[Browser Client] <--> [Nginx (Frontend Container)] <--> [Express API (Backend Container)] <--> [PostgreSQL (DB Container)]

1.  **Client:** React SPA handling UI and Auth state.
2.  **API Gateway:** Nginx serves the static React files and proxies API requests (in production) or connects directly via Docker network.
3.  **Backend:** Node.js/Express handling business logic, JWT validation, and RBAC.
4.  **Database:** PostgreSQL storing relational data with `tenant_id` isolation.

## 2. Database Schema (ERD)

View the diagrams in the `docs/images/` folder:

- System architecture diagram: [docs/images/system-architecture.svg](docs/images/system-architecture.svg)
- Database ERD: [docs/images/database-erd.svg](docs/images/database-erd.svg)

### Summary of key tables
#### Tenants
- `id` (UUID, PK)
- `subdomain` (Unique)
- `plan`, `max_users`, `max_projects`

#### Users
- `id` (UUID, PK)
- `tenant_id` (FK -> Tenants)
- `email`, `password_hash`, `role` (super_admin, tenant_admin, user)

#### Projects
- `id` (UUID, PK)
- `tenant_id` (FK -> Tenants)
- `name`, `status`, `created_by`

#### Tasks
- `id` (UUID, PK)
- `project_id` (FK -> Projects)
- `tenant_id` (FK -> Tenants)
- `assigned_to` (FK -> Users), `status`, `priority`

## 3. Data Flow
1.  **Request:** User sends request with JWT in Header.
2.  **Middleware:** Backend decodes JWT, extracts `tenant_id`.
3.  **Controller:** Logic appends `tenant_id` to SQL query.
4.  **Database:** Executes query constrained by `tenant_id`.
5.  **Response:** Data returned to client.