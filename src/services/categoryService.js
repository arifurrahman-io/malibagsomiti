import api from "./api";

/**
 * Service to handle all Category & Subcategory CRUD operations
 */
export const getCategories = async () => {
  const response = await api.get("/finance/categories");
  return response.data;
};

export const createCategory = async (categoryData) => {
  const response = await api.post("/finance/categories", categoryData);
  return response.data;
};

export const updateCategory = async (id, categoryData) => {
  const response = await api.put(`/finance/categories/${id}`, categoryData);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/finance/categories/${id}`);
  return response.data;
};
