// src/services/bankService.js
import api from "./api";

/**
 * Bank Account Service
 * Handles API calls for society-level treasury and bank management.
 */
const bankService = {
  /**
   * @desc Get all registered society bank accounts
   * @access Admin/Super-Admin
   */
  getBankAccounts: async () => {
    const response = await api.get("/bank-accounts");
    return response.data;
  },

  /**
   * @desc Register a new society bank account
   * @param {Object} bankData - { bankName, accountNumber, accountType, accountHolderNames, currentBalance }
   */
  addBankAccount: async (bankData) => {
    const response = await api.post("/bank-accounts", bankData);
    return response.data;
  },

  /**
   * @desc Execute internal balance transfer between society accounts
   * @param {Object} transferData - { fromAccountId, toAccountId, amount, remarks }
   */
  transferBalance: async (transferData) => {
    // 🔥 Added to fix the "Execute Transfer" button non-responsiveness
    const response = await api.post("/bank-accounts/transfer", transferData);
    return response.data;
  },

  /**
   * @desc Update an existing bank account's details, balance, or designation
   * @param {string} id - Bank account ID
   * @param {Object} updateData - Includes isMotherAccount toggle
   */
  updateBankAccount: async (id, updateData) => {
    const response = await api.put(`/bank-accounts/${id}`, updateData);
    return response.data;
  },

  /**
   * @desc Remove a bank account from the registry
   * @param {string} id - Bank account ID
   */
  deleteBankAccount: async (id) => {
    const response = await api.delete(`/bank-accounts/${id}`);
    return response.data;
  },
};

export default bankService;
