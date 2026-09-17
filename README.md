# Comment Highlighter

VS Code extension that paints regions of code between `!important` comments. The extension lives in [`vscode/`](vscode/).

## Develop

1. Open this repository in VS Code or Cursor.
2. Press F5 (`Run Extension`) to launch a window with the extension loaded.
3. Open `vscode/examples/demo.ts`.

## Publish to the Marketplace

GitHub Actions packages the extension from `vscode/` and publishes it with `vsce publish --oidc` when you create a GitHub Release.

One-time setup:

1. Create the `kylenahrgang` publisher at [Visual Studio Marketplace](https://marketplace.visualstudio.com/manage) if it does not already exist.
2. In that publisher, add a **trusted publishing** policy for this GitHub repository and the workflow `.github/workflows/publish.yml`.
3. Create a GitHub Release whose tag matches the version you want, for example `v0.0.1`.

Each later release works the same way: bump `vscode/package.json` if you want the source of truth in git, tag `vX.Y.Z`, and publish the GitHub Release. The workflow also accepts a manual **Run workflow** dispatch.
