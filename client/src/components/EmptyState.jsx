import { memo } from "react";

function EmptyState({ variant = "no-match" }) {
  const isNoTasks = variant === "no-tasks";

  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4" role="status">
      <span className="text-5xl mb-4">🗂️</span>
      <h3 className="text-lg font-semibold text-gray-700">
        {isNoTasks ? "No tasks yet" : "No tasks match your filters"}
      </h3>
      <p className="text-sm text-gray-400 mt-1">
        {isNoTasks
          ? "Add your first task using the form above to get started."
          : "Try adjusting your search, status, or priority filters."}
      </p>
    </div>
  );
}

export default memo(EmptyState);
