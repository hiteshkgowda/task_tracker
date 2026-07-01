export function formatDate(dateString) {
  if (!dateString) return "No due date";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function toDateInputValue(dateString) {
  return dateString ? dateString.slice(0, 10) : "";
}
