import { memo } from "react";

function SearchBar({ value, onChange }) {
  return (
    <div className="relative flex-1 min-w-[200px]">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
        🔍
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search tasks by title..."
        aria-label="Search tasks by title"
        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
      />
    </div>
  );
}

export default memo(SearchBar);
