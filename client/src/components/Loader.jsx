import { memo } from "react";

function Loader({ label = "Loading tasks...", size = "lg" }) {
  if (size === "sm") {
    return (
      <span
        role="status"
        aria-label={label}
        className="inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin"
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3" role="status" aria-live="polite">
      <div className="h-10 w-10 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin" />
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}

export default memo(Loader);
