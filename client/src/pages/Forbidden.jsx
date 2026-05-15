import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Forbidden() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      
      <motion.div
        initial={{ rotate: -10 }}
        animate={{ rotate: 0 }}
        className="text-5xl font-bold text-red-500"
      >
        403
      </motion.div>

      <p className="mt-4 text-gray-600">
        You don’t have permission to access this page
      </p>

      <button
        onClick={() => navigate("/")}
        className="px-6 py-2 mt-6 text-white bg-red-500 rounded-xl"
      >
        Back Home
      </button>
    </div>
  );
}