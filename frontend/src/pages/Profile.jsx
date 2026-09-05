import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/users/profile",
          { withCredentials: true }
        );

        setUser(response.data);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/users/logout",
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

  const initials =
    `${user?.firstname?.charAt(0) || ""}${user?.lastname?.charAt(0) || ""}`.toUpperCase();

  if (loading) {
    return (
      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-icon">✓</div>

            <div>
              <h2>Task Manager</h2>
              <span>Workspace</span>
            </div>
          </div>
        </aside>

        <main className="main-content">
          <div className="loading-message">
            Loading profile...
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-icon">✓</div>

            <div>
              <h2>Task Manager</h2>
              <span>Workspace</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            <Link
              to="/dashboard"
              className="sidebar-link"
            >
              <span>⌂</span>
              Dashboard
            </Link>

            <Link
              to="/profile"
              className="sidebar-link active"
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

        <main className="main-content">
          <div className="error-banner">
            {error}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="sidebar-logo">
          <div className="logo-icon">✓</div>

          <div>
            <h2>Task Manager</h2>
            <span>Workspace</span>
          </div>
        </div>

        <nav className="sidebar-nav">

          <Link
            to="/dashboard"
            className="sidebar-link"
          >
            <span>⌂</span>
            Dashboard
          </Link>

          <Link
            to="/profile"
            className="sidebar-link active"
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
      <main className="main-content profile-content">

        {/* Header */}
        <header className="page-header">

          <div>
            <p className="page-label">
              ACCOUNT
            </p>

            <h1>My Profile</h1>

            <p className="page-subtitle">
              Manage your account information.
            </p>
          </div>

        </header>

        {/* Profile Card */}
        <section className="profile-modern-card">

          <div className="profile-modern-header">

            <div className="profile-modern-avatar">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                />
              ) : (
                initials || "U"
              )}
            </div>

            <div className="profile-modern-name">

              <h2>
                {user?.firstname} {user?.lastname}
              </h2>

              <p>{user?.email}</p>

              <span className="account-badge">
                Active Account
              </span>

            </div>

          </div>

          <div className="profile-divider"></div>

          <div className="profile-details">

            <div className="profile-detail-item">
              <span>FIRST NAME</span>
              <strong>{user?.firstname}</strong>
            </div>

            <div className="profile-detail-item">
              <span>LAST NAME</span>
              <strong>{user?.lastname}</strong>
            </div>

            <div className="profile-detail-item profile-detail-full">
              <span>EMAIL ADDRESS</span>
              <strong>{user?.email}</strong>
            </div>

          </div>

        </section>

        {/* Quick Navigation */}
        <section className="profile-navigation-card">

          <div>
            <p className="section-label">
              WORKSPACE
            </p>

            <h2>Ready to get things done?</h2>

            <p>
              Return to your dashboard and continue
              managing your tasks.
            </p>
          </div>

          <Link
            to="/dashboard"
            className="primary-button profile-dashboard-button"
          >
            Go to Dashboard
          </Link>

        </section>

      </main>

    </div>
  );
}

export default Profile;