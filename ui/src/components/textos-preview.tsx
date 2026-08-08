"use client";

import { Fragment, type ReactNode } from "react";

type Token =
  | { type: "text"; content: string }
  | { type: "open"; tag: string; attrs: Record<string, string> }
  | { type: "close"; tag: string }
  | { type: "selfclose"; tag: string; attrs: Record<string, string> };

const VOID_TAGS = new Set(["br", "hr", "img"]);

function parseAttrs(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const re = /([\w-]+)(?:\s*=\s*"([^"]*)")?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    attrs[m[1]!] = m[2] ?? "";
  }
  return attrs;
}

function tokenize(value: string): Token[] {
  const tokens: Token[] = [];
  const re = /<\/?[a-zA-Z][^>]*>|<\/?[a-zA-Z]\s*>/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(value)) !== null) {
    if (m.index > last) tokens.push({ type: "text", content: value.slice(last, m.index) });
    const raw = m[0];
    const inner = raw.slice(1, -1).trim();
    if (inner.startsWith("/")) {
      tokens.push({ type: "close", tag: inner.slice(1).split(/\s/)[0]!.toLowerCase() });
    } else if (inner.endsWith("/")) {
      const body = inner.slice(0, -1).trim();
      const tag = body.split(/\s/)[0]!.toLowerCase();
      tokens.push({ type: "selfclose", tag, attrs: parseAttrs(body.slice(tag.length)) });
    } else {
      const tag = inner.split(/\s/)[0]!.toLowerCase();
      tokens.push({ type: "open", tag, attrs: parseAttrs(inner.slice(tag.length)) });
    }
    last = m.index + raw.length;
  }
  if (last < value.length) tokens.push({ type: "text", content: value.slice(last) });
  return tokens;
}

const INLINE: Record<string, { className?: string; render?: (children: ReactNode, attrs: Record<string, string>) => ReactNode }> = {
  b: { className: "font-bold" },
  strong: { className: "font-bold" },
  i: { className: "italic" },
  em: { className: "italic" },
  u: { className: "underline underline-offset-2" },
  s: { className: "line-through" },
  strike: { className: "line-through" },
  del: { className: "line-through" },
  code: { className: "rounded bg-black/10 px-1 py-0.5 font-mono text-[0.85em] dark:bg-white/10" },
  tgemoji: {},
  "tg-emoji": {},
  a: { render: (children, attrs) => <a href={attrs.href ?? "#"} target="_blank" rel="noreferrer" className="text-[#0b93f6] underline underline-offset-2 dark:text-[#3390ec]">{children}</a> },
};

function renderText(
  content: string,
  key: number,
  unknownRefs?: Set<string>,
): ReactNode {
  if (!unknownRefs || unknownRefs.size === 0) return content;
  const parts = content.split(/(\$\{\w+\})/g);
  if (parts.length === 1) return content;
  return parts.map((part, idx) => {
    const ref = part.match(/^\$\{(\w+)\}$/);
    if (ref && unknownRefs.has(ref[1]!)) {
      return (
        <mark
          key={`${key}-${idx}`}
          className="rounded bg-amber-400/20 px-0.5 text-amber-500 dark:text-amber-400"
          title="Placeholder de variável em tempo de execução"
        >
          {part}
        </mark>
      );
    }
    return <Fragment key={`${key}-${idx}`}>{part}</Fragment>;
  });
}

function renderNodes(
  tokens: Token[],
  start: number,
  stopTag: string | null,
  unknownRefs?: Set<string>,
): { nodes: ReactNode[]; next: number } {
  const nodes: ReactNode[] = [];
  let i = start;
  while (i < tokens.length) {
    const token = tokens[i]!;
    if (token.type === "text") {
      nodes.push(renderText(token.content, i, unknownRefs));
      i++;
      continue;
    }
    if (token.type === "close") {
      if (stopTag && token.tag === stopTag) return { nodes, next: i + 1 };
      i++;
      continue;
    }
    if (token.type === "selfclose") {
      if (token.tag === "br") nodes.push(<br key={i} />);
      i++;
      continue;
    }
    if (token.type === "open") {
      const tag = token.tag;
      const def = INLINE[tag];
      const inner = renderNodes(tokens, i + 1, tag, unknownRefs);
      i = inner.next;
      if (tag === "br") {
        nodes.push(<br key={i} />);
        continue;
      }
      if (!def) {
        nodes.push(<Fragment key={i}>{inner.nodes}</Fragment>);
        continue;
      }
      nodes.push(
        <span key={i} className={def.className}>
          {def.render ? def.render(inner.nodes, token.attrs) : inner.nodes}
        </span>,
      );
    }
  }
  return { nodes, next: i };
}

export function renderTelegramHtml(
  value: string,
  unknownRefs?: Set<string>,
): ReactNode[] {
  return renderNodes(tokenize(value), 0, null, unknownRefs).nodes;
}

export function TelegramPreview({
  html,
  isButton,
  unknownRefs,
}: {
  html: string;
  isButton?: boolean;
  unknownRefs?: Set<string>;
}) {
  if (isButton) {
    return (
      <button
        type="button"
        className="rounded-lg border border-[#0b93f6]/40 bg-[#0b93f6]/10 px-4 py-2 text-sm font-medium text-[#0b93f6] shadow-xs transition-colors hover:bg-[#0b93f6]/15 dark:border-[#3390ec]/40 dark:bg-[#3390ec]/10 dark:text-[#3390ec]"
      >
        {renderTelegramHtml(html, unknownRefs)}
      </button>
    );
  }

  return (
    <div className="bg-muted/70 text-foreground relative max-w-full rounded-2xl rounded-tl-sm px-3.5 py-2.5">
      <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
        {html ? renderTelegramHtml(html, unknownRefs) : " "}
      </div>
    </div>
  );
}
