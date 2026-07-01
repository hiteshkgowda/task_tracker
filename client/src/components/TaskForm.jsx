import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { statusOptions, priorityOptions } from "../utils/badgeStyles";
import { toDateInputValue } from "../utils/formatDate";
import Loader from "./Loader";

const inputClasses =
  "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition";
const errorInputClasses = "border-red-300 focus:ring-red-400";

const todayISO = () => new Date().toISOString().split("T")[0];

function TaskForm({ initialValues, onSubmit, onCancel }) {
  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: initialValues || {
      title: "",
      description: "",
      status: "Pending",
      priority: "Medium",
      dueDate: "",
    },
  });

  useEffect(() => {
    if (initialValues) {
      reset({
        ...initialValues,
        dueDate: toDateInputValue(initialValues.dueDate),
      });
    }
  }, [initialValues, reset]);

  const isEditing = Boolean(initialValues);

  const submitHandler = async (data) => {
    const payload = { ...data, dueDate: data.dueDate || undefined };
    const result = await onSubmit(payload);

    if (result?.success) {
      if (!isEditing) {
        reset();
        setFocus("title");
      }
    } else if (result?.fieldErrors) {
      Object.entries(result.fieldErrors).forEach(([field, message]) => {
        setError(field, { type: "server", message });
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(submitHandler)}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4"
      noValidate
    >
      <h2 className="text-lg font-semibold text-gray-800">
        {isEditing ? "Edit Task" : "Add New Task"}
      </h2>

      <div>
        <label htmlFor="task-title" className="block text-sm font-medium text-gray-600 mb-1">
          Title
        </label>
        <input
          id="task-title"
          type="text"
          className={`${inputClasses} ${errors.title ? errorInputClasses : ""}`}
          placeholder="e.g. Finish project report"
          aria-invalid={errors.title ? "true" : "false"}
          aria-describedby={errors.title ? "task-title-error" : undefined}
          {...register("title", {
            required: "Title is required",
            maxLength: { value: 100, message: "Title cannot exceed 100 characters" },
          })}
        />
        {errors.title && (
          <p id="task-title-error" role="alert" className="text-xs text-red-500 mt-1">
            {errors.title.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="task-description" className="block text-sm font-medium text-gray-600 mb-1">
          Description
        </label>
        <textarea
          id="task-description"
          rows={3}
          className={`${inputClasses} ${errors.description ? errorInputClasses : ""}`}
          placeholder="Optional details about the task"
          aria-invalid={errors.description ? "true" : "false"}
          aria-describedby={errors.description ? "task-description-error" : undefined}
          {...register("description", {
            maxLength: { value: 500, message: "Description cannot exceed 500 characters" },
          })}
        />
        {errors.description && (
          <p id="task-description-error" role="alert" className="text-xs text-red-500 mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="task-status" className="block text-sm font-medium text-gray-600 mb-1">
            Status
          </label>
          <select id="task-status" className={inputClasses} {...register("status")}>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="task-priority" className="block text-sm font-medium text-gray-600 mb-1">
            Priority
          </label>
          <select id="task-priority" className={inputClasses} {...register("priority")}>
            {priorityOptions.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="task-dueDate" className="block text-sm font-medium text-gray-600 mb-1">
            Due Date
          </label>
          <input
            id="task-dueDate"
            type="date"
            className={`${inputClasses} ${errors.dueDate ? errorInputClasses : ""}`}
            aria-invalid={errors.dueDate ? "true" : "false"}
            aria-describedby={errors.dueDate ? "task-dueDate-error" : undefined}
            {...register("dueDate", {
              validate: (value) =>
                !value || value >= todayISO() || "Due date cannot be before today",
            })}
          />
          {errors.dueDate && (
            <p id="task-dueDate-error" role="alert" className="text-xs text-red-500 mt-1">
              {errors.dueDate.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={isSubmitting}
          aria-label={isEditing ? "Save task changes" : "Add new task"}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          {isSubmitting && <Loader size="sm" label={isEditing ? "Updating task" : "Saving task"} />}
          {isSubmitting ? (isEditing ? "Updating..." : "Saving...") : isEditing ? "Save Changes" : "Add Task"}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            aria-label="Cancel editing"
            className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default TaskForm;
