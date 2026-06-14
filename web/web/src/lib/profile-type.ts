export const ProfileType = {
  USER: "USER",
  MODERATOR: "MODERATOR",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
  SUPREME: "SUPREME",
  BANNED: "BANNED",
} as const;

export type ProfileType = (typeof ProfileType)[keyof typeof ProfileType];

export const ADMIN_ROLES: readonly ProfileType[] = [
  ProfileType.ADMIN,
  ProfileType.SUPER_ADMIN,
  ProfileType.SUPREME,
];
