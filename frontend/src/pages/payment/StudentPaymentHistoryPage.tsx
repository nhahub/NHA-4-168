import { useEffect, useState } from "react";
import { Wallet, Clock, RotateCcw, AlertCircle } from "lucide-react";
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

      } catch (err) {
        console.error(err);
      }
      finally {
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
      <div className="p-6 text-center text-on-surface-variant">
        Loading payments...
      </div>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-on-background mb-8">Payment History</h1>
      <div className="space-y-8">

        {/* Summary */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-card-border bg-green-600 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-green-100">
                  Total Paid
                </p>
                <h2 className="mt-3 text-[28px] font-bold text-white">${totalPaid.toFixed(2)}</h2>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500">
                <Wallet className="text-white" size={20} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-card-border bg-yellow-500 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-yellow-100">
                  Outstanding
                </p>
                <h2 className="mt-3 text-[28px] font-bold text-white">${outstanding.toFixed(2)}</h2>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-600">
                <Clock className="text-white" size={20} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-card-border bg-sky-600 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-sky-100">
                  Refunds
                </p>
                <h2 className="mt-3 text-[28px] font-bold text-white">${refunds.toFixed(2)}</h2>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500">
                <RotateCcw className="text-white" size={20} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-card-border bg-rose-600 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-rose-100">
                  Pending Amount
                </p>
                <h2 className="mt-3 text-[28px] font-bold text-white">${nextInstallment.toFixed(2)}</h2>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-700">
                <AlertCircle className="text-white" size={20} />
              </div>
            </div>
          </div>

        </div> {/* نهاية الـ grid */}

        {/* Table will be here */}

        {/* Table */}

        <div className="bg-surface-lowest rounded-xl border border-card-border shadow-sm overflow-hidden">
          <div className="px-6 py-5 bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
            <div className="flex justify-between items-center w-full">
              <h2 className="text-xl font-semibold text-on-surface">
                Payment History
              </h2>

              <span className="text-sm font-medium text-on-surface-variant">
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
              <thead className="bg-surface-container-low border-b border-outline">
                <tr>
                  <th className="px-6 py-4 text-left">Course ID</th>
                  <th className="px-6 py-4 text-left">Course</th>
                  <th className="px-6 py-4 text-left">Amount</th>
                  <th className="px-6 py-4 text-left">Date</th>
                  <th className="px-6 py-4 text-left">Method</th>
                  <th className="px-6 py-4 text-left">Status</th>
                </tr>
              </thead>

              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-on-surface-variant">
                      No payment records found.
                    </td>
                  </tr>
                ) : (
                  currentPayments.map((payment) => (
                    <tr
                      key={payment.paymentId}
                      className="border-t border-outline-variant hover:bg-surface-container-low"
                    >
                      <td className="px-6 py-6 font-semibold text-on-surface">
                        {payment.courseId}
                      </td>
                      <td className="px-6 py-6">
                        <p className="font-semibold text-on-surface">
                          {payment.courseName}
                        </p>
                      </td>

                      <td className="p-4 font-semibold text-center text-on-surface">
                        ${payment.amount.toFixed(2)}
                      </td>

                      <td className="p-4 text-center text-on-surface">
                        {new Date(payment.paymentDate).toLocaleString("en-GB")}
                      </td>

                      <td
                        className={`px-6 py-6 font-semibold text-center ${payment.status === "Paid"
                            ? "text-green-600"
                            : payment.status === "Pending"
                              ? "text-yellow-600"
                              : payment.status === "Failed"
                                ? "text-red-600"
                                : "text-on-surface"
                          }`}
                      >
                        {payment.paymentMethod ?? "Not Specified"}
                      </td>

                      <td className="p-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold
                    ${payment.status === "Paid"
                              ? "bg-green-100 text-green-700"
                              : payment.status === "Pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : payment.status === "Failed"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-surface-container-high text-on-surface-variant"
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
          <div className="border-t border-outline-variant bg-surface-lowest px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-on-surface-variant">
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
                className="px-3 py-2 border border-card-border text-on-surface rounded-lg disabled:opacity-50"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-lg ${currentPage === i + 1
                      ? "bg-secondary text-white"
                      : "border border-card-border text-on-surface hover:bg-surface-container-low"
                    }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-2 border border-card-border text-on-surface rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>




        {/* Support */}

        <div className="bg-surface-lowest border border-card-border rounded-2xl p-8 shadow-sm">

          <h2 className="text-2xl font-bold mb-3 text-on-surface">
            Payment Support
          </h2>

          <p className="text-on-surface-variant mb-6">
            Need help with one of your payments? Contact the finance team
            through live chat or check the FAQ.
          </p>

          <div className="flex gap-3">

            <button className="px-5 py-3 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high">
              Live Chat
            </button>

            <button className="px-5 py-3 rounded-xl border border-card-border text-on-surface">
              FAQ
            </button>

          </div>

        </div>
      </div> {/* نهاية space-y-8 */}
    </>
  );
}