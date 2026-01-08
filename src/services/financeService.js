import api from "./api";

/**
 * @desc    Process monthly deposits
 * @param   {Array} userIds - List of member IDs
 * @param   {String} remarks - Description of the transaction
 * @param   {Object} data - Contains { month, year }
 */
export const postDeposit = (userIds, remarks, data) =>
  api.post("/finance/deposit", {
    userIds,
    remarks,
    ...data, // ✅ This sends "month" and "year" to the backend
  });

/**
 * @desc    Fetch Admin Dashboard statistics
 */
export const getDashboardSummary = () => api.get("/finance/summary");

/**
 * @desc    Record a new society expense
 */
export const postExpense = (data) => api.post("/finance/expense", data);

/**
 * @desc    Check payment status for a specific month/year/branch
 */
export const checkPayments = (params) =>
  api.get("/finance/check-payments", { params });

/**
 * @desc    Record Profit/Loss for a specific investment project
 * @param   {String} projectId - The ID of the investment
 * @param   {Object} data - Contains { amount, type (deposit/expense), remarks }
 */
export const postInvestmentProfit = (projectId, data) =>
  api.post(`/finance/investment/${projectId}/profit`, data);
