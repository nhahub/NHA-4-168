# ERD Documentation — Student Management System

## Overview

This document describes the Entity-Relationship Diagram (ERD) for the Student Management System. The system manages students, course enrollments, payments, services, ride bookings, and instructors in a unified platform.

---

## Entities & Attributes

### STUDENT
Primary entity representing a registered student.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `student_ssn` | INT | PK | Unique student identifier |
| `first_name` | VARCHAR(50) | NOT NULL | |
| `last_name` | VARCHAR(50) | NOT NULL | |
| `email` | VARCHAR(100) | NOT NULL | |
| `phone` | VARCHAR(20) | | |
| `date_of_birth` | DATE | | |
| `address` | VARCHAR(255) | | |
| `enrollment_date` | DATE | | |
| `status` | VARCHAR(20) | | e.g., Active, Inactive, Graduated |

---

### ENROLLMENT
Represents a student's registration in a course.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `enrollment_id` | INT | PK | |
| `student_ssn` | INT | FK → STUDENT | |
| `course_id` | INT | FK → COURSE | |
| `enrolled_on` | DATE | | |
| `grade` | VARCHAR(5) | | |
| `status` | VARCHAR(20) | | e.g., Active, Completed, Withdrawn |

---

### PAYMENT
One-to-one record of payment per enrollment.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `payment_id` | INT | PK | |
| `enrollment_id` | INT | FK → ENROLLMENT, UNIQUE | One payment per enrollment |
| `amount` | DECIMAL(10,2) | | |
| `payment_date` | DATETIME | | |
| `payment_method` | VARCHAR(50) | | e.g., Credit Card, Cash |
| `status` | VARCHAR(20) | | e.g., Paid, Pending, Failed |
| `transaction_id` | VARCHAR(100) | | External gateway reference |

---

### COURSE
Represents an academic or training course offered.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `course_id` | INT | PK | |
| `course_name` | VARCHAR(100) | NOT NULL | |
| `description` | TEXT | | |
| `start_date` | DATE | | |
| `end_date` | DATE | | |
| `max_capacity` | INT | | |
| `fee` | DECIMAL(10,2) | | |
| `level` | VARCHAR(20) | | e.g., Beginner, Intermediate, Advanced |
| `is_paid` | BOOLEAN | | Free vs. paid course |

---

### INSTRUCTOR
Represents a course instructor.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `instructor_ssn` | INT | PK | |
| `first_name` | VARCHAR(50) | NOT NULL | |
| `last_name` | VARCHAR(50) | NOT NULL | |
| `phone` | VARCHAR(20) | | |
| `email` | VARCHAR(100) | | |
| `specialization` | VARCHAR(100) | | |
| `hire_date` | DATE | | |
| `rating` | DECIMAL(3,2) | | 0.00–5.00 |

---

### COURSE_INSTRUCTOR
Junction table linking courses to instructors (many-to-many).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `course_id` | INT | PK, FK → COURSE | |
| `instructor_ssn` | INT | PK, FK → INSTRUCTOR | |
| `role` | VARCHAR(50) | | e.g., Lead, Assistant |
| `assigned_on` | DATE | | |

---

### SERVICE
Represents an administrative or support service available to students.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `service_id` | INT | PK | |
| `service_name` | VARCHAR(100) | NOT NULL | |
| `description` | TEXT | | |
| `start_time` | TIME | | Working hours start |
| `end_time` | TIME | | Working hours end |
| `working_days` | VARCHAR(50) | | e.g., Mon,Tue,Wed |
| `location` | VARCHAR(255) | Optional | |
| `website` | VARCHAR(255) | Optional | |

---

### STUDENT_SERVICE
Junction table for the many-to-many relationship between students and services.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `student_service_id` | INT | PK | |
| `student_ssn` | INT | FK → STUDENT | |
| `service_id` | INT | FK → SERVICE | |
| `requested_date` | DATETIME | | |
| `status` | VARCHAR(20) | | e.g., Pending, Approved, Rejected |

---

### DRIVER
Represents a transportation driver.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `driver_ssn` | INT | PK | |
| `first_name` | VARCHAR(50) | NOT NULL | |
| `last_name` | VARCHAR(50) | NOT NULL | |
| `phone` | VARCHAR(20) | | |
| `license_number` | VARCHAR(50) | | |
| `car_model` | VARCHAR(50) | | |
| `car_plate` | VARCHAR(20) | | |
| `car_year` | INT | | |
| `rating` | DECIMAL(3,2) | | 0.00–5.00 |

---

### RIDE_BOOKING
Represents a transportation booking made by a student.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `booking_id` | INT | PK | |
| `student_ssn` | INT | FK → STUDENT | |
| `driver_ssn` | INT | FK → DRIVER | |
| `booking_date` | DATETIME | | |
| `pickup_location` | VARCHAR(255) | | |
| `dropoff_location` | VARCHAR(255) | | |
| `status` | VARCHAR(20) | | e.g., Pending, Completed, Cancelled |
| `fare` | DECIMAL(10,2) | | |

---

## Relationships

| Relationship | Cardinality | Description |
|---|---|---|
| STUDENT → ENROLLMENT | 1 : N | A student can have many enrollments |
| ENROLLMENT → PAYMENT | 1 : 1 | Each enrollment has exactly one payment record |
| STUDENT ↔ SERVICE | N : N via STUDENT_SERVICE | Students can request multiple services |
| COURSE ↔ INSTRUCTOR | N : N via COURSE_INSTRUCTOR | Courses can have multiple instructors and vice versa |
| STUDENT → RIDE_BOOKING | 1 : N | A student can book many rides |
| DRIVER → RIDE_BOOKING | 1 : N | A driver can handle many bookings |
| ENROLLMENT → COURSE | N : 1 | Many enrollments reference the same course |

---

## MSSQL Notes

- All PKs should use `INT IDENTITY(1,1)` except SSN-based PKs which are application-managed.
- `BOOLEAN` maps to `BIT` in MSSQL.
- `DATETIME` maps to `DATETIME2` in MSSQL for precision.
- `TEXT` columns should use `NVARCHAR(MAX)` in MSSQL for Unicode support.
- Add `UNIQUE` constraint on `PAYMENT.enrollment_id` to enforce 1:1.
- Foreign keys should have explicit `ON DELETE` / `ON UPDATE` rules defined per business logic.
