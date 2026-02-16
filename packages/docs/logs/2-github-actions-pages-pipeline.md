# GitHub Actions & Pages Pipeline

## Context

Implementation of a CI/CD pipeline to automate the deployment of VitePress documentation to GitHub Pages.

## Observed Issues

1. **Permission Denied (sh: 1: vitepress):** Occurred because `node_modules` were being tracked by Git from a Windows environment, losing execution bits (+x) when running on the Linux Runner.
2. **HttpError 404:** The GitHub Pages deployment failed because the repository was not configured to accept deployments via "GitHub Actions".

## Actions Taken

- **Repository Cleanup:** Created a `.gitignore` to exclude `node_modules` and other build artifacts. Removed tracked files from the index using `git rm -r --cached`.
- **Settings Adjustment:** Changed GitHub Pages source from "Deploy from a branch" to "GitHub Actions".
- **VitePress Configuration:** Added the `base` property to `config.mts` to match the repository's subpath (`/trust-vote-ai/`).

## Outcomes

- Fully automated deployment on every `push` to the `main` branch.
- Repository hygiene restored (no heavy dependencies in the remote).
- Site live and styled at: `https://hsc00.github.io/trust-vote-ai/`
