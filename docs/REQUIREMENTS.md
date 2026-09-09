# Multi-Tenant SaaS Employee Management System

**Document:** Requirements Specification
**Version:** 1.0
**Status:** Planned
**Project Type:** SaaS-based Employee Management / HRMS
**Architecture:** Multi-Tenant Modular Monolith
**Primary Database:** PostgreSQL
**Frontend:** React + TypeScript
**Backend:** Node.js + Express + TypeScript
**API Style:** REST
**Authorization Model:** RBAC

---

# 1. Document Purpose

This document defines the functional and non-functional requirements for the **Multi-Tenant SaaS Employee Management System**.

The document serves as the primary source of truth for:

* Product scope
* MVP functionality
* User roles
* Permissions
* Business workflows
* Multi-tenant behavior
* Tenant data isolation
* Authentication and authorization
* Employee management
* Organization management
* Department and team management
* Leave management
* Project management
* Task management
* Role-specific dashboards
* Security requirements
* Performance requirements
* Scalability requirements
* Testing requirements
* Deployment requirements
* MVP acceptance criteria
* Future scope boundaries

The implementation should satisfy the requirements defined in this document.

If an implementation decision conflicts with a requirement in this document, the requirement takes precedence unless this document is explicitly updated.

---

# 2. Project Overview

## 2.1 Project Name

**Multi-Tenant SaaS Employee Management System**

The system may also be referred to as:

**Multi-Tenant HRMS (Human Resource Management System)**

---

## 2.2 Product Description

The system is a cloud-based SaaS application that allows multiple organizations to manage their employees and workforce operations through a single centralized platform.

Each organization operates as an independent tenant within the platform.

The platform provides centralized functionality for:

* Employee management
* User management
* Role management
* Permission management
* Role-Based Access Control (RBAC)
* Department management
* Team management
* Leave management
* Project management
* Task management
* Role-specific dashboards
* Secure authentication
* Tenant-level data isolation

The platform uses a shared application and shared PostgreSQL database while maintaining logical isolation between organizations.

---

# 3. Business Problem

Organizations often manage employee information and workforce activities through multiple disconnected systems such as:

* Spreadsheets
* Emails
* Chat applications
* Manual approval processes
* Separate project-management tools

This creates several operational problems.

## 3.1 Problems to Solve

The system should address the following problems:

1. Employee information is scattered across different systems.
2. HR teams spend significant time performing repetitive manual operations.
3. Leave requests may be handled through emails or chat messages.
4. Different employees require different levels of system access.
5. Unauthorized users may gain access to information they should not see.
6. Managing employees, teams, and departments becomes difficult as organizations grow.
7. There is no centralized view of employee and project activities.
8. Maintaining separate software systems for different organizations increases operational complexity.

---

# 4. Proposed Solution

The system will provide a centralized SaaS-based Employee Management System.

Multiple organizations will use the same application while their data remains logically isolated.

The platform will provide:

* Centralized employee management
* Organization management
* User management
* Role-based access control
* Permission management
* Department management
* Team management
* Leave management
* Project management
* Task management
* Role-specific dashboards
* Secure authentication
* Tenant-level data isolation

---

# 5. Project Goals

The project goals are:

1. Build a centralized employee management platform.
2. Support multiple organizations using a single application.
3. Keep each organization's data logically isolated.
4. Provide secure authentication.
5. Implement Role-Based Access Control.
6. Allow organizations to manage employees.
7. Allow organizations to manage departments.
8. Allow organizations to manage teams.
9. Simplify the employee leave process.
10. Provide basic project management.
11. Provide basic task management.
12. Provide different dashboards according to user roles.
13. Build the system using a scalable architecture.
14. Build the system using a maintainable architecture.
15. Establish a foundation for future SaaS functionality.

---

# 6. Product Scope

## 6.1 MVP Scope

The MVP shall include:

* Authentication
* Organization management
* Multi-tenancy
* Tenant isolation
* User management
* Roles
* Permissions
* RBAC
* Employee management
* Department management
* Team management
* Leave management
* Basic project management
* Basic task management
* Role-based dashboards
* Backend validation
* Error handling
* Security controls
* Automated testing
* Deployment

---

## 6.2 Explicitly Out of Scope for MVP

The following features shall NOT be implemented as part of the initial MVP:

* Payroll
* Advanced attendance management
* Subscription billing
* Advanced analytics
* Advanced reporting
* Advanced notifications
* File/document management
* Organization branding
* Custom workflows
* MFA/2FA
* Advanced audit analytics

These capabilities may be introduced in future releases.

The MVP should not expand into these areas unless the requirements are explicitly updated.

---

# 7. System Users and Roles

The system has two primary administrative levels:

1. Platform level
2. Organization level

---

# 8. System Hierarchy

```text
SaaS Platform
│
└── Super Admin
    │
    ├── Organization A
    │   ├── Organization Admin
    │   ├── HR
    │   ├── Project Manager
    │   ├── Team Lead
    │   └── Employee
    │
    ├── Organization B
    │   ├── Organization Admin
    │   ├── HR
    │   ├── Project Manager
    │   ├── Team Lead
    │   └── Employee
    │
    └── Organization C
        ├── Organization Admin
        ├── HR
        ├── Project Manager
        ├── Team Lead
        └── Employee
```

The initial predefined roles are:

1. Super Admin
2. Organization Admin
3. HR
4. Project Manager
5. Team Lead
6. Employee

---

# 9. Role Requirements

## 9.1 Super Admin

The Super Admin operates at the SaaS platform level.

The Super Admin is not restricted to a single organization.

### Responsibilities

The Super Admin shall be able to:

* Create organizations
* View organizations
* Update organizations
* Activate organizations
* Deactivate organizations
* Manage platform-level settings
* View platform-level information

### Scope

The Super Admin operates at the platform level rather than being limited to a tenant.

---

# 10. Organization Admin

The Organization Admin manages an individual organization.

### Responsibilities

The Organization Admin shall be able to:

* Manage organization users
* Assign roles
* Manage departments
* Manage teams
* Manage organization-level settings
* Manage organization employees where permitted
* View organization information

### Scope

The Organization Admin operates within the assigned organization.

The Organization Admin must not access another organization's tenant-owned data.

---

# 11. HR

The HR role manages employee-related operations.

### Responsibilities

HR shall be able to:

* Manage employees
* View employee information
* Update employee information
* Manage departments where permitted
* Manage teams where permitted
* View leave requests
* Approve leave requests
* Reject leave requests
* Manage employee-related information

HR permissions must be enforced through RBAC.

---

# 12. Project Manager

The Project Manager manages projects and project members.

### Responsibilities

The Project Manager shall be able to:

* Create projects
* Update projects
* Assign project members
* View project progress
* Create tasks
* Assign tasks
* Update task information
* Monitor project activities

Project Manager access must remain within the user's organization.

---

# 13. Team Lead

The Team Lead manages team-level activities.

### Responsibilities

The Team Lead shall be able to:

* View team members
* Assign or manage tasks
* Monitor team progress
* View relevant employee information
* Manage team-level activities according to permissions

Team Lead capabilities must be controlled through permissions and tenant boundaries.

---

# 14. Employee

The Employee has access to their own information and assigned work.

### Responsibilities

An Employee shall be able to:

* View own profile
* Update permitted profile information
* Apply for leave
* View own leave requests
* Cancel eligible pending leave requests
* View assigned projects
* View assigned tasks
* Update assigned task status where permitted

An Employee must not be able to perform administrative operations unless explicitly permitted.

---

# 15. Role-Based Access Control

The system shall use **Role-Based Access Control (RBAC)**.

The authorization model is:

```text
User
  ↓
Role
  ↓
Permissions
  ↓
Allowed Actions
```

A user receives permissions through their assigned role.

---

# 16. Permission Model

Permissions shall follow a resource-action naming convention.

Examples:

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

The exact permission list may evolve during implementation.

However, the permission model must remain centralized and permission-based.

---

# 17. Example HR Permissions

HR may have permissions such as:

```text
HR
│
├── employee.read
├── employee.create
├── employee.update
├── leave.read
├── leave.approve
└── leave.reject
```

---

# 18. Example Employee Permissions

An Employee may have permissions such as:

```text
Employee
│
├── profile.read
├── profile.update
├── leave.apply
├── leave.read-own
├── project.read-own
└── task.update-own
```

---

# 19. Authorization Requirements

Every protected request shall follow this conceptual authorization flow:

```text
Client Request
      ↓
Authentication
      ↓
Identify User
      ↓
Identify Organization/Tenant
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
      ↓
Response
```

Authorization must be enforced on the backend.

Frontend permission checks are only for controlling the user interface.

Frontend UI restrictions must never be considered a security mechanism.

For example:

Hiding an "Approve Leave" button from an Employee is not sufficient.

The backend must reject an unauthorized request even if the Employee manually calls the API.

---

# 20. Multi-Tenant Architecture

## 20.1 Tenant Definition

A tenant represents an organization using the SaaS platform.

For example:

```text
Organization A = Tenant A
Organization B = Tenant B
Organization C = Tenant C
```

All organizations use the same application.

---

# 21. Multi-Tenancy Model

The MVP shall use:

**Shared Application + Shared PostgreSQL Database + Logical Tenant Isolation**

A separate database shall not be created for each organization.

Conceptually:

```text
                 SaaS Application
                       │
              ┌────────┴────────┐
              │                 │
       Organization A     Organization B
              │                 │
              └────────┬────────┘
                       │
                Shared Database
                   PostgreSQL
```

Tenant-owned database records shall contain an organization/tenant identifier.

---

# 22. Tenant Identifier

Tenant-owned records shall contain an organization identifier, represented as:

```text
organization_id
```

Example employee record:

```text
employees

id
organization_id
first_name
last_name
email
department_id
team_id
manager_id
status
created_at
updated_at
```

---

# 23. Tenant Data Isolation

When a user makes a request:

1. The backend shall identify the authenticated user.
2. The backend shall identify the user's organization.
3. The request shall operate within that organization.
4. Database queries shall be scoped to that organization.
5. Requested resources shall be verified against the current organization.
6. Data belonging to another organization must not be returned or modified.

Conceptually:

```text
Authenticated User
       ↓
organization_id = 10
       ↓
Query Employees
       ↓
WHERE organization_id = 10
       ↓
Return Organization 10 employees
```

---

# 24. Tenant Isolation Rules

For every tenant-owned resource:

> The backend must verify that the requested resource belongs to the current user's organization before returning or modifying it.

Tenant isolation applies to:

* Employees
* Departments
* Teams
* Leaves
* Projects
* Tasks
* Organization users

Tenant isolation must be explicitly tested.

---

# 25. Cross-Tenant Access Prevention

A user belonging to Organization A must never be able to access or modify resources belonging to Organization B.

Examples:

```text
Organization A HR
      ↓
Request Organization B Employee
      ↓
ACCESS DENIED
```

And:

```text
Organization A User
      ↓
Update Organization B Employee
      ↓
ACCESS DENIED
```

This requirement is mandatory.

---

# 26. Functional Requirements

---

## FR-01 — Authentication

The system shall allow users to securely authenticate.

### Requirements

The authentication system shall support:

* User login
* User logout
* Password hashing
* JWT-based authentication
* Access tokens
* Refresh token strategy
* Protected API endpoints
* Authentication middleware
* Password reset
* Authentication validation

Protected resources shall require valid authentication.

Passwords must never be stored in plain text.

---

# 27. FR-02 — Organization Management

The system shall allow the Super Admin to manage organizations.

### Requirements

The Super Admin shall be able to:

* Create organization
* View organization
* Update organization
* Activate organization
* Deactivate organization

Organization status must be represented in the system.

---

# 28. FR-03 — User Management

Authorized organization-level users shall be able to manage users.

### Requirements

The system shall support:

* Create user
* View user
* Update user
* Disable user
* Assign role
* View user status

User operations must respect:

* Authentication
* Authorization
* Tenant isolation

---

# 29. FR-04 — Role Management

The system shall support predefined roles.

### Initial roles

* Super Admin
* Organization Admin
* HR
* Project Manager
* Team Lead
* Employee

Custom roles are not part of the MVP.

Custom roles may be introduced in a future release.

---

# 30. FR-05 — Permission Management

The system shall associate permissions with roles.

Conceptually:

```text
Role
 ↓
Permissions
 ↓
Allowed Actions
```

Permissions must be evaluated when protected operations are performed.

---

# 31. FR-06 — Employee Management

Authorized users shall be able to manage employee records.

Employee management shall support employee CRUD functionality.

---

# 32. Employee Information

Employee information may include:

## 32.1 Personal Information

* First name
* Last name
* Date of birth
* Gender
* Contact information

## 32.2 Job Information

* Employee ID
* Designation
* Department
* Team
* Manager
* Joining date
* Employment status

Employee records shall belong to an organization.

---

# 33. Employee Relationships

An employee may be associated with:

```text
Organization
     │
     ├── Department
     │
     ├── Team
     │
     └── Manager
```

Employee data must remain tenant-scoped.

---

# 34. FR-07 — Department Management

Authorized users shall be able to manage departments.

### Requirements

The system shall support:

* Create departments
* View departments
* Update departments
* Deactivate departments
* Associate employees with departments

Departments shall belong to an organization.

---

# 35. FR-08 — Team Management

Authorized users shall be able to manage teams.

### Requirements

The system shall support:

* Create teams
* View teams
* Update teams
* Assign Team Leads
* Add team members
* Remove team members
* View team members

Teams shall belong to an organization.

---

# 36. Leave Management

The MVP shall provide a digital leave-management workflow.

---

# 37. Leave Workflow

The primary leave workflow is:

```text
Employee
   ↓
Apply Leave
   ↓
PENDING
   ↓
HR / Authorized Manager
   ↓
┌───────────────┐
│               │
APPROVED      REJECTED
```

---

# 38. Leave Requirements

## Employees shall be able to:

* Apply for leave
* View their leave requests
* Cancel eligible pending leave requests

## Authorized users shall be able to:

* View leave requests
* Approve leave
* Reject leave

---

# 39. Leave Application Data

A leave request shall contain information including:

* Employee
* Leave type
* Start date
* End date
* Reason
* Status
* Approver where applicable
* Created timestamp
* Updated timestamp

---

# 40. Leave Statuses

The initial leave statuses shall be:

```text
PENDING
APPROVED
REJECTED
CANCELLED
```

The status transition must respect authorization and workflow rules.

---

# 41. Leave Approval Authorization

Employees must not be allowed to approve or reject leave requests unless their permissions explicitly allow the operation.

Example:

```text
Employee
   ↓
Approve Leave
   ↓
FORBIDDEN
```

Authorized HR:

```text
HR
   ↓
Approve Leave
   ↓
ALLOWED
```

These scenarios are mandatory security test cases.

---

# 42. Project Management

The MVP shall provide basic project management.

Authorized users shall be able to:

* Create projects
* View projects
* Update projects
* Assign project members
* Change project status
* View project progress

---

# 43. Project Members

Projects may contain multiple employee members.

Example:

```text
Project
│
├── Employee A
├── Employee B
└── Employee C
```

Project membership must respect tenant isolation.

An employee from one organization must not be assigned to a project belonging to another organization.

---

# 44. Task Management

The MVP shall provide basic task management.

The system shall support:

* Create task
* View task
* Update task
* Assign task
* Set priority
* Set due date
* Change status

---

# 45. Task Relationships

Tasks shall be associated with:

* Organization
* Project
* Employee assignee

Conceptually:

```text
Project
│
├── Task 1 → Employee A
├── Task 2 → Employee B
└── Task 3 → Employee C
```

---

# 46. Task Status

Initial task statuses shall be:

```text
TODO
IN_PROGRESS
COMPLETED
```

Additional statuses may be introduced in future versions.

---

# 47. Role-Specific Dashboards

The system shall provide role-specific dashboards.

The dashboards shall present information relevant to the user's role and permissions.

---

# 48. Super Admin Dashboard

The Super Admin dashboard may display:

* Total organizations
* Active organizations
* Organization status
* Platform-level information

---

# 49. Organization Admin Dashboard

The Organization Admin dashboard may display:

* Total employees
* Total users
* Departments
* Teams
* Organization information

---

# 50. HR Dashboard

The HR dashboard may display:

* Total employees
* Pending leave requests
* Departments
* Teams
* Employee status

---

# 51. Project Manager Dashboard

The Project Manager dashboard may display:

* Active projects
* Project members
* Pending tasks
* Task status
* Project progress

---

# 52. Team Lead Dashboard

The Team Lead dashboard may display:

* Team members
* Assigned tasks
* Task status
* Team progress

---

# 53. Employee Dashboard

The Employee dashboard may display:

* Own profile
* Own leave requests
* Assigned projects
* Assigned tasks
* Task status

---

# 54. Non-Functional Requirements

---

# 55. Security Requirements

Security is a core requirement because the system handles employee information.

The system shall:

1. Secure user authentication.
2. Hash passwords.
3. Protect API endpoints.
4. Validate input.
5. Enforce authorization.
6. Enforce tenant isolation.
7. Protect sensitive configuration.
8. Use secure authentication token handling.
9. Apply appropriate HTTP security headers.
10. Protect authentication endpoints against abuse.

---

# 56. Authentication Security

The authentication system shall include:

* Password hashing
* Access tokens
* Refresh tokens
* Protected APIs
* Authentication middleware

JWT shall be used for authentication.

---

# 57. Backend Authorization

Authorization shall be enforced on the backend.

The backend authorization flow shall conceptually be:

```text
authenticate()
      ↓
authorize("leave.approve")
      ↓
Tenant Access Check
      ↓
Controller
```

Authorization must happen before protected business operations are executed.

---

# 58. Input Validation

Requests shall be validated before reaching business logic.

Conceptual flow:

```text
HTTP Request
      ↓
Zod Validation
      ↓
Business Logic
      ↓
Database
```

Invalid input must be rejected appropriately.

---

# 59. Security Middleware

The backend shall use appropriate security middleware including:

* Helmet
* CORS
* Rate limiting
* Centralized error handling

---

# 60. Mandatory Security Rules

The following rules are mandatory.

### Rule 1 — Tenant Isolation

Users cannot access resources outside their organization.

### Rule 2 — Permission Enforcement

Users cannot perform actions they do not have permission for.

### Rule 3 — Password Protection

Passwords must never be stored in plain text.

### Rule 4 — Secret Protection

Sensitive configuration must not be committed to source control.

### Rule 5 — Backend Authorization

Frontend authorization must not replace backend authorization.

### Rule 6 — Tenant-Aware Queries

All tenant-owned database queries must be properly scoped.

---

# 61. Performance Requirements

The system should:

* Return API responses efficiently.
* Use database indexes where appropriate.
* Avoid unnecessary database queries.
* Use pagination for large datasets.
* Avoid loading unnecessary data.
* Optimize frequently used queries.

Large collections must not be loaded unnecessarily into memory.

---

# 62. Scalability Requirements

The architecture should support future scaling.

The application shall allow additional organizations and users to be added without creating a separate application for every organization.

The architecture should allow new modules to be added without restructuring the entire system.

The MVP should remain a modular monolith.

---

# 63. Maintainability Requirements

The codebase should:

* Use TypeScript.
* Follow modular architecture.
* Separate business logic from controllers.
* Use reusable components.
* Follow consistent naming conventions.
* Use centralized error handling.
* Use validation schemas.
* Maintain documentation.

---

# 64. Availability Requirements

The production application should:

* Use reliable hosting infrastructure.
* Use appropriate database backup mechanisms.
* Be deployable as separate frontend, backend, and database components.

---

# 65. System Architecture Requirements

The MVP shall use a **Modular Monolith** architecture.

The high-level architecture is:

```text
CLIENT
   │
   ▼
React + TypeScript
   │
React Router
   │
TanStack Query
   │
REST API
   │
   ▼
Node.js + Express
   │
   ├── Authentication / RBAC
   ├── Validation
   └── Business Logic
   │
   ▼
Prisma
   │
   ▼
PostgreSQL
```

---

# 66. Backend Architecture Requirements

The backend shall be organized by business modules.

The expected conceptual module structure is:

```text
server/
└── src/
    ├── modules/
    │   ├── auth/
    │   ├── organizations/
    │   ├── users/
    │   ├── roles/
    │   ├── permissions/
    │   ├── employees/
    │   ├── departments/
    │   ├── teams/
    │   ├── leaves/
    │   ├── projects/
    │   └── tasks/
    │
    ├── middleware/
    ├── config/
    ├── database/
    ├── utils/
    ├── routes/
    └── app.ts
```

Each business module may contain:

```text
module/
├── controller
├── service
├── repository / data-access
├── schema
├── routes
└── types
```

Business logic should not be unnecessarily placed directly inside controllers.

---

# 67. Frontend Architecture Requirements

The frontend should follow a modular feature-oriented structure.

Conceptually:

```text
client/
└── src/
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
    │
    ├── hooks/
    ├── services/
    ├── routes/
    ├── schemas/
    ├── types/
    ├── utils/
    └── App.tsx
```

---

# 68. Technology Requirements

## 68.1 Frontend

| Technology      | Purpose                       |
| --------------- | ----------------------------- |
| React           | User interface                |
| TypeScript      | Type safety                   |
| Vite            | Development and build tooling |
| React Router    | Client-side routing           |
| TanStack Query  | Server-state/API management   |
| React Hook Form | Form management               |
| Zod             | Runtime validation            |
| Tailwind CSS    | Styling                       |

---

# 69. Backend Technology

| Technology    | Purpose                       |
| ------------- | ----------------------------- |
| Node.js       | Backend runtime               |
| Express.js    | REST API framework            |
| TypeScript    | Type safety                   |
| Prisma        | PostgreSQL ORM and migrations |
| Zod           | Request validation            |
| JWT           | Authentication                |
| bcrypt        | Password hashing              |
| Helmet        | HTTP security headers         |
| CORS          | Cross-origin access control   |
| Rate Limiting | API abuse protection          |

---

# 70. Database Requirements

PostgreSQL shall be the primary database.

The database shall store information for:

* Organizations
* Users
* Roles
* Permissions
* Employees
* Departments
* Teams
* Leaves
* Projects
* Tasks

The database model must support tenant-aware data isolation.

---

# 71. Database Entity Requirements

## 71.1 Organization

Conceptual fields:

```text
Organization
------------
id
name
status
created_at
updated_at
```

---

## 71.2 User

Conceptual fields:

```text
User
----
id
organization_id
email
password_hash
role_id
status
created_at
updated_at
```

---

## 71.3 Employee

Conceptual fields:

```text
Employee
--------
id
organization_id
user_id
employee_id
first_name
last_name
department_id
team_id
manager_id
joining_date
status
created_at
updated_at
```

---

## 71.4 Department

Conceptual fields:

```text
Department
----------
id
organization_id
name
status
created_at
updated_at
```

---

## 71.5 Team

Conceptual fields:

```text
Team
----
id
organization_id
department_id
name
team_lead_id
status
created_at
updated_at
```

---

## 71.6 Leave

Conceptual fields:

```text
Leave
-----
id
organization_id
employee_id
leave_type_id
start_date
end_date
reason
status
approved_by
created_at
updated_at
```

---

## 71.7 Project

Conceptual fields:

```text
Project
-------
id
organization_id
name
description
status
start_date
end_date
created_at
updated_at
```

---

## 71.8 Task

Conceptual fields:

```text
Task
----
id
organization_id
project_id
assigned_to
title
description
priority
status
due_date
created_at
updated_at
```

---

# 72. API Requirements

The backend shall expose REST APIs.

The API base path shall be:

```text
/api/v1
```

---

# 73. Authentication APIs

```text
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/refresh
POST /auth/forgot-password
POST /auth/reset-password
```

---

# 74. Organization APIs

```text
POST /organizations
GET /organizations
GET /organizations/:id
PATCH /organizations/:id
PATCH /organizations/:id/status
```

---

# 75. User APIs

```text
POST /users
GET /users
GET /users/:id
PATCH /users/:id
PATCH /users/:id/status
PATCH /users/:id/role
```

---

# 76. Employee APIs

```text
POST /employees
GET /employees
GET /employees/:id
PATCH /employees/:id
PATCH /employees/:id/status
```

---

# 77. Department APIs

```text
POST /departments
GET /departments
GET /departments/:id
PATCH /departments/:id
```

---

# 78. Team APIs

```text
POST /teams
GET /teams
GET /teams/:id
PATCH /teams/:id
POST /teams/:id/members
DELETE /teams/:id/members/:employeeId
```

---

# 79. Leave APIs

```text
POST /leaves
GET /leaves
GET /leaves/:id
PATCH /leaves/:id/cancel
PATCH /leaves/:id/approve
PATCH /leaves/:id/reject
```

---

# 80. Project APIs

```text
POST /projects
GET /projects
GET /projects/:id
PATCH /projects/:id
POST /projects/:id/members
```

---

# 81. Task APIs

```text
POST /tasks
GET /tasks
GET /tasks/:id
PATCH /tasks/:id
PATCH /tasks/:id/status
PATCH /tasks/:id/assignee
```

---

# 82. API Contract Requirements

The final API specification shall define:

* Request schemas
* Response formats
* Authentication requirements
* Authorization requirements
* Tenant access requirements
* Validation requirements
* Error responses
* HTTP status codes

---

# 83. Standard API Response

Successful API responses should follow a consistent structure.

Example:

```json
{
  "success": true,
  "data": {},
  "message": "Employee retrieved successfully"
}
```

---

# 84. Standard API Error Response

Error responses should follow a consistent structure.

Example:

```json
{
  "success": false,
  "message": "You do not have permission to perform this action",
  "code": "FORBIDDEN"
}
```

---

# 85. HTTP Status Codes

The API shall use appropriate HTTP status codes.

| Status | Meaning                                  |
| ------ | ---------------------------------------- |
| 200    | Successful request                       |
| 201    | Resource created                         |
| 204    | Successful request with no response body |
| 400    | Bad request                              |
| 401    | Authentication required / invalid        |
| 403    | Insufficient permission                  |
| 404    | Resource not found                       |
| 409    | Conflict                                 |
| 422    | Validation failure                       |
| 429    | Too many requests                        |
| 500    | Internal server error                    |

---

# 86. Error Handling Requirements

The backend shall use centralized error handling.

Errors should provide:

* HTTP status
* Human-readable message
* Machine-readable error code where appropriate

Example:

```json
{
  "success": false,
  "message": "Employee not found",
  "code": "EMPLOYEE_NOT_FOUND"
}
```

Production errors must not expose sensitive internal implementation details.

---

# 87. Logging Requirements

Application logging shall help diagnose:

* API failures
* Authentication problems
* Server errors
* Important application events

Morgan may be used initially for development HTTP logging.

Structured logging may be introduced later if the system grows.

---

# 88. Audit Logging Requirements

Basic audit logging should be considered for important actions such as:

* User creation
* Role changes
* Employee creation
* Employee status changes
* Leave approval
* Leave rejection
* Organization status changes

Comprehensive audit functionality is outside the initial MVP and may be expanded later.

---

# 89. Environment Configuration Requirements

Environment-specific configuration shall be stored using environment variables.

Expected environment variables include:

```text
NODE_ENV
PORT
DATABASE_URL
JWT_SECRET
JWT_REFRESH_SECRET
CORS_ORIGIN
```

Sensitive values must never be committed to Git.

An example environment file shall be maintained:

```text
.env.example
```

Actual secret values must remain outside source control.

---

# 90. Environment File Rules

The project should follow this model:

```text
.env
    ↓
Local / deployment secrets
    ↓
NOT committed to Git

.env.example
    ↓
Variable names / placeholders
    ↓
Can be committed to Git
```

The requirements documentation, source code, and configuration files must not contain real secrets.

---

# 91. User Workflows

---

## 91.1 Organization Creation Workflow

```text
Super Admin
    ↓
Create Organization
    ↓
Organization Created
    ↓
Organization Admin Created / Assigned
    ↓
Organization Becomes Active
```

---

## 91.2 Employee Onboarding Workflow

```text
Organization Admin / HR
          ↓
      Create User
          ↓
      Assign Role
          ↓
 Create Employee Profile
          ↓
 Assign Department
          ↓
    Assign Team
          ↓
   Assign Manager
          ↓
    Employee Active
```

---

## 91.3 Leave Request Workflow

```text
Employee
   ↓
Select Leave Type
   ↓
Select Dates
   ↓
Enter Reason
   ↓
Submit
   ↓
PENDING
   ↓
HR / Authorized Manager
   ↓
Approve / Reject
```

---

## 91.4 Project Workflow

```text
Project Manager
       ↓
Create Project
       ↓
Assign Members
       ↓
Create Tasks
       ↓
Assign Tasks
       ↓
Employees Work on Tasks
       ↓
Task Status Updated
       ↓
Project Progress
```

---

# 92. MVP Definition

The MVP is the first usable version of the platform containing the core functionality required to demonstrate the product concept and primary business workflows.

The MVP focuses on:

```text
Authentication
      +
Multi-Tenancy
      +
RBAC
      +
Employee Management
      +
Leave Management
      +
Basic Projects
      +
Basic Tasks
```

---

# 93. MVP Feature List

## Module 1 — Authentication

* Login
* Logout
* Password hashing
* JWT authentication
* Protected routes
* Password reset

## Module 2 — Organizations

* Create organization
* View organization
* Update organization
* Activate organization
* Deactivate organization

## Module 3 — Users

* Create user
* Update user
* Disable user
* Assign role

## Module 4 — RBAC

* Roles
* Permissions
* Role-permission mapping
* Authorization middleware

## Module 5 — Tenant Isolation

* Organization identification
* Tenant-aware queries
* Tenant access validation

## Module 6 — Employees

* Employee CRUD
* Employee profile
* Department
* Team
* Manager
* Employment status

## Module 7 — Departments

* Create
* View
* Update
* Deactivate

## Module 8 — Teams

* Create
* View
* Update
* Team Lead
* Team members

## Module 9 — Leave

* Apply
* View
* Cancel
* Approve
* Reject
* Status

## Module 10 — Projects

* Create
* View
* Update
* Assign members
* Status

## Module 11 — Tasks

* Create
* View
* Update
* Assign
* Priority
* Due date
* Status

## Module 12 — Dashboards

* Super Admin
* Organization Admin
* HR
* Project Manager
* Team Lead
* Employee

---

# 94. MVP Acceptance Criteria

The MVP shall be considered functionally complete when all of the following are satisfied.

## Organization

* [ ] A Super Admin can create organizations.
* [ ] A Super Admin can view organizations.
* [ ] A Super Admin can update organizations.
* [ ] A Super Admin can activate organizations.
* [ ] A Super Admin can deactivate organizations.

## Users

* [ ] Organizations can have their own users.
* [ ] Authorized users can create users.
* [ ] Authorized users can update users.
* [ ] Authorized users can disable users.
* [ ] Users can be assigned roles.

## Authentication

* [ ] Users can authenticate securely.
* [ ] Users can log out.
* [ ] Passwords are securely hashed.
* [ ] Protected APIs require authentication.
* [ ] Password reset is supported.

## RBAC

* [ ] Roles are defined.
* [ ] Permissions are defined.
* [ ] Permissions are associated with roles.
* [ ] Authorization is enforced by the backend.
* [ ] Users cannot perform unauthorized actions.

## Tenant Isolation

* [ ] Organizations share the same application.
* [ ] Organizations share the PostgreSQL database.
* [ ] Tenant-owned records contain organization context.
* [ ] Tenant-aware queries are enforced.
* [ ] Cross-tenant resource access is denied.
* [ ] Cross-tenant resource modification is denied.

## Employees

* [ ] Employees can be created.
* [ ] Employees can be viewed.
* [ ] Employees can be updated.
* [ ] Employees can be managed according to permissions.
* [ ] Employee department assignment works.
* [ ] Employee team assignment works.
* [ ] Employee manager assignment works.
* [ ] Employee status can be managed.

## Departments

* [ ] Departments can be created.
* [ ] Departments can be viewed.
* [ ] Departments can be updated.
* [ ] Departments can be deactivated.
* [ ] Employees can be associated with departments.

## Teams

* [ ] Teams can be created.
* [ ] Teams can be viewed.
* [ ] Teams can be updated.
* [ ] Team Leads can be assigned.
* [ ] Team members can be added.
* [ ] Team members can be removed.
* [ ] Team members can be viewed.

## Leave

* [ ] Employees can apply for leave.
* [ ] Employees can view their leave requests.
* [ ] Eligible pending leave requests can be cancelled.
* [ ] Authorized users can view leave requests.
* [ ] Authorized users can approve leave.
* [ ] Authorized users can reject leave.
* [ ] Leave statuses are correctly maintained.

## Projects

* [ ] Authorized users can create projects.
* [ ] Authorized users can view projects.
* [ ] Authorized users can update projects.
* [ ] Project members can be assigned.
* [ ] Project status can be changed.

## Tasks

* [ ] Tasks can be created.
* [ ] Tasks can be viewed.
* [ ] Tasks can be updated.
* [ ] Tasks can be assigned.
* [ ] Task priority can be set.
* [ ] Task due dates can be set.
* [ ] Task status can be changed.

## Dashboards

* [ ] Super Admin dashboard exists.
* [ ] Organization Admin dashboard exists.
* [ ] HR dashboard exists.
* [ ] Project Manager dashboard exists.
* [ ] Team Lead dashboard exists.
* [ ] Employee dashboard exists.

## Validation

* [ ] APIs validate incoming data.
* [ ] Invalid requests return appropriate errors.
* [ ] Validation occurs before business logic.

## Error Handling

* [ ] Centralized error handling exists.
* [ ] Errors use appropriate HTTP status codes.
* [ ] Errors provide meaningful messages.
* [ ] Machine-readable error codes are provided where appropriate.
* [ ] Production errors do not expose sensitive internal details.

## Testing

* [ ] Important workflows have automated tests.
* [ ] Authentication is tested.
* [ ] CRUD operations are tested.
* [ ] Validation is tested.
* [ ] Authorization is tested.
* [ ] RBAC is tested.
* [ ] Tenant isolation is tested.

## Deployment

* [ ] Frontend can be built for production.
* [ ] Backend can be built for production.
* [ ] Database can be deployed.
* [ ] Production configuration is available.
* [ ] CI/CD pipeline is configured.
* [ ] Application can be deployed to a production environment.

---

# 95. Testing Requirements

Testing shall be performed throughout development rather than only at the end.

---

# 96. Unit Testing

Unit testing shall cover:

* Business logic
* Utility functions
* Validation logic
* Permission logic

Technology:

```text
Vitest
```

---

# 97. Frontend Testing

Frontend tests shall cover:

* Components
* Forms
* User interactions
* Important UI workflows

Technology:

```text
React Testing Library
```

---

# 98. API Testing

API tests shall cover:

* Authentication
* CRUD operations
* Validation
* Authorization
* Error responses

Technology:

```text
Supertest
```

---

# 99. Critical Security Tests

The following tests are mandatory and considered critical MVP tests.

---

## Test 1 — Unauthorized Leave Approval

```text
Employee
   ↓
Approve Leave
   ↓
403 Forbidden
```

An Employee must not be able to approve leave.

---

## Test 2 — Authorized Leave Approval

```text
HR
   ↓
Approve Leave
   ↓
Allowed
```

An authorized HR user must be able to approve leave.

---

## Test 3 — Cross-Tenant Access

```text
Organization A HR
       ↓
Request Organization B Employee
       ↓
Access Denied
```

---

## Test 4 — Cross-Tenant Update

```text
Organization A User
       ↓
Update Organization B Employee
       ↓
Access Denied
```

Tenant isolation tests are mandatory for MVP completion.

---

# 100. Development and Delivery Requirements

The project shall follow an Agile development approach.

Development shall be divided into two-week sprints.

Each sprint shall follow:

```text
Planning
   ↓
Development
   ↓
Testing
   ↓
Review
   ↓
Retrospective
   ↓
Next Sprint
```

Each sprint should produce a usable increment of the application.

---

# 101. MVP Development Estimate

The initial planning estimate is:

| Item                         |     Estimate |
| ---------------------------- | -----------: |
| Development Team             |  1 Developer |
| Sprint Duration              |      2 Weeks |
| Planned Sprints              |            8 |
| Planned Story Points         |      ~270 SP |
| Initial Development Timeline |    ~16 Weeks |
| Recommended Buffer           |       15–20% |
| Overall Planning Range       | ~14–19 Weeks |

Story points represent relative:

* Effort
* Complexity
* Risk
* Uncertainty

Story points do not represent a fixed number of hours.

---

# 102. MVP Delivery Scope

The initial planned sprint scope is:

## Sprint 1 — Project Foundation

Duration: 2 weeks

Focus:

* Repository setup
* Frontend setup
* Backend setup
* TypeScript configuration
* PostgreSQL setup
* Prisma setup
* Environment configuration
* Basic application structure
* Basic API structure
* Database migration setup
* Basic error handling

Estimated: **15 Story Points**

Deliverable:

Working frontend, backend, and PostgreSQL foundation.

---

## Sprint 2 — Authentication

Duration: 2 weeks

Focus:

* User model
* Registration
* Login
* Logout
* Password hashing
* JWT
* Refresh token strategy
* Authentication middleware
* Protected routes
* Password reset

Estimated: **25 Story Points**

Deliverable:

Users can securely authenticate and access protected resources.

---

## Sprint 3 — Organizations & Multi-Tenancy

Duration: 2 weeks

Focus:

* Organization model
* Organization CRUD
* Organization status
* Tenant identification
* Tenant middleware
* Tenant-aware queries
* Tenant access validation

Estimated: **30 Story Points**

Deliverable:

Multiple organizations can use the same application with logically isolated data.

---

## Sprint 4 — Users, Roles & RBAC

Duration: 2 weeks

Focus:

* User management
* Role model
* Permission model
* Role-permission mapping
* Permission middleware
* Authorization rules
* Frontend permission handling

Estimated: **40 Story Points**

Deliverable:

Users can perform actions according to their assigned roles and permissions.

---

## Sprint 5 — Employee Management

Duration: 2 weeks

Focus:

* Employee model
* Employee CRUD
* Employee profile
* Job information
* Department assignment
* Team assignment
* Manager assignment
* Employment status

Estimated: **30 Story Points**

Deliverable:

Organizations can manage employee records.

---

## Sprint 6 — Departments, Teams & Leave

Duration: 2 weeks

Focus:

* Department management
* Team management
* Team members
* Leave types
* Leave application
* Leave cancellation
* Leave approval
* Leave rejection
* Leave status

Estimated: **50 Story Points**

Deliverable:

Employees can submit leave requests and authorized users can approve or reject them.

---

## Sprint 7 — Projects, Tasks & Dashboards

Duration: 2 weeks

Focus:

* Project management
* Project members
* Task management
* Task assignment
* Task priority
* Task due dates
* Task status
* Role-specific dashboards

Estimated: **45 Story Points**

Deliverable:

Organizations can manage basic projects and employee tasks.

---

## Sprint 8 — Testing, Security & Deployment

Duration: 2 weeks

Focus:

* Unit testing
* API testing
* Integration testing
* RBAC testing
* Tenant isolation testing
* Security review
* Error handling review
* Bug fixing
* Production configuration
* CI/CD
* Deployment
* Final regression testing

Estimated: **35 Story Points**

Deliverable:

Tested, secured, and deployable MVP.

---

# 103. Development Constraints

The MVP shall follow these constraints:

1. One developer is assumed for the initial planning estimate.
2. Development is planned around two-week sprints.
3. Requirements should remain reasonably stable.
4. Major third-party integrations are excluded from MVP.
5. Payroll is excluded.
6. Billing is excluded.
7. Advanced attendance is excluded.
8. Microservices are excluded from MVP.
9. Major scope expansion should be avoided.

---

# 104. Estimation Buffer

A 15–20% buffer should be considered for:

* Bugs
* Unexpected technical problems
* Requirement clarification
* Integration problems
* Database changes
* Security issues
* Deployment issues
* Additional testing

The buffer must not be treated as planned feature-development time.

---

# 105. Deployment Requirements

The system shall be deployable as separate components:

```text
Internet
   │
   ├───────────────┐
   │               │
Frontend          Backend
React             Express
   │               │
   └───────┬───────┘
           │
      PostgreSQL
```

The production deployment should include:

* Frontend
* Backend
* PostgreSQL database
* Production environment configuration

---

# 106. CI/CD Requirements

GitHub Actions may be used for automated CI/CD.

The expected pipeline is:

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

Deployment should occur only when required checks pass.

---

# 107. Git Requirements

The project shall use Git for version control.

The recommended branch structure is:

```text
main
 │
 ├── develop
 │
 ├── feature/authentication
 ├── feature/rbac
 ├── feature/employees
 └── feature/leave-management
```

Feature branches should be merged after appropriate review and testing.

Commit messages should clearly describe the change.

---

# 108. Definition of Done

A feature shall be considered complete only when:

* [ ] Requirement is implemented.
* [ ] UI is implemented where required.
* [ ] Backend API is implemented.
* [ ] Validation is implemented.
* [ ] Authorization is implemented.
* [ ] Tenant isolation is verified.
* [ ] Error handling is implemented.
* [ ] Tests are added.
* [ ] Code is reviewed.
* [ ] Feature works in the expected workflow.
* [ ] Documentation is updated where required.

---

# 109. Project Risks

## Risk 1 — Tenant Data Leakage

### Risk

Incorrect database queries could expose one organization's data to another organization.

### Mitigation

* Mandatory organization scoping
* Tenant-aware data-access patterns
* Authorization checks
* Automated cross-tenant tests

---

## Risk 2 — Incorrect Permissions

### Risk

Users may receive permissions they should not have.

### Mitigation

* Centralized RBAC
* Permission-based authorization
* Automated permission tests
* Backend enforcement

---

## Risk 3 — Scope Creep

### Risk

Additional features may continuously be added during MVP development.

### Mitigation

Maintain a strict MVP scope.

Additional features should be moved to the future roadmap unless they are critical to the MVP.

---

## Risk 4 — Underestimated Complexity

### Risk

Authentication, RBAC, tenant isolation, and leave workflows may require more effort than initially expected.

### Mitigation

* Use story points.
* Conduct sprint reviews.
* Update estimates based on actual progress.

---

## Risk 5 — Database Design Changes

### Risk

As requirements become clearer, database relationships may change.

### Mitigation

* Design the core domain model before implementation.
* Use database migrations for controlled schema changes.

---

# 110. Project Assumptions

The initial project assumes:

1. The application will be web-based.
2. The application will support multiple organizations.
3. Organizations will use a shared application.
4. Organizations will use a shared PostgreSQL database.
5. Tenant data will be logically isolated.
6. Users will have predefined roles during MVP.
7. Advanced custom roles are a future enhancement.
8. Payroll is outside the MVP.
9. Advanced attendance is outside the MVP.
10. Billing/subscriptions are outside the MVP.
11. Advanced notifications are outside the MVP.
12. Advanced analytics are outside the MVP.
13. Third-party infrastructure will only be introduced when required.
14. Microservices are not required for MVP.
15. Requirements remain reasonably stable during the MVP development period.

---

# 111. Future Enhancements

The following features are intentionally deferred from the MVP.

---

# 112. Phase 2 — Attendance

Potential features:

* Check-in
* Check-out
* Working hours
* Attendance history
* Late/early tracking
* Attendance correction

---

# 113. Phase 2 — Notifications

Potential features:

* In-app notifications
* Email notifications
* Leave notifications
* Task notifications

---

# 114. Phase 2 — Audit Logs

Potential features:

* Detailed activity history
* User activity tracking
* Administrative actions

---

# 115. Phase 2 — Reports

Potential features:

* Employee reports
* Leave reports
* Project reports
* Export functionality

---

# 116. Advanced Features

Future versions may include:

* Custom roles
* Advanced leave policies
* Leave balance management
* Holiday calendars
* Advanced project management
* Advanced task management
* Task comments
* Attachments
* Task dependencies
* Time tracking
* Advanced analytics
* Organization branding
* Document management

---

# 117. Future SaaS Features

Once the core platform is stable, SaaS-specific functionality may be introduced:

* Subscription plans
* Billing
* Usage limits
* Organization-level feature flags
* Subscription management
* Plan-based permissions
* Organization onboarding workflows

---

# 118. Future Security Enhancements

Future versions may include:

* MFA/2FA
* Advanced audit logs
* Security event monitoring
* Advanced session management
* Organization security policies

These are not part of the MVP.

---

# 119. Future Infrastructure

Additional infrastructure should be introduced only when there is a real requirement.

Potential future infrastructure includes:

## Redis

Potential uses:

* Caching
* Distributed rate limiting
* Session-related infrastructure
* Temporary data

## BullMQ

Potential uses:

* Background jobs
* Email processing
* Report generation
* Notifications

## S3-Compatible Object Storage

Potential uses:

* Employee documents
* Profile images
* Attachments

## Transactional Email Provider

Potential uses:

* Password reset emails
* Account verification
* Leave notifications
* System notifications

These are not required for the initial MVP.

---

# 120. Scalability Roadmap

The MVP architecture is:

```text
React
  ↓
Express
  ↓
Prisma
  ↓
PostgreSQL
```

As the system grows, supporting infrastructure may be introduced:

```text
React
  ↓
Express
  ├── PostgreSQL
  ├── Redis
  ├── Object Storage
  └── Background Worker
          ↓
      Email / Jobs
```

Microservices are not required for the MVP.

The modular monolith should be scaled first before introducing distributed-system complexity.

---

# 121. MVP vs Future Roadmap

| Feature                 | MVP                 | Future                          |
| ----------------------- | ------------------- | ------------------------------- |
| Authentication          | Yes                 | Enhanced security               |
| Organizations           | Yes                 | Enhanced onboarding             |
| Multi-Tenancy           | Yes                 | Advanced SaaS features          |
| Tenant Isolation        | Yes                 | Advanced security               |
| Users                   | Yes                 | Enhanced management             |
| Roles                   | Yes                 | Custom roles                    |
| Permissions             | Yes                 | Plan-based permissions          |
| RBAC                    | Yes                 | Advanced authorization          |
| Employees               | Yes                 | Advanced employee management    |
| Departments             | Yes                 | Advanced organization structure |
| Teams                   | Yes                 | Advanced team management        |
| Leave Management        | Yes                 | Advanced leave policies         |
| Basic Projects          | Yes                 | Advanced project management     |
| Basic Tasks             | Yes                 | Advanced task management        |
| Dashboards              | Yes                 | Advanced analytics              |
| Testing                 | Yes                 | Expanded coverage               |
| Deployment              | Yes                 | Advanced infrastructure         |
| Attendance              | No                  | Yes                             |
| Notifications           | No                  | Yes                             |
| Audit Logs              | Basic consideration | Advanced                        |
| Reports                 | Basic consideration | Advanced                        |
| Documents               | No                  | Yes                             |
| Custom Roles            | No                  | Yes                             |
| Advanced Leave Policies | No                  | Yes                             |
| Advanced Analytics      | No                  | Yes                             |
| Billing                 | No                  | Yes                             |
| Organization Branding   | No                  | Yes                             |
| MFA/2FA                 | No                  | Yes                             |
| Advanced Workflows      | No                  | Yes                             |

---

# 122. MVP Deliverables

At the end of the MVP, the project should deliver:

## Application

* React web application
* Super Admin interface
* Organization interface
* Role-specific dashboards

## Backend

* Node.js/Express REST API
* Authentication
* RBAC
* Tenant isolation
* Business logic
* Validation
* Error handling

## Database

* PostgreSQL database
* Database schema
* Prisma migrations
* Tenant-aware data model

## Testing

* Unit tests
* Frontend tests
* API tests
* Authorization tests
* Tenant isolation tests

## DevOps

* Git repository
* Docker configuration where required
* CI/CD pipeline
* Production deployment configuration

## Documentation

* Project documentation
* API documentation
* Database documentation
* Setup instructions
* Environment configuration documentation

---

# 123. Success Criteria

The project will be considered successful when it demonstrates the following.

## 123.1 Business Success

* Multiple organizations can use one platform.
* Organizations can manage their workforce.
* Employees can manage relevant activities.
* Leave workflows can be handled digitally.
* Projects and tasks can be managed.

## 123.2 Security Success

* Authentication works securely.
* Roles and permissions are enforced.
* Tenant data remains isolated.
* Unauthorized operations are rejected.

## 123.3 Technical Success

* Frontend and backend are separated cleanly.
* Backend follows modular architecture.
* PostgreSQL is properly structured.
* APIs are validated.
* Automated tests cover critical functionality.
* Application can be deployed.

## 123.4 Scalability Success

* New organizations can be added without creating separate applications.
* New modules can be added without restructuring the entire system.
* Future infrastructure such as Redis, background jobs, and object storage can be introduced when required.

---

# 124. Complete MVP User Journey

The complete MVP business flow is:

```text
                         SaaS Platform
                               │
                               ▼
                          Super Admin
                               │
                               ▼
                      Create Organization
                               │
                               ▼
                     Organization Admin
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
             HR               PM               TL
              │                │                │
              ▼                ▼                ▼
        Employees          Projects           Teams
                               │
                               ▼
                             Tasks
                               │
              ┌────────────────┴────────────────┐
              │                                 │
              ▼                                 ▼
          Employee                         Employee
              │                                 │
       ┌──────┴──────┐                          │
       ▼             ▼                          ▼
   Leave Request   Tasks                   Projects
       │
       ▼
   HR / Manager
       │
   ┌───┴────┐
   ▼        ▼
APPROVED  REJECTED
```

---

# 125. Architecture Principles

The implementation must follow these high-level principles:

1. Multi-tenancy is a core architectural requirement.
2. Tenant isolation is a security requirement.
3. RBAC is a core authorization mechanism.
4. Backend authorization is mandatory.
5. Frontend permission checks are UI controls only.
6. All tenant-owned queries must be tenant-aware.
7. Business logic should be separated from controllers.
8. Input validation should occur before business logic.
9. Error handling should be centralized.
10. The codebase should use TypeScript.
11. The MVP should remain a modular monolith.
12. New infrastructure should be introduced only when justified by actual requirements.
13. Critical security workflows must have automated tests.
14. Documentation must remain synchronized with implementation.

---

# 126. Requirement Change Policy

Requirements may evolve during development.

When a requirement changes:

1. The change must be explicitly identified.
2. The affected requirement in this document must be updated.
3. The impact on the implementation plan must be evaluated.
4. The affected implementation tasks must be updated.
5. Tests must be updated where necessary.
6. Documentation must be updated where necessary.

New functionality should not be silently added to the MVP.

Features that are not part of the MVP should normally be placed in the future roadmap unless they are explicitly approved as MVP scope.

---

# 127. Source of Truth Rules for Cursor AI

When working on this project, the following hierarchy should be respected:

```text
REQUIREMENTS.md
       ↓
Defines WHAT the system must do

PLAN.md
       ↓
Defines HOW the system will be built

IMPLEMENTATION.md
       ↓
Defines WHAT has actually been implemented
```

Cursor should:

* Read and understand `REQUIREMENTS.md` before implementing features.
* Follow the defined MVP scope.
* Respect role and permission boundaries.
* Respect tenant isolation requirements.
* Avoid implementing explicitly out-of-scope features.
* Avoid introducing unnecessary infrastructure.
* Update implementation documentation as features are completed.
* Keep implementation aligned with the approved requirements.

---

# 128. Requirement Traceability

Each major requirement should be traceable through:

```text
Requirement
    ↓
Plan
    ↓
Implementation
    ↓
Tests
    ↓
Acceptance Criteria
```

For example:

```text
Tenant Isolation
      ↓
Tenant Architecture Plan
      ↓
Tenant Middleware + Data Access
      ↓
Cross-Tenant Tests
      ↓
Acceptance Criteria
```

Similarly:

```text
Leave Approval
      ↓
Leave Management Plan
      ↓
Leave API + Authorization
      ↓
RBAC Tests
      ↓
MVP Acceptance Criteria
```

---

# 129. Final MVP Requirement Summary

The MVP must provide:

```text
                    MULTI-TENANT HRMS
                           │
          ┌────────────────┼────────────────┐
          │                │                │
   Authentication       RBAC          Tenant Isolation
          │                │                │
          └────────────────┼────────────────┘
                           │
             ┌─────────────┴─────────────┐
             │                           │
       Organization                 User Management
             │                           │
       ┌─────┼─────┐                     │
       │     │     │                     │
      HR     PM    TL              Employee Management
       │     │     │                     │
       │     │     └──────────┐          │
       │     │                │          │
       ▼     ▼                ▼          ▼
    Leaves Projects         Teams    Departments
             │
             ▼
           Tasks
             │
             ▼
      Role-Specific
        Dashboards
```

The MVP combines:

* Multi-Tenancy
* Tenant Isolation
* Authentication
* RBAC
* Employee Management
* Organization Management
* User Management
* Department Management
* Team Management
* Leave Management
* Project Management
* Task Management
* Role-Based Dashboards
* Validation
* Error Handling
* Security
* Automated Testing
* Deployment

The MVP shall be implemented using:

```text
React + TypeScript
        ↓
React Router
        ↓
TanStack Query
        ↓
REST API
        ↓
Node.js + Express + TypeScript
        ↓
Prisma
        ↓
PostgreSQL
```

The application shall follow a **Modular Monolith** architecture with shared application infrastructure and shared database storage while maintaining logical tenant-level isolation.

---

# 130. Document Status

| Property         | Value                                        |
| ---------------- | -------------------------------------------- |
| Project          | Multi-Tenant SaaS Employee Management System |
| Version          | 1.0                                          |
| Architecture     | Modular Monolith                             |
| Tenancy Model    | Shared Application + Shared Database         |
| Tenant Isolation | organization_id-based logical isolation      |
| Frontend         | React + TypeScript                           |
| Backend          | Node.js + Express + TypeScript               |
| Database         | PostgreSQL                                   |
| ORM              | Prisma                                       |
| API Style        | REST                                         |
| Authorization    | RBAC                                         |
| Sprint Duration  | 2 Weeks                                      |
| Planned Sprints  | 8                                            |
| Estimated MVP    | ~270 Story Points                            |
| Initial Timeline | ~16 Weeks                                    |
| Planning Range   | ~14–19 Weeks                                 |
| MVP Status       | Planned                                      |

---

# 131. Requirement Completion Statement

This document defines the approved MVP requirements and the boundaries of the initial product.

Implementation should proceed incrementally.

No requirement should be considered implemented merely because the UI exists.

A feature is complete only when the required UI, API, validation, authorization, tenant isolation, business logic, error handling, testing, and workflow behavior are satisfied where applicable.

The highest-priority architectural and security requirements are:

1. Secure authentication.
2. Backend authorization.
3. RBAC.
4. Tenant isolation.
5. Tenant-aware database access.
6. Input validation.
7. Centralized error handling.
8. Automated testing of critical security workflows.
9. Maintainable modular architecture.
10. Production deployment capability.

These requirements form the foundation of the Multi-Tenant SaaS Employee Management System MVP.
