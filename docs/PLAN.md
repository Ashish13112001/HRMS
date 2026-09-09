# Project Implementation Plan

## Multi-Tenant SaaS Employee Management System

---

# 1. Purpose

This document defines **how and in what order** the Multi-Tenant SaaS Employee Management System will be developed.

It converts the requirements defined in `REQUIREMENTS.md` into:

* Development phases
* Implementation tasks
* Dependencies
* Development order
* Testing requirements
* Deliverables
* Acceptance criteria
* Sprint planning
* Technical milestones

> `REQUIREMENTS.md` defines **WHAT** the system must do.
>
> `PLAN.md` defines **HOW and WHEN** it will be built.
>
> `IMPLEMENTATION.md` records **WHAT has actually been built**.

---

# 2. Planning Principles

The project will be developed incrementally.

The following principles must be followed:

1. Build the project phase-by-phase.
2. Complete and verify one phase before moving to the next major phase.
3. Do not implement future phases unnecessarily.
4. Follow `REQUIREMENTS.md` as the functional source of truth.
5. Follow `.cursor/rules/project-rules.mdc` for project-specific coding rules.
6. Update `IMPLEMENTATION.md` after meaningful implementation work.
7. Keep the MVP scope controlled.
8. Prioritize security-critical functionality early.
9. Test critical business rules before considering a feature complete.
10. Avoid unnecessary infrastructure and dependencies.
11. Prefer a modular monolith for the MVP.
12. Maintain tenant isolation throughout the implementation.
13. Enforce RBAC on the backend.
14. Keep frontend and backend responsibilities clearly separated.
15. Record important architecture and implementation decisions.

---

# 3. High-Level Development Flow

```text
Requirements
     ↓
Project Foundation
     ↓
Authentication
     ↓
Organizations
     ↓
Multi-Tenancy
     ↓
Users + Roles + Permissions
     ↓
RBAC
     ↓
Employees
     ↓
Departments + Teams
     ↓
Leave Management
     ↓
Projects + Tasks
     ↓
Dashboards
     ↓
Testing + Security
     ↓
Deployment
     ↓
MVP Complete
```

---

# 4. Architecture Strategy

## Architecture

The MVP will use a:

**Multi-Tenant Modular Monolith**

```text
                    ┌─────────────────────┐
                    │      React App      │
                    │      Frontend       │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │   Express Backend   │
                    │   Modular Monolith  │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
          Auth/RBAC       Business Modules   Middleware
              │                │                │
              └────────────────┼────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     PostgreSQL      │
                    │       Prisma        │
                    └─────────────────────┘
```

## Why Modular Monolith?

The MVP does not require microservices.

A modular monolith provides:

* Simpler development
* Easier local setup
* Easier deployment
* Lower infrastructure complexity
* Clear module boundaries
* Easier debugging
* Easier testing
* Ability to scale the architecture before considering service extraction

Microservices should only be considered if future scale or business requirements justify them.

---

# 5. Development Stack

## Frontend

* React
* TypeScript
* Vite
* React Router
* TanStack Query
* React Hook Form
* Zod
* Tailwind CSS

## Backend

* Node.js
* Express
* TypeScript
* REST API
* Zod
* JWT
* bcrypt
* Helmet
* CORS
* Rate Limiting

## Database

* PostgreSQL
* Prisma ORM

## Testing

* Vitest
* React Testing Library
* Supertest

## Version Control / CI

* Git
* GitHub
* GitHub Actions

---

# 6. Project Phases

The MVP is divided into eight major phases.

| Phase | Name                           | Story Points |
| ----- | ------------------------------ | -----------: |
| 1     | Project Foundation             |           15 |
| 2     | Authentication                 |           25 |
| 3     | Organizations & Multi-Tenancy  |           30 |
| 4     | Users, Roles & RBAC            |           40 |
| 5     | Employee Management            |           30 |
| 6     | Departments, Teams & Leave     |           50 |
| 7     | Projects, Tasks & Dashboards   |           45 |
| 8     | Testing, Security & Deployment |           35 |
|       | **Total**                      |      **270** |

Estimated timeline:

**Approximately 16 weeks**

Planning range:

**Approximately 14–19 weeks**

A buffer of approximately **15–20%** should be considered for unknowns, bugs, requirement clarification, and technical changes.

> Story points represent relative effort, complexity, risk, and uncertainty. They are not fixed development hours.

---

# 7. Phase 1 — Project Foundation

## Goal

Create a clean and maintainable development foundation for the application.

## Dependencies

None.

## Tasks

### Repository

* [ ] Initialize Git repository
* [ ] Configure `.gitignore`
* [ ] Create project README
* [ ] Configure branch strategy

### Frontend

* [ ] Initialize React application
* [ ] Configure TypeScript
* [ ] Configure Vite
* [ ] Configure Tailwind CSS
* [ ] Configure React Router
* [ ] Create initial application structure

### Backend

* [ ] Initialize Node.js application
* [ ] Configure TypeScript
* [ ] Configure Express
* [ ] Create application entry point
* [ ] Create server entry point
* [ ] Create initial middleware structure
* [ ] Create API versioning structure

### Environment

* [ ] Create `.env`
* [ ] Create `.env.example`
* [ ] Configure environment loading
* [ ] Validate required environment variables

Expected variables:

```text
NODE_ENV
PORT
DATABASE_URL
JWT_SECRET
JWT_REFRESH_SECRET
CORS_ORIGIN
```

### Code Quality

* [ ] Configure ESLint
* [ ] Configure formatting
* [ ] Configure development scripts
* [ ] Establish basic coding conventions

### Health Check

Create:

```text
GET /api/v1/health
```

## Deliverables

* Working React application
* Working Express server
* TypeScript configuration
* Environment configuration
* Basic API structure
* Health-check endpoint
* Initial project structure

## Acceptance Criteria

* [ ] Frontend starts successfully
* [ ] Backend starts successfully
* [ ] TypeScript compilation works
* [ ] Health endpoint returns successful response
* [ ] Environment variables load correctly
* [ ] No secrets are committed

## Completion

After completing Phase 1:

1. Run the required checks.
2. Verify the application manually.
3. Update `IMPLEMENTATION.md`.
4. Record important technical decisions.
5. Only then begin Phase 2.

---

# 8. Phase 2 — Authentication

## Goal

Implement secure user authentication.

## Dependencies

Phase 1.

## Tasks

### Database

* [ ] Create User model
* [ ] Add authentication-related fields
* [ ] Create migrations

### Registration

* [ ] Registration API
* [ ] Registration validation
* [ ] Password hashing
* [ ] Duplicate email handling

### Login

* [ ] Login API
* [ ] Credential validation
* [ ] JWT access token
* [ ] Refresh token strategy

### Authentication Middleware

* [ ] Token extraction
* [ ] Token verification
* [ ] User identification
* [ ] Authentication middleware
* [ ] Protected routes

### Logout

* [ ] Logout implementation
* [ ] Refresh-token invalidation strategy

### Password Recovery

* [ ] Forgot password flow
* [ ] Reset password flow
* [ ] Secure reset mechanism

### Frontend

* [ ] Login page
* [ ] Registration page
* [ ] Authentication state
* [ ] Protected routes
* [ ] Logout flow
* [ ] Authentication error handling

## API

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
```

## Acceptance Criteria

* [ ] Users can register
* [ ] Users can log in
* [ ] Passwords are hashed
* [ ] Invalid credentials are rejected
* [ ] Protected endpoints require authentication
* [ ] Invalid tokens are rejected
* [ ] Refresh flow works
* [ ] Logout works
* [ ] Password reset flow works
* [ ] Sensitive information is not exposed

## Testing

* [ ] Registration tests
* [ ] Login tests
* [ ] Invalid credentials tests
* [ ] Token tests
* [ ] Protected route tests
* [ ] Password hashing tests
* [ ] Refresh-token tests

---

# 9. Phase 3 — Organizations & Multi-Tenancy

## Goal

Introduce organizations and secure tenant isolation.

## Dependencies

Phase 2.

## Tasks

### Organization

* [ ] Organization model
* [ ] Organization creation
* [ ] Organization listing
* [ ] Organization details
* [ ] Organization update
* [ ] Organization status management

### Multi-Tenancy

* [ ] Associate users with organization
* [ ] Identify current organization
* [ ] Create tenant context
* [ ] Implement tenant-aware queries
* [ ] Enforce organization ownership
* [ ] Prevent cross-tenant access

### Database

Add `organization_id` to tenant-owned entities where required.

Tenant-owned entities include:

```text
User
Employee
Department
Team
Leave
Project
Task
```

## API

```text
POST /api/v1/organizations
GET /api/v1/organizations
GET /api/v1/organizations/:id
PATCH /api/v1/organizations/:id
PATCH /api/v1/organizations/:id/status
```

## Acceptance Criteria

* [ ] Organizations can be created
* [ ] Users belong to organizations
* [ ] Tenant context is available
* [ ] Tenant-owned queries are scoped
* [ ] Organization A cannot access Organization B data
* [ ] Organization A cannot modify Organization B data
* [ ] Tenant isolation is tested

## Critical Security Requirement

Tenant isolation must be treated as a mandatory security boundary.

```text
Request
   ↓
Authenticated User
   ↓
Organization/Tenant
   ↓
Authorization
   ↓
Tenant Ownership Check
   ↓
Database
```

---

# 10. Phase 4 — Users, Roles & RBAC

## Goal

Implement role-based access control.

## Dependencies

Phase 3.

## Roles

```text
Super Admin
Organization Admin
HR
Project Manager
Team Lead
Employee
```

## Tasks

### Roles

* [ ] Role model
* [ ] Role creation/seeding
* [ ] Role assignment
* [ ] Role validation

### Permissions

* [ ] Permission model
* [ ] Permission definitions
* [ ] Role-permission relationship
* [ ] Permission checking

Example:

```text
employee.read
employee.create
employee.update
employee.delete

leave.read
leave.apply
leave.approve
leave.reject

department.read
department.create
department.update

team.read
team.create
team.update

project.read
project.create
project.update

task.read
task.create
task.update
task.assign
```

### Authorization

* [ ] Authorization middleware
* [ ] Permission checking
* [ ] Role checking
* [ ] Tenant checking
* [ ] `401` handling
* [ ] `403` handling

### User Management

* [ ] Create user
* [ ] List users
* [ ] View user
* [ ] Update user
* [ ] Disable user
* [ ] Assign role

## Authorization Flow

```text
Request
   ↓
Authentication
   ↓
Identify User
   ↓
Identify Organization
   ↓
Check Role
   ↓
Check Permission
   ↓
Check Tenant Access
   ↓
Business Logic
   ↓
Database
```

## Acceptance Criteria

* [ ] Roles are correctly assigned
* [ ] Permissions are correctly evaluated
* [ ] Backend authorization works
* [ ] Unauthorized users receive `401`
* [ ] Authenticated users without permission receive `403`
* [ ] Tenant boundaries remain enforced
* [ ] Employee cannot perform HR-only operations
* [ ] HR can perform permitted HR operations

## Critical Tests

```text
Employee → Approve Leave → 403

HR → Approve Leave → Success

Organization A → Organization B Employee → Denied
```

---

# 11. Phase 5 — Employee Management

## Goal

Implement employee lifecycle and employee information management.

## Dependencies

Phase 4.

## Tasks

### Employee Model

* [ ] Employee model
* [ ] User relationship
* [ ] Organization relationship
* [ ] Department relationship
* [ ] Team relationship
* [ ] Manager relationship

### Employee Information

#### Personal

* [ ] First name
* [ ] Last name
* [ ] Date of birth
* [ ] Gender
* [ ] Contact information

#### Job

* [ ] Employee ID
* [ ] Designation
* [ ] Department
* [ ] Team
* [ ] Manager
* [ ] Joining date
* [ ] Employment status

### CRUD

* [ ] Create employee
* [ ] List employees
* [ ] View employee
* [ ] Update employee
* [ ] Activate/deactivate employee

### Security

* [ ] Authentication
* [ ] Authorization
* [ ] Tenant isolation
* [ ] Validation

## API

```text
POST /api/v1/employees
GET /api/v1/employees
GET /api/v1/employees/:id
PATCH /api/v1/employees/:id
PATCH /api/v1/employees/:id/status
```

## Acceptance Criteria

* [ ] Authorized users can manage employees
* [ ] Employee records are tenant-scoped
* [ ] Unauthorized users cannot modify employees
* [ ] Validation works
* [ ] CRUD operations work
* [ ] Employee status works
* [ ] Tests pass

---

# 12. Phase 6 — Departments, Teams & Leave

## Goal

Implement organizational structure and leave management.

## Dependencies

Phase 5.

---

## 12.1 Departments

### Tasks

* [ ] Department model
* [ ] Create department
* [ ] List departments
* [ ] View department
* [ ] Update department
* [ ] Deactivate department
* [ ] Associate employees
* [ ] Tenant isolation
* [ ] Authorization
* [ ] Validation
* [ ] Tests

### API

```text
POST /api/v1/departments
GET /api/v1/departments
GET /api/v1/departments/:id
PATCH /api/v1/departments/:id
```

---

# 13. Teams

### Tasks

* [ ] Team model
* [ ] Department relationship
* [ ] Team lead relationship
* [ ] Create team
* [ ] List teams
* [ ] View team
* [ ] Update team
* [ ] Assign team lead
* [ ] Add team member
* [ ] Remove team member
* [ ] View team members
* [ ] Authorization
* [ ] Tenant isolation
* [ ] Validation
* [ ] Tests

### API

```text
POST /api/v1/teams
GET /api/v1/teams
GET /api/v1/teams/:id
PATCH /api/v1/teams/:id
POST /api/v1/teams/:id/members
DELETE /api/v1/teams/:id/members/:employeeId
```

---

# 14. Leave Management

## Goal

Implement the employee leave workflow.

## Leave Workflow

```text
Employee
    ↓
Apply
    ↓
PENDING
    ↓
HR / Authorized Manager
    ↓
 ┌───────────┐
 ↓           ↓
APPROVED   REJECTED
```

## Statuses

```text
PENDING
APPROVED
REJECTED
CANCELLED
```

## Tasks

* [ ] Leave model
* [ ] Leave type
* [ ] Apply for leave
* [ ] View own leave requests
* [ ] View authorized leave requests
* [ ] Cancel eligible leave
* [ ] Approve leave
* [ ] Reject leave
* [ ] Store approver
* [ ] Validate dates
* [ ] Validate status transitions
* [ ] Authorization
* [ ] Tenant isolation
* [ ] Tests

## API

```text
POST /api/v1/leaves
GET /api/v1/leaves
GET /api/v1/leaves/:id
PATCH /api/v1/leaves/:id/cancel
PATCH /api/v1/leaves/:id/approve
PATCH /api/v1/leaves/:id/reject
```

## Acceptance Criteria

* [ ] Employee can apply for leave
* [ ] Employee can view own leave
* [ ] Employee can cancel eligible pending request
* [ ] Authorized user can approve
* [ ] Authorized user can reject
* [ ] Unauthorized employee cannot approve/reject
* [ ] Invalid state transitions are rejected
* [ ] Tenant isolation works
* [ ] Tests pass

---

# 15. Phase 7 — Projects, Tasks & Dashboards

## Goal

Implement basic project/task management and role-specific dashboards.

## Dependencies

Phase 6.

---

# 16. Projects

### Tasks

* [ ] Project model
* [ ] Create project
* [ ] List projects
* [ ] View project
* [ ] Update project
* [ ] Assign project members
* [ ] Project status
* [ ] Project progress
* [ ] Project dates
* [ ] Tenant isolation
* [ ] Authorization
* [ ] Validation
* [ ] Tests

### API

```text
POST /api/v1/projects
GET /api/v1/projects
GET /api/v1/projects/:id
PATCH /api/v1/projects/:id
POST /api/v1/projects/:id/members
```

---

# 17. Tasks

### Tasks

* [ ] Task model
* [ ] Create task
* [ ] List tasks
* [ ] View task
* [ ] Update task
* [ ] Assign task
* [ ] Change assignee
* [ ] Change status
* [ ] Priority
* [ ] Due date
* [ ] Tenant isolation
* [ ] Authorization
* [ ] Validation
* [ ] Tests

### Statuses

```text
TODO
IN_PROGRESS
COMPLETED
```

### API

```text
POST /api/v1/tasks
GET /api/v1/tasks
GET /api/v1/tasks/:id
PATCH /api/v1/tasks/:id
PATCH /api/v1/tasks/:id/status
PATCH /api/v1/tasks/:id/assignee
```

---

# 18. Dashboards

## Goal

Provide role-specific information and summaries.

## Super Admin

* [ ] Total organizations
* [ ] Active organizations
* [ ] Organization status
* [ ] Platform information

## Organization Admin

* [ ] Employee statistics
* [ ] User statistics
* [ ] Department statistics
* [ ] Team statistics
* [ ] Organization information

## HR

* [ ] Employee statistics
* [ ] Pending leaves
* [ ] Department information
* [ ] Team information

## Project Manager

* [ ] Active projects
* [ ] Project members
* [ ] Pending tasks
* [ ] Project status
* [ ] Project progress

## Team Lead

* [ ] Team members
* [ ] Assigned tasks
* [ ] Task status
* [ ] Team progress

## Employee

* [ ] Own profile
* [ ] Own leave requests
* [ ] Assigned projects
* [ ] Assigned tasks

## Acceptance Criteria

* [ ] Correct dashboard is displayed for each role
* [ ] Dashboard data respects tenant boundaries
* [ ] Users cannot access unauthorized dashboard data
* [ ] Loading states are handled
* [ ] Error states are handled
* [ ] Dashboard APIs are tested

---

# 19. Phase 8 — Testing, Security & Deployment

## Goal

Harden the application and prepare it for production deployment.

## Dependencies

Phases 1–7.

---

# 20. Testing

## Unit Testing

* [ ] Authentication
* [ ] Authorization
* [ ] RBAC
* [ ] Employee services
* [ ] Leave services
* [ ] Project services
* [ ] Task services

## Frontend Testing

* [ ] Authentication components
* [ ] Forms
* [ ] Protected routes
* [ ] Role-based UI
* [ ] Employee pages
* [ ] Leave pages
* [ ] Project pages
* [ ] Task pages

## API Testing

* [ ] Authentication APIs
* [ ] Organization APIs
* [ ] User APIs
* [ ] Employee APIs
* [ ] Department APIs
* [ ] Team APIs
* [ ] Leave APIs
* [ ] Project APIs
* [ ] Task APIs

## Security Testing

Mandatory:

```text
Employee → Approve Leave
Expected: 403

HR → Approve Leave
Expected: Success

Organization A → Read Organization B Employee
Expected: Denied

Organization A → Update Organization B Employee
Expected: Denied
```

---

# 21. Security Hardening

### Authentication

* [ ] Password hashing
* [ ] JWT validation
* [ ] Refresh token security
* [ ] Secure token handling

### Authorization

* [ ] Backend RBAC
* [ ] Permission checks
* [ ] Role checks
* [ ] Tenant checks

### API Security

* [ ] Helmet
* [ ] CORS
* [ ] Rate limiting
* [ ] Input validation
* [ ] Secure error responses

### Secrets

* [ ] `.env` ignored
* [ ] No secrets in source code
* [ ] No secrets in documentation
* [ ] Production secrets securely configured

---

# 22. Deployment

## Infrastructure

```text
Frontend
   ↓
Backend API
   ↓
PostgreSQL
```

## Tasks

* [ ] Configure production frontend
* [ ] Configure production backend
* [ ] Configure PostgreSQL
* [ ] Configure production environment variables
* [ ] Run production migrations
* [ ] Configure CORS
* [ ] Configure HTTPS
* [ ] Configure CI
* [ ] Configure deployment
* [ ] Verify production application

## CI/CD

Recommended pipeline:

```text
Developer Push
      ↓
GitHub
      ↓
Install Dependencies
      ↓
Lint
      ↓
Run Tests
      ↓
Build
      ↓
Deploy
```

---

# 23. Git Branching Strategy

Main branches:

```text
main
develop
```

Feature branches:

```text
feature/authentication
feature/rbac
feature/employee-management
feature/leave-management
feature/project-management
```

Bug fixes:

```text
fix/login-validation
fix/tenant-isolation
```

Suggested flow:

```text
develop
   ↓
feature/xyz
   ↓
Development
   ↓
Testing
   ↓
Pull Request
   ↓
Code Review
   ↓
develop
   ↓
Release
   ↓
main
```

---

# 24. Sprint Plan

The project can be organized into approximately **8 two-week sprints**.

---

## Sprint 1 — Project Foundation

**15 SP**

Focus:

* Repository
* Frontend setup
* Backend setup
* TypeScript
* Environment
* API structure
* Health check

Deliverable:

**Working project foundation**

---

## Sprint 2 — Authentication

**25 SP**

Focus:

* Registration
* Login
* JWT
* Refresh tokens
* Logout
* Password recovery
* Protected routes

Deliverable:

**Working authentication system**

---

## Sprint 3 — Organizations & Multi-Tenancy

**30 SP**

Focus:

* Organization model
* Organization APIs
* Tenant identification
* Tenant-aware database queries
* Tenant isolation

Deliverable:

**Working multi-tenant foundation**

---

## Sprint 4 — Users, Roles & RBAC

**40 SP**

Focus:

* Users
* Roles
* Permissions
* RBAC
* Authorization middleware

Deliverable:

**Working authorization system**

---

## Sprint 5 — Employee Management

**30 SP**

Focus:

* Employee model
* Employee CRUD
* Employee relationships
* Employee status
* Validation
* Authorization

Deliverable:

**Working employee management**

---

## Sprint 6 — Departments, Teams & Leave

**50 SP**

Focus:

* Departments
* Teams
* Team members
* Leave workflow
* Leave approval/rejection

Deliverable:

**Working organizational and leave management**

---

## Sprint 7 — Projects, Tasks & Dashboards

**45 SP**

Focus:

* Projects
* Project members
* Tasks
* Task assignment
* Task status
* Dashboards

Deliverable:

**Working project/task management and dashboards**

---

## Sprint 8 — Testing, Security & Deployment

**35 SP**

Focus:

* Automated tests
* Tenant isolation tests
* RBAC tests
* Security hardening
* Production build
* CI/CD
* Deployment

Deliverable:

**Production-ready MVP**

---

# 25. Feature Dependency Graph

Some features cannot be implemented correctly before others.

```text
Project Foundation
       │
       ▼
Authentication
       │
       ▼
Organizations
       │
       ▼
Multi-Tenancy
       │
       ▼
Users
       │
       ▼
Roles + Permissions
       │
       ▼
RBAC
       │
       ▼
Employees
       │
       ├──────────────┐
       ▼              ▼
Departments         Teams
       │              │
       └──────┬───────┘
              ▼
       Leave Management
              │
              ▼
      Projects + Tasks
              │
              ▼
          Dashboards
              │
              ▼
      Testing + Security
              │
              ▼
          Deployment
```

---

# 26. Cross-Cutting Requirements

The following requirements apply throughout development rather than to only one phase.

## Authentication

Every protected API must require authentication.

## Authorization

Every protected business operation must verify authorization.

## Tenant Isolation

Every tenant-owned database operation must respect the current organization.

## Validation

Incoming data must be validated before business logic executes.

## Error Handling

Errors must use a consistent response format and appropriate HTTP status codes.

## Logging

Important events and API/server errors should be logged appropriately.

## Testing

Critical business rules must have automated tests.

---

# 27. API Development Strategy

Base path:

```text
/api/v1
```

Each module should generally follow:

```text
Route
  ↓
Authentication
  ↓
Authorization
  ↓
Validation
  ↓
Controller
  ↓
Service
  ↓
Repository / Data Access
  ↓
Database
```

Example:

```text
POST /api/v1/leaves/:id/approve
            ↓
Authentication
            ↓
Permission Check
            ↓
Tenant Check
            ↓
Validation
            ↓
Leave Controller
            ↓
Leave Service
            ↓
Database
```

---

# 28. Frontend Development Strategy

The frontend should be organized by feature and responsibility.

Conceptual structure:

```text
client/src/
├── components/
├── pages/
├── layouts/
├── features/
│   ├── auth/
│   ├── organizations/
│   ├── employees/
│   ├── departments/
│   ├── teams/
│   ├── leaves/
│   ├── projects/
│   └── tasks/
├── hooks/
├── services/
├── routes/
├── schemas/
├── types/
├── utils/
└── App.tsx
```

Frontend responsibilities:

* Display UI
* Handle user interactions
* Validate forms
* Manage client-side state where required
* Fetch server data
* Handle loading/error states
* Hide unavailable actions based on permissions

> Frontend permission checks are for user experience. They must never replace backend authorization.

---

# 29. Database Development Strategy

Use Prisma migrations for database changes.

General flow:

```text
Change Prisma Schema
       ↓
Create Migration
       ↓
Run Migration
       ↓
Update Application Code
       ↓
Run Tests
       ↓
Verify Database
```

Database considerations:

* Primary keys
* Foreign keys
* Relationships
* Unique constraints
* Indexes
* Tenant keys
* Created timestamps
* Updated timestamps
* Appropriate delete/update behavior

---

# 30. Documentation Workflow

Documentation should evolve with the implementation.

```text
REQUIREMENTS.md
       ↓
Define requirement
       ↓
PLAN.md
       ↓
Define implementation phase
       ↓
Cursor implementation
       ↓
Testing
       ↓
IMPLEMENTATION.md
       ↓
Record actual implementation
```

For every meaningful phase:

1. Read requirements.
2. Read the relevant plan.
3. Implement only the selected scope.
4. Test the implementation.
5. Review the code.
6. Update `IMPLEMENTATION.md`.
7. Record deviations if any.
8. Move to the next phase.

---

# 31. Cursor Development Workflow

Cursor should not be asked to build the complete project in one step.

Instead:

```text
Phase
 ↓
Task
 ↓
Cursor
 ↓
Implementation
 ↓
Test
 ↓
Review
 ↓
Documentation
 ↓
Next Task
```

For example:

```text
Phase 1
   ↓
Task 1: Initialize Backend
   ↓
Implement
   ↓
Test
   ↓
Update IMPLEMENTATION.md
   ↓
Task 2: Initialize Frontend
   ↓
Implement
   ↓
Test
   ↓
Update IMPLEMENTATION.md
```

This reduces unintended changes and makes debugging easier.

---

# 32. Definition of Done

A feature is considered complete only when applicable requirements below are satisfied.

## Functional

* [ ] Requirement implemented
* [ ] Expected workflow works
* [ ] Edge cases handled

## Backend

* [ ] API implemented
* [ ] Validation implemented
* [ ] Authorization implemented
* [ ] Tenant isolation verified
* [ ] Error handling implemented

## Frontend

* [ ] UI implemented
* [ ] Form validation implemented
* [ ] Loading state handled
* [ ] Error state handled
* [ ] Permission-based UI handled

## Database

* [ ] Database model implemented
* [ ] Relationships verified
* [ ] Migration created
* [ ] Constraints considered
* [ ] Indexes considered

## Testing

* [ ] Relevant unit tests
* [ ] Relevant API tests
* [ ] Critical security tests
* [ ] Tenant isolation tests

## Documentation

* [ ] `IMPLEMENTATION.md` updated
* [ ] Important decisions documented
* [ ] Deviations documented

---

# 33. MVP Scope Control

The following features are intentionally excluded from the MVP:

* Payroll
* Advanced attendance
* Subscription billing
* Advanced analytics
* Advanced reporting
* Advanced notifications
* File/document management
* Organization branding
* Custom workflows
* MFA/2FA
* Advanced audit analytics

If a new feature is requested during development:

```text
New Feature
     ↓
Is it in REQUIREMENTS.md?
     │
 ┌───┴────┐
 │        │
YES       NO
 │        │
 ▼        ▼
Plan     Evaluate
 │        │
 ▼        ▼
Build    Approve?
          │
       ┌──┴──┐
       │     │
      YES    NO
       │     │
       ▼     ▼
     Plan   Backlog
```

Do not add scope silently.

---

# 34. Risk Management

## Risk: Tenant Data Leakage

Mitigation:

* Tenant-aware queries
* Organization ownership checks
* Automated isolation tests

## Risk: Incorrect Permissions

Mitigation:

* Centralized RBAC
* Permission definitions
* Authorization middleware
* RBAC tests

## Risk: Scope Creep

Mitigation:

* Strict MVP scope
* Requirements review
* Change documentation

## Risk: Underestimated Complexity

Mitigation:

* Story points
* Sprint reviews
* 15–20% buffer
* Incremental development

## Risk: Database Changes

Mitigation:

* Prisma migrations
* Version-controlled schema
* Test migrations
* Document important changes

---

# 35. Future Infrastructure Strategy

The MVP should avoid unnecessary infrastructure.

Potential future additions:

```text
Redis
BullMQ
Object Storage
Transactional Email
Advanced Notification Services
```

These should only be introduced when an actual requirement justifies them.

The initial architecture should remain simple.

---

# 36. Future Development Roadmap

After MVP completion, potential future features include:

* Attendance management
* Notifications
* Audit logs
* Advanced reports
* Custom roles
* Advanced leave policies
* Advanced project/task management
* Task comments
* Task attachments
* Task dependencies
* Time tracking
* Analytics
* Organization branding
* Document management
* Subscription billing
* MFA/2FA
* Advanced workflows

These are future roadmap items and should not be implemented as part of the current MVP unless explicitly approved.

---

# 37. Release Strategy

## Development

```text
Feature Branch
      ↓
Local Development
      ↓
Testing
      ↓
Pull Request
      ↓
Code Review
      ↓
develop
```

## Release

```text
develop
    ↓
Integration Testing
    ↓
Release Verification
    ↓
main
    ↓
Production Deployment
```

---

# 38. Final MVP Acceptance

The MVP should only be considered complete when all major areas below are implemented and verified:

```text
Authentication
       ✓
Organizations
       ✓
Multi-Tenancy
       ✓
Tenant Isolation
       ✓
Users
       ✓
Roles
       ✓
Permissions
       ✓
RBAC
       ✓
Employees
       ✓
Departments
       ✓
Teams
       ✓
Leaves
       ✓
Projects
       ✓
Tasks
       ✓
Dashboards
       ✓
Validation
       ✓
Error Handling
       ✓
Security
       ✓
Testing
       ✓
Deployment
       ✓
Documentation
       ✓
```

---

# 39. Project Completion Flow

```text
                    ┌─────────────────────┐
                    │   REQUIREMENTS.md   │
                    │       WHAT          │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       PLAN.md       │
                    │     HOW / WHEN      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      CURSOR AI      │
                    │    Implementation   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       TESTING       │
                    │   Verify Behavior   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ IMPLEMENTATION.md   │
                    │    ACTUAL STATE     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     NEXT PHASE      │
                    └─────────────────────┘
```

---

# 40. Plan Maintenance Rules

`PLAN.md` is a living planning document.

Update it when:

* Implementation order changes
* A phase changes significantly
* A task is split into smaller tasks
* Dependencies change
* A requirement changes
* Scope changes
* A technical decision affects the implementation plan
* A phase is removed or added

Do not use `PLAN.md` to record detailed implementation history.

That information belongs in `IMPLEMENTATION.md`.

---

# 41. Source of Truth Rules

The project follows this hierarchy:

```text
REQUIREMENTS.md
      ↓
Functional Requirements
      ↓
PLAN.md
      ↓
Implementation Strategy
      ↓
Source Code
      ↓
Tests
      ↓
IMPLEMENTATION.md
      ↓
Actual Implementation Record
```

If a conflict is discovered:

1. Identify the conflict.
2. Do not silently change requirements.
3. Review the requirement.
4. Update the plan if necessary.
5. Implement the approved approach.
6. Document the change in `IMPLEMENTATION.md`.

---

# 42. Initial Development State

At project initialization:

```text
Current Phase:
Phase 1 — Project Foundation

Current Sprint:
Sprint 1

Overall Status:
Not Started

Next Objective:
Initialize and configure the project foundation.

Next Step:
Start Phase 1 implementation.
```

---

# 43. Plan Summary

The project will be built in the following order:

```text
1. Project Foundation
        ↓
2. Authentication
        ↓
3. Organizations & Multi-Tenancy
        ↓
4. Users, Roles & RBAC
        ↓
5. Employee Management
        ↓
6. Departments, Teams & Leave
        ↓
7. Projects, Tasks & Dashboards
        ↓
8. Testing, Security & Deployment
        ↓
       MVP
```

The goal is to build a **secure, maintainable, multi-tenant HRMS MVP** using a modular monolith architecture, while keeping development incremental and ensuring that every major feature is validated, tested, and documented before moving forward.
