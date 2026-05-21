import { createHash } from "node:crypto";

export function calcHash(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}
