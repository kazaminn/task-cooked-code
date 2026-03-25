import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { Team, TeamMembership, TeamRole } from "../types/User";
import { ROLE_HIERARCHY } from "../types/User";
import { useServices } from "../services/useServices";

export function useTeams() {
  const { teams: teamService, auth } = useServices();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [members, setMembers] = useState<TeamMembership[]>([]);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    teamService.loadTeams().then(setTeams);
  }, [teamService]);

  // Load members when team selection changes
  const [membersForTeamId, setMembersForTeamId] = useState<string | null>(null);
  useEffect(() => {
    if (!selectedTeamId) return;
    let stale = false;
    teamService.loadMembers(selectedTeamId).then((m) => {
      if (!stale) {
        setMembers(m);
        setMembersForTeamId(selectedTeamId);
      }
    });
    return () => { stale = true; };
  }, [selectedTeamId, teamService]);

  // Return empty members if they don't belong to the current selection
  const activeMembers = useMemo(
    () => (membersForTeamId === selectedTeamId ? members : []),
    [membersForTeamId, selectedTeamId, members]
  );

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) ?? null;

  const currentUser = auth.getCurrentUser();

  const currentUserRole = useMemo((): TeamRole | null => {
    if (!selectedTeamId) return null;
    const membership = activeMembers.find((m) => m.userId === currentUser.id);
    return membership?.role ?? null;
  }, [selectedTeamId, activeMembers, currentUser.id]);

  const canManageMembers = currentUserRole === "owner";
  const canEdit = currentUserRole !== null && ROLE_HIERARCHY[currentUserRole] >= ROLE_HIERARCHY.editor;

  const createTeam = useCallback((name: string, description = "") => {
    const now = Date.now();
    const team: Team = {
      id: crypto.randomUUID(),
      name,
      description,
      createdBy: currentUser.id,
      createdAt: now,
      updatedAt: now,
    };
    setTeams((prev) => [team, ...prev]);
    setSelectedTeamId(team.id);
    teamService.saveTeam(team);

    // Add creator as owner
    const membership: TeamMembership = {
      id: crypto.randomUUID(),
      teamId: team.id,
      userId: currentUser.id,
      role: "owner",
      joinedAt: now,
    };
    teamService.addMember(membership);
    setMembers([membership]);

    return team;
  }, [currentUser.id, teamService]);

  const updateTeam = useCallback(
    (id: string, updates: Partial<Omit<Team, "id" | "createdAt" | "createdBy">>) => {
      setTeams((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          const updated = { ...t, ...updates, updatedAt: Date.now() };
          teamService.saveTeam(updated);
          return updated;
        })
      );
    },
    [teamService]
  );

  const removeTeam = useCallback(
    (id: string) => {
      setTeams((prev) => prev.filter((t) => t.id !== id));
      if (selectedTeamId === id) {
        setSelectedTeamId(null);
        setMembers([]);
      }
      teamService.deleteTeam(id);
    },
    [selectedTeamId, teamService]
  );

  const addMember = useCallback(
    (userId: string, displayName: string, role: TeamRole = "viewer") => {
      if (!selectedTeamId) return;
      const membership: TeamMembership = {
        id: crypto.randomUUID(),
        teamId: selectedTeamId,
        userId,
        role,
        joinedAt: Date.now(),
      };
      setMembers((prev) => [...prev, membership]);
      teamService.addMember(membership);
      return membership;
    },
    [selectedTeamId, teamService]
  );

  const updateMemberRole = useCallback(
    (membershipId: string, role: TeamRole) => {
      setMembers((prev) =>
        prev.map((m) => {
          if (m.id !== membershipId) return m;
          const updated = { ...m, role };
          teamService.updateMember(updated);
          return updated;
        })
      );
    },
    [teamService]
  );

  const removeMember = useCallback(
    (membershipId: string) => {
      setMembers((prev) => prev.filter((m) => m.id !== membershipId));
      teamService.removeMember(membershipId);
    },
    [teamService]
  );

  return {
    teams,
    selectedTeam,
    selectedTeamId,
    setSelectedTeamId,
    members: activeMembers,
    currentUserRole,
    canManageMembers,
    canEdit,
    createTeam,
    updateTeam,
    removeTeam,
    addMember,
    updateMemberRole,
    removeMember,
  };
}
