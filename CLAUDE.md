# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Astro application deployed on Cloudflare Pages using the Cloudflare adapter. Uses Tailwind CSS 4.x and Bun as the package manager.

## Important Rules

**Documentation Files**
- NEVER proactively create documentation files (*.md) or README files
- Only create documentation files if explicitly requested by the user

## Commands

Run from project root using Bun:

- `bun install` - Install dependencies
- `bun dev` - Start dev server at localhost:4321
- `bun build` - Build production site to ./dist/
- `bun preview` - Build and preview with Wrangler locally
- `bun deploy` - Build and deploy to Cloudflare Pages
- `bun cf-typegen` - Generate TypeScript types for Cloudflare bindings

## Architecture

**Cloudflare Integration**
- Adapter: `@astrojs/cloudflare` with platform proxy enabled for local development
- Image service: Cloudflare's image service
- Build output: `./dist/` (configured in wrangler.jsonc)
- Runtime: Cloudflare Workers with Node.js compatibility enabled

**Styling**
- Tailwind CSS 4.x via Vite plugin (`@tailwindcss/vite`)
- Global styles: [src/styles/global.css](src/styles/global.css)

**TypeScript**
- Runtime types in [src/env.d.ts](src/env.d.ts)
- `App.Locals` extends Cloudflare runtime types
- Use `bun cf-typegen` to generate types for Cloudflare bindings

**Cloudflare Configuration**
- [wrangler.jsonc](wrangler.jsonc) - compatibility date 2025-10-11, Node.js compat enabled, observability enabled
- Add bindings (KV, D1, R2, etc.) in wrangler.jsonc

## Documentation

- [UPDATE_PEPTIDES_COMMAND.md](UPDATE_PEPTIDES_COMMAND.md) - Guide for updating peptide content using the update_peptides script
  - Includes smart merge behavior that prevents duplicates and filters placeholder text
  - Automatically handles case-insensitive URL deduplication
  - Preserves user-added data (affiliate links, valid content)

- [POSTHOG_TRACKING.md](POSTHOG_TRACKING.md) - PostHog analytics tracking documentation
  - Lists all tracked events (peptide clicks, affiliate link clicks, research link clicks, navigation)
  - Explains event properties and implementation details
  - Provides guidance on creating insights and analyzing data
