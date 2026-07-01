const mongoose = require("mongoose");
const Task = require("../models/Task");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Create a new task
// @route   POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get all tasks
// @route   GET /api/tasks
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get a single task by id
// @route   GET /api/tasks/:id
const getTaskById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid Task ID" });
    }

    const task = await Task.findById(req.params.id).lean();

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid Task ID" });
    }

    const { title } = req.body;

    if (title !== undefined && !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title cannot be empty",
      });
    }

    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid Task ID" });
    }

    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
