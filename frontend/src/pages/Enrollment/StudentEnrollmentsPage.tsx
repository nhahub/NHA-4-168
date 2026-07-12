// import MainLayout from "../../components/layout/MainLayout";
import { useEffect, useState } from "react";
import enrollmentService, {
  type EnrollmentDto,
} from "../../services/api/enrollmentService";
import {BookOpen,CheckCircle2,CreditCard,} from "lucide-react";
import type { ReactNode } from "react";
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
    icon: <BookOpen size={33} />
  },
  {
    title: "COMPLETED",
    value: completedCourses.toString(),
    icon: <CheckCircle2 size={33} />
  },
  {
    title: "PENDING PAYMENTS",
    value: pendingFees.toString(),
    icon: <CreditCard size={33} />,
    error: pendingFees > 0,
  },
];

  if (loading) {
  return (
    <div className="flex items-center justify-center h-96">
      <p className="text-gray-500">Loading enrollments...</p>
    </div>
  );
}

  return (
    <>
        <h1 className="text-3xl font-bold text-gray-900">My Enrollments</h1>
      <div className="pt-6 pb-12">

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          {summaryCards.map((card) => (
  <SummaryCard
    key={card.title}
    title={card.title}
    value={card.value}
    icon={card.icon}
    error={card.error}
  />
))}

        </div>


        {enrollments.length > 0 ? (
          <div className="bg-surface-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">

            <div className="px-6 py-5 bg-gray-50 border-b border-gray-200 flex justify-between items-center">

  <div className="flex justify-between items-center w-full">
  <h2 className="text-xl font-semibold text-gray-900">
    Current Semester Enrollments
  </h2>

  <span className="text-sm font-medium text-gray-500">
    {enrollments.length} {enrollments.length === 1 ? "Course" : "Courses"}
  </span>
</div>

</div>


            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead>
                  <tr className="bg-gray-100 ">

                    {[
                      "Course Name",
                      "Enrolled On",
                      "Status",
                      "Grade",
                      "Payment Status",
                      "Action",
                    ].map((head) => (
                      <th
                        key={head}
                        className="px-6 py-3 text-xs font-semibold tracking-wide uppercase text-gray-600"
                      >
                        {head}
                      </th>
                    ))}

                  </tr>
                </thead>


                <tbody className="divide-y divide-outline-variant">

                  {enrollments.map((course) => (

                    <tr
                      key={course.enrollmentId}
                      className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                    >

                      <td className="px-6 py-6">

                        <div className="flex items-center gap-3">

                          <div className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center text-xs font-bold">
  {course.courseName.slice(0,2).toUpperCase()}
</div>


                          <div>
                            <p className="font-semibold">
                              {course.courseName}
                            </p>

                            <p className="text-xs text-gray-500">
  Course ID: {course.courseId}
</p>
                          </div>

                        </div>

                      </td>


                      <td className="px-6 py-6 text-on-surface-variant">
  {new Date(course.enrolledOn).toLocaleDateString("en-GB")}
</td>


                      <td className="px-6 py-6">
                        <StatusBadge status={course.status}/>
                      </td>


                      <td className="px-6 py-5 font-bold text-secondary">
  {course.grade ?? "Pending"}
</td>


                      <td className="px-6 py-6">
                        <StatusBadge status={course.paymentStatus ?? "N/A"}/>
                      </td>


                      <td className="px-6 py-6">

                        <button className="text-secondary font-semibold leading-4 hover:underline">
  <span className="block">View</span>
  <span className="block">Details</span>
</button>

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

      </div>
    </>
  );
}



function SummaryCard({
  title,
  value,
  icon,
  error = false,
}: {
  title: string;
  value: string;
  icon: ReactNode;
  error?: boolean;
}) {

  return (
    <div className="bg-surface-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex items-center gap-4">

      <div className="w-12 h-12 rounded-lg bg-primary-fixed flex items-center justify-center">
  {icon}
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
    Active: "bg-green-100 text-green-800",
    Paid: "bg-blue-100 text-blue-800",
    Unpaid: "bg-yellow-100 text-yellow-800",
    Completed: "bg-gray-100 text-gray-800",
    Withdrawn: "bg-red-100 text-red-800",
    "N/A": "bg-gray-100 text-gray-700",
    Failed: "bg-red-100 text-red-800",
  };


  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] ??
"bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}