import * as vscode from "vscode";
import { getLineCommentSyntax, makeMarkerComment } from "./comments";
import { loadConfigFrom, sanitizeColor } from "./config";
import { findMarkerInLine, parseHighlightRegions } from "./parser";

function selectedLineRange(editor: vscode.TextEditor): { start: number; end: number } {
  const selection = editor.selection;
  let start = selection.start.line;
  let end = selection.end.line;
  if (!selection.isEmpty && selection.end.character === 0) {
    end -= 1;
  }
  return { start, end: Math.max(start, end) };
}

function indentationOf(line: string): string {
  const match = line.match(/^[ \t]*/);
  return match ? match[0] : "";
}

function currentConfig() {
  return loadConfigFrom(vscode.workspace.getConfiguration("commentHighlighter"));
}

export async function wrapSelection(color?: string): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const config = currentConfig();
  const syntax = getLineCommentSyntax(editor.document.languageId);
  const { start, end } = selectedLineRange(editor);
  const indent = indentationOf(editor.document.lineAt(start).text);
  const startComment = `${indent}${makeMarkerComment(syntax, config.token, color)}`;
  const endComment = `${indent}${makeMarkerComment(syntax, config.token)}`;

  await editor.edit((builder) => {
    builder.insert(new vscode.Position(end, editor.document.lineAt(end).text.length), `\n${endComment}`);
    builder.insert(new vscode.Position(start, 0), `${startComment}\n`);
  });
}

export async function wrapSelectionWithColor(): Promise<void> {
  const color = await vscode.window.showInputBox({
    prompt: "Highlight color",
    placeHolder: "#e05252 or red",
    validateInput(value) {
      if (!value.trim()) {
        return "Enter a CSS color";
      }
      return sanitizeColor(value) ? undefined : "Enter a hex, rgb, or CSS color name";
    },
  });
  if (!color) {
    return;
  }
  const sanitized = sanitizeColor(color);
  if (!sanitized) {
    return;
  }
  await wrapSelection(sanitized);
}

export async function removeNearest(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const config = currentConfig();
  const cursor = editor.selection.active.line;
  const region = parseHighlightRegions(editor.document.getText(), {
    token: config.token,
    includeMarkers: true,
  }).find((candidate) => cursor >= candidate.startMarkerLine && cursor <= candidate.endMarkerLine);

  if (!region) {
    void vscode.window.showInformationMessage("No highlight markers found around the cursor.");
    return;
  }

  await editor.edit((builder) => {
    builder.delete(editor.document.lineAt(region.endMarkerLine).rangeIncludingLineBreak);
    builder.delete(editor.document.lineAt(region.startMarkerLine).rangeIncludingLineBreak);
  });
}

export async function removeAll(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const config = currentConfig();
  const linesToDelete: number[] = [];
  for (let line = 0; line < editor.document.lineCount; line += 1) {
    const marker = findMarkerInLine(editor.document.lineAt(line).text, config.token);
    if (marker) {
      linesToDelete.push(line);
    }
  }

  if (linesToDelete.length === 0) {
    void vscode.window.showInformationMessage("No highlight markers found in this file.");
    return;
  }

  await editor.edit((builder) => {
    for (let index = linesToDelete.length - 1; index >= 0; index -= 1) {
      builder.delete(editor.document.lineAt(linesToDelete[index]).rangeIncludingLineBreak);
    }
  });
}

export async function toggleEnabled(): Promise<void> {
  const settings = vscode.workspace.getConfiguration("commentHighlighter");
  const enabled = settings.get<boolean>("enabled") !== false;
  const target = vscode.workspace.workspaceFolders
    ? vscode.ConfigurationTarget.Workspace
    : vscode.ConfigurationTarget.Global;
  await settings.update("enabled", !enabled, target);
}
