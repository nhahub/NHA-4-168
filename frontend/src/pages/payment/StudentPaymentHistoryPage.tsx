import { useEffect, useState } from "react";
// import MainLayout from "../../components/layout/MainLayout";
import paymentService, {
  type PaymentDto,
} from "../../services/api/paymentService";
import { studentService } from "../../services/api/studentService";



export default function StudentPaymentHistoryPage() {

const [payments, setPayments] = useState<PaymentDto[]>([]);
const [isLoading, setIsLoading] = useState(true);



useEffect(() => {
  console.log("useEffect started");

  const loadPayments = async () => {
    console.log("loadPayments started");

    try {
      const currentStudent = await studentService.getCurrentStudent();

const studentSsn = currentStudent.studentSsn;

      const data = await paymentService.getStudentPayments(studentSsn);

console.log("Payments:", data);

setPayments(data);

// لو كنت واقف في صفحة أكبر من عدد الصفحات الجديدة
setCurrentPage(1);

    } catch(err){
  console.error(err);
}
finally{
  setIsLoading(false);
}
  };

  loadPayments();
}, []);



const totalPaid = payments
  .filter((p) => p.status === "Paid")
  .reduce((sum, p) => sum + p.amount, 0);

const outstanding = payments
  .filter((p) => p.status === "Pending")
  .reduce((sum, p) => sum + p.amount, 0);

  
const refunds = payments
  .filter((p) => p.status === "Refunded")
  .reduce((sum, p) => sum + Math.abs(p.amount), 0);

const nextInstallment = outstanding;

const ITEMS_PER_PAGE = 6;

const [currentPage, setCurrentPage] = useState(1);

const totalPages = Math.ceil(payments.length / ITEMS_PER_PAGE);

useEffect(() => {
  if (currentPage > totalPages) {
    setCurrentPage(1);
  }
}, [payments, totalPages, currentPage]);

const currentPayments = payments.slice(
  (currentPage - 1) * ITEMS_PER_PAGE,
  currentPage * ITEMS_PER_PAGE
);

if (isLoading) {
  return (
    <div className="p-6 text-center">
      Loading payments...
    </div>
  );
}

  return (
    <>
       <h1 className="text-3xl font-bold text-gray-900 mb-8">Payment History</h1>
      <div className="space-y-8">

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <p className="text-xs uppercase text-gray-500 font-semibold">
              Total Paid
            </p>

            <h2 className="text-3xl font-bold mt-2">
  ${totalPaid.toFixed(2)}
</h2>

            <p className="text-green-600 text-sm mt-4">
              {/* 12% from last term */}
            </p>
          </div>

          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <p className="text-xs uppercase text-gray-500 font-semibold">
              Outstanding
            </p>

            <h2 className="text-3xl font-bold mt-2 text-blue-600">
  ${outstanding.toFixed(2)}
</h2>

            <p className="text-blue-500 text-sm mt-4">
              {/* Due in 14 days */}
            </p>
          </div>

          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <p className="text-xs uppercase text-gray-500 font-semibold">
              Refunds
            </p>

            <h2 className="text-3xl font-bold mt-2">
  ${refunds.toFixed(2)}
</h2>

            <p className="text-gray-500 text-sm mt-4">
              {/* Last: July 12, 2023 */}
            </p>
          </div>

                    <div className="bg-white rounded-xl border p-6 shadow-sm">
            <p className="text-xs uppercase text-gray-500 font-semibold">
              Pending Amount
            </p>

           <h2 className="text-3xl font-bold mt-2 text-red-500">
  ${nextInstallment.toFixed(2)}
</h2>

            <p className="text-red-500 text-sm mt-4">
              {/* Aug 24, 2023 */}
            </p>
          </div>

        </div> {/* نهاية الـ grid */}

        {/* Table will be here */}
    
    {/* Table */}

    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="px-6 py-5 bg-gray-50 border-b  flex justify-between items-center">
        <div className="flex justify-between items-center w-full">
  <h2 className="text-xl font-semibold text-gray-900">
    Payment History
  </h2>

      <span className="text-sm font-medium text-gray-500">
        {payments.length} {payments.length === 1 ? "Transaction" : "Transactions"}
      </span>
    </div>

        {/* <div className="flex gap-3">
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Filter
          </button>

          <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            Download Statement
          </button>
        </div> */}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
  <tr className="bg-gray-100 ">
              <th className="px-6 py-3 text-xs font-semibold tracking-wide uppercase text-gray-600">Course</th>
              <th className="px-6 py-3 text-xs font-semibold tracking-wide uppercase text-gray-600">Amount</th>
              <th className="px-6 py-3 text-xs font-semibold tracking-wide uppercase text-gray-600">Date</th>
              <th className="px-6 py-3 text-xs font-semibold tracking-wide uppercase text-gray-600">Method</th>
              <th className="px-6 py-3 text-xs font-semibold tracking-wide uppercase text-gray-600">Status</th>
              {/* <th className="px-6 py-3 text-xs font-semibold tracking-wide uppercase text-gray-600">Action</th> */}
            </tr>
          </thead>

          <tbody>
            {payments.length === 0 ? (
  <tr>
    <td colSpan={6} className="p-10 text-center text-gray-500">
      No payment records found.
    </td>
  </tr>
) : (
  currentPayments.map((payment) => (
              <tr
                key={payment.paymentId}
                className="border-t hover:bg-gray-50"
              >
                <td className="px-6 py-6 ">
  <div className="flex items-center gap-3">

    <div className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center text-xs font-bold ">
      {payment.courseName.substring(0, 2).toUpperCase()}
    </div>

    <div>
      <p className="font-semibold">
        {payment.courseName}
      </p>

      <p className="text-xs text-gray-500">
        Course ID: {payment.courseId}
      </p>
    </div>

  </div>
</td>

                <td className="p-4 font-semibold text-center">
                  ${payment.amount.toFixed(2)}
                </td>

                <td className="p-4 text-center">
                  {new Date(payment.paymentDate).toLocaleString("en-GB")}
                </td>

                <td 
  className={`px-6 py-6 font-semibold text-center ${
    payment.status === "Paid"
      ? "text-green-600"
      : payment.status === "Pending"
      ? "text-yellow-600"
      : payment.status === "Failed"
      ? "text-red-600"
      : ""
  }`}
>
                  {payment.paymentMethod ?? "Not Specified"}
                </td>

                <td className="p-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold
                    ${
                      payment.status === "Paid"
                        ? "bg-green-100 text-green-700"
                        : payment.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : payment.status === "Failed"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {payment.status}
                  </span>
                </td>

                {/* <td className="p-4 text-center">
                  <button className="text-blue-600 hover:underline">
                    View
                  </button>
                </td> */}
              </tr>
            ))
)}
          </tbody>
        </table>
      </div>
      <div className="border-t bg-white px-6 py-4 flex items-center justify-between">
  <p className="text-sm text-gray-500">
    {payments.length === 0
  ? "No transactions"
  : `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1} - ${Math.min(
currentPage * ITEMS_PER_PAGE,
payments.length
)} of ${payments.length} transactions`}
  </p>

  <div className="flex items-center gap-2">
    <button
  disabled={currentPage === 1}
  onClick={() => setCurrentPage((p) => p - 1)}
  className="px-3 py-2 border rounded-lg disabled:opacity-50"
>
  Previous
</button>

    {Array.from({ length: totalPages }, (_, i) => (
  <button
    key={i + 1}
    onClick={() => setCurrentPage(i + 1)}
    className={`w-10 h-10 rounded-lg ${
      currentPage === i + 1
        ? "bg-blue-600 text-white"
        : "border hover:bg-gray-50"
    }`}
  >
    {i + 1}
  </button>
))}

    <button
  disabled={currentPage === totalPages}
  onClick={() => setCurrentPage((p) => p + 1)}
  className="px-3 py-2 border rounded-lg disabled:opacity-50"
>
  Next
</button>
  </div>
</div>
    </div>

    
 
   
  {/* Discount */}
  <div className="grid lg:grid-cols-2 gap-6">
  <div className="bg-blue-900 text-white rounded-2xl p-8">

    <h2 className="text-3xl font-bold mb-3">
      Early Bird Discount
    </h2>

    <p className="text-blue-100 leading-7 mb-6">
      Pay your next semester before August 30 and get a 15% discount
      on premium courses.
    </p>

    <button className="bg-white text-blue-900 font-semibold px-6 py-3 rounded-xl">
      Apply Now
    </button>

  </div>

  {/* Support */}

  <div className="bg-white border rounded-2xl p-8 shadow-sm">

    <h2 className="text-2xl font-bold mb-3">
      Payment Support
    </h2>

    <p className="text-gray-600 mb-6">
      Need help with one of your payments? Contact the finance team
      through live chat or check the FAQ.
    </p>

    <div className="flex gap-3">

      <button className="px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200">
        Live Chat
      </button>

      <button className="px-5 py-3 rounded-xl border">
        FAQ
      </button>

    </div>

  </div>

</div>
      </div> {/* نهاية space-y-8 */}
    </>
  );
}