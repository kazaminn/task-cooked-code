import type { Task, TaskLabel, TaskMilestone, TaskComment } from "../../types/Task";
import { DEFAULT_LABELS } from "../../types/Task";
import type { TaskService } from "../types";
import { getAll, put, remove } from "./db";

export function createLocalTaskService(): TaskService {
  return {
    async loadTasks() {
      const tasks = await getAll<Task>("tasks");
      return tasks.sort((a, b) => b.updatedAt - a.updatedAt);
    },
    saveTask: (task) => put("tasks", task),
    deleteTask: (id) => remove("tasks", id),

    async loadLabels() {
      const labels = await getAll<TaskLabel>("taskLabels");
      if (labels.length === 0) {
        for (const l of DEFAULT_LABELS) {
          await put("taskLabels", l);
        }
        return [...DEFAULT_LABELS];
      }
      return labels;
    },
    saveLabel: (label) => put("taskLabels", label),

    loadMilestones: () => getAll<TaskMilestone>("taskMilestones"),
    saveMilestone: (ms) => put("taskMilestones", ms),

    async loadComments(taskId: string) {
      const all = await getAll<TaskComment>("taskComments");
      return all
        .filter((c) => c.taskId === taskId)
        .sort((a, b) => a.createdAt - b.createdAt);
    },
    saveComment: (comment) => put("taskComments", comment),
  };
}
