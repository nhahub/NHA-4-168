import axiosInstance from "./axiosInstance";

export interface PaymentDto {
  paymentId: number;
  enrollmentId: number;

  amount: number;
  paymentDate: string;

  paymentMethod: string | null;
  status: string;

  transactionId: string;

  studentName: string;
  courseName: string;
  courseId: number;
}

// export interface CreatePaymentDto {
//   studentSsn: number;
//   serviceId: number;
//   amount: number;
// }

export interface UpdatePaymentStatusDto {
  status: string;
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
};

export interface CreatePaymentDto {
  enrollmentId: number;
  amount: number;
  paymentMethod: string;
}

export default paymentService;