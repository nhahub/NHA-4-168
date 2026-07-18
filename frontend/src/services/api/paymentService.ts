import axiosInstance from "./axiosInstance";

export interface PaymentDto {
  paymentId: number;
  enrollmentId: number | null;
  tripId: number | null;

  amount: number;
  paymentDate: string;

  paymentMethod: string | null;
  status: string;

  transactionId: string;

  studentName: string;

  // Present when this payment came from a course enrollment.
  courseName: string | null;
  courseId: number | null;

  // Present when this payment came from a trip booking.
  tripDestination: string | null;
  tripPickupArea: string | null;

  paymentType: "Course" | "Trip";
}

export interface UpdatePaymentStatusDto {
  status: string;
}

export interface CreatePaymentDto {
  enrollmentId?: number;
  tripId?: number;
  studentSsn?: number;
  amount: number;
  paymentMethod: string;
}

const paymentService = {
  getAll: async (): Promise<PaymentDto[]> => {
    const response = await axiosInstance.get("/payments");
    return response.data;
  },

  getById: async (id: number): Promise<PaymentDto> => {
    const response = await axiosInstance.get(`/payments/${id}`);
    return response.data;
  },

  create: async (data: CreatePaymentDto): Promise<PaymentDto> => {
    const response = await axiosInstance.post("/payments", data);
    return response.data;
  },

  updateStatus: async (
    id: number,
    data: UpdatePaymentStatusDto
  ): Promise<void> => {
    await axiosInstance.patch(`/payments/${id}/status`, data);
  },

  getStudentPayments: async (
    studentSsn: number
  ): Promise<PaymentDto[]> => {
    const response = await axiosInstance.get(
      `/payments/student/${studentSsn}`
    );

    return response.data;
  },

  getByEnrollment: async (
    enrollmentId: number
  ): Promise<PaymentDto> => {
    const response = await axiosInstance.get(
      `/payments/enrollment/${enrollmentId}`
    );

    return response.data;
  },

  getByTripAndStudent: async (
    tripId: number,
    studentSsn: number
  ): Promise<PaymentDto> => {
    const response = await axiosInstance.get(
      `/payments/trip/${tripId}/student/${studentSsn}`
    );

    return response.data;
  },
};

export default paymentService;
