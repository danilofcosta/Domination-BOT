export interface DeviceFingerprint {
  ip: string;
  userAgent: string;
  acceptLanguage?: string;
}

export interface StoredFingerprint {
  ipPrefix: string;
  uaHash: string;
}

const RISK_WEIGHTS = {
  IP_SAME_COUNTRY: 10,
  IP_DIFFERENT_COUNTRY: 30,
  USER_AGENT_CHANGED: 40,
  IP_AND_UA_CHANGED: 60,
  COMPLETE_MISMATCH: 90,
};

export function computeStoredFingerprint(fp: DeviceFingerprint): StoredFingerprint {
  const ipPrefix = fp.ip.includes(".")
    ? fp.ip.split(".").slice(0, 3).join(".")
    : fp.ip;

  const uaHash = simpleHash(fp.userAgent);

  return { ipPrefix, uaHash };
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(36);
}

export function computeCurrentFingerprint(req: Request): DeviceFingerprint {
  const forwardedFor = req.headers.get("x-forwarded-for") || "";
  const ip = forwardedFor.split(",")[0]?.trim() || "unknown";
  const userAgent = req.headers.get("user-agent") || "";
  const acceptLanguage = req.headers.get("accept-language") || undefined;

  return { ip, userAgent, acceptLanguage };
}

export interface RiskAssessment {
  score: number;
  level: "low" | "medium" | "high" | "critical";
  reasons: string[];
}

export function assessRisk(
  stored: StoredFingerprint | null,
  current: DeviceFingerprint,
): RiskAssessment {
  const reasons: string[] = [];
  let score = 0;

  if (!stored) {
    return { score: 0, level: "low", reasons: ["primeiro acesso"] };
  }

  const currentUaHash = simpleHash(current.userAgent);
  const currentIpPrefix = current.ip.includes(".")
    ? current.ip.split(".").slice(0, 3).join(".")
    : current.ip;

  const ipChanged = stored.ipPrefix !== currentIpPrefix;
  const uaChanged = stored.uaHash !== currentUaHash;

  if (ipChanged && uaChanged) {
    score += RISK_WEIGHTS.COMPLETE_MISMATCH;
    reasons.push("IP e User-Agent mudaram simultaneamente");
  } else if (uaChanged) {
    score += RISK_WEIGHTS.USER_AGENT_CHANGED;
    reasons.push("User-Agent mudou");
  } else if (ipChanged) {
    score += RISK_WEIGHTS.IP_SAME_COUNTRY;
    reasons.push("IP mudou (mesmo prefixo de rede)");
  }

  if (score >= 90) {
    return { score, level: "critical", reasons };
  }
  if (score >= 50) {
    return { score, level: "high", reasons };
  }
  if (score >= 20) {
    return { score, level: "medium", reasons };
  }
  return { score, level: "low", reasons };
}
