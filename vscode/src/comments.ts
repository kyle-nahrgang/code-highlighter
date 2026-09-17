export interface LineCommentSyntax {
  prefix: string;
  suffix?: string;
}

const LANGUAGE_COMMENTS: Record<string, LineCommentSyntax> = {
  bat: { prefix: "REM " },
  c: { prefix: "//" },
  clojure: { prefix: ";" },
  coffeescript: { prefix: "#" },
  cpp: { prefix: "//" },
  csharp: { prefix: "//" },
  css: { prefix: "/* ", suffix: " */" },
  dart: { prefix: "//" },
  dockerfile: { prefix: "#" },
  elixir: { prefix: "#" },
  erlang: { prefix: "%" },
  fsharp: { prefix: "//" },
  go: { prefix: "//" },
  groovy: { prefix: "//" },
  handlebars: { prefix: "{{!-- ", suffix: " --}}" },
  haskell: { prefix: "--" },
  html: { prefix: "<!-- ", suffix: " -->" },
  ini: { prefix: ";" },
  java: { prefix: "//" },
  javascript: { prefix: "//" },
  javascriptreact: { prefix: "//" },
  jsonc: { prefix: "//" },
  julia: { prefix: "#" },
  kotlin: { prefix: "//" },
  latex: { prefix: "%" },
  less: { prefix: "//" },
  lua: { prefix: "--" },
  makefile: { prefix: "#" },
  markdown: { prefix: "<!-- ", suffix: " -->" },
  matlab: { prefix: "%" },
  objectivec: { prefix: "//" },
  perl: { prefix: "#" },
  php: { prefix: "//" },
  powershell: { prefix: "#" },
  python: { prefix: "#" },
  r: { prefix: "#" },
  ruby: { prefix: "#" },
  rust: { prefix: "//" },
  scala: { prefix: "//" },
  scss: { prefix: "//" },
  shellscript: { prefix: "#" },
  sql: { prefix: "--" },
  swift: { prefix: "//" },
  toml: { prefix: "#" },
  typescript: { prefix: "//" },
  typescriptreact: { prefix: "//" },
  vb: { prefix: "'" },
  vue: { prefix: "//" },
  xml: { prefix: "<!-- ", suffix: " -->" },
  yaml: { prefix: "#" },
};

export function getLineCommentSyntax(languageId: string): LineCommentSyntax {
  return LANGUAGE_COMMENTS[languageId] ?? { prefix: "//" };
}

export function makeMarkerComment(
  syntax: LineCommentSyntax,
  token: string,
  color?: string
): string {
  const payload = color ? `${token}:${color}` : token;
  if (syntax.suffix) {
    return `${syntax.prefix}${payload}${syntax.suffix}`;
  }
  const prefix = syntax.prefix.endsWith(" ") ? syntax.prefix : `${syntax.prefix} `;
  return `${prefix}${payload}`;
}
