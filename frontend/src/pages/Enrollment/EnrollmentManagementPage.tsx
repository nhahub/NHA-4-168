// import MainLayout from "../../components/layout/MainLayout";
import {
  Users,CheckCircle2,CircleX,GraduationCap,} from "lucide-react";
import { useEffect, useState } from "react";
import enrollmentService, {
  type EnrollmentDto,
} from "../../services/api/enrollmentService";
import { Pencil } from "lucide-react";
import paymentService from "../../services/api/paymentService";

import { courseService } from "../../services/api/courseService";

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-700";
    case "Completed":
      return "bg-blue-100 text-blue-700";
    case "Withdrawn":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};







export default function EnrollmentManagementPage() {

  const [enrollments, setEnrollments] = useState<EnrollmentDto[]>([]);
const [loading, setLoading] = useState(true);
const [selectedEnrollment, setSelectedEnrollment] =
  useState<EnrollmentDto | null>(null);

const [showEditModal, setShowEditModal] = useState(false);

const [editStatus, setEditStatus] = useState("");

const [editGrade, setEditGrade] = useState("");

const [saving, setSaving] = useState(false);
const [search, setSearch] = useState("");
const [courseFilter, setCourseFilter] = useState("");
const [statusFilter, setStatusFilter] = useState("");
const [showCreateModal, setShowCreateModal] = useState(false);

const [newStudentSsn, setNewStudentSsn] = useState<number | "">("");
const [newCourseId, setNewCourseId] = useState<number | "">("");
const [creating, setCreating] = useState(false);
const [newStudentName, setNewStudentName] = useState("");
const [newCourseName, setNewCourseName] = useState("");
const [students, setStudents] = useState([]);



useEffect(() => {
  const loadEnrollments = async () => {
    try {
      const data = await enrollmentService.getAll();

console.log("API Response:", data);
console.log("Is Array:", Array.isArray(data));

data.sort(
  (a, b) =>
    new Date(b.enrolledOn).getTime() -
    new Date(a.enrolledOn).getTime()
);

setEnrollments(data);

setEnrollments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  loadEnrollments();
}, []);


useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            setShowEditModal(false);
            setEditStatus("");
setEditGrade("");
        }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
        document.removeEventListener("keydown", handleEscape);
    };
}, []);


useEffect(() => {
  setCurrentPage(1);
}, [search]);

const ITEMS_PER_PAGE = 6;

const [currentPage, setCurrentPage] = useState(1);

const filteredEnrollments = enrollments.filter((e) => {
  const matchesName =
    e.studentName.toLowerCase().includes(search.toLowerCase());

  const matchesCourse =
    courseFilter === "" || e.courseName === courseFilter;

  const matchesStatus =
    statusFilter === "" || e.status === statusFilter;

  return matchesName && matchesCourse && matchesStatus;
});

const currentEnrollments = filteredEnrollments.slice(
  (currentPage - 1) * ITEMS_PER_PAGE,
  currentPage * ITEMS_PER_PAGE
);

const totalPages = Math.ceil(
  filteredEnrollments.length / ITEMS_PER_PAGE
);



// const currentEnrollments = enrollments.slice(
//   (currentPage - 1) * ITEMS_PER_PAGE,
//   currentPage * ITEMS_PER_PAGE
// );



console.log("State:", enrollments);
console.log("Is Array State:", Array.isArray(enrollments));

if (loading) {
  return (
    <div className="flex h-[70vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
    </div>
  );
}

const totalActive = enrollments.filter(
  (e) => e.status === "Active"
).length;

const totalCompleted = enrollments.filter(
  (e) => e.status === "Completed"
).length;

const totalWithdrawn = enrollments.filter(
  (e) => e.status === "Withdrawn"
).length;

const gradeMap: Record<string, number> = {
  "A+": 4.0,
  "A": 4.0,
  "A-": 3.7,
  "B+": 3.3,
  "B": 3.0,
  "B-": 2.7,
  "C+": 2.3,
  "C": 2.0,
  "D": 1.0,
  "F": 0,
};

const getLetterGrade = (gpa: number) => {
  if (gpa >= 4.0) return "A";
  if (gpa >= 3.7) return "A-";
  if (gpa >= 3.3) return "B+";
  if (gpa >= 3.0) return "B";
  if (gpa >= 2.7) return "B-";
  if (gpa >= 2.3) return "C+";
  if (gpa >= 2.0) return "C";
  if (gpa >= 1.0) return "D";
  return "F";
};



const gradedEnrollments = enrollments.filter(
  (e) => e.grade && gradeMap[e.grade] !== undefined
);

const averageGpa =
  gradedEnrollments.length === 0
    ? 0
    : gradedEnrollments.reduce(
        (sum, e) => sum + gradeMap[e.grade!],
        0
      ) / gradedEnrollments.length;

const averageGrade =
  gradedEnrollments.length === 0
    ? "--"
    : `${averageGpa.toFixed(2)} (${getLetterGrade(averageGpa)})`;



      const stats = [
  {
    title: "Active",
    value: totalActive,
    icon: Users,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    title: "Completed",
    value: totalCompleted,
    icon: CheckCircle2,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    title: "Withdrawn",
    value: totalWithdrawn,
    icon: CircleX,
    color: "text-red-600",
    bg: "bg-red-100",
  },
  {
    title: "Average Grade",
    value: averageGrade,
    icon: GraduationCap,
    color: "text-amber-600",
    bg: "bg-amber-100",
  },
];

const hasChanges =
  selectedEnrollment &&
  (
    selectedEnrollment.status !== editStatus ||
    (selectedEnrollment.grade ?? "") !== editGrade
  );

const handleSave = async () => {
  if (!selectedEnrollment) return;

  if (editStatus === "Completed" && !editGrade) {
    alert("Completed enrollment must have a grade.");
    return;
  }

  setSaving(true);
  try {
    await enrollmentService.updateStatus(
      selectedEnrollment.enrollmentId,
      {
        status: editStatus,
        grade: editGrade || undefined,
      }
    );

    setEnrollments((prev) =>
      prev.map((e) =>
        e.enrollmentId === selectedEnrollment.enrollmentId
          ? {
              ...e,
              status: editStatus,
              grade: editGrade || null,
            }
          : e
      )
    );

    setShowEditModal(false);
    setEditStatus("");
setEditGrade("");
    setSelectedEnrollment(null);
  } catch (error) {
    console.error(error);
    alert("Failed to update enrollment.");
  }
  finally {
    setSaving(false);
}
};



const handleCreateEnrollment = async () => {
  if (!newStudentSsn || !newCourseId) {
    alert("Select student and course");
    return;
  }


  const alreadyEnrolled = enrollments.find(
  (e) =>
    e.studentSsn === Number(newStudentSsn) &&
    e.courseId === Number(newCourseId) &&
    e.status !== "Withdrawn"
);



  if (alreadyEnrolled) {
    alert("Student already enrolled in this course.");
    return;
  }


  setCreating(true);

  try {

    const created = await enrollmentService.create({
      studentSsn: Number(newStudentSsn),
      courseId: Number(newCourseId),
    });

    const course = await courseService.getCourse(Number(newCourseId));



    setEnrollments((prev)=>[
      ...prev,
      created
    ]);


    setShowCreateModal(false);

    setNewStudentSsn("");
    setNewCourseId("");


  } catch(error){

    console.error(error);
    alert("Failed to create enrollment");

  } finally {

    setCreating(false);

  }
};


  return (
    <>
        <div className="mx-auto max-w-7xl space-y-8 p-6">
            
        
  {/* Page Header */}
  <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

    <div>
        <h1 className="text-3xl font-bold text-on-background">
          Enrollment Management
        </h1>

      <p className="mt-2 text-on-surface-variant">
        Manage student placements, track progress, and finalize grading cycles.
      </p>
    </div>

    <div className="flex gap-3">

      <button
  onClick={() => setShowCreateModal(true)}
  className="rounded-xl bg-secondary px-6 py-3 font-semibold text-on-secondary hover:opacity-90"
>
  + New Enrollment
</button>


    </div>

  </div>


            
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">

  {stats.map((item) => (

    <div
      key={item.title}
      className="flex items-center gap-3 rounded-xl border border-outline bg-surface-lowest p-5 shadow-sm"
    >

      <div
  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.bg}`}
>
  <item.icon className={`h-5 w-5 ${item.color}`} />
</div>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-on-surface-variant truncate">
          {item.title}
        </p>
        <h2 className="text-[24px] font-bold leading-8 text-on-surface truncate">
          {item.value}
        </h2>
      </div>

    </div>

  ))}

</div>
<div className="rounded-xl border border-outline bg-surface-lowest p-6 shadow-sm">

  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

    {/* Student Name */}
    <div>
      <label className="mb-2 block text-sm font-medium">
        Student Name
      </label>

      <input
  type="text"
  placeholder="Filter by student..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="w-full rounded-lg border border-outline px-4 py-2 outline-none focus:border-secondary"
/>
    </div>

    {/* Course */}
    <div>
      <label className="mb-2 block text-sm font-medium">
        Course
      </label>

      <select
  value={courseFilter}
  onChange={(e) => setCourseFilter(e.target.value)}
  className="w-full rounded-lg border border-outline px-4 py-2"
>
        <option value="">All Courses</option>

{[...new Set(enrollments.map(e => e.courseName))].map(course => (
  <option key={course} value={course}>
    {course}
  </option>
))}
      </select>
    </div>

    {/* Status */}
    <div>
      <label className="mb-2 block text-sm font-medium">
        Status
      </label>

      <select
  value={statusFilter}
  onChange={(e) => setStatusFilter(e.target.value)}
  className="w-full rounded-lg border border-outline px-4 py-2"
>
        <option value="">All Statuses</option>
        <option>Active</option>
        <option>Completed</option>
        <option>Withdrawn</option>
      </select>
    </div>

    {/* Filter Button */}
    <div className="flex items-end">
     <button
  onClick={() => {
    setSearch("");
    setCourseFilter("");
    setStatusFilter("");
    setCurrentPage(1);
  }}
  className="w-full rounded-lg bg-secondary py-2 font-semibold text-on-secondary hover:opacity-90"
>
  Reset Filters
</button>
    </div>

  </div>

</div>
<div className="overflow-hidden rounded-xl border border-outline bg-surface-lowest shadow-sm">

  <div className="border-b p-6">

    <h2 className="text-xl font-semibold">
      Enrollment List
    </h2>

  </div>

  <div className="overflow-x-auto">

    <table className="min-w-full">

      <thead className="bg-surface-container-low border-b border-outline">
  <tr>
    <th className="px-6 py-4 text-left">Student</th>
    <th className="px-6 py-4 text-left">Course</th>
    <th className="px-6 py-4 text-left">Enrollment Date</th>
    <th className="px-6 py-4 text-left">Status</th>
    <th className="px-6 py-4 text-left">Grade</th>
    <th className="px-6 py-4 text-left">Edit</th>
  </tr>
</thead>

<tbody>
  {currentEnrollments.length === 0 ? (
    <tr>
      <td
        colSpan={6}
        className="py-10 text-center text-gray-500"
      >
        No enrollments found.
      </td>
    </tr>
  ) : (
    currentEnrollments.map((enrollment) => (
    <tr
      key={enrollment.enrollmentId}
      className="border-b border-outline hover:bg-surface-container-low transition-colors duration-200"
    >
      <td className="px-6 py-4">
        <p className="font-semibold">
          {enrollment.studentName}
        </p>

        <p className="text-sm text-on-surface-variant">
          {enrollment.studentSsn}
        </p>
      </td>

      <td className="px-6 py-4">
        <p>{enrollment.courseName}</p>
        <p className="text-xs text-on-surface-variant">
          Course ID: {enrollment.courseId}
        </p>
      </td>

      <td className="px-6 py-4">
        {new Date(enrollment.enrolledOn).toLocaleDateString()}
      </td>

      <td className="px-6 py-4">
  <span
    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
      enrollment.status
    )}`}
  >
    {enrollment.status}
  </span>
</td>

      <td className="px-6 py-4 text-body-sm font-semibold text-on-surface">
        {enrollment.grade ?? '—'}
      </td>

      <td className="px-6 py-4 ">
  <button
  onClick={() => {
    setSelectedEnrollment(enrollment);
    setEditStatus(enrollment.status);
    setEditGrade(enrollment.grade ?? "");
    setShowEditModal(true);
  }}
  className="inline-flex items-center gap-2 rounded-lg border border-outline px-3 py-2 text-sm font-medium hover:bg-surface-container-low"
>
  <Pencil size={16} />
  Edit
</button>
</td>


    </tr>
      ))
  )}
</tbody>

    </table>
    </div>
  <div className="flex items-center justify-between border-t border-outline p-6">

  <p className="text-sm text-on-surface-variant">
  {filteredEnrollments.length === 0
    ? "No enrollments"
    : `Showing ${
        (currentPage - 1) * ITEMS_PER_PAGE + 1
      }-${Math.min(
        currentPage * ITEMS_PER_PAGE,
        filteredEnrollments.length
      )} of ${filteredEnrollments.length} enrollments`}
</p>

  <div className="flex gap-2">

  <button
    disabled={currentPage === 1}
    onClick={() => setCurrentPage((p) => p - 1)}
    className="rounded-lg border border-outline px-3 py-2 disabled:opacity-50"
  >
    Previous
  </button>

  {Array.from({ length: totalPages }, (_, i) => (
    <button
      key={i + 1}
      onClick={() => setCurrentPage(i + 1)}
      className={`rounded-lg px-4 py-2 ${
        currentPage === i + 1
          ? "bg-secondary text-white"
          : "border border-outline"
      }`}
    >
      {i + 1}
    </button>
  ))}

  <button
    disabled={currentPage === totalPages}
    onClick={() => setCurrentPage((p) => p + 1)}
    className="rounded-lg border border-outline px-3 py-2 disabled:opacity-50"
  >
    Next
  </button>

</div>

</div>
  

</div>

<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

  <div className="rounded-xl border border-dashed border-outline bg-surface-container-low p-6">
    <h3 className="font-semibold">
      Grading Guidelines
    </h3>

    <p className="mt-2 text-sm text-on-surface-variant">
      Grades can be entered as GPA (0.0–4.0) or letter grades (A–F).
    </p>
  </div>

  <div className="rounded-xl border border-dashed border-outline bg-surface-container-low p-6">
    <h3 className="font-semibold">
      Recent Activity
    </h3>

    <p className="mt-2 text-sm text-on-surface-variant">
      Last finalized cycle: Fall 2023 - Session A.
    </p>
  </div>

</div>
</div>

{showEditModal && selectedEnrollment && (
  <div
  className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
  onClick={() => setShowEditModal(false)}
>
    <div
  className="w-full max-w-md rounded-xl bg-surface-lowest p-6 shadow-xl"
  onClick={(e) => e.stopPropagation()}
>

      <h2 className="mb-6 text-2xl font-bold text-on-surface">
        Edit Enrollment
      </h2>

      <div className="space-y-4">

        <div>
          <label className="mb-1 block text-sm font-medium">
            Student
          </label>

          <input
            value={selectedEnrollment.studentName}
            readOnly
            className="w-full rounded-lg border border-outline bg-surface px-4 py-2 text-on-surface"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Course
          </label>

          <input
            value={selectedEnrollment.courseName}
            readOnly
            className="w-full rounded-lg border border-outline bg-surface px-4 py-2 text-on-surface"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Status
          </label>

          <select
  value={editStatus}
  onChange={(e) => {
    const value = e.target.value;

    setEditStatus(value);

    if (value !== "Completed") {
      setEditGrade("");
    }
  }}
            className="w-full rounded-lg border px-4 py-2"
          >
            {/* <option value="">All Statuses</option> */}
<option value="Active">Active</option>
<option value="Completed">Completed</option>
<option value="Withdrawn">Withdrawn</option>
          </select>
        </div>

        <div>
          {editStatus === "Completed" && (
  <div>
    <label className="mb-1 block text-sm font-medium">
      Grade
    </label>

    <select
      value={editGrade}
      onChange={(e) => setEditGrade(e.target.value)}
      className="w-full rounded-lg border px-4 py-2"
    >
      <option value="">Select Grade</option>
      <option value="A+">A+</option>
      <option value="A">A</option>
      <option value="A-">A-</option>
      <option value="B+">B+</option>
      <option value="B">B</option>
      <option value="B-">B-</option>
      <option value="C+">C+</option>
      <option value="C">C</option>
      <option value="D">D</option>
      <option value="F">F</option>
    </select>
  </div>
)}

         
        </div>

      </div>

      <div className="mt-6 flex justify-end gap-3">

        <button
          onClick={() => setShowEditModal(false)}
          className="rounded-lg border border-outline px-5 py-2 text-on-surface"
        >
          Cancel
        </button>

        <button
    onClick={handleSave}
    disabled={saving || !hasChanges}
    className="rounded-lg bg-secondary px-5 py-2 text-white disabled:opacity-50"
>
    {saving ? "Saving..." : "Save"}
</button>

      </div>

    </div>
  </div>
)}



{showCreateModal && (
<div
className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
onClick={() => setShowCreateModal(false)}
>

<div
className="w-full max-w-md rounded-xl bg-surface-lowest p-6"
onClick={(e)=>e.stopPropagation()}
>

  <h2 className="text-xl font-bold mb-5 text-on-surface">
    New Enrollment
  </h2>

  <div className="space-y-4">

  <input
    type="number"
    placeholder="Enter Student SSN"
    value={newStudentSsn}
    onChange={(e) => {
      const id = e.target.value === "" ? "" : Number(e.target.value);

      setNewStudentSsn(id);

      const student = enrollments.find(
        (e) => e.studentSsn === Number(id)
      );

      setNewStudentName(student?.studentName ?? "");
    }}
    className="w-full border border-outline rounded-lg px-4 py-2 text-on-surface bg-surface"
  />

  {newStudentName && (
    <p className="mt-2 text-sm text-green-600">
      Student: {newStudentName}
    </p>
  )}



  <input
    type="number"
    placeholder="Enter Course ID"
    value={newCourseId}
    onChange={(e) => {
      const id = e.target.value === "" ? "" : Number(e.target.value);

      setNewCourseId(id);

      const course = enrollments.find(
        (e) => e.courseId === Number(id)
      );

      setNewCourseName(course?.courseName ?? "");
    }}
    className="w-full border border-outline rounded-lg px-4 py-2 text-on-surface bg-surface"
  />

  {newCourseName && (
    <p className="mt-2 text-sm text-green-600">
      Course: {newCourseName}
    </p>
  )}

  </div>


<div className="flex justify-end gap-3 mt-6">

<button
onClick={()=>setShowCreateModal(false)}
className="border border-outline px-4 py-2 rounded-lg text-on-surface"
>
  Cancel
</button>


<button
disabled={creating}
onClick={handleCreateEnrollment}
className="bg-secondary text-white px-4 py-2 rounded-lg"
>
{creating ? "Creating..." : "Create"}
</button>


</div>


</div>

</div>
)}


    </>
  );
}

console.log("EnrollmentManagementPage Loaded");



