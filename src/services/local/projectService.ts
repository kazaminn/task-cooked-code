import type { Project } from "../../types/Project";
import type { ProjectService } from "../types";
import { getAll, put, remove } from "./db";

const STORE = "projects";

export function createLocalProjectService(): ProjectService {
  return {
    async loadAll() {
      const projects = await getAll<Project>(STORE);
      return projects.sort((a, b) => b.updatedAt - a.updatedAt);
    },
    save: (project) => put(STORE, project),
    delete: (id) => remove(STORE, id),
  };
}
