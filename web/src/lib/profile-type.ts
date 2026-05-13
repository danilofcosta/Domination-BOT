import { ProfileType } from "../../generated/prisma/enums";

export const ADMIN_ROLES: readonly ProfileType[] = [
  ProfileType.ADMIN,
  ProfileType.SUPER_ADMIN,
  ProfileType.SUPREME,
];

export { ProfileType };
