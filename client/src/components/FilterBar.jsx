import { memo } from "react";
import { statusOptions, priorityOptions } from "../utils/badgeStyles";

const selectClasses =
  "px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition";

function FilterBar({
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  sortBy,
  onSortByChange,
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value)}
        aria-label="Filter tasks by status"
        className={selectClasses}
      >
        <option value="All">All Statuses</option>
        {statusOptions.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>

      <select
        value={priorityFilter}
        onChange={(e) => onPriorityFilterChange(e.target.value)}
        aria-label="Filter tasks by priority"
        className={selectClasses}
      >
        <option value="All">All Priorities</option>
        {priorityOptions.map((priority) => (
          <option key={priority} value={priority}>
            {priority}
          </option>
        ))}
      </select>

      <select
        value={sortBy}
        onChange={(e) => onSortByChange(e.target.value)}
        aria-label="Sort tasks"
        className={selectClasses}
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="dueDate">Due Date</option>
        <option value="priority">Priority</option>
        <option value="title">Title (A-Z)</option>
      </select>
    </div>
  );
}

export default memo(FilterBar);
