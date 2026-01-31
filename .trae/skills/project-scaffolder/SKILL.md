---
name: "project-scaffolder"
description: "Scaffolds Vue3+Vite+TS admin projects. Invoke when user requests project setup or adding standard modules (routing, state, HTTP, i18n)."
---

# Project Scaffolder

This skill bootstraps a Vue3 + Vite + TypeScript admin project with:
- Routing (login + layout), Pinia stores, Element Plus UI
- HTTP layer (ky), data fetching via @tanstack/vue-query
- i18next integration, environment configs, ESLint + Prettier

Usage:
- Invoke when the user asks to create/initialize a front-end admin project
- Also invoke to add standard modules (router guards, menus, stores, API client)

Outputs:
- Creates required folders/files and minimal working examples
- Adds scripts and configuration to run and build the project
