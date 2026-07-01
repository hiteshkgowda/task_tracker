import { memo } from "react";
import { AnimatePresence } from "framer-motion";
import TaskCard from "./TaskCard";
import SkeletonCard from "./SkeletonCard";
import EmptyState from "./EmptyState";

const gridClasses = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";

function TaskList({ tasks, loading, hasAnyTasks, deletingId, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className={gridClasses}>
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return <EmptyState variant={hasAnyTasks ? "no-match" : "no-tasks"} />;
  }

  return (
    <div className={gridClasses}>
      <AnimatePresence initial={false}>
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            isDeleting={deletingId === task._id}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

export default memo(TaskList);
