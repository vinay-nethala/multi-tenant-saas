# Research & Requirements Analysis

## 1. Multi-Tenancy Approach Analysis

Building a Multi-Tenant SaaS requires choosing how to isolate data. We analyzed three common patterns:

### Option A: Separate Databases (Database-per-tenant)
Every tenant gets their own dedicated database instance.
* **Pros:** Ultimate data isolation (security), easy compliance (GDPR), no "noisy neighbor" performance issues.
* **Cons:** Extremely expensive (high infrastructure cost), difficult to maintain (running migrations on 1000 DBs), hard to aggregate analytics.

### Option B: Shared Database, Separate Schemas
One database, but each tenant gets a separate schema (namespace).
* **Pros:** Good logical isolation, easier backup/restore per tenant than shared schema.
* **Cons:** High overhead on the database engine as tenant count grows (Postgres slows down with thousands of schemas), complex migration scripts.

### Option C: Shared Database, Shared Schema (Row-level Isolation)
One database, one schema. All tenants share the same tables (`users`, `projects`), but every table has a `tenant_id` column.
* **Pros:** Lowest cost, easiest to scale, easiest to develop and maintain, simple analytics queries.
* **Cons:** Requires strict application-level security (developers must remember `WHERE tenant_id = ?` clauses), potential for data leaks if code is buggy.

### Chosen Approach: Shared Database, Shared Schema
For this project, we selected **Option C (Shared Schema)**.
**Justification:**
1.  **Cost-Efficiency:** As a startup SaaS, minimizing infrastructure costs is a priority. Running one Postgres instance is cheaper than hundreds.
2.  **Scalability:** Modern databases handle millions of rows efficiently with proper indexing on `tenant_id`.
3.  **Complexity:** The timeframe (3 days) makes managing dynamic schema creation risky. Row-level isolation is standard for early-stage SaaS.
4.  **Security Mitigation:** We implemented Middleware (`authMiddleware.js`) and RLS-like logic in controllers to ensure strict data isolation despite the shared schema.

## 2. Technology Stack Justification

### Backend: Node.js & Express
* **Why:** Non-blocking I/O is ideal for real-time SaaS apps handling concurrent requests. The vast ecosystem (npm) speeds up development.
* **Alternative:** Python/Django was considered but Node.js offers better performance for JSON APIs.

### Frontend: React (Vite)
* **Why:** Component-based architecture allows reusing UI elements (cards, buttons) across the dashboard. React's state management handles the dynamic updates of tasks efficiently.
* **Alternative:** Vue.js is simpler, but React has better TypeScript/Enterprise support.

### Database: PostgreSQL
* **Why:** Robust relational data support, ACID compliance (critical for subscription/tenant data), and excellent JSONB support if we need flexible fields later.
* **Alternative:** MongoDB was rejected because multi-tenant relationships (Users -> Tenants -> Projects) are inherently relational.

### Authentication: JWT (JSON Web Tokens)
* **Why:** Stateless authentication scales better than sessions. We don't need Redis to store session IDs; the token contains the proof.
* **Security:** We sign tokens with a 24-hour expiry to balance UX and security.

### Containerization: Docker
* **Why:** Ensures the "works on my machine" guarantee. The strict requirement for submission demands the app runs with one command (`docker-compose up`).

## 3. Security Considerations
1.  **Data Isolation:** Every SQL query includes `WHERE tenant_id = $1`. We never trust the client to send the tenant ID for writes; we extract it from the JWT.
2.  **Password Hashing:** We use `bcrypt` with salt rounds to prevent rainbow table attacks.
3.  **JWT Security:** Tokens are signed with a strong secret. We verify the signature on every protected request.
4.  **Input Validation:** We sanitize inputs to prevent SQL Injection (using parameterized queries via `pg` library).
5.  **CORS:** Configured to only allow requests from our specific frontend URL.