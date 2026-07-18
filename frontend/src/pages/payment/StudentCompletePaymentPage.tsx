import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import paymentService from "../../services/api/paymentService";
import type { PaymentDto } from "../../services/api/paymentService";
import { getApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../contexts/ToastContext";
import { useAuth } from "../../contexts/AuthContext";

export default function StudentPaymentPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { enrollmentId, tripId } = useParams<{ enrollmentId?: string; tripId?: string }>();
  const parsedEnrollmentId = enrollmentId ? Number(enrollmentId) : null;
  const parsedTripId = tripId ? Number(tripId) : null;

  const [paymentMethod, setPaymentMethod] =
    useState<"card" | "cash">("card");

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [saveCard, setSaveCard] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [payment, setPayment] = useState<PaymentDto | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const isFormValid =
    paymentMethod === "cash" ||
    (
      cardName.trim().length > 0 &&
      cardNumber.trim().length > 0 &&
      expiry.trim().length > 0 &&
      cvv.trim().length > 0
    );

  useEffect(() => {
    const loadPayment = async () => {
      try {
        if (parsedTripId) {
          if (!user?.studentSsn) {
            setPageError("Could not identify the current student.");
            setPageLoading(false);
            return;
          }
          const data = await paymentService.getByTripAndStudent(parsedTripId, user.studentSsn);
          setPayment(data);
          return;
        }

        if (!parsedEnrollmentId || Number.isNaN(parsedEnrollmentId) || parsedEnrollmentId <= 0) {
          setPageError("Invalid enrollment.");
          setPageLoading(false);
          return;
        }

        const data = await paymentService.getByEnrollment(parsedEnrollmentId);
        setPayment(data);
      } catch (requestError) {
        setPageError(getApiErrorMessage(requestError, "Payment not found."));
      } finally {
        setPageLoading(false);
      }
    };

    loadPayment();
  }, [parsedEnrollmentId, parsedTripId, user?.studentSsn]);

  const handlePayment = async () => {
    if (!payment) return;

    setIsLoading(true);
    setPageError(null);

    try {
      const method = paymentMethod === "cash" ? "Cash" : "Card";
      await paymentService.updateStatus(payment.paymentId, {
        status: "Paid"
      });

      setPayment((prev) =>
        prev
          ? {
              ...prev,
              status: "Paid",
              paymentMethod: method,
              paymentDate: new Date().toISOString(),
            }
          : prev
      );

      setIsSuccess(true);
      setCardName("");
      setCardNumber("");
      setExpiry("");
      setCvv("");
      setSaveCard(false);
      toast.success("Payment completed successfully.");

      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, "Payment failed. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Loading payment...</p>
        </div>
      </MainLayout>
    );
  }

  if (pageError || !payment) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-red-500">{pageError || "Payment not found."}</p>
        </div>
      </MainLayout>
    );
  }

  const currentPayment = payment as PaymentDto;
  const isTrip = currentPayment.paymentType === "Trip";
  const serviceName = isTrip
    ? `${currentPayment.tripDestination ?? "Trip"}${currentPayment.tripPickupArea ? ` · ${currentPayment.tripPickupArea}` : ""}`
    : currentPayment.courseName ?? "Course";
  const serviceLabel = isTrip ? "Ride Booking" : "Course Enrollment Fee";
  const subtotal = currentPayment.amount;
  const processingFee = subtotal > 0 ? 3 : 0;
  const tax = 0;
  const total = subtotal + processingFee + tax;

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

            <div className="bg-surface-lowest rounded-2xl border shadow-sm p-6">

              <div className="flex items-start justify-between">

                <div>

                  <h2 className="text-xl font-bold">
                    {serviceName}
                  </h2>

                  <p className="text-gray-500 mt-1">
                    {serviceLabel}
                  </p>

                </div>

                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                  {isTrip ? "Trip Payment" : "Course Payment"}
                </span>

              </div>

            </div>

            {/* Payment Method */}

            <div className="bg-surface-lowest rounded-2xl border shadow-sm p-6">

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
              <div className="bg-surface-lowest rounded-2xl border shadow-sm p-6">

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

            <div className="bg-surface-lowest rounded-2xl border shadow-sm overflow-hidden">

              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">
                  Order Summary
                </h2>
              </div>

              <div className="p-6 space-y-4">

                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Processing Fee
                  </span>
                  <span>
                    ${processingFee.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Tax
                  </span>
                  <span>
                    Free
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
                    </a>
                    .
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
