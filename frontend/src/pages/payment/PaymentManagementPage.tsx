import { useEffect, useState } from "react";
// import MainLayout from "../../components/layout/MainLayout";
import paymentService, {
  type PaymentDto,
} from "../../services/api/paymentService";
import enrollmentService, {
  type EnrollmentDto,
} from "../../services/api/enrollmentService";
import {TrendingUp,Clock3, CircleX,} from "lucide-react";

type PaymentStatus = "Paid" | "Pending" | "Failed";

// interface Payment {
//   id: string;
//   student: string;
//   email: string;
//   date: string;
//   service: string;
//   amount: number;
//   status: "Paid" | "Pending" | "Failed";
// }

const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
  return "bg-green-100 text-green-800";

case "Pending":
  return "bg-yellow-100 text-yellow-800";

case "Failed":
  return "bg-red-100 text-red-800";
        default:
  return "bg-surface-container text-on-surface-variant";
}
    
  };
   
    
  




export default function PaymentManagementPage() {
   const [filter, setFilter] = useState<
    "All" | "Paid" | "Pending" | "Failed"
  >("All");

const [showUpdateModal, setShowUpdateModal] = useState(false);
const [showRefundModal, setShowRefundModal] = useState(false);
const [loading, setLoading] = useState(true);
const [search, setSearch] = useState("");
const [showCreateModal, setShowCreateModal] = useState(false);
const [selectedPayment, setSelectedPayment] =
  useState<PaymentDto | null>(null);

  const [payments, setPayments] = useState<PaymentDto[]>([]);
const [enrollments, setEnrollments] = useState<EnrollmentDto[]>([]);
const [selectedEnrollmentId, setSelectedEnrollmentId] = useState(0);
  
const loadPayments = async () => {
  try {
    const data = await paymentService.getAll();
    setPayments(data);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};


const loadEnrollments = async () => {
  try {
    const data = await enrollmentService.getAll();
    setEnrollments(data);
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  

  loadPayments();
loadEnrollments();
}, []);

const filteredPayments = payments.filter((p) => {
  const matchesStatus =
    filter === "All" || p.status === filter;

  const matchesSearch =
    p.studentName
      .toLowerCase()
      .includes(search.toLowerCase());

  return matchesStatus && matchesSearch;
});


  const [newStatus, setNewStatus] =
  useState<PaymentStatus>("Paid");

const ITEMS_PER_PAGE = 6;

const [currentPage, setCurrentPage] = useState(1);


useEffect(() => {
  setCurrentPage(1);
}, [filter, search]);

const currentPayments = filteredPayments.slice(
  (currentPage - 1) * ITEMS_PER_PAGE,
  currentPage * ITEMS_PER_PAGE
);

const totalPages = Math.ceil(
  filteredPayments.length / ITEMS_PER_PAGE
);

const totalRevenue = payments
  .filter((p) => p.status === "Paid")
  .reduce((sum, p) => sum + p.amount, 0);

const pendingRevenue = payments
  .filter((p) => p.status === "Pending")
  .reduce((sum, p) => sum + p.amount, 0);

const failedTransactions = payments.filter(
  (p) => p.status === "Failed"
).length;

const stats = [
  {
    title: "Total Revenue",
    value: `$${totalRevenue.toFixed(2)}`,
    subtitle: "Successful payments",
    icon: TrendingUp,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    title: "Pending Receipts",
    value: `$${pendingRevenue.toFixed(2)}`,
    subtitle: "Awaiting payment",
    icon: Clock3,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
  },
  {
    title: "Failed Transactions",
    value: failedTransactions,
    subtitle: "Require attention",
    icon: CircleX,
    color: "text-red-600",
    bg: "bg-red-100",
  },
];

if (loading) {
  return (
    <div className="flex h-[70vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
    </div>
  );
}


  return (
  <>
    <div className="max-w-7xl mx-auto p-6 space-y-8">

      {/* Header */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

        <div>
          <h1 className="text-3xl font-bold text-on-background">
            Payment Management
          </h1>

          <p className="text-on-surface-variant mt-2">
            Review and manage institutional financial operations.
          </p>
        </div>

        <div className="flex gap-3">

          {/* <button
  onClick={() => alert("Coming Soon")}
  className="px-5 py-3 rounded-xl border border-card-border font-medium hover:bg-surface-container-low transition"
>
  Export CSV
</button> */}

          {/* <button
  onClick={() => alert("Coming Soon")}
  className="px-5 py-3 rounded-xl bg-secondary text-white font-semibold hover:opacity-90 transition"
>
  + Manual Entry
</button> */}

        </div>

      </div>

      {/* Statistics */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {stats.map((item) => (

          <div
            key={item.title}
            className="bg-surface-lowest border border-card-border rounded-2xl shadow-sm p-6"
          >

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm uppercase tracking-wider text-on-surface-variant">
                  {item.title}
                </p>

                <h2 className="text-3xl font-bold mt-3 text-on-surface">
                  {item.value}
                </h2>

                <p className={`mt-3 text-sm ${item.color}`}>
                  {item.subtitle}
                </p>

              </div>

              <div
  className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.bg}`}
>
  <item.icon className={item.color} size={24} />
</div>

            </div>

          </div>

        ))}

      </div>
        {/* Payment Table */}

<div className="bg-surface-lowest rounded-2xl border border-card-border shadow-sm overflow-hidden">

  {/* Filter Bar */}

  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-5 border-b border-outline-variant">

    <div className="flex flex-wrap gap-2">

      {["All", "Paid", "Pending", "Failed"].map((item) => (

        <button
          key={item}
          onClick={() => setFilter(item as typeof filter)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
            filter === item
              ? "bg-secondary text-white"
              : "bg-surface-container text-on-surface hover:bg-surface-container-high"
          }`}
        >
          {item}
        </button>

      ))}

      {/* <button
  disabled
  className="px-4 py-2 rounded-xl border border-card-border bg-surface-container text-on-surface-variant cursor-not-allowed"
>
  More Filters
</button> */}

<input
  type="text"
  placeholder="Search by student..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="rounded-xl border border-card-border px-4 py-2 text-on-surface outline-none focus:border-input-border-focus"
/>

    </div>

    {/* <p className="text-sm text-on-surface-variant">
      Showing{" "}
      <span className="font-semibold">
        {filteredPayments.length}
      </span>{" "}
      transaction(s)
    </p> */}

  </div>

  {/* Table */}

  <div className="overflow-x-auto">

    <table className="w-full">

      <thead className="bg-surface-container-low border-b border-outline-variant">

        <tr className="text-left text-sm text-on-surface-variant">

          <th className="p-4">Transaction ID</th>
          <th className="p-4">Student</th>
          <th className="p-4">Date</th>
          <th className="p-4">Service</th>
          <th className="p-4">Amount</th>
          <th className="p-4">Status</th>
          <th className="p-4 text-right">Actions</th>

        </tr>

      </thead>

      <tbody>
  {filteredPayments.length === 0 ? (
    <tr>
      <td
        colSpan={7}
        className="py-10 text-center text-on-surface-variant"
      >
        No payments found.
      </td>
    </tr>
  ) : (
    currentPayments.map((payment) => (
      <tr
        key={payment.transactionId}
        className="border-b border-outline-variant hover:bg-surface-container-low transition"
      >
            <td className="p-4 font-semibold text-on-surface">
              {payment.transactionId}
            </td>

            <td className="p-4">

              <div>

                <p className="font-medium text-on-surface">
                  {payment.studentName}
                </p>

                <p className="text-sm text-on-surface-variant">
                  
                </p>

              </div>

            </td>

            <td className="p-4 text-on-surface">
              {new Date(payment.paymentDate).toLocaleDateString()}
            </td>

            <td className="p-4 text-on-surface">
              {payment.courseName}
            </td>

            <td className="p-4 font-semibold text-on-surface">
              ${payment.amount.toFixed(2)}
            </td>

            <td className="p-4">

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                  payment.status
                )}`}
              >
                {payment.status}
              </span>

            </td>

            <td className="p-4">

              <div className="flex justify-end gap-2">

                <button
  onClick={() => {
    setSelectedPayment(payment);
setNewStatus(payment.status as PaymentStatus);
setShowUpdateModal(true);
  }}
  className="px-3 py-2 rounded-lg border border-card-border text-on-surface hover:bg-surface-container transition"
>
  Edit
</button>

{/* <button
  onClick={() => {
    setSelectedPayment(payment);
    setShowRefundModal(true);
    
  }}
  className="px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
>
  Refund
</button> */}

              </div>

            </td>

                 </tr>
      ))
  )}
</tbody>

    </table>

  </div>

        {/* Pagination */}

<div className="flex items-center justify-between border-t border-outline-variant p-5">

  <p className="text-sm text-on-surface-variant">
    {filteredPayments.length === 0
      ? "No payments"
      : `Showing ${
          (currentPage - 1) * ITEMS_PER_PAGE + 1
        }-${Math.min(
          currentPage * ITEMS_PER_PAGE,
          filteredPayments.length
        )} of ${filteredPayments.length} Transactions`}
  </p>

  <div className="flex gap-2">

    <button
      disabled={currentPage === 1}
      onClick={() => setCurrentPage((p) => p - 1)}
      className="rounded-lg border border-card-border text-on-surface px-3 py-2 disabled:opacity-50"
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
            : "border border-card-border text-on-surface"
        }`}
      >
        {i + 1}
      </button>
    ))}

    <button
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage((p) => p + 1)}
      className="rounded-lg border border-card-border text-on-surface px-3 py-2 disabled:opacity-50"
    >
      Next
    </button>

  </div>

</div>
</div>
    </div>
    {showUpdateModal && selectedPayment && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

    <div className="bg-surface-lowest rounded-2xl shadow-xl w-full max-w-md p-6">

      <div className="flex items-center justify-between mb-6">

        <h2 className="text-xl font-bold text-on-surface">
          Update Payment Status
        </h2>

        <button
          onClick={() => {
  setShowUpdateModal(false);
  setSelectedPayment(null);
}}
          className="text-on-surface-variant hover:text-on-surface text-xl"
        >
          ✕
        </button>

      </div>

      <p className="text-on-surface-variant mb-5">
        Transaction
        <span className="font-semibold">
          {" "}{selectedPayment.transactionId}
        </span>
      </p>

      <label className="block text-sm font-medium mb-2 text-on-surface">
        Status
      </label>

      <select
        value={newStatus}
        onChange={(e) =>
  setNewStatus(e.target.value as PaymentStatus)
}
        className="w-full rounded-lg border border-input-border bg-surface-lowest px-4 py-3 mb-6 text-body-sm text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
      >
        <option value="Paid">Paid</option>
        <option value="Pending">Pending</option>
        <option value="Failed">Failed</option>
      </select>

      <div className="flex justify-end gap-3">

        <button
         onClick={() => {
  setShowUpdateModal(false);
  setSelectedPayment(null);
}}
          className="px-5 py-2 border border-card-border text-on-surface rounded-xl"
        >
          Cancel
        </button>

        <button
          onClick={async () => {
  if (!selectedPayment) return;

  try {
    await paymentService.updateStatus(
      selectedPayment.paymentId,
      {
        status: newStatus,
      }
    );

   await loadPayments();


    setShowUpdateModal(false);
    setSelectedPayment(null);
  } catch (err) {
    console.error(err);
    alert("Failed to update payment");
  }
}}
          className="px-5 py-2 rounded-xl bg-secondary text-white"
        >
          Confirm
        </button>

      </div>

    </div>

  </div>
)}
{showRefundModal && selectedPayment && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

    <div className="bg-surface-lowest rounded-2xl shadow-xl w-full max-w-md p-6">

      <div className="flex items-center justify-between mb-6">

        <h2 className="text-xl font-bold text-red-600">
          Confirm Refund
        </h2>

        <button
          onClick={() => {
            setShowRefundModal(false);
            setSelectedPayment(null);
          }}
          className="text-on-surface-variant hover:text-on-surface text-xl"
        >
          ✕
        </button>

      </div>

      <p className="text-on-surface-variant mb-6">
        Are you sure you want to refund
        <span className="font-semibold">
          {" "} ${selectedPayment.amount.toFixed(2)}
        </span>
        <br />
        for transaction
        <span className="font-semibold">
          {" "} {selectedPayment.transactionId}
        </span>
        ?
      </p>

      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">

        <p className="text-sm text-red-700">
          This action cannot be undone.
        </p>

      </div>

      <div className="flex justify-end gap-3">

        <button
          onClick={() => {
            setShowRefundModal(false);
            setSelectedPayment(null);
          }}
          className="px-5 py-2 border border-card-border text-on-surface rounded-xl"
        >
          Cancel
        </button>

        <button
          onClick={async () => {
            try {
  if (!selectedPayment) return;

console.log(selectedPayment);

  await paymentService.updateStatus(
    selectedPayment.paymentId,
    {
      status: "Failed",
    }
  );

  await loadPayments();


  setShowRefundModal(false);
  setSelectedPayment(null);
} catch (err) {
  console.error(err);
}
            setShowRefundModal(false);
            setSelectedPayment(null);
          }}
          className="px-5 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700"
        >
          Process Refund
        </button>

      </div>

    </div>

  </div>
)}


{showCreateModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="w-full max-w-md rounded-2xl bg-surface-lowest p-6 shadow-xl">

      <h2 className="mb-6 text-2xl font-bold text-on-surface">
        Manual Payment
      </h2>
<div className="mb-5">
  <label className="mb-2 block text-sm font-medium text-on-surface">
    Enrollment
  </label>

  <select
    value={selectedEnrollmentId}
    onChange={(e) =>
      setSelectedEnrollmentId(Number(e.target.value))
    }
    className="w-full rounded-lg border border-card-border text-on-surface px-4 py-2"
  >
    <option value={0}>Select Enrollment</option>

    {enrollments.map((e) => (
      <option
        key={e.enrollmentId}
        value={e.enrollmentId}
      >
        {e.studentName} - {e.courseName}
      </option>
    ))}
  </select>
</div>
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreateModal(false)}
          className="rounded-lg border border-card-border text-on-surface px-5 py-2"
        >
          Close
        </button>
      </div>

    </div>
  </div>
)}

  </>
);
}