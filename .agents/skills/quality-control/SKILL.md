---
name: quality-control
description: Instructions and checklists for verification, linter checks, formatting, production build confirmation, and packaging pre-flight checks before compiling or packaging the app. Use when the user requests quality control, codebase health check, pre-pack checks, or validation of the build environment.
---

# Universal Quality Control and Codebase Checker

This skill outlines the quality control protocols, codebase verification standards, and automated pre-flight checks required before compiling, packaging, or deploying code across any project or stack.

Whenever you encounter a new tooling error, packaging failure, or framework deprecation, update or add a stack-specific file under the `references/` sub-skills directory to dynamically grow our troubleshooting library.

## 1. Core Verification Workflow
1.  **Project Metadata & Configuration Pre-Flight**:
    *   Verify target compiler configurations and manifest dependencies.
    *   Check for required assets, target deployment folders, and path specifications.
2.  **Lint & Format Check**:
    *   Run linting and formatting commands to maintain syntax hygiene.
    *   Fix line ending mismatches or syntax problems.
3.  **Production Compilation Verification**:
    *   Test compile the codebase to confirm build success prior to actual packaging.

## 2. Stack-Specific Sub-Skills (References)
Refer to the stack-specific reference sub-skills for exact checklists, common errors, and remedies:

*   [ESLint & Prettier Sub-Skill](file:///d:/Antigravity/capital-os/.agents/skills/quality-control/references/eslint-prettier.md): Formatting issues, line ending fixes, and linter overrides.
*   [Electron & Packaging Sub-Skill](file:///d:/Antigravity/capital-os/.agents/skills/quality-control/references/electron-packaging.md): App version types, Vite 8 path migrations, and packaging assets.
*   [Python Quality Control Sub-Skill](file:///d:/Antigravity/capital-os/.agents/skills/quality-control/references/python.md): Python environments, pip check, static checking, and mypy type checks.
