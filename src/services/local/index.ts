import type { Services } from "../types";
import { createLocalNoteService } from "./noteService";
import { createLocalTaskService } from "./taskService";
import { createLocalProjectService } from "./projectService";
import { createLocalAuthService } from "./authService";
import { createLocalTeamService } from "./teamService";

export function createLocalServices(): Services {
  return {
    notes: createLocalNoteService(),
    tasks: createLocalTaskService(),
    projects: createLocalProjectService(),
    auth: createLocalAuthService(),
    teams: createLocalTeamService(),
  };
}
