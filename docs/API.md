# API Documentation

Base URL: `http://localhost:5000/api`

Authentication
- POST `/auth/register-tenant` — Register a tenant and initial tenant admin. Body: `{ tenantName, subdomain, adminEmail, adminPassword, adminFullName }` (201)
- POST `/auth/login` — Login with `email`, `password`, and optional `tenantSubdomain`. Returns JWT. (200)
- GET `/auth/me` — Get current user (Authorization header required). (200)
- POST `/auth/logout` — Logout (protected route). (200)

Tenants
- GET `/tenants` — List all tenants (super_admin only). (200)
- GET `/tenants/:id` — Get tenant details (super_admin or tenant member). (200)
- PUT `/tenants/:id` — Update tenant (tenant admin or super_admin). (200)
- GET `/tenants/:tenantId/users` — List users for a tenant (tenant member or super_admin). (200)
- POST `/tenants/:tenantId/users` — Add user to tenant (tenant_admin only). Body: `{ email, password, fullName, role }` (201)

Users
- PUT `/users/:id` — Update user (admin or self). Body: `{ fullName, role, isActive }` (200)
- DELETE `/users/:id` — Delete user (tenant_admin only). (200)

Projects
- GET `/projects` — List projects for current tenant. (200)
- POST `/projects` — Create project. Body: `{ name, description }` (201)
- GET `/projects/:id` — Get project details (200)
- PUT `/projects/:id` — Update project (200)
- DELETE `/projects/:id` — Delete project (200)
- GET `/projects/:projectId/tasks` — List tasks for a project (200)
- POST `/projects/:projectId/tasks` — Create task in project. Body: `{ title, description, priority, assignedTo, dueDate }` (201)

Tasks
- PATCH `/tasks/:id/status` — Update task status. Body: `{ status }` (200)
- PUT `/tasks/:id` — Update task details. Body: `{ title, description, priority, assignedTo, dueDate }` (200)
- DELETE `/tasks/:id` — Delete task (200)

Notes
- All protected routes require `Authorization: Bearer <token>` header.
- Tenant isolation: server extracts `tenant_id` from JWT and enforces `WHERE tenant_id = $1` in queries.
- Error responses use a consistent structure via `utils/response.js`.

Examples (curl + sample responses)

1) Register Tenant
```bash
curl -X POST http://localhost:5000/api/auth/register-tenant \
	-H "Content-Type: application/json" \
	-d '{"tenantName":"Acme","subdomain":"acme","adminEmail":"admin@acme.com","adminPassword":"Secret@123","adminFullName":"Acme Admin"}'
```

201 response example:
```json
{
	"success": true,
	"message": "Tenant registered successfully",
	"data": { "tenantId": "<uuid>", "subdomain": "acme", "adminUser": { "id":"<uuid>", "email":"admin@acme.com" } }
}
```

2) Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
	-H "Content-Type: application/json" \
	-d '{"email":"admin@acme.com","password":"Secret@123","tenantSubdomain":"acme"}'
```

200 response example:
```json
{
	"success": true,
	"message": "Login successful",
	"data": {
		"user": { "id":"<uuid>", "email":"admin@acme.com", "fullName": "Acme Admin", "role":"tenant_admin", "tenantId":"<uuid>" },
		"token": "<jwt>",
		"expiresIn": 86400
	}
}
```

3) Get current user (`/auth/me`)
```bash
curl -H "Authorization: Bearer <jwt>" http://localhost:5000/api/auth/me
```

200 response example:
```json
{
	"success": true,
	"message": "User details fetched",
	"data": { "id":"<uuid>", "email":"admin@acme.com", "fullName":"Acme Admin", "tenant": {"id":"<uuid>", "name":"Acme"} }
}
```

4) Create Project
```bash
curl -X POST http://localhost:5000/api/projects \
	-H "Authorization: Bearer <jwt>" -H "Content-Type: application/json" \
	-d '{"name":"Project X","description":"Important"}'
```

201 response example:
```json
{ "success": true, "message": "Project created", "data": { "id":"<uuid>", "name":"Project X", "tenant_id":"<uuid>" } }
```

5) List Projects
```bash
curl -H "Authorization: Bearer <jwt>" http://localhost:5000/api/projects
```

200 response example:
```json
{ "success": true, "message": "Projects fetched", "data": { "projects": [ {"id":"<uuid>","name":"Project X"} ] } }
```

6) Create Task
```bash
curl -X POST http://localhost:5000/api/projects/<projectId>/tasks \
	-H "Authorization: Bearer <jwt>" -H "Content-Type: application/json" \
	-d '{"title":"Fix bug","priority":"high"}'
```

201 response example:
```json
{ "success": true, "message": "Task created", "data": { "id":"<uuid>", "title":"Fix bug", "project_id":"<projectId>" } }
```

7) Update Task Status
```bash
curl -X PATCH http://localhost:5000/api/tasks/<taskId>/status \
	-H "Authorization: Bearer <jwt>" -H "Content-Type: application/json" \
	-d '{"status":"completed"}'
```

200 response example:
```json
{ "success": true, "message": "Task status updated", "data": { "id":"<taskId>", "status":"completed" } }
```

8) Add User to Tenant
```bash
curl -X POST http://localhost:5000/api/tenants/<tenantId>/users \
	-H "Authorization: Bearer <jwt>" -H "Content-Type: application/json" \
	-d '{"email":"user@acme.com","password":"User@123","fullName":"User One","role":"user"}'
```

201 response example:
```json
{ "success": true, "message": "User added successfully", "data": { "id":"<uuid>", "email":"user@acme.com" } }
```

For other endpoints shown above, replace path and body appropriately. If you want, I can expand these to include all minor endpoints and full request/response schemas (JSON Schema) next.
