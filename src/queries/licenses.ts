import { useMutation, useQuery } from "@tanstack/react-query"
import { axiosInstance } from "./axiosconf"
import { User } from "@/types/users"

export interface PaymentRequest {
  email: string
  players: Array<{
    id: number
    first_name: string
    last_name: string
    birth_date: string
    licenseType: string
    eltl_id: number
    club_name: string
    selected_license_duration: number
  }>
  currency: string
}

export interface PaymentResponse {
  data: {
    payment_url: string
    order_id: string
  }
  error?: string
}

export interface PaymentStatusResponse {
  data: {
    status: string
    order_id: string
  }
  error?: string
}

export interface LicensePaymentRecord {
  id: number
  user_id: number
  user: User
  license_type: string
  amount: number
  currency: string
  status: string
  purchase_email: string
  payment_order_id: string
  created_at: string
  paid_at: string
  selected_license_duration: number
}

export interface LicenseDetailsResponse {
  message: string
  data: LicensePaymentRecord[]
}

export const useCreatePayment = () => {
  return useMutation({
    mutationFn: async (paymentData: PaymentRequest): Promise<PaymentResponse> => {
      const { data } = await axiosInstance.post('/api/v1/licenses/payment', paymentData, {
        withCredentials: true,
      });
      return data;
    },
  });
}

export const useCheckPaymentStatus = () => {
  return useMutation({
    mutationFn: async (orderId: string): Promise<PaymentStatusResponse> => {
      const { data } = await axiosInstance.get(`/api/v1/licenses/status?order_id=${orderId}`, {
        withCredentials: true,
      });
      return data;
    },
  });
}

export const useLicenseDetails = (orderId: string | undefined) => {
  return useQuery({
    queryKey: ['license-details', orderId],
    queryFn: async (): Promise<LicenseDetailsResponse> => {
      const { data } = await axiosInstance.get(`/api/v1/licenses/status?order_id=${orderId}`, {
        withCredentials: true,
      });
      return data;
    },
    enabled: !!orderId,
  });
}