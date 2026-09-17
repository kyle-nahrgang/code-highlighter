import * as vscode from "vscode";
import { HighlighterConfig, loadConfigFrom, sanitizeColor, styleFromColor } from "./config";
import { parseHighlightRegions } from "./parser";

const REFRESH_DELAY_MS = 75;

export class Highlighter implements vscode.Disposable {
  private readonly disposables: vscode.Disposable[] = [];
  private readonly pending = new Map<string, NodeJS.Timeout>();
  private decorationTypes = new Map<string, vscode.TextEditorDecorationType>();
  private decorationKey = "";

  public initialize(): void {
    this.disposables.push(
      vscode.window.onDidChangeActiveTextEditor(() => this.refreshVisible()),
      vscode.window.onDidChangeVisibleTextEditors(() => this.refreshVisible()),
      vscode.workspace.onDidChangeTextDocument((event) => this.schedule(event.document)),
      vscode.workspace.onDidCloseTextDocument((document) => this.clearPending(document.uri)),
      vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration("commentHighlighter")) {
          this.refreshVisible();
        }
      })
    );
    this.refreshVisible();
  }

  public refreshVisible(): void {
    const config = this.readConfig();
    const editors: Array<{
      editor: vscode.TextEditor;
      rangesByColor: Map<string, vscode.Range[]>;
    }> = [];
    const colors = new Set<string>([config.defaultColor]);

    for (const editor of vscode.window.visibleTextEditors) {
      const rangesByColor = new Map<string, vscode.Range[]>();
      if (config.enabled && editor.document.uri.scheme !== "output") {
        const regions = parseHighlightRegions(editor.document.getText(), {
          token: config.token,
          includeMarkers: config.includeMarkers,
        });

        for (const region of regions) {
          const color = sanitizeColor(region.color) ?? config.defaultColor;
          colors.add(color);
          const start = new vscode.Position(region.startLine, 0);
          const endLine = editor.document.lineAt(region.endLine);
          const end = config.wholeLine
            ? endLine.range.end
            : new vscode.Position(region.endLine, endLine.text.length);
          const ranges = rangesByColor.get(color) ?? [];
          ranges.push(new vscode.Range(start, end));
          rangesByColor.set(color, ranges);
        }
      }
      editors.push({ editor, rangesByColor });
    }

    this.syncDecorationTypes(colors, config);
    for (const { editor, rangesByColor } of editors) {
      for (const [color, decorationType] of this.decorationTypes) {
        editor.setDecorations(decorationType, rangesByColor.get(color) ?? []);
      }
    }
  }

  public dispose(): void {
    for (const timeout of this.pending.values()) {
      clearTimeout(timeout);
    }
    this.pending.clear();
    this.disposeDecorationTypes();
    for (const disposable of this.disposables) {
      disposable.dispose();
    }
  }

  private readConfig(): HighlighterConfig {
    return loadConfigFrom(vscode.workspace.getConfiguration("commentHighlighter"));
  }

  private schedule(document: vscode.TextDocument): void {
    const key = document.uri.toString();
    this.clearPending(document.uri);
    const timeout = setTimeout(() => {
      this.pending.delete(key);
      this.refreshVisible();
    }, REFRESH_DELAY_MS);
    this.pending.set(key, timeout);
  }

  private clearPending(uri: vscode.Uri): void {
    const key = uri.toString();
    const timeout = this.pending.get(key);
    if (timeout) {
      clearTimeout(timeout);
      this.pending.delete(key);
    }
  }

  private syncDecorationTypes(colors: Set<string>, config: HighlighterConfig): void {
    const nextKey = JSON.stringify({
      colors: [...colors].sort(),
      wholeLine: config.wholeLine,
    });
    if (nextKey === this.decorationKey) {
      return;
    }
    this.disposeDecorationTypes();
    this.decorationKey = nextKey;
    for (const color of colors) {
      const style = styleFromColor(color);
      this.decorationTypes.set(
        color,
        vscode.window.createTextEditorDecorationType({
          backgroundColor: style.backgroundColor,
          borderColor: style.borderColor,
          borderWidth: "0 0 0 3px",
          borderStyle: "solid",
          isWholeLine: config.wholeLine,
          overviewRulerColor: style.overviewRulerColor,
          overviewRulerLane: vscode.OverviewRulerLane.Left,
          rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        })
      );
    }
  }

  private disposeDecorationTypes(): void {
    for (const decorationType of this.decorationTypes.values()) {
      decorationType.dispose();
    }
    this.decorationTypes.clear();
  }
}
