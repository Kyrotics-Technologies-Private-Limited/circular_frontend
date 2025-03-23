// src/services/request.service.ts
import api from "./api";

export interface Request {
  id: string;
  ownerUid: string;
  orgId: string;
  organizationName: string;
  CIN: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  processedAt: Date | null;
  processedBy: string | null;
  rejectionReason?: string;
}

/**
 * Get all organization registration requests (Super Admin only)
 */
export const getAllRequests = async (): Promise<Request[]> => {
  try {
    const response = await api.get("/requests");

    // Convert timestamp strings to Date objects
    const requests = response.data.requests.map((request: any) => ({
      ...request,
      createdAt: request.createdAt ? new Date(request.createdAt) : null,
      processedAt: request.processedAt ? new Date(request.processedAt) : null,
    }));

    return requests;
  } catch (error) {
    console.error("Error getting organization requests:", error);
    throw error;
  }
};

/**
 * Get a specific request by ID (Super Admin only)
 */
export const getRequestById = async (requestId: string): Promise<Request> => {
  try {
    const response = await api.get(`/requests/${requestId}`);

    // Convert timestamp strings to Date objects
    const request = {
      ...response.data.request,
      createdAt: response.data.request.createdAt
        ? new Date(response.data.request.createdAt)
        : null,
      processedAt: response.data.request.processedAt
        ? new Date(response.data.request.processedAt)
        : null,
    };

    return request;
  } catch (error) {
    console.error("Error getting request details:", error);
    throw error;
  }
};

/**
 * Approve an organization registration request (Super Admin only)
 */
export const approveRequest = async (requestId: string): Promise<void> => {
  try {
    await api.put(`/requests/${requestId}/approve`);
  } catch (error) {
    console.error("Error approving organization request:", error);
    throw error;
  }
};

/**
 * Reject an organization registration request (Super Admin only)
 */
export const rejectRequest = async (
  requestId: string,
  reason?: string
): Promise<void> => {
  try {
    await api.put(`/requests/${requestId}/reject`, { reason });
  } catch (error) {
    console.error("Error rejecting organization request:", error);
    throw error;
  }
};
