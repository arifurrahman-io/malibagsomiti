import api from "./api"; //

/**
 * Fetch all members with optional filters (branch, status)
 * Returns: { success: true, data: [...] }
 */
export const getMembers = (params) => api.get("/members", { params });

/**
 * Register a new member (Admin/Super-Admin only)
 * Expected fields: name, email, password, phone, nid, bankAccount, branch, shares, joiningDate
 */
export const createMember = (memberData) => api.post("/members", memberData);

/**
 * Get detailed profile including financial summary for dynamic UI cards
 * Path: /api/members/profile/:id
 */
export const getMemberDetails = (id) => api.get(`/members/profile/${id}`);

/**
 * Update member information (Admin/Super-Admin)
 * Recalculates monthlySubscription automatically if shares are changed
 */
export const updateMember = (id, data) => api.put(`/members/${id}`, data);

/**
 * Toggle account status between active and inactive
 * Path: /api/members/:id/status
 */
export const toggleMemberStatus = (id) => api.patch(`/members/${id}/status`);

/**
 * Permanently delete a member record (Super-Admin Only)
 * WARNING: This should be used with a confirmation modal in the UI.
 */
export const deleteMember = (id) => api.delete(`/members/${id}`);
