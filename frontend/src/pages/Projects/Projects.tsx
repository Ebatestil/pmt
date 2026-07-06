import { useState, useEffect, useCallback } from "react";
import { useTheme } from "../../context/ThemeContext";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import CreateProjectModal from "../../components/CreateProjectModal";
import ProjectDetailModal from "../../components/ProjectDetailModal";
import { fetchProjects } from "../../api/projects";
import type { ProjectResponse } from "../../api/projects";
import "./Projects.css";

type TabKey = "mine" | "shared";

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  completed: "Completed",
  on_hold: "On Hold",
};

export default function Projects() {
  const { theme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("mine");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const [myProjects, setMyProjects] = useState<ProjectResponse[]>([]);
  const [sharedProjects, setSharedProjects] = useState<ProjectResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const { owned, shared } = await fetchProjects();
      setMyProjects(owned);
      setSharedProjects(shared);
    } catch {
      setErrorMessage("Couldn't load your projects. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  function handleProjectCreated() {
    setIsModalOpen(false);
    loadProjects();
  }

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "mine", label: "My Projects", count: myProjects.length },
    { key: "shared", label: "Shared with Me", count: sharedProjects.length },
  ];

  const activeProjects = activeTab === "mine" ? myProjects : sharedProjects;
  const emptyCopy =
    activeTab === "mine"
      ? {
          title: "No projects yet",
          subtitle: "Create your first project to start organizing tasks and inviting your team.",
        }
      : {
          title: "Nothing shared with you yet",
          subtitle: "Projects you're invited to as a member or manager will show up here.",
        };

  return (
    <div className="projects-page" data-theme={theme}>
      <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

      <div className="projects-body">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <div className="projects-content">
          <div className="projects-header">
            <div>
              <h1 className="projects-heading">Projects</h1>
              <p className="projects-subheading">All projects you own or are a member of</p>
            </div>
            <button type="button" className="projects-create-btn" onClick={() => setIsModalOpen(true)}>
              + New Project
            </button>
          </div>

          {isModalOpen && (
            <CreateProjectModal
              onClose={() => setIsModalOpen(false)}
              onCreated={handleProjectCreated}
            />
          )}

          {selectedProjectId !== null && (
            <ProjectDetailModal
              projectId={selectedProjectId}
              onClose={() => setSelectedProjectId(null)}
            />
          )}

          <div className="projects-tabs" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.key}
                className={
                  activeTab === tab.key
                    ? "projects-tab projects-tab--active"
                    : "projects-tab"
                }
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
                <span className="projects-tab__count">{tab.count}</span>
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="projects-empty">
              <p className="projects-empty__title">Loading projects…</p>
            </div>
          ) : errorMessage ? (
            <div className="projects-empty">
              <p className="projects-empty__title">{errorMessage}</p>
              <button type="button" className="projects-create-btn" onClick={loadProjects}>
                Retry
              </button>
            </div>
          ) : activeProjects.length === 0 ? (
            <div className="projects-empty">
              <p className="projects-empty__title">{emptyCopy.title}</p>
              <p className="projects-empty__subtitle">{emptyCopy.subtitle}</p>
            </div>
          ) : (
            <div className="projects-table-wrap">
              <table className="projects-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Owner</th>
                    <th>Members</th>
                  </tr>
                </thead>
                <tbody>
                  {activeProjects.map((project) => (
                    <tr
                      key={project.id}
                      className="projects-table__row--clickable"
                      onClick={() => setSelectedProjectId(project.id)}
                    >
                      <td>{project.name}</td>
                      <td>
                        <span className={`projects-status projects-status--${project.status}`}>
                          {STATUS_LABELS[project.status]}
                        </span>
                      </td>
                      <td>{project.owner.name}</td>
                      <td>{project.members_count}</td>
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