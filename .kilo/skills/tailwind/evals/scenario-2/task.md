# Tailwind config for React project

## Context

A React project already has Tailwind CSS installed. The brand primary color is `#0EA5E9`. Component files live under `src/` (e.g. `src/App.jsx`, `src/components/*.jsx`).

## Task

Add or update the Tailwind config so that:

1. The brand primary color is available (e.g. as a named color like `primary` or `brand`) for use in utility classes.
2. Tailwind scans all relevant component and template files so that classes used in the project are generated.

Provide the config file (e.g. `tailwind.config.js` or `tailwind.config.ts`). Do not assume a specific config format (CommonJS vs ESM) beyond what is standard for the file extension.

## Expected Outputs

- A single Tailwind config file that extends the theme with the primary color and sets content so component files under `src/` are included.
