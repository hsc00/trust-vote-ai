# Dependency Integrity

## Context

Initializing the documentation engine (VitePress).

## The Issue

During the initial setup, `npm audit` flagged **3 moderate severity vulnerabilities** tied to `esbuild` (a dependency of Vite). The vulnerability (GHSA-67mh-4wv8-2f99) allowed for potential request forgery in the local development server.

## The Trap

The default suggestion from the package manager was `npm audit fix --force`, which would have downgraded the documentation engine to an obsolete version (v0.1.1), causing a breaking change in our architecture.

## The Solution: Manual Override

Instead of a destructive downgrade, we implemented an **npm override** to force the usage of `esbuild@0.25.0`, which contains the security patch, while maintaining our modern VitePress stack.

```json
// package.json
"overrides": {
  "esbuild": "0.25.0"
}
```

## Current Status

The override remains useful for top-level Vite consumers in the workspace, and the root override set now also includes patched floors for `vite`, `fastify`, and `postcss`.

However, the stable `vitepress@1.6.4` line still resolves its own nested `vite` and `esbuild` versions in the lockfile. That means the VitePress toolchain is not fully remediated by the top-level override alone.

For this repository, that residual risk is constrained to documentation tooling and local preview or development workflows. The production docs output remains static, and `vitepress build` continues to pass. A full remediation will require either:

- a stable VitePress release that consumes a patched Vite and esbuild chain, or
- a separate hardening branch to evaluate the VitePress 2 alpha line.
