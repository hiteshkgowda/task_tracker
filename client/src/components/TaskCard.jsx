import { memo } from "react";
import { motion } from "framer-motion";
import { statusStyles, priorityStyles } from "../utils/badgeStyles";
import { formatDate } from "../utils/formatDate";
import Loader from "./Loader";

function TaskCard({ task, onEdit, onDelete, isDeleting }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      id={`task-${task._id}`}
      aria-busy={isDeleting}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-shadow duration-200 scroll-mt-24"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold text-gray-800 break-words">
          {task.title}
        </h3>
        <span
          className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${statusStyles[task.status]}`}
        >
          {task.status}
        </span>
      </div>

      {task.description && (
        <p className="text-sm text-gray-500 line-clamp-3">{task.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full border ${priorityStyles[task.priority]}`}
        >
          {task.priority} priority
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
        <span>Due: {formatDate(task.dueDate)}</span>
        <span>Created: {formatDate(task.createdAt)}</span>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => onEdit(task)}
          disabled={isDeleting}
          aria-label={`Edit task: ${task.title}`}
          className="flex-1 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(task)}
          disabled={isDeleting}
          aria-label={`Delete task: ${task.title}`}
          className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
        >
          {isDeleting ? (
            <>
              <Loader size="sm" label="Deleting task" />
              Deleting...
            </>
          ) : (
            "Delete"
          )}
        </button>
      </div>
    </motion.div>
  );
}

export default memo(TaskCard);
