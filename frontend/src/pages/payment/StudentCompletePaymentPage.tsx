import { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";

interface PaymentInfo {
  courseName: string;
  semester: string;
  category: string;
  subtotal: number;
  processingFee: number;
  tax: number;
}

const payment: PaymentInfo = {
  courseName: "Advanced Defensive Driving",
  semester: "Spring Semester 2024",
  category: "Education",
  subtotal: 150,
  processingFee: 3,
  tax: 0,
};




export default function StudentPaymentPage() {
   
  const [paymentMethod, setPaymentMethod] =
    useState<"card" | "cash">("card");

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [saveCard, setSaveCard] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
const [isSuccess, setIsSuccess] = useState(false);

     const isFormValid =
  paymentMethod === "cash" ||
  (
    cardName.trim().length > 0 &&
    cardNumber.trim().length > 0 &&
    expiry.trim().length > 0 &&
    cvv.trim().length > 0
  );
  const total =
    payment.subtotal +
    payment.processingFee +
    payment.tax;

    const handlePayment = () => {
  setIsLoading(true);

  setTimeout(() => {
    setIsLoading(false);
    setIsSuccess(true);
    setCardName("");
    setCardNumber("");
    setExpiry("");
    setCvv("");
    setSaveCard(false);

    setTimeout(() => {
      setIsSuccess(false);
    }, 3000);

  }, 2000);
};
  return (
    <MainLayout>
  <div className="max-w-7xl mx-auto p-6 space-y-8">

    {/* Breadcrumb */}

    <div className="flex items-center gap-2 text-sm text-gray-500">
      <a href=""><span>Dashboard</span></a>
      <span>/</span>
      <span className="text-blue-600 font-medium">
        Checkout
      </span>
    </div>

    {/* Page Title */}

    <div>
      <h1 className="text-3xl font-bold text-gray-900">
        Complete Your Payment
      </h1>

      <p className="text-gray-500 mt-2">
        Complete your course enrollment securely.
      </p>
    </div>

    {/* Main Grid */}

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

      {/* Left Side */}

      <div className="lg:col-span-8 space-y-6">

        {/* Course Card */}

        <div className="bg-white rounded-2xl border shadow-sm p-6">

          <div className="flex items-start justify-between">

            <div>

              <h2 className="text-xl font-bold">
                {payment.courseName}
              </h2>

              <p className="text-gray-500 mt-1">
                Course Enrollment Fee • {payment.semester}
              </p>

            </div>

            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
              {payment.category}
            </span>

          </div>

        </div>

        {/* Payment Method */}

        <div className="bg-white rounded-2xl border shadow-sm p-6">

          <h2 className="text-xl font-semibold mb-6">
            Select Payment Method
          </h2>

          <div className="grid grid-cols-2 gap-4">

            <button
              onClick={() => setPaymentMethod("card")}
              className={`rounded-xl border-2 p-6 transition
              ${
                paymentMethod === "card"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-300"
              }`}
            >
              <div className="text-5xl mb-3">
                💳
              </div>

              <p className="font-semibold">
                Credit Card
              </p>
            </button>

            <button
              onClick={() => setPaymentMethod("cash")}
              className={`rounded-xl border-2 p-6 transition
              ${
                paymentMethod === "cash"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-300"
              }`}
            >
              <div className="text-5xl mb-3">
                💵
              </div>

              <p className="font-semibold">
                Cash / Wire
              </p>
            </button>

          </div>

        </div>

        {/* Card Information */}

    {paymentMethod === "card" && (
  <div className="bg-white rounded-2xl border shadow-sm p-6">

    <h2 className="text-xl font-semibold mb-6">
      Card Information
    </h2>

    <div className="space-y-5">

      <div>
        <label className="block text-sm font-medium mb-2">
          Cardholder Name
        </label>

        <input
          type="text"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
        //   placeholder="John Doe"
          className="w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Card Number
        </label>

        <input
          type="text"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          placeholder="0000 0000 0000 0000"
          className="w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">

        <div>
          <label className="block text-sm font-medium mb-2">
            Expiry Date
          </label>

          <input
            type="text"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            placeholder="MM / YY"
            className="w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            CVV
          </label>

          <input
            type="password"
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}
            placeholder="***"
            className="w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

      </div>

      <label className="flex items-center gap-3">

        <input
          type="checkbox"
          checked={saveCard}
          onChange={(e) => setSaveCard(e.target.checked)}
        />

        <span className="text-sm text-gray-600">
          Save card details for future payments
        </span>

      </label>

    </div>

  </div>
)}
{paymentMethod === "cash" && (
  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
    <h2 className="text-xl font-semibold mb-3">
      Cash / Wire Payment
    </h2>

    <p className="text-gray-600">
      Please visit the finance office or use the provided bank account
      to complete your payment.
    </p>
  </div>
)}
</div> {/* Left Side */}

<div className="lg:col-span-4">

  <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">

    <div className="p-6 border-b">
      <h2 className="text-xl font-semibold">
        Order Summary
      </h2>
    </div>

    <div className="p-6 space-y-4">

      <div className="flex justify-between">
        <span className="text-gray-500">Subtotal</span>
        <span>${payment.subtotal.toFixed(2)}</span>
      </div>

      <div className="flex justify-between">
        <span className="text-gray-500">
          Processing Fee
        </span>
        <span>
          ${payment.processingFee.toFixed(2)}
        </span>
      </div>

      <div className="flex justify-between">
        <span className="text-gray-500">Tax</span>
        <span>
          {payment.tax === 0
            ? "Free"
            : `$${payment.tax.toFixed(2)}`}
        </span>
      </div>

      <hr />

      <div className="flex justify-between text-xl font-bold">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>

      <button
  onClick={handlePayment}
  disabled={!isFormValid || isLoading || isSuccess}
 className={`w-full mt-4 py-4 rounded-xl font-semibold transition ${
  isSuccess
    ? "bg-green-600 text-white"
    : "bg-blue-600 hover:bg-blue-700 text-white"
} disabled:opacity-70 disabled:cursor-not-allowed`}
>
  {isLoading ? (
    <div className="flex items-center justify-center gap-2">
      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      <span>Processing...</span>
    </div>
  ) : isSuccess ? (
    "Payment Successful ✓"
  ) : (
    "Confirm Payment"
  )}
</button>

      <p className="text-xs text-center text-gray-500">
        Secure 256-bit SSL encrypted payment
      </p>
<div className="mt-4 bg-gray-50 border rounded-xl p-4 flex gap-3">
  <div className="text-blue-600 text-xl">
    🛡️
  </div>

  <p className="text-xs text-gray-600 leading-relaxed">
    Your payment is protected by our secure payment system.
    By clicking <span className="font-medium">"Confirm Payment"</span>,
    you agree to our{" "}
    <a
      href="#"
      className="text-blue-600 underline hover:text-blue-700"
    >
      Terms of Service
    </a>.
  </p>
</div>
    </div>

  </div>
<div className="mt-6 rounded-2xl overflow-hidden relative h-40">
  <img
    src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200"
    alt="EduDrive"
    className="absolute inset-0 w-full h-full object-cover"
  />

  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center text-white px-4">
    <p className="text-lg font-bold">
      Invest in your safety
    </p>

    <p className="text-sm opacity-90 mt-1">
      Join 5,000+ certified drivers this year
    </p>
  </div>
</div>
</div>

</div> {/* Main Grid */}

</div>

</MainLayout>

  );
}