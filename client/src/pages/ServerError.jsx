import { motion } from "framer-motion";

export default function ServerError() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 1 }}
        className="text-5xl font-bold text-gray-700"
      >
        ⚠️
      </motion.div>

      <h1 className="mt-4 text-2xl font-semibold">
        Something went wrong
      </h1>

      <p className="mt-2 text-gray-500">
        Please try again later
      </p>
    </div>
  );
}