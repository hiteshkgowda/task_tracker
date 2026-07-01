import { formatDate } from "./formatDate";

const CSV_HEADERS = ["Title", "Description", "Status", "Priority", "Due Date", "Created Date"];

function escapeCsvValue(value) {
  const stringValue = String(value ?? "");
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export function tasksToCsv(tasks) {
  const rows = tasks.map((task) =>
    [
      task.title,
      task.description,
      task.status,
      task.priority,
      formatDate(task.dueDate),
      formatDate(task.createdAt),
    ]
      .map(escapeCsvValue)
      .join(",")
  );

  return [CSV_HEADERS.join(","), ...rows].join("\n");
}

export function downloadTasksAsCsv(tasks, filename = "tasks.csv") {
  const csvContent = tasksToCsv(tasks);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
