import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";
import SummaryCard from "../components/SummaryCard";
import ConfirmModal from "../components/ConfirmModal";
import taskService from "../services/taskService";
import useDebouncedValue from "../hooks/useDebouncedValue";
import useLocalStorageState from "../hooks/useLocalStorageState";
import { downloadTasksAsCsv } from "../utils/exportTasksToCsv";
import { CONNECTION_ERROR_MESSAGE, getErrorMessage, matchFieldFromMessage } from "../utils/apiError";

const PRIORITY_RANK = { High: 0, Medium: 1, Low: 2 };

function sortTasks(tasks, sortBy) {
  const sorted = [...tasks];
  switch (sortBy) {
    case "oldest":
      return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case "dueDate":
      return sorted.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    case "priority":
      return sorted.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
    case "title":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "newest":
    default:
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

function Home() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [taskPendingDelete, setTaskPendingDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [pendingScrollId, setPendingScrollId] = useState(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useLocalStorageState("taskTracker.search", "");
  const [statusFilter, setStatusFilter] = useLocalStorageState("taskTracker.statusFilter", "All");
  const [priorityFilter, setPriorityFilter] = useLocalStorageState("taskTracker.priorityFilter", "All");
  const [sortBy, setSortBy] = useLocalStorageState("taskTracker.sortBy", "newest");

  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const data = await taskService.getTasks();
        setTasks(data);
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to load tasks"));
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // Runs after `tasks` re-renders with the updated item, so the DOM node
  // for `pendingScrollId` is guaranteed to exist before we scroll to it.
  useEffect(() => {
    if (!pendingScrollId) return;
    const node = document.getElementById(`task-${pendingScrollId}`);
    node?.scrollIntoView({ behavior: "smooth", block: "center" });
    setPendingScrollId(null);
  }, [pendingScrollId, tasks]);

  const summary = useMemo(
    () => ({
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "Pending").length,
      inProgress: tasks.filter((t) => t.status === "In Progress").length,
      completed: tasks.filter((t) => t.status === "Completed").length,
    }),
    [tasks]
  );

  const visibleTasks = useMemo(() => {
    const filtered = tasks.filter((task) => {
      const matchesSearch = task.title
        .toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || task.status === statusFilter;
      const matchesPriority = priorityFilter === "All" || task.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });

    return sortTasks(filtered, sortBy);
  }, [tasks, debouncedSearchTerm, statusFilter, priorityFilter, sortBy]);

  // Returns { success, fieldErrors? } so TaskForm can decide whether to
  // reset/focus (on success) or highlight a field (on validation failure)
  // without this component reaching into the form's internals.
  const handleCreateOrUpdate = useCallback(
    async (data) => {
      try {
        if (editingTask) {
          const updated = await taskService.updateTask(editingTask._id, data);
          setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
          toast.success("Task updated successfully");
          setEditingTask(null);
          setPendingScrollId(updated._id);
        } else {
          const created = await taskService.createTask(data);
          setTasks((prev) => [created, ...prev]);
          toast.success("Task created successfully");
        }
        return { success: true };
      } catch (error) {
        if (!error.response) {
          toast.error(CONNECTION_ERROR_MESSAGE);
          return { success: false };
        }

        const message = getErrorMessage(
          error,
          editingTask ? "Failed to update task" : "Failed to create task"
        );
        toast.error(message);

        if (error.response.status === 400) {
          const field = matchFieldFromMessage(message);
          if (field) return { success: false, fieldErrors: { [field]: message } };
        }
        return { success: false };
      }
    },
    [editingTask]
  );

  const handleEdit = useCallback((task) => setEditingTask(task), []);
  const handleCancelEdit = useCallback(() => setEditingTask(null), []);

  const requestDelete = useCallback(
    (task) => {
      if (deletingId) return; // a delete is already in flight
      setTaskPendingDelete(task);
    },
    [deletingId]
  );

  const cancelDelete = useCallback(() => {
    if (deletingId) return;
    setTaskPendingDelete(null);
  }, [deletingId]);

  const confirmDelete = useCallback(async () => {
    if (!taskPendingDelete || deletingId) return;
    setDeletingId(taskPendingDelete._id);
    try {
      await taskService.deleteTask(taskPendingDelete._id);
      setTasks((prev) => prev.filter((t) => t._id !== taskPendingDelete._id));
      toast.success("Task deleted successfully");
      setTaskPendingDelete(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete task"));
    } finally {
      setDeletingId(null);
    }
  }, [taskPendingDelete, deletingId]);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("All");
    setPriorityFilter("All");
  }, [setSearchTerm, setStatusFilter, setPriorityFilter]);

  const filterByStatus = useCallback(
    (status) => setStatusFilter(status),
    [setStatusFilter]
  );

  const handleExport = useCallback(() => {
    if (visibleTasks.length === 0) {
      toast.info("No tasks to export");
      return;
    }
    const filename = `tasks-${new Date().toISOString().slice(0, 10)}.csv`;
    downloadTasksAsCsv(visibleTasks, filename);
  }, [visibleTasks]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            label="Total Tasks"
            value={summary.total}
            accent="text-gray-800"
            isActive={statusFilter === "All"}
            onClick={clearFilters}
          />
          <SummaryCard
            label="Pending"
            value={summary.pending}
            accent="text-yellow-600"
            isActive={statusFilter === "Pending"}
            onClick={() => filterByStatus("Pending")}
          />
          <SummaryCard
            label="In Progress"
            value={summary.inProgress}
            accent="text-blue-600"
            isActive={statusFilter === "In Progress"}
            onClick={() => filterByStatus("In Progress")}
          />
          <SummaryCard
            label="Completed"
            value={summary.completed}
            accent="text-green-600"
            isActive={statusFilter === "Completed"}
            onClick={() => filterByStatus("Completed")}
          />
        </div>

        <TaskForm
          initialValues={editingTask}
          onSubmit={handleCreateOrUpdate}
          onCancel={handleCancelEdit}
        />

        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
            <button
              type="button"
              onClick={() => setIsFiltersOpen((open) => !open)}
              aria-expanded={isFiltersOpen}
              aria-controls="filter-panel"
              className="sm:hidden flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600"
            >
              Filters & Sort
              <span aria-hidden="true">{isFiltersOpen ? "▲" : "▼"}</span>
            </button>
            <div
              id="filter-panel"
              className={`${isFiltersOpen ? "flex" : "hidden"} sm:flex`}
            >
              <FilterBar
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                priorityFilter={priorityFilter}
                onPriorityFilterChange={setPriorityFilter}
                sortBy={sortBy}
                onSortByChange={setSortBy}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-700">{visibleTasks.length}</span> of{" "}
              <span className="font-medium text-gray-700">{tasks.length}</span> tasks
            </p>
            <button
              type="button"
              onClick={handleExport}
              aria-label="Export visible tasks as CSV"
              className="self-start sm:self-auto px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
            >
              Export Tasks
            </button>
          </div>
        </div>

        <TaskList
          tasks={visibleTasks}
          loading={loading}
          hasAnyTasks={tasks.length > 0}
          deletingId={deletingId}
          onEdit={handleEdit}
          onDelete={requestDelete}
        />
      </main>

      <ConfirmModal
        open={Boolean(taskPendingDelete)}
        title="Delete task?"
        message={`Are you sure you want to delete "${taskPendingDelete?.title}"? This cannot be undone.`}
        loading={Boolean(deletingId)}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export default Home;
