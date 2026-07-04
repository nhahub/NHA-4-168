# Use Cases — Student Management System

## Actors

| Actor | Description |
|---|---|
| **Student** | Registered user of the system. Can enroll, pay, book rides, and request services. |
| **Instructor** | Assigned to courses. Can view their assigned courses and students. |
| **Driver** | Handles ride bookings. Can update ride status. |
| **Admin** | System administrator. Full CRUD access across all entities. |
| **System** | Automated triggers (e.g., payment processing, notifications). |

---

## Use Case Index

| ID | Use Case | Primary Actor |
|---|---|---|
| UC-01 | Register Student | Admin |
| UC-02 | View Student Profile | Student, Admin |
| UC-03 | Update Student Profile | Student, Admin |
| UC-04 | Deactivate / Graduate Student | Admin |
| UC-05 | Browse Available Courses | Student |
| UC-06 | Enroll in a Course | Student |
| UC-07 | View Enrollment Details | Student, Admin |
| UC-08 | Update Enrollment Status | Admin |
| UC-09 | Make a Payment | Student |
| UC-10 | View Payment History | Student, Admin |
| UC-11 | Refund a Payment | Admin |
| UC-12 | Add / Edit Course | Admin |
| UC-13 | Assign Instructor to Course | Admin |
| UC-14 | View Instructor Profile | Admin |
| UC-15 | Browse Available Services | Student |
| UC-16 | Request a Service | Student |
| UC-17 | Approve / Reject Service Request | Admin |
| UC-18 | Book a Ride | Student |
| UC-19 | Update Ride Status | Driver, Admin |
| UC-20 | View Ride History | Student, Admin |
| UC-21 | Manage Drivers | Admin |
| UC-22 | View Dashboard (Analytics) | Admin |

---

## Detailed Use Cases

---

### UC-01: Register Student

- **Actor:** Admin
- **Precondition:** Admin is authenticated.
- **Main Flow:**
  1. Admin navigates to Student Management → Add Student.
  2. Admin fills in personal details (name, email, phone, DOB, address).
  3. System validates uniqueness of email.
  4. System saves the student record with status `Active`.
  5. System returns the created student with generated SSN.
- **Alternate Flow:** Email already exists → System returns validation error.
- **Postcondition:** New student record created in database.

---

### UC-06: Enroll in a Course

- **Actor:** Student
- **Precondition:** Student is authenticated. Course exists and has available capacity.
- **Main Flow:**
  1. Student browses course catalog.
  2. Student selects a course and clicks "Enroll".
  3. System checks `max_capacity` against active enrollments.
  4. System creates an `Enrollment` record with status `Active`.
  5. If `is_paid = true`, system redirects student to payment flow (UC-09).
- **Alternate Flow A:** Course is full → System shows "No seats available" message.
- **Alternate Flow B:** Student already enrolled in same course → System returns conflict error.
- **Postcondition:** Enrollment record created; payment initiated if applicable.

---

### UC-09: Make a Payment

- **Actor:** Student
- **Precondition:** Enrollment record exists with no associated paid payment.
- **Main Flow:**
  1. Student navigates to "My Enrollments" → selects unpaid enrollment.
  2. Student selects payment method and confirms amount.
  3. System creates a `Payment` record with status `Pending`.
  4. System processes payment via payment gateway (external).
  5. On success, system updates `Payment.status` to `Paid` and stores `transaction_id`.
- **Alternate Flow:** Payment fails → Status set to `Failed`; student can retry.
- **Postcondition:** Payment record exists with final status.

---

### UC-13: Assign Instructor to Course

- **Actor:** Admin
- **Precondition:** Course and instructor both exist in the system.
- **Main Flow:**
  1. Admin opens a Course detail page.
  2. Admin clicks "Assign Instructor".
  3. Admin selects instructor and specifies role (`Lead`, `Assistant`).
  4. System creates a `CourseInstructor` record with `assigned_on = today`.
- **Alternate Flow:** Instructor already assigned to same course → System returns conflict.
- **Postcondition:** `CourseInstructor` junction record created.

---

### UC-16: Request a Service

- **Actor:** Student
- **Precondition:** Student is authenticated. Service exists and is active.
- **Main Flow:**
  1. Student browses available services.
  2. Student selects a service and clicks "Request".
  3. System creates a `StudentService` record with status `Pending` and current timestamp.
  4. Admin receives notification of new service request.
- **Postcondition:** Service request created with `Pending` status.

---

### UC-17: Approve / Reject Service Request

- **Actor:** Admin
- **Precondition:** Service request exists with status `Pending`.
- **Main Flow:**
  1. Admin opens service request list.
  2. Admin reviews request details.
  3. Admin clicks "Approve" or "Reject".
  4. System updates `StudentService.status` accordingly.
  5. System notifies student of the decision.
- **Postcondition:** Service request status updated.

---

### UC-18: Book a Ride

- **Actor:** Student
- **Precondition:** Student is authenticated. At least one driver is available.
- **Main Flow:**
  1. Student navigates to "Ride Booking".
  2. Student enters pickup and dropoff locations.
  3. System assigns an available driver.
  4. System creates a `RideBooking` record with status `Pending`.
  5. Driver is notified of the booking.
- **Alternate Flow:** No drivers available → System shows "No drivers available at this time".
- **Postcondition:** Ride booking record created.

---

### UC-19: Update Ride Status

- **Actor:** Driver, Admin
- **Precondition:** Ride booking exists.
- **Main Flow:**
  1. Driver opens assigned ride in their dashboard.
  2. Driver updates status: `Confirmed` → `InProgress` → `Completed`.
  3. System records each status change with timestamp.
  4. On `Completed`, system calculates and stores fare.
- **Postcondition:** Ride status updated; fare stored if completed.

---

### UC-22: View Dashboard (Analytics)

- **Actor:** Admin
- **Precondition:** Admin is authenticated.
- **Main Flow:**
  1. Admin navigates to Dashboard.
  2. System displays: total students, active enrollments, pending payments, pending service requests, active rides.
  3. Admin can filter by date range.
- **Postcondition:** Read-only. No data mutations.
