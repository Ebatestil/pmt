import { useState } from "react";
import type { FormEvent } from "react";
import Swal from "sweetalert2";
import { createProject } from "../../api/projects";
import { useTheme } from "../../context/ThemeContext";
import "./CreateProjectModal.css";

interface CreateProjectModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateProjectModal({ onClose, onCreated }: CreateProjectModalProps) {
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"active" | "completed" | "on_hold">("active");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      await createProject({
        name,
        description: description || undefined,
        status,
      });

      await Swal.fire({
        icon: "success",
        title: "Project created",
        text: "Your project was successfully created.",
        confirmButtonText: "OK",
        confirmButtonColor: "#e3ad5c",
        background: theme === "dark" ? "#1c1d24" : "#ffffff",
        color: theme === "dark" ? "#f2f1ee" : "#16181d",
      });

      onCreated();
    } catch (err: any) {
      const validationErrors = err?.response?.data?.errors;
      if (validationErrors) {
        const firstError = Object.values(validationErrors)[0] as string[];
        setErrorMessage(firstError[0]);
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" data-theme={theme} onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-heading">New Project</h2>
        <p className="modal-subheading">Give your project a name to get started.</p>

        {errorMessage && (
          <div className="modal-error" role="alert">
            {errorMessage}
          </div>
        )}

        <form className="modal-form" onSubmit={handleSubmit}>
          <label className="modal-field" htmlFor="project-name">
            <span className="modal-field__label">Project name</span>
            <input
              id="project-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="modal-field__input"
              placeholder="Website Redesign"
              required
            />
          </label>

          <label className="modal-field" htmlFor="project-description">
            <span className="modal-field__label">Description (optional)</span>
            <textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="modal-field__textarea"
              placeholder="What's this project about?"
              rows={3}
            />
          </label>

          <label className="modal-field" htmlFor="project-status">
            <span className="modal-field__label">Status</span>
            <select
              id="project-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="modal-field__select"
            >
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </label>

          <div className="modal-actions">
            <button type="button" className="modal-cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="modal-submit-btn" disabled={isLoading}>
              {isLoading ? "Creating…" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}