export const CONNECTION_ERROR_MESSAGE = "Unable to connect to the server. Please try again.";

export function getErrorMessage(error, fallback) {
  if (!error.response) return CONNECTION_ERROR_MESSAGE;
  return error.response.data?.message || fallback;
}

// The backend returns one message string, not per-field errors — this is a
// best-effort keyword match so the offending form field can still be highlighted.
export function matchFieldFromMessage(message = "") {
  const lower = message.toLowerCase();
  if (lower.includes("title")) return "title";
  if (lower.includes("description")) return "description";
  if (lower.includes("priority")) return "priority";
  if (lower.includes("status")) return "status";
  if (lower.includes("due date") || lower.includes("duedate")) return "dueDate";
  return null;
}
