# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based table tennis tournament management application built with TypeScript, Vite, and modern React ecosystem tools. The application provides comprehensive tournament management features including brackets, player management, scheduling, and media handling.

## Development Commands

### Essential Commands
- **Development server**: `pnpm dev` (runs on port 5174 with host flag enabled)
- **Build**: `pnpm run build` (TypeScript compilation followed by Vite build)
- **Lint**: `pnpm run lint` (ESLint check)
- **Lint fix**: `pnpm run lint:fix` (ESLint with auto-fix)
- **Preview**: `pnpm run preview` (preview built application)

### Package Management
- **Package manager**: pnpm (version 9.12.3+ specified in packageManager field)
- **Node version**: 18-20 (GitHub Actions use both versions)
- **Install dependencies**: `pnpm install`

## Architecture & Tech Stack

### Core Framework
- **React 18.3.1** with TypeScript
- **Vite** as build tool with SWC for fast refresh
- **TanStack Router** for file-based routing with automatic route generation
- **TanStack Query** for server state management with React Query DevTools

### UI & Styling
- **Tailwind CSS** with custom design system and shadcn/ui components
- **Radix UI** primitives for accessible components
- **Framer Motion** for animations
- **Lucide React** and **React Icons** for iconography
- **next-themes** for dark mode support

### State Management & Data Fetching
- **TanStack Query** for server state and caching
- **Axios** for HTTP requests with configured base instance
- **React Hook Form** with Zod validation for forms
- **Zustand-like providers** for global state (UserProvider, etc.)

### Specialized Features
- **@dnd-kit** suite for drag-and-drop functionality (tournament brackets, regrouping)
- **Yoopta Editor** for rich text editing (blog posts)
- **React DatePicker** and **React Day Picker** for date handling
- **html2canvas** and **jsPDF** for PDF generation
- **i18next** with browser language detection for internationalization (ET/EN)
- **recharts** for data visualization

### File Structure
```
src/
├── components/          # Reusable UI components and tournament-specific components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and shared logic
├── providers/          # React context providers
├── queries/            # TanStack Query configurations and API calls
├── routes/             # File-based routing structure (TanStack Router)
├── types/              # TypeScript type definitions
└── i18n.ts            # Internationalization setup
```

### Routing Structure
- **File-based routing** with TanStack Router
- **Route generation** handled automatically via `@tanstack/router-plugin`
- **Nested layouts** for admin and public sections
- **Admin routes** (`/admin/*`) have separate navigation and layout
- **Protected routes** with user authentication context

### API Integration
- **Axios instance** configured in `src/queries/axiosconf.ts`
- **Environment-based** API URL configuration
- **Bearer token** authentication using `VITE_TOURNAMENT10_PUBLIC_KEY`
- **Modular query files** for different entities (tournaments, players, matches, etc.)

## Development Workflow

### Branch Strategy
- **Main branch**: `main` (production deployments)
- **Development branch**: `development` (active development)
- **Feature branches**: merged to development via PR

### Deployment via Labels
The project uses GitHub Actions with label-triggered deployments:
- **"deploy to test"**: Deploys to test.eltl.ee from development branch
- **"merge to development"**: Auto-merges approved PRs to development
- **"deploy to production"**: Deploys from development to main branch

### Code Quality
- **ESLint** with React-specific rules and React Compiler plugin
- **TypeScript** strict configuration with path aliases
- **Tailwind CSS** for consistent styling
- **Component-driven** architecture with reusable UI components

## Key Patterns

### Component Organization
- **UI components** in `src/components/ui/` (shadcn/ui based)
- **Feature components** organized by domain
- **Route-specific components** in `src/routes/-components/`
- **Shared utilities** in `src/lib/utils.ts`

### Data Fetching
- **TanStack Query** for all server state
- **Custom hooks** for complex data operations
- **Type-safe** API responses with TypeScript definitions

### Form Handling
- **React Hook Form** with Zod schemas
- **Reusable form components** with consistent validation
- **TypeScript** integration for form data types

### Tournament Features
The application specializes in table tennis tournament management with:
- **Bracket generation** (single/double elimination, group stage)
- **Player registration** and management
- **Match scheduling** and scoring
- **Live tournament** tracking and results
- **Media management** (images, videos)
- **PDF protocol** generation and export

### Internationalization
- **i18next** setup with Estonian and English support
- **Browser language** detection
- **Translation files** in `public/locales/`