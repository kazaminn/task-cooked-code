import { useState, useEffect, useCallback, useRef } from "react";
import type { Project } from "../types/Project";
import { useServices } from "../services/useServices";

const PROJECT_COLORS = [
  "#0075ca", "#0e8a16", "#d73a4a", "#e4e669",
  "#d876e3", "#fbca04", "#a2eeef", "#f9826c",
];

export function useProjects() {
  const { projects: projectService, auth } = useServices();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    projectService.loadAll().then(setProjects);
  }, [projectService]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) ?? null;

  const createProject = useCallback((name: string, tag: string, description = "") => {
    const now = Date.now();
    const user = auth.getCurrentUser();
    const color = PROJECT_COLORS[projects.length % PROJECT_COLORS.length];
    const project: Project = {
      id: crypto.randomUUID(),
      name,
      description,
      tag,
      color,
      teamId: null,
      createdBy: user.id,
      createdAt: now,
      updatedAt: now,
    };
    setProjects((prev) => [project, ...prev]);
    setSelectedProjectId(project.id);
    projectService.save(project);
    return project;
  }, [projects.length, projectService, auth]);

  const updateProject = useCallback(
    (id: string, updates: Partial<Omit<Project, "id" | "createdAt" | "createdBy">>) => {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          const updated = { ...p, ...updates, updatedAt: Date.now() };
          projectService.save(updated);
          return updated;
        })
      );
    },
    [projectService]
  );

  const removeProject = useCallback(
    (id: string) => {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (selectedProjectId === id) setSelectedProjectId(null);
      projectService.delete(id);
    },
    [selectedProjectId, projectService]
  );

  return {
    projects,
    selectedProject,
    selectedProjectId,
    setSelectedProjectId,
    createProject,
    updateProject,
    removeProject,
  };
}
