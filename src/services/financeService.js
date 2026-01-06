import api from "./api";

export const postDeposit = (userIds, remarks) =>
  api.post("/finance/deposit", { userIds, remarks });

export const getDashboardSummary = () => api.get("/finance/summary");

export const postExpense = (data) => api.post("/finance/expense", data);
