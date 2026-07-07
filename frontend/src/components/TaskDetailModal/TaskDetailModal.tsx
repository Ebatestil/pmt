import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { updateMyTaskStatus, fetchProjectProgress } from "../../api/Tasks";
import type { TaskResponse } from "../../api/Tasks";
import "./TaskDetailModal.css";

interface TaskDetailModalProps {
  task: TaskResponse;
  onClose: () => void;
  onStatusChange: (updatedTask: TaskResponse, progress: number) => void;
}

export default function TaskDetailModal({
  task,
  onClose,
  onStatusChange,
}: TaskDetailModalProps) {
  const { theme } = useTheme();
  const [currentTask, setCurrentTask] = useState<TaskResponse>(task);
  const [progress, setProgress] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function initModal() {
      if (task.status === "todo") {
        // Auto-mark in_progress and get progress in one call
        try {
          const { task: updated, progress: prog } = await updateMyTaskStatus(
            task.project.id,
            task.id,
            "in_progress"
          );
          setCurrentTask(updated);
          setProgress(prog);
          onStatusChange(updated, prog);
        } catch {
          // silent — fetch progress separately if status update fails
          try {
            const prog = await fetchProjectProgress(task.project.id);
            setProgress(prog);
          } catch {
            setProgress(0);
          }
        }
      } else {
        // Already in_progress or done — just fetch the real progress
        try {
          const prog = await fetchProjectProgress(task.project.id);
          setProgress(prog);
        } catch {
          setProgress(0);
        }
      }
    }
    initModal();
  }, []);

  async function handleCheckboxChange(checked: boolean) {
    if (isUpdating) return;
    setIsUpdating(true);
    const newStatus = checked ? "done" : "in_progress";
    try {
      const { task: updated, progress: prog } = await updateMyTaskStatus(
        currentTask.project.id,
        currentTask.id,
        newStatus
      );
      setCurrentTask(updated);
      setProgress(prog);
      onStatusChange(updated, prog);
    } catch {
      // silent
    } finally {
      setIsUpdating(false);
    //   window.location.reload();
    }
  }

  const isDone = currentTask.status === "done";
  const displayProgress = progress ?? 0;

  const createdDate = new Date(currentTask.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="task-modal-overlay" onClick={onClose}>
      <div className="task-modal-card" data-theme={theme} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="task-modal-header">
          <div className="task-modal-header__meta">
            <p className="task-modal-project">{currentTask.project.name}</p>
            <h2 className={`task-modal-title${isDone ? " task-modal-title--done" : ""}`}>
              {currentTask.title}
            </h2>
          </div>
          <button type="button" className="task-modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Progress bar */}
        <div className="task-modal-progress">
          <div className="task-modal-progress__header">
            <span className="task-modal-progress__label">Project Progress</span>
            <span className="task-modal-progress__value">
              {progress === null ? "…" : `${progress}%`}
            </span>
          </div>
          <div className="task-modal-progress__track">
            <div
              className="task-modal-progress__fill"
              style={{ width: `${progress ?? 0}%` }}
            />
          </div>
        </div>

        {/* Body */}
        <div className="task-modal-body">

          {/* Status badge */}
          <div className="task-modal-meta-row">
            <span className={`task-modal-status task-modal-status--${currentTask.status}`}>
              {currentTask.status === "todo"
                ? "To Do"
                : currentTask.status === "in_progress"
                ? "In Progress"
                : "Done"}
            </span>
            <span className="task-modal-date">Added {createdDate}</span>
          </div>

          {/* Description */}
          {currentTask.description ? (
            <div className="task-modal-section">
              <p className="task-modal-section__label">Description</p>
              <p className="task-modal-description">{currentTask.description}</p>
            </div>
          ) : (
            <div className="task-modal-section">
              <p className="task-modal-no-description">No description provided.</p>
            </div>
          )}

          {/* Mark as done checkbox */}
          <div className="task-modal-done-row">
            <label className="task-modal-checkbox-label">
              <input
                type="checkbox"
                className="task-modal-checkbox"
                checked={isDone}
                disabled={isUpdating}
                onChange={(e) => handleCheckboxChange(e.target.checked)}
              />
              <span className="task-modal-checkbox-text">
                {isDone ? "Task completed" : "Mark as complete"}
              </span>
            </label>
            {isUpdating && <span className="task-modal-updating">Saving…</span>}
          </div>
        </div>
      </div>
    </div>
  );
}