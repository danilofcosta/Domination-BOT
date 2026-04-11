export const roleWeights: Record<string, number> = {
  BANNED: -1,
  USER: 0,
  MODERATOR: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
  SUPREME: 4,
};

export const DELETE_ROLES = ["SUPREME", "SUPER_ADMIN", "ADMIN"] as const;