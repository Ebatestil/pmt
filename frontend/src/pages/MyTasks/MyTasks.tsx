import { useState, useEffect, useCallback } from "react";
import { useTheme } from "../../context/ThemeContext";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import TaskDetailModal from "../../components/TaskDetailModal";
import { fetchTasks } from "../../api/Tasks";
import type { TaskResponse } from "../../api/Tasks";
import "./MyTask.css";

interface StoredUser {
  id: number;
}

const STATUS_LABELS: Record<string, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
};

export default function MyTasks() {
  const { theme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [myTasks, setMyTasks] = useState<TaskResponse[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const userJson = localStorage.getItem("auth_user");
  const user: StoredUser = userJson ? JSON.parse(userJson) : null;

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    if (!user) return;
    try {
      const res = await fetchTasks(user.id);
      setMyTasks(res.mytasks);
    } catch {
      setErrorMessage("Couldn't load your tasks. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  function handleStatusChange(updatedTask: TaskResponse) {
    setMyTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
    // Keep the modal open with the updated task
    setSelectedTask(updatedTask);
  }

  const filteredTasks = myTasks.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      t.title.toLowerCase().includes(q) ||
      t.project.name.toLowerCase().includes(q) ||
      t.status.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mytasks-page" data-theme={theme}>
      <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

      <div className="mytasks-body">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <div className="mytasks-content">
          <div className="mytasks-header">
            <div>
              <h1 className="mytasks-heading">My Tasks</h1>
              <p className="mytasks-subheading">All tasks you're assigned to</p>
            </div>
            <input
              type="text"
              className="mytasks-search"
              placeholder="Search by title, project, or status…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {selectedTask && (
            <TaskDetailModal
              task={selectedTask}
              onClose={() => setSelectedTask(null)}
              onStatusChange={(updatedTask, _progress) => handleStatusChange(updatedTask)}
            />
          )}

          {isLoading ? (
            <div className="mytasks-empty">
              <p className="mytasks-empty_title">Loading Tasks...</p>
            </div>
          ) : errorMessage ? (
            <div className="mytasks-empty">
              <p className="mytasks-empty_title">{errorMessage}</p>
              <button type="button" className="projects-create-btn" onClick={loadTasks}>
                Retry
              </button>
            </div>
          ) : myTasks.length === 0 ? (
            <div className="mytasks-empty">
              <p className="mytasks-empty_title">No tasks assigned to you yet.</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="mytasks-empty">
              <p className="mytasks-empty_title">No tasks matching "{searchQuery}".</p>
            </div>
          ) : (
            <div className="mytasks-table-wrap">
              <table className="mytasks-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>From</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((mytask) => (
                    <tr
                      key={mytask.id}
                      className="mytasks-table__row--clickable"
                      onClick={() => setSelectedTask(mytask)}
                    >
                      <td>{mytask.title}</td>
                      <td>
                        <span className={`mytasks-status mytasks-status--${mytask.status}`}>
                          {STATUS_LABELS[mytask.status]}
                        </span>
                      </td>
                      <td>{mytask.project.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}