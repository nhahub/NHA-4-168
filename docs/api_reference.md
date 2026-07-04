# API Reference — Student Management System

## General Conventions

- **Base URL:** `https://<host>/api`
- **Auth:** All endpoints (except `/auth/*`) require `Authorization: Bearer <JWT>` header
- **Content-Type:** `application/json`
- **Pagination:** List endpoints accept `?page=1&pageSize=20` query params and return a paginated envelope
- **Dates:** ISO 8601 format — `YYYY-MM-DD` for dates, `YYYY-MM-DDTHH:mm:ssZ` for datetimes
- **Roles:** `Admin`, `Student`, `Instructor`, `Driver`

### Standard Paginated Response Envelope

```json
{
  "data": [...],
  "page": 1,
  "pageSize": 20,
  "totalCount": 150,
  "totalPages": 8
}
```

### Standard Error Response

```json
{
  "status": 400,
  "error": "Validation failed",
  "details": {
    "email": ["Email is required", "Must be a valid email address"]
  }
}
```

### HTTP Status Code Reference

| Code | Meaning |
|---|---|
| 200 | OK — successful GET / PATCH / PUT |
| 201 | Created — successful POST |
| 204 | No Content — successful DELETE |
| 400 | Bad Request — validation error |
| 401 | Unauthorized — missing or invalid JWT |
| 403 | Forbidden — insufficient role |
| 404 | Not Found |
| 409 | Conflict — duplicate or business rule violation |
| 500 | Internal Server Error |

---

## Auth

### POST `/api/auth/login`

Authenticate a user and receive a JWT.

**Auth required:** No

**Request body:**
```json
{
  "email": "student@example.com",
  "password": "P@ssword123"
}
```

**Response `200 OK`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresAt": "2026-07-05T12:00:00Z",
  "user": {
    "id": 1001,
    "email": "student@example.com",
    "role": "Student",
    "fullName": "Ahmed Kamal"
  }
}
```

**Errors:** `401` — invalid credentials.

---

### POST `/api/auth/register`

Create a new user account. Admin-only in production; may be open during development.

**Auth required:** Admin

**Request body:**
```json
{
  "firstName": "Ahmed",
  "lastName": "Kamal",
  "email": "ahmed@example.com",
  "password": "P@ssword123",
  "role": "Student",
  "phone": "+201001234567",
  "dateOfBirth": "2000-05-15",
  "address": "Cairo, Egypt"
}
```

**Response `201 Created`:**
```json
{
  "studentSsn": 1001,
  "email": "ahmed@example.com",
  "role": "Student"
}
```

**Errors:** `409` — email already registered.

---

## Students

### GET `/api/students`

List all students with optional filters and pagination.

**Auth required:** Admin

**Query params:**

| Param | Type | Description |
|---|---|---|
| `page` | int | Page number (default: 1) |
| `pageSize` | int | Items per page (default: 20, max: 100) |
| `search` | string | Filter by name or email (partial match) |
| `status` | string | Filter by status: `Active`, `Inactive`, `Graduated` |
| `enrollmentDateFrom` | date | Filter by enrollment date range start |
| `enrollmentDateTo` | date | Filter by enrollment date range end |

**Response `200 OK`:**
```json
{
  "data": [
    {
      "studentSsn": 1001,
      "firstName": "Ahmed",
      "lastName": "Kamal",
      "email": "ahmed@example.com",
      "phone": "+201001234567",
      "status": "Active",
      "enrollmentDate": "2024-09-01"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "totalCount": 85,
  "totalPages": 5
}
```

---

### GET `/api/students/{ssn}`

Get a single student's full profile.

**Auth required:** Admin, or the Student themselves

**Path params:** `ssn` — student SSN (int)

**Response `200 OK`:**
```json
{
  "studentSsn": 1001,
  "firstName": "Ahmed",
  "lastName": "Kamal",
  "email": "ahmed@example.com",
  "phone": "+201001234567",
  "dateOfBirth": "2000-05-15",
  "address": "Cairo, Egypt",
  "enrollmentDate": "2024-09-01",
  "status": "Active"
}
```

**Errors:** `404` — student not found.

---

### POST `/api/students`

Create a new student record.

**Auth required:** Admin

**Request body:**
```json
{
  "firstName": "Sara",
  "lastName": "Mahmoud",
  "email": "sara@example.com",
  "phone": "+201009876543",
  "dateOfBirth": "2001-03-20",
  "address": "Alexandria, Egypt",
  "enrollmentDate": "2025-01-15"
}
```

**Response `201 Created`:** Full student object (same as GET by SSN).

**Errors:** `409` — email already exists. `400` — validation error.

---

### PUT `/api/students/{ssn}`

Replace a student's editable profile fields.

**Auth required:** Admin, or the Student themselves (limited fields)

**Request body:** Same structure as POST, all fields optional but at least one required.

**Response `200 OK`:** Updated student object.

**Errors:** `404`, `400`.

---

### PATCH `/api/students/{ssn}/status`

Change a student's status.

**Auth required:** Admin

**Request body:**
```json
{
  "status": "Graduated"
}
```

Allowed values: `Active`, `Inactive`, `Graduated`, `Suspended`

**Response `200 OK`:**
```json
{
  "studentSsn": 1001,
  "status": "Graduated"
}
```

**Errors:** `404`, `400` — invalid status value.

---

## Courses

### GET `/api/courses`

List all courses with filters.

**Auth required:** Any authenticated user

**Query params:**

| Param | Type | Description |
|---|---|---|
| `page` | int | Page number |
| `pageSize` | int | Items per page |
| `search` | string | Name or description partial match |
| `level` | string | `Beginner`, `Intermediate`, `Advanced` |
| `isPaid` | bool | `true` or `false` |
| `startDateFrom` | date | Filter by start date range |
| `hasCapacity` | bool | Only return courses with available seats |

**Response `200 OK`:**
```json
{
  "data": [
    {
      "courseId": 10,
      "courseName": "Introduction to Python",
      "level": "Beginner",
      "fee": 500.00,
      "isPaid": true,
      "startDate": "2025-02-01",
      "endDate": "2025-05-01",
      "maxCapacity": 30,
      "enrolledCount": 18,
      "availableSeats": 12
    }
  ],
  "page": 1,
  "pageSize": 20,
  "totalCount": 12,
  "totalPages": 1
}
```

---

### GET `/api/courses/{id}`

Get full course detail including assigned instructors.

**Auth required:** Any authenticated user

**Response `200 OK`:**
```json
{
  "courseId": 10,
  "courseName": "Introduction to Python",
  "description": "A beginner-friendly Python course...",
  "level": "Beginner",
  "fee": 500.00,
  "isPaid": true,
  "startDate": "2025-02-01",
  "endDate": "2025-05-01",
  "maxCapacity": 30,
  "enrolledCount": 18,
  "instructors": [
    {
      "instructorSsn": 2001,
      "fullName": "Dr. Mona Farid",
      "role": "Lead",
      "assignedOn": "2024-12-01"
    }
  ]
}
```

**Errors:** `404`.

---

### POST `/api/courses`

Create a new course.

**Auth required:** Admin

**Request body:**
```json
{
  "courseName": "Advanced Machine Learning",
  "description": "Deep dive into supervised and unsupervised learning...",
  "startDate": "2025-03-01",
  "endDate": "2025-06-30",
  "maxCapacity": 25,
  "fee": 1200.00,
  "level": "Advanced",
  "isPaid": true
}
```

**Response `201 Created`:** Full course object.

---

### PUT `/api/courses/{id}`

Update all editable fields of a course.

**Auth required:** Admin

**Request body:** Same as POST.

**Response `200 OK`:** Updated course object.

**Errors:** `404`, `400`.

---

### DELETE `/api/courses/{id}`

Soft-delete (deactivate) a course. Does not remove existing enrollments.

**Auth required:** Admin

**Response `204 No Content`**

**Errors:** `404`.

---

### POST `/api/courses/{id}/instructors`

Assign an instructor to a course.

**Auth required:** Admin

**Request body:**
```json
{
  "instructorSsn": 2001,
  "role": "Lead"
}
```

Allowed roles: `Lead`, `Assistant`, `Guest`

**Response `201 Created`:**
```json
{
  "courseId": 10,
  "instructorSsn": 2001,
  "role": "Lead",
  "assignedOn": "2025-01-10"
}
```

**Errors:** `404` — course or instructor not found. `409` — already assigned.

---

### DELETE `/api/courses/{id}/instructors/{ssn}`

Remove an instructor from a course.

**Auth required:** Admin

**Response `204 No Content`**

**Errors:** `404`.

---

## Instructors

### GET `/api/instructors`

List all instructors.

**Auth required:** Admin

**Query params:**

| Param | Type | Description |
|---|---|---|
| `page` | int | Page number |
| `pageSize` | int | Items per page |
| `search` | string | Name or specialization |
| `specialization` | string | Exact match filter |

**Response `200 OK`:**
```json
{
  "data": [
    {
      "instructorSsn": 2001,
      "firstName": "Mona",
      "lastName": "Farid",
      "email": "mona@example.com",
      "specialization": "Machine Learning",
      "rating": 4.8,
      "hireDate": "2020-01-15"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "totalCount": 8,
  "totalPages": 1
}
```

---

### GET `/api/instructors/{ssn}`

Get full instructor profile with assigned courses.

**Auth required:** Admin, or the Instructor themselves

**Response `200 OK`:**
```json
{
  "instructorSsn": 2001,
  "firstName": "Mona",
  "lastName": "Farid",
  "phone": "+20100000001",
  "email": "mona@example.com",
  "specialization": "Machine Learning",
  "hireDate": "2020-01-15",
  "rating": 4.8,
  "courses": [
    {
      "courseId": 10,
      "courseName": "Advanced Machine Learning",
      "role": "Lead"
    }
  ]
}
```

---

### POST `/api/instructors`

Create a new instructor.

**Auth required:** Admin

**Request body:**
```json
{
  "firstName": "Mona",
  "lastName": "Farid",
  "phone": "+20100000001",
  "email": "mona@example.com",
  "specialization": "Machine Learning",
  "hireDate": "2020-01-15"
}
```

**Response `201 Created`:** Full instructor object.

**Errors:** `409` — email already exists.

---

### PUT `/api/instructors/{ssn}`

Update instructor details.

**Auth required:** Admin

**Request body:** Same structure as POST.

**Response `200 OK`:** Updated instructor object.

---

## Enrollments

### GET `/api/enrollments`

List enrollments with filters.

**Auth required:** Admin (all enrollments), Student (own only — enforced server-side)

**Query params:**

| Param | Type | Description |
|---|---|---|
| `page` | int | Page number |
| `pageSize` | int | Items per page |
| `studentSsn` | int | Filter by student |
| `courseId` | int | Filter by course |
| `status` | string | `Active`, `Completed`, `Withdrawn`, `Failed` |

**Response `200 OK`:**
```json
{
  "data": [
    {
      "enrollmentId": 500,
      "studentSsn": 1001,
      "studentName": "Ahmed Kamal",
      "courseId": 10,
      "courseName": "Introduction to Python",
      "enrolledOn": "2025-01-20",
      "grade": null,
      "status": "Active",
      "paymentStatus": "Paid"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "totalCount": 3,
  "totalPages": 1
}
```

---

### POST `/api/enrollments`

Enroll a student in a course.

**Auth required:** Admin or Student (can enroll themselves)

**Request body:**
```json
{
  "studentSsn": 1001,
  "courseId": 10
}
```

**Response `201 Created`:**
```json
{
  "enrollmentId": 500,
  "studentSsn": 1001,
  "courseId": 10,
  "enrolledOn": "2025-01-20",
  "status": "Active",
  "requiresPayment": true
}
```

**Errors:**
- `409` — student already enrolled in this course
- `409` — course is at maximum capacity
- `404` — student or course not found

---

### GET `/api/enrollments/{id}`

Get a single enrollment's full detail.

**Auth required:** Admin, or the enrolled Student

**Response `200 OK`:**
```json
{
  "enrollmentId": 500,
  "studentSsn": 1001,
  "studentName": "Ahmed Kamal",
  "courseId": 10,
  "courseName": "Introduction to Python",
  "enrolledOn": "2025-01-20",
  "grade": null,
  "status": "Active",
  "payment": {
    "paymentId": 800,
    "amount": 500.00,
    "status": "Paid",
    "paymentDate": "2025-01-20T14:32:00Z",
    "paymentMethod": "Credit Card"
  }
}
```

---

### PATCH `/api/enrollments/{id}/status`

Update enrollment status (e.g., mark as completed, withdrawn).

**Auth required:** Admin

**Request body:**
```json
{
  "status": "Completed",
  "grade": "A"
}
```

Allowed statuses: `Active`, `Completed`, `Withdrawn`, `Failed`

**Response `200 OK`:**
```json
{
  "enrollmentId": 500,
  "status": "Completed",
  "grade": "A"
}
```

---

## Payments

### GET `/api/payments`

List payments with filters.

**Auth required:** Admin (all), Student (own only)

**Query params:**

| Param | Type | Description |
|---|---|---|
| `page` | int | Page number |
| `pageSize` | int | Items per page |
| `studentSsn` | int | Filter by student (Admin only) |
| `status` | string | `Pending`, `Paid`, `Failed`, `Refunded` |
| `paymentDateFrom` | datetime | Date range filter |
| `paymentDateTo` | datetime | Date range filter |

**Response `200 OK`:**
```json
{
  "data": [
    {
      "paymentId": 800,
      "enrollmentId": 500,
      "studentName": "Ahmed Kamal",
      "courseName": "Introduction to Python",
      "amount": 500.00,
      "paymentDate": "2025-01-20T14:32:00Z",
      "paymentMethod": "Credit Card",
      "status": "Paid",
      "transactionId": "txn_abc123"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "totalCount": 1,
  "totalPages": 1
}
```

---

### POST `/api/payments`

Create a payment record for an enrollment.

**Auth required:** Admin or Student (own enrollment)

**Request body:**
```json
{
  "enrollmentId": 500,
  "amount": 500.00,
  "paymentMethod": "Credit Card"
}
```

**Response `201 Created`:**
```json
{
  "paymentId": 800,
  "enrollmentId": 500,
  "amount": 500.00,
  "paymentMethod": "Credit Card",
  "status": "Pending",
  "paymentDate": "2025-01-20T14:30:00Z"
}
```

**Errors:**
- `409` — payment already exists for this enrollment
- `404` — enrollment not found

---

### PATCH `/api/payments/{id}/status`

Update payment status (e.g., after gateway callback).

**Auth required:** Admin

**Request body:**
```json
{
  "status": "Paid",
  "transactionId": "txn_abc123"
}
```

Allowed statuses: `Pending`, `Paid`, `Failed`, `Refunded`

**Response `200 OK`:**
```json
{
  "paymentId": 800,
  "status": "Paid",
  "transactionId": "txn_abc123"
}
```

---

## Services

### GET `/api/services`

List all available services.

**Auth required:** Any authenticated user

**Query params:**

| Param | Type | Description |
|---|---|---|
| `page` | int | Page number |
| `pageSize` | int | Items per page |
| `search` | string | Name or description partial match |
| `workingDay` | string | Filter by day abbreviation, e.g., `Mon` |

**Response `200 OK`:**
```json
{
  "data": [
    {
      "serviceId": 1,
      "serviceName": "Academic Counseling",
      "description": "One-on-one session with an academic advisor.",
      "startTime": "09:00",
      "endTime": "17:00",
      "workingDays": "Sun,Mon,Tue,Wed,Thu",
      "location": "Building A, Room 101",
      "website": "https://counseling.example.com"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "totalCount": 5,
  "totalPages": 1
}
```

---

### POST `/api/services`

Create a new service.

**Auth required:** Admin

**Request body:**
```json
{
  "serviceName": "IT Helpdesk",
  "description": "Technical support for students.",
  "startTime": "08:00",
  "endTime": "16:00",
  "workingDays": "Sun,Mon,Tue,Wed,Thu",
  "location": "Lab B",
  "website": null
}
```

**Response `201 Created`:** Full service object.

---

### PUT `/api/services/{id}`

Update a service's details.

**Auth required:** Admin

**Request body:** Same structure as POST.

**Response `200 OK`:** Updated service object.

**Errors:** `404`.

---

### DELETE `/api/services/{id}`

Deactivate a service.

**Auth required:** Admin

**Response `204 No Content`**

---

## Student Services (Service Requests)

### GET `/api/student-services`

List service requests.

**Auth required:** Admin (all), Student (own only)

**Query params:**

| Param | Type | Description |
|---|---|---|
| `page` | int | Page number |
| `pageSize` | int | Items per page |
| `studentSsn` | int | Filter by student (Admin only) |
| `serviceId` | int | Filter by service |
| `status` | string | `Pending`, `Approved`, `Rejected`, `Completed` |

**Response `200 OK`:**
```json
{
  "data": [
    {
      "studentServiceId": 300,
      "studentSsn": 1001,
      "studentName": "Ahmed Kamal",
      "serviceId": 1,
      "serviceName": "Academic Counseling",
      "requestedDate": "2025-01-25T10:00:00Z",
      "status": "Pending"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "totalCount": 2,
  "totalPages": 1
}
```

---

### POST `/api/student-services`

Student submits a service request.

**Auth required:** Admin or Student (own)

**Request body:**
```json
{
  "studentSsn": 1001,
  "serviceId": 1
}
```

**Response `201 Created`:**
```json
{
  "studentServiceId": 300,
  "studentSsn": 1001,
  "serviceId": 1,
  "requestedDate": "2025-01-25T10:00:00Z",
  "status": "Pending"
}
```

**Errors:** `404` — student or service not found.

---

### PATCH `/api/student-services/{id}/status`

Approve or reject a service request.

**Auth required:** Admin

**Request body:**
```json
{
  "status": "Approved"
}
```

Allowed values: `Approved`, `Rejected`, `Completed`

**Response `200 OK`:**
```json
{
  "studentServiceId": 300,
  "status": "Approved"
}
```

**Errors:** `404`, `400` — invalid status transition.

---

## Drivers

### GET `/api/drivers`

List all drivers.

**Auth required:** Admin

**Query params:**

| Param | Type | Description |
|---|---|---|
| `page` | int | Page number |
| `pageSize` | int | Items per page |
| `search` | string | Name or license partial match |
| `minRating` | decimal | Filter by minimum rating (e.g., `4.0`) |

**Response `200 OK`:**
```json
{
  "data": [
    {
      "driverSsn": 3001,
      "firstName": "Khaled",
      "lastName": "Hassan",
      "phone": "+201112223344",
      "licenseNumber": "EG-123456",
      "carModel": "Toyota Corolla",
      "carPlate": "ABC-1234",
      "carYear": 2020,
      "rating": 4.6
    }
  ],
  "page": 1,
  "pageSize": 20,
  "totalCount": 10,
  "totalPages": 1
}
```

---

### GET `/api/drivers/{ssn}`

Get a driver's full profile with ride history summary.

**Auth required:** Admin, or the Driver themselves

**Response `200 OK`:**
```json
{
  "driverSsn": 3001,
  "firstName": "Khaled",
  "lastName": "Hassan",
  "phone": "+201112223344",
  "licenseNumber": "EG-123456",
  "carModel": "Toyota Corolla",
  "carPlate": "ABC-1234",
  "carYear": 2020,
  "rating": 4.6,
  "totalRides": 84,
  "completedRides": 80
}
```

---

### POST `/api/drivers`

Register a new driver.

**Auth required:** Admin

**Request body:**
```json
{
  "firstName": "Khaled",
  "lastName": "Hassan",
  "phone": "+201112223344",
  "licenseNumber": "EG-123456",
  "carModel": "Toyota Corolla",
  "carPlate": "ABC-1234",
  "carYear": 2020
}
```

**Response `201 Created`:** Full driver object.

**Errors:** `409` — license number or phone already registered.

---

### PUT `/api/drivers/{ssn}`

Update a driver's details.

**Auth required:** Admin

**Request body:** Same structure as POST.

**Response `200 OK`:** Updated driver object.

---

## Ride Bookings

### GET `/api/ride-bookings`

List ride bookings with filters.

**Auth required:** Admin (all), Student (own), Driver (assigned to them)

**Query params:**

| Param | Type | Description |
|---|---|---|
| `page` | int | Page number |
| `pageSize` | int | Items per page |
| `studentSsn` | int | Filter by student (Admin only) |
| `driverSsn` | int | Filter by driver (Admin only) |
| `status` | string | `Pending`, `Confirmed`, `InProgress`, `Completed`, `Cancelled` |
| `bookingDateFrom` | datetime | Date range start |
| `bookingDateTo` | datetime | Date range end |

**Response `200 OK`:**
```json
{
  "data": [
    {
      "bookingId": 700,
      "studentSsn": 1001,
      "studentName": "Ahmed Kamal",
      "driverSsn": 3001,
      "driverName": "Khaled Hassan",
      "bookingDate": "2025-01-22T08:00:00Z",
      "pickupLocation": "Main Gate",
      "dropoffLocation": "Cairo Airport",
      "status": "Completed",
      "fare": 120.00
    }
  ],
  "page": 1,
  "pageSize": 20,
  "totalCount": 5,
  "totalPages": 1
}
```

---

### POST `/api/ride-bookings`

Create a new ride booking. System auto-assigns an available driver.

**Auth required:** Admin or Student (own)

**Request body:**
```json
{
  "studentSsn": 1001,
  "pickupLocation": "Main Gate",
  "dropoffLocation": "Cairo Airport",
  "bookingDate": "2025-01-22T08:00:00Z"
}
```

**Response `201 Created`:**
```json
{
  "bookingId": 700,
  "studentSsn": 1001,
  "driverSsn": 3001,
  "driverName": "Khaled Hassan",
  "driverPhone": "+201112223344",
  "carModel": "Toyota Corolla",
  "carPlate": "ABC-1234",
  "pickupLocation": "Main Gate",
  "dropoffLocation": "Cairo Airport",
  "bookingDate": "2025-01-22T08:00:00Z",
  "status": "Pending",
  "fare": null
}
```

**Errors:** `503` — no drivers available. `404` — student not found.

---

### GET `/api/ride-bookings/{id}`

Get a single booking's full detail.

**Auth required:** Admin, the booked Student, or the assigned Driver

**Response `200 OK`:** Full booking object (same structure as list item, expanded).

---

### PATCH `/api/ride-bookings/{id}/status`

Update the status of a ride booking.

**Auth required:** Admin or Driver (own assigned rides only)

**Request body:**
```json
{
  "status": "Completed",
  "fare": 120.00
}
```

Allowed status transitions:

| From | To (allowed) |
|---|---|
| `Pending` | `Confirmed`, `Cancelled` |
| `Confirmed` | `InProgress`, `Cancelled` |
| `InProgress` | `Completed` |
| `Completed` | — (terminal) |
| `Cancelled` | — (terminal) |

`fare` is required when transitioning to `Completed`.

**Response `200 OK`:**
```json
{
  "bookingId": 700,
  "status": "Completed",
  "fare": 120.00
}
```

**Errors:** `400` — invalid status transition. `404`.

---

## Dashboard

### GET `/api/dashboard/summary`

Returns aggregate statistics for the admin dashboard.

**Auth required:** Admin

**Query params:**

| Param | Type | Description |
|---|---|---|
| `dateFrom` | date | Start of reporting window (default: 30 days ago) |
| `dateTo` | date | End of reporting window (default: today) |

**Response `200 OK`:**
```json
{
  "students": {
    "total": 250,
    "active": 210,
    "newThisPeriod": 18
  },
  "courses": {
    "total": 14,
    "active": 11
  },
  "enrollments": {
    "total": 430,
    "activeThisPeriod": 95,
    "completedThisPeriod": 30
  },
  "payments": {
    "totalRevenue": 87500.00,
    "revenueThisPeriod": 9000.00,
    "pending": 12,
    "failed": 3
  },
  "serviceRequests": {
    "total": 60,
    "pending": 8,
    "approved": 45,
    "rejected": 7
  },
  "rides": {
    "total": 180,
    "completed": 162,
    "cancelled": 10,
    "pending": 8,
    "totalFareCollected": 21600.00
  }
}
```
