import { useState, useEffect, useRef, useMemo } from "react";
import { useTheme } from "../../context/ThemeContext";
import {
  fetchProject,
  addMember,
  fetchTasks,
  createTask,
  updateTaskStatus,
} from "../../api/projects";
import type { ProjectDetail, ProjectMember, Task } from "../../api/projects";
import { searchUsers } from "../../api/users";
import type { UserSearchResult } from "../../api/users";
import "./ProjectDetailModal.css";

interface ProjectDetailModalProps {
  projectId: number;
  onClose: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  completed: "Completed",
  on_hold: "On Hold",
};

const TASK_STATUS_LABELS: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

type ModalTab = "members" | "tasks" | "my_tasks";
const PAGE_SIZE = 7;

function Pagination({
  page,
  total,
  pageSize,
  onChange,
}: {
  page: number;
  total: number;
  pageSize: number;
  onChange: (p: number) => void;
}) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  return (
    <div className="detail-pagination">
      <button
        type="button"
        className="detail-pagination__btn"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        ‹
      </button>
      <span className="detail-pagination__label">
        {page} / {totalPages}
      </span>
      <button
        type="button"
        className="detail-pagination__btn"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
      >
        ›
      </button>
    </div>
  );
}

export default function ProjectDetailModal({ projectId, onClose }: ProjectDetailModalProps) {
  const { theme } = useTheme();

  // Project
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Tabs
  const [activeTab, setActiveTab] = useState<ModalTab>("members");

  // Tasks
  const [tasks, setTasks] = useState<Task[]>([]);
  const [progress, setProgress] = useState(0);
  const [tasksLoading, setTasksLoading] = useState(false);

  // Member list filter + pagination
  const [memberSearch, setMemberSearch] = useState("");
  const [memberPage, setMemberPage] = useState(1);
  const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(null);
  const [memberTaskPage, setMemberTaskPage] = useState(1);

  // Task list filter + pagination
  const [taskSearch, setTaskSearch] = useState("");
  const [taskPage, setTaskPage] = useState(1);

  // My tasks pagination
  const [myTaskPage, setMyTaskPage] = useState(1);

  // Add member (user lookup dropdown)
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTouched, setSearchTouched] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [addMemberRole, setAddMemberRole] = useState<"manager" | "member">("member");
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");

  // Create task
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskAssignee, setTaskAssignee] = useState<number | "">("");
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [taskError, setTaskError] = useState("");
  const [taskSuccess, setTaskSuccess] = useState("");

  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const userJson = localStorage.getItem("auth_user");
  const currentUser = userJson ? JSON.parse(userJson) : null;

  // ===== Load project =====
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const data = await fetchProject(projectId);
        setProject(data);
        setMembers(data.members);
      } catch {
        setErrorMessage("Couldn't load project details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [projectId]);

  // ===== Load tasks when tab opens =====
  useEffect(() => {
    if (activeTab !== "tasks" && activeTab !== "my_tasks") return;
    async function loadTasks() {
      setTasksLoading(true);
      try {
        const { tasks: fetched, progress: prog } = await fetchTasks(projectId);
        setTasks(fetched);
        setProgress(prog);
      } catch {
        // silent
      } finally {
        setTasksLoading(false);
      }
    }
    loadTasks();
  }, [activeTab, projectId]);

  // Close add-member dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchResults([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset pages when search changes
  useEffect(() => { setMemberPage(1); }, [memberSearch]);
  useEffect(() => { setTaskPage(1); }, [taskSearch]);

  // ===== Derived — member list filter + pagination =====
  const filteredMembers = useMemo(() => {
    const q = memberSearch.toLowerCase().trim();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
    );
  }, [members, memberSearch]);

  const pagedMembers = useMemo(() => {
    const start = (memberPage - 1) * PAGE_SIZE;
    return filteredMembers.slice(start, start + PAGE_SIZE);
  }, [filteredMembers, memberPage]);

  // ===== Derived — task list filter + pagination =====
  const filteredTasks = useMemo(() => {
    const q = taskSearch.toLowerCase().trim();
    if (!q) return tasks;
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.assignee.name.toLowerCase().includes(q)
    );
  }, [tasks, taskSearch]);

  const pagedTasks = useMemo(() => {
    const start = (taskPage - 1) * PAGE_SIZE;
    return filteredTasks.slice(start, start + PAGE_SIZE);
  }, [filteredTasks, taskPage]);

  // ===== Derived — my tasks =====
  const myTasks = useMemo(() => {
    if (!currentUser) return [];
    return tasks.filter((t) => t.assigned_to === currentUser.id);
  }, [tasks, currentUser]);

  const pagedMyTasks = useMemo(() => {
    const start = (myTaskPage - 1) * PAGE_SIZE;
    return myTasks.slice(start, start + PAGE_SIZE);
  }, [myTasks, myTaskPage]);

  // ===== Derived — tasks for selected member =====
  const memberTasks = useMemo(() => {
    if (!selectedMember) return [];
    return tasks.filter((t) => t.assigned_to === selectedMember.id);
  }, [tasks, selectedMember]);

  const pagedMemberTasks = useMemo(() => {
    const start = (memberTaskPage - 1) * PAGE_SIZE;
    return memberTasks.slice(start, start + PAGE_SIZE);
  }, [memberTasks, memberTaskPage]);

  function handleSelectMember(member: ProjectMember) {
    setSelectedMember(member);
    setMemberTaskPage(1);
    // Make sure tasks are loaded — switch to tasks tab internally to trigger fetch if not yet loaded
    if (tasks.length === 0 && !tasksLoading) {
      fetchTasks(projectId).then(({ tasks: fetched, progress: prog }) => {
        setTasks(fetched);
        setProgress(prog);
      }).catch(() => {});
    }
  }

  function handleBackToMembers() {
    setSelectedMember(null);
    setMemberTaskPage(1);
  }
  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedUser(null);
    setSearchTouched(true);
    setAddError("");
    setAddSuccess("");

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const alreadyMemberIds = members.map((m) => m.id);
        const results = await searchUsers(value.trim());
        setSearchResults(results.filter((u) => !alreadyMemberIds.includes(u.id)));
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  }

  function handleSelectUser(user: UserSearchResult) {
    setSelectedUser(user);
    setSearchQuery(`${user.name} (${user.email})`);
    setSearchResults([]);
  }

  async function handleAddMember() {
    if (!selectedUser || !project) return;
    setAddError("");
    setAddSuccess("");
    setIsAdding(true);
    try {
      const { members: updated } = await addMember(project.id, {
        user_id: selectedUser.id,
        role: addMemberRole,
      });
      setMembers(updated);
      setAddSuccess(`${selectedUser.name} was added as a ${addMemberRole}.`);
      setSearchQuery("");
      setSelectedUser(null);
      setAddMemberRole("member");
      setSearchTouched(false);
    } catch (err: any) {
      setAddError(err?.response?.data?.message ?? "Couldn't add member. Please try again.");
    } finally {
      setIsAdding(false);
    }
  }

  // ===== Create task =====
  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!project || !taskAssignee) return;
    setTaskError("");
    setTaskSuccess("");
    setIsCreatingTask(true);
    try {
      const newTask = await createTask(project.id, {
        title: taskTitle,
        description: taskDescription || undefined,
        assigned_to: taskAssignee as number,
      });
      setTasks((prev) => [newTask, ...prev]);
      setTaskTitle("");
      setTaskDescription("");
      setTaskAssignee("");
      setTaskSuccess(`Task "${newTask.title}" created and assigned.`);
    } catch (err: any) {
      setTaskError(err?.response?.data?.message ?? "Couldn't create task. Please try again.");
    } finally {
      setIsCreatingTask(false);
    }
  }

  // ===== Status update =====
  async function handleStatusChange(task: Task, newStatus: Task["status"]) {
    if (!project) return;
    try {
      const { task: updated, progress: newProgress } = await updateTaskStatus(
        project.id,
        task.id,
        { status: newStatus }
      );
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setProgress(newProgress);
    } catch {
      // silent — select snaps back since state unchanged
    }
  }

  // ===== Derived permissions =====
  const isOwner = project?.owner_id === currentUser?.id;
  const currentMember = members.find((m) => m.id === currentUser?.id);
  const isManager = currentMember?.pivot?.role === "manager";
  const canManageTasks = isOwner || isManager;

  const assignableUsers = project
    ? [
        { id: project.owner_id, name: project.owner.name },
        ...members.map((m) => ({ id: m.id, name: m.name })),
      ]
    : [];

  const showNoResults =
    searchTouched &&
    !isSearching &&
    searchQuery.trim().length >= 2 &&
    searchResults.length === 0 &&
    !selectedUser;

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-card" data-theme={theme} onClick={(e) => e.stopPropagation()}>

        {isLoading ? (
          <div className="detail-loading">Loading project…</div>
        ) : errorMessage ? (
          <div className="detail-error">{errorMessage}</div>
        ) : project ? (
          <>
            {/* ===== Header ===== */}
            <div className="detail-card-header">
              <div className="detail-card-header__meta">
                <h2 className="detail-heading">{project.name}</h2>
                <p className="detail-owner">Owned by {project.owner.name}</p>
              </div>
              <div className="detail-card-header__right">
                <span className={`detail-status detail-status--${project.status}`}>
                  {STATUS_LABELS[project.status]}
                </span>
                <button type="button" className="detail-close" onClick={onClose} aria-label="Close">✕</button>
              </div>
            </div>

            {/* ===== Progress bar ===== */}
            <div className="detail-progress">
              <div className="detail-progress__header">
                <span className="detail-progress__label">Progress</span>
                <span className="detail-progress__value">{progress}%</span>
              </div>
              <div className="detail-progress__track">
                <div className="detail-progress__fill" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* ===== Body ===== */}
            <div className="detail-card-body">
              {project.description && (
                <p className="detail-description">{project.description}</p>
              )}

              {/* ===== Tabs ===== */}
              <div className="detail-tabs">
                <button
                  type="button"
                  className={activeTab === "members" ? "detail-tab detail-tab--active" : "detail-tab"}
                  onClick={() => setActiveTab("members")}
                >
                  Members
                  <span className="detail-tab__count">{members.length}</span>
                </button>
                <button
                  type="button"
                  className={activeTab === "tasks" ? "detail-tab detail-tab--active" : "detail-tab"}
                  onClick={() => setActiveTab("tasks")}
                >
                  Tasks
                  <span className="detail-tab__count">{tasks.length}</span>
                </button>
                <button
                  type="button"
                  className={activeTab === "my_tasks" ? "detail-tab detail-tab--active" : "detail-tab"}
                  onClick={() => setActiveTab("my_tasks")}
                >
                  My Tasks
                  <span className="detail-tab__count">{myTasks.length}</span>
                </button>
              </div>

              {/* ===== Members tab ===== */}
              {activeTab === "members" && (
                <>
                  {selectedMember ? (
                    /* ===== Member drill-down ===== */
                    <div className="detail-section">
                      <div className="detail-drilldown-header">
                        <button
                          type="button"
                          className="detail-back-btn"
                          onClick={handleBackToMembers}
                        >
                          ← Back
                        </button>
                        <div className="detail-drilldown-member">
                          <div className="detail-member__avatar detail-member__avatar--lg">
                            {selectedMember.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="detail-member__name">{selectedMember.name}</p>
                            <p className="detail-member__email">{selectedMember.email}</p>
                          </div>
                          <span className={`detail-member__role detail-member__role--${selectedMember.pivot.role}`}>
                            {selectedMember.pivot.role === "manager" ? "Manager" : "Member"}
                          </span>
                        </div>
                      </div>

                      <p className="detail-section__label" style={{ marginTop: 16 }}>
                        Assigned Tasks
                        <span style={{ marginLeft: 8, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
                          ({memberTasks.length})
                        </span>
                      </p>

                      {tasksLoading ? (
                        <p className="detail-empty">Loading tasks…</p>
                      ) : memberTasks.length === 0 ? (
                        <p className="detail-empty">No tasks assigned to {selectedMember.name} yet.</p>
                      ) : (
                        <>
                          <ul className="detail-tasks">
                            {pagedMemberTasks.map((task) => {
                              const isAssignedToMe = task.assigned_to === currentUser?.id;
                              return (
                                <li key={task.id} className="detail-task">
                                  <div className="detail-task__top">
                                    <p className="detail-task__title">{task.title}</p>
                                    {isAssignedToMe ? (
                                      <select
                                        value={task.status}
                                        onChange={(e) =>
                                          handleStatusChange(task, e.target.value as Task["status"])
                                        }
                                        className={`detail-task__status detail-task__status--${task.status}`}
                                      >
                                        <option value="todo">To Do</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="done">Done</option>
                                      </select>
                                    ) : (
                                      <span className={`detail-task__status detail-task__status--${task.status}`}>
                                        {TASK_STATUS_LABELS[task.status]}
                                      </span>
                                    )}
                                  </div>
                                  {task.description && (
                                    <p className="detail-task__description">{task.description}</p>
                                  )}
                                  <p className="detail-task__meta">
                                    Created by {task.creator.name}
                                  </p>
                                </li>
                              );
                            })}
                          </ul>
                          <Pagination
                            page={memberTaskPage}
                            total={memberTasks.length}
                            pageSize={PAGE_SIZE}
                            onChange={setMemberTaskPage}
                          />
                        </>
                      )}
                    </div>
                  ) : (
                    /* ===== Normal member list ===== */
                    <>
                      <div className="detail-section">
                        <div className="detail-list-search">
                          <input
                            type="text"
                            value={memberSearch}
                            onChange={(e) => setMemberSearch(e.target.value)}
                            className="detail-input"
                            placeholder="Search members by name or email…"
                          />
                        </div>

                        {filteredMembers.length === 0 ? (
                          <p className="detail-empty">
                            {memberSearch ? `No members matching "${memberSearch}".` : "No members yet. Add one below."}
                          </p>
                        ) : (
                          <>
                            <ul className="detail-members">
                              {pagedMembers.map((member) => (
                                <li
                                  key={member.id}
                                  className="detail-member detail-member--clickable"
                                  onClick={() => handleSelectMember(member)}
                                >
                                  <div className="detail-member__avatar">
                                    {member.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="detail-member__info">
                                    <p className="detail-member__name">{member.name}</p>
                                    <p className="detail-member__email">{member.email}</p>
                                  </div>
                                  <span className={`detail-member__role detail-member__role--${member.pivot.role}`}>
                                    {member.pivot.role === "manager" ? "Manager" : "Member"}
                                  </span>
                                  <span className="detail-member__chevron">›</span>
                                </li>
                              ))}
                            </ul>
                            <Pagination
                              page={memberPage}
                              total={filteredMembers.length}
                              pageSize={PAGE_SIZE}
                              onChange={setMemberPage}
                            />
                          </>
                        )}
                      </div>

                      {isOwner && (
                        <div className="detail-section">
                          <p className="detail-section__label">Add Member</p>

                          {addError && <div className="detail-banner detail-banner--error">{addError}</div>}
                          {addSuccess && <div className="detail-banner detail-banner--success">{addSuccess}</div>}

                          <div className="detail-search" ref={searchRef}>
                            <div className="detail-search__field">
                              <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="detail-input"
                                placeholder="Search by name or email…"
                                autoComplete="off"
                              />
                              {isSearching && <span className="detail-search__spinner" />}
                            </div>

                            {searchResults.length > 0 && (
                              <ul className="detail-search__dropdown">
                                {searchResults.map((user) => (
                                  <li
                                    key={user.id}
                                    className="detail-search__option"
                                    onMouseDown={() => handleSelectUser(user)}
                                  >
                                    <div className="detail-search__avatar">
                                      {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="detail-search__info">
                                      <p className="detail-search__name">{user.name}</p>
                                      <p className="detail-search__email">{user.email}</p>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}

                            {showNoResults && (
                              <div className="detail-search__no-results">
                                No user found matching <strong>"{searchQuery}"</strong>. Only registered users can be added.
                              </div>
                            )}
                          </div>

                          <div className="detail-add-row">
                            <select
                              value={addMemberRole}
                              onChange={(e) => setAddMemberRole(e.target.value as typeof addMemberRole)}
                              className="detail-select"
                            >
                              <option value="member">Member</option>
                              <option value="manager">Manager</option>
                            </select>
                            <button
                              type="button"
                              className="detail-btn"
                              disabled={!selectedUser || isAdding}
                              onClick={handleAddMember}
                            >
                              {isAdding ? "Adding…" : "Add"}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {/* ===== Tasks tab ===== */}
              {activeTab === "tasks" && (
                <>
                  {/* Create task — owner or manager only */}
                  {canManageTasks && (
                    <div className="detail-section">
                      <p className="detail-section__label">Create Task</p>

                      {taskError && <div className="detail-banner detail-banner--error">{taskError}</div>}
                      {taskSuccess && <div className="detail-banner detail-banner--success">{taskSuccess}</div>}

                      <form className="detail-task-form" onSubmit={handleCreateTask}>
                        <input
                          type="text"
                          value={taskTitle}
                          onChange={(e) => setTaskTitle(e.target.value)}
                          className="detail-input"
                          placeholder="Task title"
                          required
                        />
                        <textarea
                          value={taskDescription}
                          onChange={(e) => setTaskDescription(e.target.value)}
                          className="detail-textarea"
                          placeholder="Description (optional)"
                          rows={2}
                        />
                        <div className="detail-add-row">
                          <select
                            value={taskAssignee}
                            onChange={(e) => setTaskAssignee(Number(e.target.value))}
                            className="detail-select"
                            required
                          >
                            <option value="">Assign to…</option>
                            {assignableUsers.map((u) => (
                              <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                          </select>
                          <button type="submit" className="detail-btn" disabled={isCreatingTask}>
                            {isCreatingTask ? "Creating…" : "Create"}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Task list with search + pagination */}
                  <div className="detail-section">
                    <div className="detail-list-search">
                      <input
                        type="text"
                        value={taskSearch}
                        onChange={(e) => setTaskSearch(e.target.value)}
                        className="detail-input"
                        placeholder="Search tasks by title or assignee…"
                      />
                    </div>

                    {tasksLoading ? (
                      <p className="detail-empty">Loading tasks…</p>
                    ) : filteredTasks.length === 0 ? (
                      <p className="detail-empty">
                        {taskSearch ? `No tasks matching "${taskSearch}".` : "No tasks yet."}
                      </p>
                    ) : (
                      <>
                        <ul className="detail-tasks">
                          {pagedTasks.map((task) => {
                            const isAssignedToMe = task.assigned_to === currentUser?.id;
                            return (
                              <li key={task.id} className="detail-task">
                                <div className="detail-task__top">
                                  <p className="detail-task__title">{task.title}</p>
                                  {isAssignedToMe ? (
                                    <select
                                      value={task.status}
                                      onChange={(e) =>
                                        handleStatusChange(task, e.target.value as Task["status"])
                                      }
                                      className={`detail-task__status detail-task__status--${task.status}`}
                                    >
                                      <option value="todo">To Do</option>
                                      <option value="in_progress">In Progress</option>
                                      <option value="done">Done</option>
                                    </select>
                                  ) : (
                                    <span className={`detail-task__status detail-task__status--${task.status}`}>
                                      {TASK_STATUS_LABELS[task.status]}
                                    </span>
                                  )}
                                </div>
                                {task.description && (
                                  <p className="detail-task__description">{task.description}</p>
                                )}
                                <p className="detail-task__meta">
                                  Assigned to <strong>{task.assignee.name}</strong> · by {task.creator.name}
                                </p>
                              </li>
                            );
                          })}
                        </ul>
                        <Pagination
                          page={taskPage}
                          total={filteredTasks.length}
                          pageSize={PAGE_SIZE}
                          onChange={setTaskPage}
                        />
                      </>
                    )}
                  </div>
                </>
              )}

              {/* ===== My Tasks tab ===== */}
              {activeTab === "my_tasks" && (
                <div className="detail-section">
                  {tasksLoading ? (
                    <p className="detail-empty">Loading tasks…</p>
                  ) : myTasks.length === 0 ? (
                    <p className="detail-empty">You have no tasks assigned to you in this project.</p>
                  ) : (
                    <>
                      <ul className="detail-tasks">
                        {pagedMyTasks.map((task) => (
                          <li key={task.id} className="detail-task">
                            <div className="detail-task__top">
                              <p className="detail-task__title">{task.title}</p>
                              <select
                                value={task.status}
                                onChange={(e) =>
                                  handleStatusChange(task, e.target.value as Task["status"])
                                }
                                className={`detail-task__status detail-task__status--${task.status}`}
                              >
                                <option value="todo">To Do</option>
                                <option value="in_progress">In Progress</option>
                                <option value="done">Done</option>
                              </select>
                            </div>
                            {task.description && (
                              <p className="detail-task__description">{task.description}</p>
                            )}
                            <p className="detail-task__meta">
                              Assigned by {task.creator.name}
                            </p>
                          </li>
                        ))}
                      </ul>
                      <Pagination
                        page={myTaskPage}
                        total={myTasks.length}
                        pageSize={PAGE_SIZE}
                        onChange={setMyTaskPage}
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}