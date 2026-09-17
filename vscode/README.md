# !important Highlighter

VS Code extension that paints regions of code between `!important` comments.

```ts
// !important
const message = "this block uses the default color";
// !important

// !important:red
return process.env.SECRET;
// !important

// !important:#3b82f6
const info = true;
// !important
```

The closing comment is a bare `!important`. Put a color only on the opening comment.

## Try it

1. Open the repository root in VS Code or Cursor.
2. Press F5 (`Run Extension`) to launch a new window with the extension loaded.
3. Open `vscode/examples/demo.ts` — the marked blocks should already be highlighted.
4. Select some code, right-click, and choose **!important Highlighter → Wrap Selection**.

## Commands

| Command | What it does |
| --- | --- |
| `Highlight: Wrap Selection` | Insert `!important` comments around the selected lines |
| `Highlight: Wrap Selection with Color...` | Same, with a color on the opening comment |
| `Highlight: Remove Nearest Markers` | Delete the marker pair around the cursor |
| `Highlight: Remove All Markers in File` | Strip every highlight comment in the file |
| `Highlight: Toggle` | Turn highlighting on or off |

## Settings

- `commentHighlighter.defaultColor` — color picker for `!important` without an explicit color
- `commentHighlighter.token` — marker text (default `!important`)
- `commentHighlighter.includeMarkers` — include the comment lines in the paint
- `commentHighlighter.wholeLine` — stretch the color across the editor width
