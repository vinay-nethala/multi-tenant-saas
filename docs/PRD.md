# Product Requirements Document (PRD)

## 1. User Personas

### A. Super Admin
* **Role:** System Owner.
* **Goal:** Monitor system health, view all tenants, manage subscription plans.
* **Pain Points:** Cannot easily see which tenants are active or churning.

### B. Tenant Admin (Organization Manager)
* **Role:** Manager of a specific company (Tenant).
* **Goal:** Manage their team members, oversee projects, ensure billing is correct.
* **Responsibilities:** Add users, create projects, assign tasks.

### C. End User (Team Member)
* **Role:** Employee of the tenant.
* **Goal:** Complete assigned tasks efficiently.
* **Pain Points:** Confusing interface, hard to find assigned work.

## 2. Functional Requirements

### Authentication Module
* **FR-001:** The system shall allow new organizations to register via a signup form.
* **FR-002:** The system shall allow users to login using email, password, and tenant subdomain.
* **FR-003:** The system shall issue a JWT upon successful login.

### Tenant Management
* **FR-004:** The system shall isolate data so Tenant A cannot access Tenant B's data.
* **FR-005:** The system shall enforce unique subdomains for tenants.
* **FR-006:** The system shall allow Tenant Admins to view their organization details.

### User Management
* **FR-007:** Tenant Admins shall be able to add new users to their organization.
* **FR-008:** The system shall enforce subscription limits (Max Users) before adding a user.
* **FR-009:** Users shall have roles (Admin vs User) determining their permissions.

### Project Management
* **FR-010:** Users shall be able to create new projects.
* **FR-011:** The system shall enforce subscription limits (Max Projects).
* **FR-012:** Users shall be able to view a list of projects for their tenant.

### Task Management
* **FR-013:** Users shall be able to add tasks to a specific project.
* **FR-014:** Users shall be able to change the status of a task (Todo -> Done).
* **FR-015:** Tasks shall display the assignee and priority level.

## 3. Non-Functional Requirements
* **NFR-001 (Performance):** API response time should be under 300ms.
* **NFR-002 (Security):** All passwords must be hashed using Bcrypt.
* **NFR-003 (Scalability):** Database schema must support indexing on `tenant_id`.
* **NFR-004 (Availability):** The system must be containerized for easy deployment/restart.
* **NFR-005 (Usability):** The UI must be responsive and work on mobile devices.