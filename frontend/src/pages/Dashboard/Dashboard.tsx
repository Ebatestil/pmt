import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import "./Dashboard.css";

interface StoredUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}

export default function Dashboard() {
  const { theme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const userJson = localStorage.getItem("auth_user");
  const user: StoredUser | null = userJson ? JSON.parse(userJson) : null;

  return (
    <div className="dashboard-page" data-theme={theme}>
      <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

      <div className="dashboard-body">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <div className="dashboard-content">
          <div className="dashboard-card">
            <h1 className="dashboard-heading">Dashboard</h1>
            <p className="dashboard-subheading">This is a placeholder — real content coming soon.</p>

            {user && (
              <div className="dashboard-user">
                <p>
                  Signed in as <strong>{user.name}</strong>
                </p>
                <p className="dashboard-user__role">{user.role}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}