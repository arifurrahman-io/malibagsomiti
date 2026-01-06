import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Button from "../components/ui/Button";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-6 p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-center">
          <div className="p-4 bg-red-50 text-red-600 rounded-full">
            <ShieldAlert size={48} />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-500">
            You do not have the required permissions to view this page. Please
            contact the Malibag Society Admin if you believe this is an error.
          </p>
        </div>

        <div className="pt-4">
          <Button
            onClick={() => navigate("/dashboard")}
            className="w-full flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} /> Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
