import taskModel from "../models/Task.js";

// Get logged-in user's tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await taskModel
      .find({ assignedTo: req.user })
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Create a task for logged-in user
const createTask = async (req, res) => {
  try {
    const { title, description, status, dueDate, priority } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Task title is required",
      });
    }

    const task = new taskModel({
      title,
      description,
      status,
      dueDate,
      priority,
      assignedTo: req.user,
    });

    const newTask = await task.save();

    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// Update logged-in user's task
const updateTask = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedTask = await taskModel.findOneAndUpdate(
      {
        _id: id,
        assignedTo: req.user,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// Delete logged-in user's task
const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTask = await taskModel.findOneAndDelete({
      _id: id,
      assignedTo: req.user,
    });

    if (!deletedTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// Reorder/update task statuses
const reorderTasks = async (req, res) => {
  const { tasks } = req.body;

  try {
    if (!Array.isArray(tasks)) {
      return res.status(400).json({
        message: "Tasks must be an array",
      });
    }

    for (const task of tasks) {
      await taskModel.findOneAndUpdate(
        {
          _id: task.id,
          assignedTo: req.user,
        },
        {
          status: task.status,
        }
      );
    }

    res.status(200).json({
      message: "Tasks reordered successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  reorderTasks,
};
