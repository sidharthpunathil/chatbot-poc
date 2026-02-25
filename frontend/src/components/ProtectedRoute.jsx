import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../services/api";

const ProtectedRoute = ({ children }) => {
  const [status, setStatus] = useState("checking"); // checking | valid | invalid

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setStatus("invalid");
      return;
    }

    api
      .get("/admin/status")
      .then(() => setStatus("valid"))
      .catch(() => {
        localStorage.removeItem("access_token");
        setStatus("invalid");
      });
  }, []);

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "invalid") return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
