# Documentation Stack

## Context

The project needs a technical "home" that explains the _how_ and _why_.

## Decision

Use **VitePress** + **GitHub Pages**.

## Why?

- **Speed:** It's the fastest static site generator for technical docs.
- **Simplicity:** We write in Markdown; it handles the rest.
- **Workflow:** Documentation lives with the code.

## Consequences

- Requires a `/docs` folder and a dedicated build step in CI/CD.
