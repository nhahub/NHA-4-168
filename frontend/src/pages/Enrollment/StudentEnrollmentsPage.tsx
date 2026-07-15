// import MainLayout from "../../components/layout/MainLayout";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import enrollmentService, {
  type EnrollmentDto,
} from "../../services/api/enrollmentService";
import {BookOpen,CheckCircle2,CreditCard,} from "lucide-react";
import { studentService } from "../../services/api/studentService";

export default function StudentEnrollmentPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  

  
  
  useEffect(() => {
  loadEnrollments();
}, []);

const loadEnrollments = async () => {
  try {
    const currentStudent = await studentService.getCurrentStudent();



const studentSsn = currentStudent.studentSsn;

    const data = await enrollmentService.getAll();

    setEnrollments(
      data.filter((e) => e.studentSsn === studentSsn)
    );
  } catch(err){
   console.error(err);
}
finally{
   setLoading(false);
}
};
const activeCourses = enrollments.filter(
  (e) => e.status === "Active"
).length;

const completedCourses = enrollments.filter(
  (e) => e.status === "Completed"
).length;

const pendingFees = enrollments.filter(
  (e) => e.paymentStatus !== "Paid"
).length;
const summaryCards = [
  {
    title: "ACTIVE COURSES",
    value: activeCourses.toString(),
    icon: BookOpen,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-100",
  },
  {
    title: "COMPLETED",
    value: completedCourses.toString(),
    icon: CheckCircle2,
    iconColor: "text-teal-600",
    iconBg: "bg-teal-100",
  },
  {
    title: "PENDING PAYMENTS",
    value: pendingFees.toString(),
    icon: CreditCard,
    iconColor: "text-yellow-600",
    iconBg: "bg-yellow-100",
    error: pendingFees > 0,
  },
];

  if (loading) {
  return (
    <div className="flex items-center justify-center h-96">
      <p className="text-on-surface-variant">Loading enrollments...</p>
    </div>
  );
}

  return (
    <>
        <h1 className="text-display-lg font-bold text-on-background mb-8">My Enrollments</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          {summaryCards.map((card) => (
  <SummaryCard
    key={card.title}
    title={card.title}
    value={card.value}
    icon={card.icon}
    iconColor={card.iconColor}
    iconBg={card.iconBg}
    error={card.error}
  />
))}

        </div>


        {enrollments.length > 0 ? (
          <div className="bg-surface-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">

            <div className="px-6 py-5 bg-surface-container-low border-b border-outline-variant flex justify-between items-center">

  <div className="flex justify-between items-center w-full">
  <h2 className="text-xl font-semibold text-on-surface">
    Current Semester Enrollments
  </h2>

  <span className="text-sm font-medium text-on-surface-variant">
    {enrollments.length} {enrollments.length === 1 ? "Course" : "Courses"}
  </span>
</div>

</div>


            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="bg-surface-container-low border-b border-outline">
                  <tr>
                    <th className="px-6 py-4 text-left">Course ID</th>
                    <th className="px-6 py-4 text-left">Course Name</th>
                    <th className="px-6 py-4 text-left">Enrolled On</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-left">Grade</th>
                    <th className="px-6 py-4 text-left">Payment Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-outline-variant">

                  {enrollments.map((course) => (

                    <tr
                      key={course.enrollmentId}
                      className="border-b last:border-0 hover:bg-surface-container-low transition-colors"
                    >
                      <td className="px-6 py-6 font-semibold text-on-surface">
                        {course.courseId}
                      </td>
                      <td className="px-6 py-6">
                        <Link to={`/courses/${course.courseId}`} className="font-semibold hover:text-secondary">
                          {course.courseName}
                        </Link>
                      </td>
                      <td className="px-6 py-6 text-on-surface-variant">
  {new Date(course.enrolledOn).toLocaleDateString("en-GB")}
</td>
                      <td className="px-6 py-6">
                        <StatusBadge status={course.status}/>
                      </td>
                      <td className="px-6 py-5">
                        <GradeBadge grade={course.grade} />
                      </td>
                      <td className="px-6 py-6">
                        <StatusBadge status={course.paymentStatus ?? "N/A"}/>
                      </td>
                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        ) : (

          <div className="bg-surface-lowest rounded-xl border border-outline-variant shadow-sm p-16 text-center">

            <div className="text-6xl mb-6">
              📚
            </div>

            <h3 className="text-headline-md font-bold text-primary mb-2">
              No active enrollments found
            </h3>

            <p className="text-on-surface-variant max-w-md mx-auto mb-8">
              It looks like you haven't enrolled in any courses for the upcoming semester yet.
            </p>


            {/* <button className="bg-secondary text-white px-8 py-3 rounded-xl font-bold">
              Browse Courses
            </button> */}

          </div>

        )}

      </>
    );
}



function SummaryCard({
  title,
  value,
  icon: Icon,
  iconColor = "text-secondary",
  iconBg = "bg-secondary-fixed",
  error = false,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  iconBg?: string;
  error?: boolean;
}) {

  return (
    <div className="bg-surface-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex items-center gap-4">

      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconBg}`}>
        <Icon className={`h-8 w-8 ${iconColor}`} />
      </div>

      <div>

        <p className="text-label-caps text-on-surface-variant">
          {title}
        </p>

        <h3 className={`text-headline-md font-bold ${error ? "text-error" : ""}`}>
          {value}
        </h3>

      </div>

    </div>
  );
}



function StatusBadge({status}: {status:string}) {

  const styles: Record<string,string> = {
    Active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    Paid: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    Unpaid: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
    Completed: "bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300",
    Withdrawn: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    "N/A": "bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300",
    Failed: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  };


  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] ??
    "bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300"}`}>
      {status}
    </span>
  );
}

function GradeBadge({ grade }: { grade: string | null | undefined }) {
  const displayGrade = grade ?? "Pending";

  const styles: Record<string, string> = {
    A: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    B: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    C: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
    D: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    F: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    Pending: "bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300",
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${styles[displayGrade] ??
      "bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300"}`}>
      {displayGrade}
    </span>
  );
}