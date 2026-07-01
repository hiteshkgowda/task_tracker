import { memo } from "react";
import { motion } from "framer-motion";

function SummaryCard({ label, value, accent, isActive, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      aria-pressed={isActive}
      aria-label={`Show ${label.toLowerCase()} tasks`}
      className={`text-left bg-white rounded-2xl shadow-sm border p-5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
        isActive ? "border-blue-400 ring-2 ring-blue-100" : "border-gray-100 hover:border-gray-200"
      }`}
    >
      <p className="text-sm text-gray-400">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${accent}`}>{value}</p>
    </motion.button>
  );
}

export default memo(SummaryCard);
