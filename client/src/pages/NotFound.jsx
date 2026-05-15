import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen text-gray-800 bg-white">
      
      <motion.h1
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-6xl font-bold text-orange-500"
      >
        404
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-4 text-lg"
      >
        Page not found
      </motion.p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={() => navigate("/")}
        className="px-6 py-2 mt-6 text-white bg-orange-500 rounded-xl"
      >
        Go Home
      </motion.button>
    </div>
  );
}