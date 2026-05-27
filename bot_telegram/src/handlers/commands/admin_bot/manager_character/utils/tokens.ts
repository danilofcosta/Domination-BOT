export function parseTokens(rest: string[]) {
  const tokens = rest.join(" ").toLowerCase().split(/\s+/);

  const rarities: number[] = [];
  const events: number[] = [];

  for (const token of tokens) {
    if (!token) continue;

    if (token.startsWith("r")) {
      const id = parseInt(token.slice(1), 10);
      if (!isNaN(id)) rarities.push(id);
    }

    if (token.startsWith("e")) {
      const id = parseInt(token.slice(1), 10);
      if (!isNaN(id)) events.push(id);
    }
  }

  return {
    rarities: rarities.length ? rarities : undefined,
    events: events.length ? events : undefined,
  };
}
