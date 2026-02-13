# Technical Specification & Setup Guide

This document outlines the technical structure, development environment setup, and local running procedures for the Multi-Tenant SaaS Platform.

## 1. Project Structure

The project follows a monorepo-style structure separating the backend API, frontend client, and documentation.

```text
multi-tenant-saas/
├── backend/                  # Node.js/Express API
│   ├── src/
│   │   ├── config/           # DB and App Configuration
│   │   ├── controllers/      # Route logic (Auth, Projects, Tenants)
│   │   ├── middleware/       # Auth & Error Handling Middleware
│   │   ├── models/           # Database Queries & Logic
│   │   ├── routes/           # API Route Definitions
│   │   ├── utils/            # Helper functions (DB Init, Logger)
│   │   └── index.js          # Entry point
│   ├── Dockerfile            # Backend Container Config
│   └── package.json
│
├── frontend/                 # React (Vite) Application
│   ├── src/
│   │   ├── context/          # Auth Context (State Management)
│   │   ├── pages/            # Dashboard, Login, ProjectDetails
│   │   ├── utils/            # API Axios Interceptors
│   │   └── App.jsx           # Main Component
│   ├── Dockerfile            # Frontend Container Config
│   ├── nginx.conf            # Nginx Server Config
│   └── package.json
│
├── docs/                     # Documentation Artifacts
│   ├── architecture.md
│   ├── API.md
│   ├── PRD.md
│   └── research.md
│
├── db_data/                  # Persisted Docker Volume (Auto-created)
├── docker-compose.yml        # Orchestration Config (Mandatory)
├── submission.json           # Test Credentials (Mandatory)
└── README.md                 # Main Documentation
```
## 2. Prerequisites
Before running the application locally, ensure the following tools are installed:

- Docker Engine (v20.10+)

- Docker Compose (v1.29+)

- Git (v2.30+)

- (Optional for non-docker dev) Node.js (v18+) and PostgreSQL (v15+)

## 3. Local Docker Setup (Recommended)
This is the standard method for running the application on a local machine. It ensures all services (Database, Backend, Frontend) run in isolated containers with correct networking.

### Step 1: Clone & Configure
Clone the repository to your local machine:

```Bash

git clone <repository-url>
cd multi-tenant-saas
```

### Step 2: Build and Start
Run the following command in the root directory. This triggers the multi-stage builds for both frontend and backend.
```

```Bash

docker-compose up -d --build
```

### Step 3: Verification
The services will be exposed on the following fixed ports:

- Frontend: http://localhost:3000

- Backend API: http://localhost:5000

- Database: localhost:5432

**Note:** On the very first run, the backend will automatically:

1. Wait for the Database to be healthy.

2. Run SQL migrations to create tables.

3. Seed the database with the initial data found in submission.json. Allow approximately 30-60 seconds for this process to complete.

## 4. Local Development (Manual)
If you need to run the application locally without Docker for debugging purposes:

**1. Database:** Ensure a local PostgreSQL instance is running and create a database named saas_db.

**2. Backend:**

```Bash

cd backend
# Update .env file with your local DB credentials
npm install
npm run dev
```

**3. Frontend:**

```Bash

cd frontend
# Update .env file with VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```
