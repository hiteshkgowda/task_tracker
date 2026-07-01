import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

if (!import.meta.env.VITE_API_BASE_URL) {
  console.error(
    "VITE_API_BASE_URL is not set. Falling back to http://localhost:5000/api — " +
      "set it in your .env file (see .env.example) before deploying."
  );
}

const api = axios.create({
  baseURL: API_BASE_URL,
});

const taskService = {
  getTasks: async () => {
    const response = await api.get("/tasks");
    return response.data.data;
  },
  createTask: async (taskData) => {
    const response = await api.post("/tasks", taskData);
    return response.data.data;
  },
  updateTask: async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data.data;
  },
  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data.data;
  },
};

export default taskService;
