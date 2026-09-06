import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import API_URL from "../api";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingTaskId, setEditingTaskId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "To Do",
    dueDate: "",
    priority: "Medium",
  });

  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/tasks`,
        { withCredentials: true }
      );

      setTasks(response.data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load tasks."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (editingTaskId) {
        const response = await axios.put(
          `${API_URL}/api/tasks/${editingTaskId}`,
          formData,
          { withCredentials: true }
        );

        setTasks((currentTasks) =>
          currentTasks.map((task) =>
            task._id === editingTaskId
              ? response.data
              : task
          )
        );

        setEditingTaskId(null);
      } else {
        const response = await axios.post(
          `${API_URL}/api/tasks`,
          formData,
          { withCredentials: true }
        );

        setTasks((currentTasks) => [
          response.data,
          ...currentTasks,
        ]);
      }

      setFormData({
        title: "",
        description: "",
        status: "To Do",
        dueDate: "",
        priority: "Medium",
      });

      setShowForm(false);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to save task."
      );
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `${API_URL}/api/tasks/${id}`,
        { withCredentials: true }
      );

      setTasks((currentTasks) =>
        currentTasks.filter(
          (task) => task._id !== id
        )
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to delete task."
      );
    }
  };

  const handleEdit = (task) => {
    setEditingTaskId(task._id);

    setFormData({
      title: task.title,
      description: task.description || "",
      status: task.status,
      dueDate: task.dueDate
        ? task.dueDate.substring(0, 10)
        : "",
      priority: task.priority,
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);

    setFormData({
      title: "",
      description: "",
      status: "To Do",
      dueDate: "",
      priority: "Medium",
    });

    setShowForm(false);
  };

  const handleAddTask = () => {
    setEditingTaskId(null);

    setFormData({
      title: "",
      description: "",
      status: "To Do",
      dueDate: "",
      priority: "Medium",
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_URL}/api/users/logout`,
        {},
        { withCredentials: true }
      );

      window.location.href = "/login";
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to logout."
      );
    }
  };

  const progressTotal = tasks.reduce(
    (total, task) => {
      if (task.status === "Done") {
        return total + 100;
      }

      if (task.status === "In Progress") {
        return total + 50;
      }

      return total;
    },
    0
  );

  const completedPercentage =
    tasks.length === 0
      ? 0
      : Math.round(
          progressTotal / tasks.length
        );

  const completedTasks = tasks.filter(
    (task) => task.status === "Done"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const todoTasks = tasks.filter(
    (task) => task.status === "To Do"
  ).length;

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter =
      filter === "All" || task.status === filter;

    const searchText = search.toLowerCase();

    const matchesSearch =
      task.title.toLowerCase().includes(searchText) ||
      (task.description || "")
        .toLowerCase()
        .includes(searchText);

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="app-layout">

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">✓</div>

          <div>
            <h2>Task Manager</h2>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/dashboard"
            className="sidebar-link active"
          >
            <span>⌂</span>
            Dashboard
          </Link>

          <Link
            to="/profile"
            className="sidebar-link"
          >
            <span>◯</span>
            Profile
          </Link>
        </nav>

        <div className="sidebar-bottom">
          <button
            onClick={handleLogout}
            className="sidebar-logout"
          >
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">

        {/* Header */}
        <header className="page-header">
          <div>
            <h1>My Tasks</h1>

            <p className="page-subtitle">
              Organize your work and keep track
              of your progress.
            </p>
          </div>

          <button
            className="add-task-button"
            onClick={handleAddTask}
          >
            <span>+</span>
            Add Task
          </button>
        </header>

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        {/* Statistics */}
        <section className="stats-grid">

          <div className="stat-card">
            <div className="stat-icon total-icon">
              ✓
            </div>

            <div>
              <span>Total Tasks</span>
              <strong>{tasks.length}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon todo-icon">
              ○
            </div>

            <div>
              <span>To Do</span>
              <strong>{todoTasks}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon progress-icon">
              ◐
            </div>

            <div>
              <span>In Progress</span>
              <strong>{inProgressTasks}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon done-icon">
              ✓
            </div>

            <div>
              <span>Completed</span>
              <strong>{completedTasks}</strong>
            </div>
          </div>

        </section>

        {/* Progress */}
        <section className="progress-card">
          <div className="progress-card-top">
            <div>
              <p className="section-label">
                OVERALL PROGRESS
              </p>

              <h2>
                {completedPercentage}% completed
              </h2>
            </div>

            <div className="progress-percentage">
              {completedPercentage}%
            </div>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${completedPercentage}%`,
              }}
            ></div>
          </div>

          <p className="progress-description">
            {completedTasks} of {tasks.length} tasks
            fully completed
          </p>
        </section>

        {/* Add/Edit Task */}
        {showForm && (
          <section className="task-form-card">
            <div className="form-card-header">
              <div>
                <p className="section-label">
                  TASK
                </p>

                <h2>
                  {editingTaskId
                    ? "Edit Task"
                    : "Create a New Task"}
                </h2>
              </div>

              <button
                className="close-form"
                onClick={handleCancelEdit}
                type="button"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Task Title</label>

                <input
                  type="text"
                  name="title"
                  placeholder="Enter task title"
                  value={formData.title}
                  onChange={handleChange}
                  minLength={3}
                  maxLength={100}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>

                <textarea
                  name="description"
                  placeholder="Add a description..."
                  value={formData.description}
                  onChange={handleChange}
                  maxLength={500}
                />
              </div>

              <div className="form-grid">

                <div className="form-group">
                  <label>Status</label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="To Do">
                      To Do
                    </option>

                    <option value="In Progress">
                      In Progress
                    </option>

                    <option value="Done">
                      Done
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority</label>

                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="Low">
                      Low
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="High">
                      High
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Due Date</label>

                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                  />
                </div>

              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  {editingTaskId
                    ? "Update Task"
                    : "Create Task"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Task Section */}
        <section className="tasks-section">

          <div className="tasks-header">
            <div>
              <h2>Tasks</h2>

              <span>
                {filteredTasks.length} tasks
              </span>
            </div>

            <div className="task-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>

            <div className="task-filters">
              {[
                "All",
                "To Do",
                "In Progress",
                "Done",
              ].map((status) => (
                <button
                  key={status}
                  className={
                    filter === status
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setFilter(status)
                  }
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="loading-message">
              Loading tasks...
            </div>
          )}

          {!loading &&
            filteredTasks.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">
                  ✓
                </div>

                <h3>No tasks found</h3>

                <p>
                  Create your first task to get
                  started.
                </p>

                <button
                  onClick={handleAddTask}
                  className="primary-button"
                >
                  Add Your First Task
                </button>
              </div>
            )}

          <div className="task-list">
            {filteredTasks.map((task) => (
              <div
                className={`task-card priority-${task.priority.toLowerCase()}`}
                key={task._id}
              >
                <div className="task-card-top">
                  <span
                    className={`status-badge status-${task.status
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {task.status}
                  </span>

                  <span
                    className={`priority-label priority-text-${task.priority.toLowerCase()}`}
                  >
                    {task.priority} Priority
                  </span>
                </div>

                <h3>{task.title}</h3>

                {task.description && (
                  <p className="task-description">
                    {task.description}
                  </p>
                )}

                <div className="task-meta">
                  {task.dueDate && (
                    <span>
                      Due{" "}
                      {new Date(
                        task.dueDate
                      ).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="task-actions">
                  <button
                    onClick={() =>
                      handleEdit(task)
                    }
                    className="edit-button"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(task._id)
                    }
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

        </section>

      </main>
    </div>
  );
}

export default Dashboard;