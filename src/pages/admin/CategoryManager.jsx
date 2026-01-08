import React, { useState, useMemo } from "react";
import {
  Plus,
  Trash2,
  Edit3,
  X,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  PlusCircle,
} from "lucide-react";
import { useFetch } from "../../hooks/useFetch";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/categoryService";
import toast from "react-hot-toast";

const CategoryManager = () => {
  const { data: config, loading, refetch } = useFetch("/finance/categories");
  const [isEditing, setIsEditing] = useState(null);
  const [formData, setFormData] = useState({ name: "", type: "deposit" });
  const [newSub, setNewSub] = useState({ id: null, name: "" });

  const categoriesList = useMemo(() => {
    const raw = Array.isArray(config) ? config : config?.data;
    return Array.isArray(raw) ? raw : [];
  }, [config]);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateCategory(isEditing, formData);
        toast.success("Category Updated");
      } else {
        await createCategory({ ...formData, subcategories: [] });
        toast.success("Category Created");
      }
      setFormData({ name: "", type: "deposit" });
      setIsEditing(null);
      refetch();
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const handleAddSubcategory = async (cat) => {
    if (!newSub.name) return;
    try {
      const updatedSubs = [...cat.subcategories, newSub.name];
      await updateCategory(cat._id, { subcategories: updatedSubs });
      setNewSub({ id: null, name: "" });
      refetch();
    } catch (err) {
      toast.error("Failed to add subcategory");
    }
  };

  const handleRemoveSub = async (cat, subName) => {
    try {
      const updatedSubs = cat.subcategories.filter((s) => s !== subName);
      await updateCategory(cat._id, { subcategories: updatedSubs });
      refetch();
    } catch (err) {
      toast.error("Failed to remove");
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-10 animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">
          Category Management
        </h1>
        <p className="text-sm text-slate-500">
          Organize your deposit and expense categories.
        </p>
      </header>

      {/* --- CREATE NEW CATEGORY SECTION --- */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
        <div className="flex items-center gap-2 text-blue-600 mb-6">
          <PlusCircle size={20} />
          <span className="font-bold text-sm uppercase tracking-tight">
            Create New Category
          </span>
        </div>
        <form
          onSubmit={handleCreateCategory}
          className="flex flex-wrap items-end gap-6"
        >
          <div className="flex-1 min-w-[300px] space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              required
              placeholder="e.g. Tuition Fee"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none transition-all"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase">
              Type
            </label>
            <div className="flex p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                className={`px-6 py-2 rounded-md text-xs font-bold transition-all ${
                  formData.type === "deposit"
                    ? "bg-white text-green-600 shadow-sm"
                    : "text-slate-500"
                }`}
                onClick={() => setFormData({ ...formData, type: "deposit" })}
              >
                deposit
              </button>
              <button
                type="button"
                className={`px-6 py-2 rounded-md text-xs font-bold transition-all ${
                  formData.type === "expense"
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-slate-500"
                }`}
                onClick={() => setFormData({ ...formData, type: "expense" })}
              >
                Expense
              </button>
            </div>
          </div>
          <button className="px-8 py-3 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition-all">
            {isEditing ? "Update Category" : "Create Category"}
          </button>
        </form>
      </div>

      {/* --- CATEGORY LIST GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {["deposit", "expense"].map((type) => (
          <div key={type} className="space-y-6">
            <div className="flex items-center gap-3">
              <div
                className={`w-2 h-2 rounded-full ${
                  type === "deposit" ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
                {type} Categories
              </h2>
            </div>

            <div className="space-y-4">
              {categoriesList
                .filter((c) => c.type === type)
                .map((cat) => (
                  <div
                    key={cat._id}
                    className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-base font-bold text-slate-800">
                          {cat.name}
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          {cat.subcategories.length} Subcategories
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setIsEditing(cat._id);
                            setFormData({ name: cat.name, type: cat.type });
                          }}
                          className="p-1.5 text-slate-300 hover:text-blue-600 transition-all"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() =>
                            deleteCategory(cat._id).then(() => refetch())
                          }
                          className="p-1.5 text-slate-300 hover:text-red-600 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {cat.subcategories.map((sub) => (
                        <span
                          key={sub}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                            type === "deposit"
                              ? "bg-green-50 text-green-600 border-green-100"
                              : "bg-red-50 text-red-600 border-red-100"
                          }`}
                        >
                          {sub}
                          <X
                            size={10}
                            className="cursor-pointer opacity-60 hover:opacity-100"
                            onClick={() => handleRemoveSub(cat, sub)}
                          />
                        </span>
                      ))}
                    </div>

                    {/* Add Subcategory Inline */}
                    <div className="flex gap-2">
                      <input
                        placeholder="Add new subcategory..."
                        className="flex-1 px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[11px] outline-none focus:bg-white"
                        value={newSub.id === cat._id ? newSub.name : ""}
                        onChange={(e) =>
                          setNewSub({ id: cat._id, name: e.target.value })
                        }
                      />
                      <button
                        onClick={() => handleAddSubcategory(cat)}
                        className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryManager;
