import type { User } from "../../types/User";
import type { AuthService } from "../types";

const LOCAL_USER: User = {
  id: "local-user",
  displayName: "ローカルユーザー",
  email: "local@example.com",
  avatarUrl: "",
};

export function createLocalAuthService(): AuthService {
  return {
    getCurrentUser: () => LOCAL_USER,
  };
}
