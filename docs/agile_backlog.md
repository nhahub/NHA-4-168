# Agile Backlog — Student Management System

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (TypeScript recommended) |
| Backend | .NET Web API (C#) |
| Database | Microsoft SQL Server (MSSQL) |
| ORM | Entity Framework Core |
| Auth | ASP.NET Identity + JWT |

---

## Epics Overview

| Epic | Description |
|---|---|
| **E1 - Foundation** | Project setup, auth, shared infrastructure |
| **E2 - Student Management** | CRUD for students |
| **E3 - Course Management** | Courses, instructors, assignments |
| **E4 - Enrollment & Payment** | Enrollment lifecycle and payment processing |
| **E5 - Services** | Student service requests |
| **E6 - Ride Booking** | Driver management and ride lifecycle |
| **E7 - Admin Dashboard** | Analytics and reporting |

---

## Sprint Breakdown

---

### Sprint 1 — Foundation & Auth
**Goal:** Working skeleton with authentication, project structure, and database setup.

#### Backend
| Story ID | Story | Points |
|---|---|---|
| S1-BE-01 | Set up .NET Web API project with folder structure (Controllers, Services, Repositories, DTOs, Models) | 3 |
| S1-BE-02 | Configure EF Core with MSSQL connection string and migrations | 3 |
| S1-BE-03 | Create all domain models (entities) from ERD | 5 |
| S1-BE-04 | Scaffold initial EF Core migration and seed data | 3 |
| S1-BE-05 | Implement JWT authentication (register/login endpoints) | 5 |
| S1-BE-06 | Implement role-based authorization (Admin, Student, Driver, Instructor) | 3 |
| S1-BE-07 | Add global exception handling middleware | 2 |
| S1-BE-08 | Configure CORS for React frontend | 1 |

#### Frontend
| Story ID | Story | Points |
|---|---|---|
| S1-FE-01 | Scaffold React app (Vite/CRA, TypeScript, folder structure) | 2 |
| S1-FE-02 | Set up React Router with route guards | 3 |
| S1-FE-03 | Build Login page and connect to auth API | 3 |
| S1-FE-04 | Implement JWT storage and Axios interceptor for auth headers | 3 |
| S1-FE-05 | Build shared layout (Sidebar, Topbar, Protected Route wrapper) | 3 |

---

### Sprint 2 — Student Management
**Goal:** Full CRUD for students visible in the UI.

#### Backend
| Story ID | Story | Points |
|---|---|---|
| S2-BE-01 | `GET /api/students` — List all students (with pagination & filters) | 3 |
| S2-BE-02 | `GET /api/students/{ssn}` — Get student by SSN | 2 |
| S2-BE-03 | `POST /api/students` — Create new student | 3 |
| S2-BE-04 | `PUT /api/students/{ssn}` — Update student | 2 |
| S2-BE-05 | `PATCH /api/students/{ssn}/status` — Change status | 2 |
| S2-BE-06 | Add FluentValidation for Student DTOs | 2 |

#### Frontend
| Story ID | Story | Points |
|---|---|---|
| S2-FE-01 | Student List page (table with search/filter/pagination) | 4 |
| S2-FE-02 | Student Detail page (view profile) | 3 |
| S2-FE-03 | Add/Edit Student modal or form page | 4 |
| S2-FE-04 | Status change confirmation dialog | 2 |

---

### Sprint 3 — Course & Instructor Management
**Goal:** Admins can manage the course catalog and assign instructors.

#### Backend
| Story ID | Story | Points |
|---|---|---|
| S3-BE-01 | `GET /api/courses` — List courses (with filters: level, is_paid, status) | 3 |
| S3-BE-02 | `GET /api/courses/{id}` — Course detail with enrolled count | 2 |
| S3-BE-03 | `POST /api/courses` — Create course | 3 |
| S3-BE-04 | `PUT /api/courses/{id}` — Update course | 2 |
| S3-BE-05 | `DELETE /api/courses/{id}` — Soft delete or deactivate | 2 |
| S3-BE-06 | `GET /api/instructors` — List instructors | 2 |
| S3-BE-07 | `POST /api/instructors` — Create instructor | 2 |
| S3-BE-08 | `POST /api/courses/{id}/instructors` — Assign instructor to course | 3 |
| S3-BE-09 | `DELETE /api/courses/{id}/instructors/{ssn}` — Remove instructor from course | 2 |

#### Frontend
| Story ID | Story | Points |
|---|---|---|
| S3-FE-01 | Course List page with filters | 3 |
| S3-FE-02 | Course Detail page (info + instructor list) | 3 |
| S3-FE-03 | Add/Edit Course form | 4 |
| S3-FE-04 | Instructor List & Add Instructor form | 3 |
| S3-FE-05 | Assign Instructor to Course UI (modal with role selector) | 3 |

---

### Sprint 4 — Enrollment & Payment
**Goal:** Students can enroll in courses; enrollment payment is tracked.

#### Backend
| Story ID | Story | Points |
|---|---|---|
| S4-BE-01 | `GET /api/enrollments` — List enrollments (filter by student/course/status) | 3 |
| S4-BE-02 | `POST /api/enrollments` — Enroll student in course (capacity check) | 5 |
| S4-BE-03 | `PATCH /api/enrollments/{id}/status` — Update enrollment status | 2 |
| S4-BE-04 | `POST /api/payments` — Create payment for enrollment | 4 |
| S4-BE-05 | `GET /api/payments` — List payments (filter by student/status) | 3 |
| S4-BE-06 | `PATCH /api/payments/{id}/status` — Update payment status (simulate gateway callback) | 3 |
| S4-BE-07 | Business rule: block duplicate enrollments in same course | 2 |

#### Frontend
| Story ID | Story | Points |
|---|---|---|
| S4-FE-01 | My Courses / Enrollment list (student view) | 3 |
| S4-FE-02 | Course catalog with "Enroll" button | 3 |
| S4-FE-03 | Payment form (method selection, amount display) | 4 |
| S4-FE-04 | Payment status badge and history list | 3 |
| S4-FE-05 | Admin enrollment management table | 3 |

---

### Sprint 5 — Services Module
**Goal:** Students can discover and request services; admins can approve/reject.

#### Backend
| Story ID | Story | Points |
|---|---|---|
| S5-BE-01 | `GET /api/services` — List all services | 2 |
| S5-BE-02 | `POST /api/services` — Create service (Admin) | 2 |
| S5-BE-03 | `PUT /api/services/{id}` — Update service | 2 |
| S5-BE-04 | `POST /api/student-services` — Student requests a service | 3 |
| S5-BE-05 | `GET /api/student-services` — List requests (filter by student/status) | 3 |
| S5-BE-06 | `PATCH /api/student-services/{id}/status` — Approve or Reject | 2 |

#### Frontend
| Story ID | Story | Points |
|---|---|---|
| S5-FE-01 | Services catalog page (cards with working hours/location) | 3 |
| S5-FE-02 | "Request Service" button with confirmation | 2 |
| S5-FE-03 | My Service Requests list (student view) | 2 |
| S5-FE-04 | Admin service requests management table (approve/reject actions) | 3 |

---

### Sprint 6 — Ride Booking Module
**Goal:** Students can book rides; drivers can update ride status.

#### Backend
| Story ID | Story | Points |
|---|---|---|
| S6-BE-01 | `GET /api/drivers` — List drivers | 2 |
| S6-BE-02 | `POST /api/drivers` — Add driver (Admin) | 2 |
| S6-BE-03 | `PUT /api/drivers/{ssn}` — Update driver details | 2 |
| S6-BE-04 | `POST /api/ride-bookings` — Create booking (auto-assign driver) | 5 |
| S6-BE-05 | `GET /api/ride-bookings` — List bookings (filter by student/driver/status) | 3 |
| S6-BE-06 | `PATCH /api/ride-bookings/{id}/status` — Update ride status | 3 |
| S6-BE-07 | Business rule: calculate fare on completion | 3 |

#### Frontend
| Story ID | Story | Points |
|---|---|---|
| S6-FE-01 | Book Ride form (pickup/dropoff input, submit) | 4 |
| S6-FE-02 | My Rides history (student view) | 2 |
| S6-FE-03 | Driver Dashboard — assigned rides with status update | 4 |
| S6-FE-04 | Admin ride bookings management table | 3 |
| S6-FE-05 | Driver management page (list, add, edit) | 3 |

---

### Sprint 7 — Admin Dashboard & Polish
**Goal:** Admin overview, system-wide analytics, and final QA.

#### Backend
| Story ID | Story | Points |
|---|---|---|
| S7-BE-01 | `GET /api/dashboard/summary` — Aggregate stats (student count, active enrollments, pending payments, etc.) | 4 |
| S7-BE-02 | Add response pagination to all list endpoints (if not already done) | 3 |
| S7-BE-03 | Add audit logging or soft-delete across all major entities | 3 |
| S7-BE-04 | Write integration tests for critical endpoints (enrollment, payment) | 5 |

#### Frontend
| Story ID | Story | Points |
|---|---|---|
| S7-FE-01 | Admin Dashboard page (stat cards, summary tables) | 5 |
| S7-FE-02 | Global loading states and error boundaries | 3 |
| S7-FE-03 | Toast notifications for API responses | 2 |
| S7-FE-04 | Responsive layout review (mobile-friendly) | 3 |
| S7-FE-05 | Empty states and 404 / unauthorized pages | 2 |

## Definition of Done (DoD)

- [ ] API endpoint implemented and returns correct HTTP status codes
- [ ] EF Core migration applied and tested on MSSQL
- [ ] DTO validation in place (FluentValidation or Data Annotations)
- [ ] React component renders correctly with real API data
- [ ] Error states handled (loading, empty, error)
- [ ] Code reviewed and merged to main branch
- [ ] Feature tested manually end-to-end
