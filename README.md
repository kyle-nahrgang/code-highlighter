# !important Highlighter

VS Code extension that paints regions of code between `!important` comments. The extension lives in [`vscode/`](vscode/).

## Develop

1. Open this repository in VS Code or Cursor.
2. Press F5 (`Run Extension`) to launch a window with the extension loaded.
3. Open `vscode/examples/demo.ts`.

## Publish to the Marketplace

GitHub Actions packages the extension from `vscode/` and publishes it on every commit to `main`.

Each push to `main` tags a new patch version (`v0.0.1`, `v0.0.2`, …) and pushes that tag. If you already bumped `vscode/package.json` in the commit and that version is not tagged yet, the workflow uses that version instead of bumping again.

One-time setup:

1. Confirm the `kylenahrgang` publisher exists at [Visual Studio Marketplace](https://marketplace.visualstudio.com/manage). The Unique ID must match `publisher` in `vscode/package.json`.
2. Create an Azure DevOps [Personal Access Token](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token):
   - Organization: **All accessible organizations**
   - Scope: **Marketplace → Manage**
3. Add it as a repository secret named `VSCE_PAT` at [GitHub Actions secrets](https://github.com/kyle-nahrgang/code-highlighter/settings/secrets/actions).

Marketplace `--oidc` trusted publishing is not live yet (`/_apis/gallery/token` returns 404), so the workflow authenticates with `VSCE_PAT`.
