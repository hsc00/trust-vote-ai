# Engineering Log #1: Dependency Integrity

**Date:** 2026-01-24

## Context

Initializing the documentation engine (VitePress).

## The Issue

During the initial setup, `npm audit` flagged **3 moderate severity vulnerabilities** tied to `esbuild` (a dependency of Vite). The vulnerability (GHSA-67mh-4wv8-2f99) allowed for potential request forgery in the local development server.

## The Trap

The default suggestion from the package manager was `npm audit fix --force`, which would have downgraded the documentation engine to an obsolete version (v0.1.1), causing a breaking change in our architecture.

## The Solution: Manual Override

Instead of a destructive downgrade, I implemented an **npm override** to force the usage of `esbuild@0.25.0`, which contains the security patch, while maintaining our modern VitePress stack.

```json
// package.json
"overrides": {
  "esbuild": "0.25.0"
}
```
