import * as vscode from "vscode";
import {
  removeAll,
  removeNearest,
  toggleEnabled,
  wrapSelection,
  wrapSelectionWithColor,
} from "./commands";
import { Highlighter } from "./highlighter";

export function activate(context: vscode.ExtensionContext): void {
  const highlighter = new Highlighter();
  highlighter.initialize();

  context.subscriptions.push(
    highlighter,
    vscode.commands.registerCommand("commentHighlighter.wrap", () => wrapSelection()),
    vscode.commands.registerCommand("commentHighlighter.wrapWithColor", () => wrapSelectionWithColor()),
    vscode.commands.registerCommand("commentHighlighter.removeNearest", () => removeNearest()),
    vscode.commands.registerCommand("commentHighlighter.removeAll", () => removeAll()),
    vscode.commands.registerCommand("commentHighlighter.toggle", () => toggleEnabled())
  );
}

export function deactivate(): void {
  // Decorations are disposed through the Highlighter subscription.
}
