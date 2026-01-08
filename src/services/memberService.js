import api from "./api";

/**
 * @desc    Fetch all members with optional filters (branch, status)
 * @returns {Promise} { success: true, data: [...] }
 */
// Suggested slight enhancement for the Search bar in your Member List
export const getMembers = (params) =>
  api.get("/members", {
    params: {
      ...params,
      sort: "-createdAt", // Ensure newest members show at the top by default
    },
  });

/**
 * @desc    Register a new member (Admin/Super-Admin only)
 * @param   {Object} memberData - name, email, password, phone, nid, bankAccount, branch, shares, joiningDate
 */
export const createMember = (memberData) => api.post("/members", memberData);

/**
 * @desc    Get detailed profile including financial summary for dynamic UI cards
 * @param   {String} id - The specific member ID (used by Admins)
 */
export const getMemberDetails = (id) => api.get(`/members/profile/${id}`);

/**
 * @desc    🚀 NEW: Fetch profile for the currently logged-in user
 * @returns {Promise} Returns personal financial summary and registry details
 * This matches the optional parameter route: /api/members/profile/:id?
 */
export const getMyProfile = () => api.get("/members/profile");

/**
 * @desc    Update member information (Admin/Super-Admin)
 * @param   {String} id - Member ID
 * @param   {Object} data - Updated profile fields
 */
export const updateMember = (id, data) => api.put(`/members/${id}`, data);

/**
 * @desc    Toggle account status between active and inactive
 * @param   {String} id - Member ID
 */
export const toggleMemberStatus = (id) => api.patch(`/members/${id}/status`);

/**
 * @desc    Permanently delete a member record (Super-Admin Only)
 * @param   {String} id - Member ID
 */
export const deleteMember = (id) => api.delete(`/members/${id}`);
