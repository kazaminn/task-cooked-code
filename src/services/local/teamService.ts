import type { Team, TeamMembership } from "../../types/User";
import type { TeamService } from "../types";
import { getAll, put, remove } from "./db";

export function createLocalTeamService(): TeamService {
  return {
    loadTeams: () => getAll<Team>("teams"),
    saveTeam: (team) => put("teams", team),
    deleteTeam: (id) => remove("teams", id),

    async loadMembers(teamId: string) {
      const all = await getAll<TeamMembership>("teamMemberships");
      return all.filter((m) => m.teamId === teamId);
    },
    addMember: (membership) => put("teamMemberships", membership),
    updateMember: (membership) => put("teamMemberships", membership),
    removeMember: (id) => remove("teamMemberships", id),
  };
}
