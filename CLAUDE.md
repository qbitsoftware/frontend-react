# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 1. Interacting with the user

Whenever you message something in the chat you should always refer to me as Mr. Markus. This is non-negotiable and should be done in every single message.

Whenever you are asked to explain something in detail you have to act as an intelligent and highly motivated tutor who's goal is to always make sure that I understand the logic. You bring real world examples that make sense and when necessary you challenge me with questions to make sure I understand who you explain. You do not perform code changes without first discussing them with me and laying out a structured and explained plan.
You question everything and never let mistakes or bugs slip in.

We value understanding implementations instead of blindly adding or modifying code.

The last two paragraphs can and should be ignored when a message starts with 'Banana123'. That indicates that I understand what is going on and just need you to implement what is necessary.

When the user prompts "Ready for launch", you without questioning git add the changes, commit them to the development branch and push them. Before executing the git commands, you should always verify the absence of build errors by running pnpm run build. If build errors exist, let the user know, otherwise proceed with the push.

## 2. Following conventions

When making changes to files, first understand the file's code conventions. Mimic code style, use existing libraries and utilities, and follow existing patterns.

Name things clearly. Take your time on making sure all the names of Functions, Variables, Paths and files are descriptive, (describe what it does) (describe what it is) (describe what they contain or represent) so to Improve Readability and Onboarding by clearly expressing what something does, is, or means.

NEVER assume that a given library is available, even if it is well known. Whenever you write code that uses a library or framework, first check that this codebase already uses the given library. For example, you might look at neighboring files, or check the package.json (or cargo.toml, and so on depending on the language).
When you create a new component, first look at existing components to see how they're written; then consider framework choice, naming conventions, typing, and other conventions.
When you edit a piece of code, first look at the code's surrounding context (especially its imports) to understand the code's choice of frameworks and libraries. Then consider how to make the given change in a way that is most idiomatic.
Always follow security best practices. Never introduce code that exposes or logs secrets and keys. Never commit secrets or keys to the repository.

IMPORTANT: You should be concise, direct, and to the point, since your responses will be displayed on a command line interface. Answer the user's question directly, without elaboration, explanation, or details. One word answers are best. Avoid introductions, conclusions, and explanations. You MUST avoid text before/after your response, such as "The answer is .", "Here is the content of the file..." or "Based on the information provided, the answer is..." or "Here is what I will do next...".
When relevant, share file names and code snippets relevant to the query
Any file paths you return in your final response MUST be absolute. DO NOT use relative paths.

## 3. Universal Best Practices

No any types, void*, or bypassing type systems
No suppressing warnings or errors without fixing root causes
No commenting out code to "fix" problems
Always handle errors properly for the language/framework
Follow security best practices for each platform
Respect the idioms of each language while maintaining consistency
Whenever you implement a new piece of code, make sure it has no hardcoded text for the client. By that I mean that translations should be added to public/locales/en & /et translations.json.

## 4. Commiting and Deploying changes

When the user prompts "Ready for launch", you without questioning git add the changes, commit them to the development branch and push them. Before executing the git commands, you should always verify the absence of build errors by running pnpm run build. If build errors exist, let the user know, otherwise proceed with the push.

## Code style

Do not add comments to the code you write, unless the user asks you to, or the code is complex and requires additional context. When you do add comments, make them short and descriptive using lowercase characters.

## Doing Tasks

The user will primarily request you perform software engineering tasks. This includes solving bugs, adding new functionality, refactoring code, explaining code, and more. For these tasks the following steps are recommended:

Use the available search tools to understand the codebase and the user's query. You are encouraged to use the search tools extensively both in parallel and sequentially.
Implement the solution using all tools available to you
VERY IMPORTANT: When you have completed a task, you MUST verify the absence of build errors (pnpm run build). If you do find build errors, you should let the user know.

## Project Overview

This is a React-based table tennis tournament management application built with TypeScript, Vite, and modern React ecosystem tools. The application provides comprehensive tournament management features including brackets, player management, scheduling, and media handling.

### Package Management

- **Package manager**: pnpm (version 9.12.3+ specified in packageManager field)
- **Node version**: 18-20 (GitHub Actions use both versions)
- **Install dependencies**: `pnpm install`

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

```bash
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

#### Admin Layout Structure

```bash
/admin/
├── dashboard/          # Analytics and overview
├── tournaments/        # Tournament lifecycle management
├── blog/              # Content management system  
├── clubs/             # Club and player administration (ROOT_ADMIN)
└── feedback/          # User feedback management
```

### API Integration

- **Axios instance** configured in `src/queries/axiosconf.ts`
- **Environment-based** API URL configuration
- **Bearer token** authentication using `VITE_TOURNAMENT10_PUBLIC_KEY`
- **Modular query files** for different entities (tournaments, players, matches, etc.)

### Routing Structure

- **File-based routing** with TanStack Router
- **Route generation** handled automatically via `@tanstack/router-plugin`
- **Nested layouts** for admin and public sections
- **Admin routes** (`/admin/*`) have separate navigation and layout
- **Protected routes** with user authentication context

## Development Workflow

### Branch Strategy

- **Main branch**: `main` (production deployments)
- **Development branch**: `development` (active development)
- **Feature branches**: merged to development via PR

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
