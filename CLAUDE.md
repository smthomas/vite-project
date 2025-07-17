# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vite + React + TypeScript project using pnpm as the package manager.

## Essential Commands

```bash
# Install dependencies
pnpm install

# Run development server with hot module replacement
pnpm run dev

# Build for production
pnpm run build

# Preview production build locally
pnpm run preview

# Run ESLint
pnpm run lint

# TypeScript type checking (no dedicated script, runs during build)
pnpm exec tsc --noEmit
```

## Architecture

### Build System
- **Vite** handles bundling and development server
- TypeScript compilation happens before Vite build in production
- Project uses ES modules (`"type": "module"` in package.json)

### TypeScript Configuration
- Uses project references with two separate configs:
  - `tsconfig.app.json`: Application code in `/src` directory
  - `tsconfig.node.json`: Node.js files like `vite.config.ts`
- Strict mode is enabled
- React JSX transform is configured

### Code Structure
```
src/
├── main.tsx      # Application entry point, mounts React app
├── App.tsx       # Root React component
├── App.css       # App-specific styles
├── index.css     # Global styles
└── assets/       # Static assets imported by components
```

### Key Technologies
- React 19.1.0 with React DOM
- TypeScript 5.8.3 with strict typing
- Vite 7.0.4 for fast builds and HMR
- ESLint 9.30.1 with React hooks and refresh plugins

## Development Notes

- Hot Module Replacement (HMR) is configured via `@vitejs/plugin-react`
- ESLint ignores the `dist` directory
- The project uses the newer flat ESLint config format
- No testing framework is currently configured