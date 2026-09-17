export interface Marker {
  line: number;
  color: string | undefined;
}

export interface HighlightRegion {
  startLine: number;
  endLine: number;
  startMarkerLine: number;
  endMarkerLine: number;
  color: string | undefined;
}

export interface ParseOptions {
  token: string;
  includeMarkers: boolean;
}

const COMMENT_STARTERS = ["{{!--", "<!--", "//", "/*", "--", "#", ";", "%"];

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripTrailingCommentCloser(text: string): string {
  return text.replace(/\s*(?:\*\/|-->|--}})\s*$/, "").trim();
}

function lastIndexOfStarter(line: string, starter: string): number {
  let from = line.length;
  while (from > 0) {
    const index = line.lastIndexOf(starter, from - 1);
    if (index === -1) {
      return -1;
    }
    if (starter === "//" && index > 0 && line[index - 1] === ":") {
      from = index;
      continue;
    }
    return index;
  }
  return -1;
}

function tokenRegex(token: string): RegExp {
  return new RegExp(`^${escapeRegExp(token)}(?:\\s*:\\s*(.+))?$`);
}

function commentBodies(line: string): string[] {
  const bodies: string[] = [];

  for (const starter of COMMENT_STARTERS) {
    const index = lastIndexOfStarter(line, starter);
    if (index !== -1) {
      bodies.push(stripTrailingCommentCloser(line.slice(index + starter.length)));
    }
  }

  if (/^\s*\*(?!\/)/.test(line)) {
    bodies.push(stripTrailingCommentCloser(line.replace(/^\s*\*\s?/, "")));
  }

  if (/^\s*'/.test(line)) {
    bodies.push(stripTrailingCommentCloser(line.replace(/^\s*'/, "")));
  }

  bodies.push(stripTrailingCommentCloser(line.trim()));
  return bodies;
}

export function findMarkerInLine(line: string, token: string): Omit<Marker, "line"> | undefined {
  const pattern = tokenRegex(token);

  for (const body of commentBodies(line)) {
    const match = pattern.exec(body);
    if (match) {
      const color = match[1]?.trim();
      return { color: color ? color : undefined };
    }
  }

  return undefined;
}

export function parseHighlightRegions(text: string, options: ParseOptions): HighlightRegion[] {
  const lines = text.split(/\r?\n/);
  const stack: Array<{ line: number; color: string | undefined }> = [];
  const regions: HighlightRegion[] = [];

  for (let line = 0; line < lines.length; line += 1) {
    const marker = findMarkerInLine(lines[line], options.token);
    if (!marker) {
      continue;
    }

    const isStart = marker.color !== undefined || stack.length === 0;
    if (isStart) {
      stack.push({ line, color: marker.color });
      continue;
    }

    const start = stack.pop();
    if (!start) {
      continue;
    }

    const startLine = options.includeMarkers ? start.line : start.line + 1;
    const endLine = options.includeMarkers ? line : line - 1;
    if (startLine > endLine) {
      continue;
    }

    regions.push({
      startLine,
      endLine,
      startMarkerLine: start.line,
      endMarkerLine: line,
      color: start.color,
    });
  }

  return regions;
}
