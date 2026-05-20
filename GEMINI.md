# Gemini Instructions for `meme-fabrica-app`

This file contains the foundational mandates, architecture patterns, and conventions for the `meme-fabrica-app` project. As an AI assistant, you must rigorously adhere to these rules.

## 1. Project Overview & Tech Stack

- **Framework**: Next.js 16.1.6 (App Router).
- **Library**: React 19.2.3 (with `babel-plugin-react-compiler` enabled).
- **Language**: TypeScript 5.x.
- **Styling**: Tailwind CSS v4.
- **State Management**: Zustand 5.x.
- **Form Handling**: React Hook Form 7.x + Zod 4.x + `@hookform/resolvers`.
- **UI/Visuals**: Recharts (charts), Lucide React (icons).
- **Containerization**: Docker & Docker Compose configured.

## 2. Architectural Pattern

This project follows a **Feature-Driven Architecture**, strongly separating domain logic from global concerns and routing. 

### Directory Structure & Responsibilities:
- `src/app/`: Next.js App Router structure. Contains ONLY routing, layouts, and page entry points. Notice the `(protected)` route group handling authenticated areas.
- `src/features/`: **Core Domain Logic**. Code is grouped by business feature (e.g., `dashboard`, `insumos`, `login`, `maquinas`, `operarios`, `ordenes`). Each feature folder encapsulates its own:
  - `components/`: Feature-specific UI components.
  - `schemas/`: Zod validation schemas (`*.schema.ts`).
  - `services/`: API calls and data fetching logic (`*.service.ts`).
  - `store/`: Zustand state management (`use*Store.ts`).
  - `actions/`: Server actions or complex actions (if applicable).
- `src/components/`: Global, generic, reusable UI components (e.g., `Header.tsx`, layout components, shared modals).
- `src/shared/`: Shared domain logic, generic constants (`constants/index.ts`).
- `src/services/`: Global API configurations or generic external integrations not tied to a single feature.
- `src/types/`: Global TypeScript definitions. Feature-specific types should stay within their respective feature folders.
- `src/utils/`: Generic utility functions (e.g., `formatters.ts`).

## 3. Core Development Conventions

### State Management (Zustand)
- Use Zustand (`src/features/*/store/`) for cross-component global state.
- Keep Zustand stores lightweight and feature-scoped.
- For local, isolated component state, prefer standard React `useState`.

### Forms and Data Validation (Zod + React Hook Form)
- Always use **Zod** to validate incoming and outgoing data, as well as form inputs.
- Define Zod schemas inside `src/features/[feature]/schemas/`.
- Use `@hookform/resolvers/zod` to bind Zod schemas to `useForm`.
- Strictly type form data using Zod's `z.infer<typeof schema>`.

### Data Fetching and Services
- Encapsulate all external data fetching in `services/` (either global or feature-specific).
- Avoid putting raw `fetch` calls directly inside Next.js pages or UI components.
- Rely on Server Components in `src/app/` where feasible for direct database/API reads, falling back to Client Components when interactivity or Zustand state is needed.

### React 19 & React Compiler
- The project uses `babel-plugin-react-compiler`. Manual memoization (`useMemo`, `useCallback`, `memo`) is generally unnecessary. Write idiomatic, clean React code and rely on the compiler for optimization unless profiling dictates otherwise.

### Styling & UI Consistency (Tailwind v4)
- **UI Consistency:** Rigorously follow the existing UI styles, color palettes, and spacing conventions of the application when generating new screens or features.
- **Component Reusability:** Always prioritize reusing existing UI components (found in `src/components/` or feature-specific folders) before creating new ones to avoid duplication and maintain visual harmony.
- Use Tailwind utility classes directly in `className`.
- Do not create separate `.css` files unless absolutely necessary (e.g., `globals.css` base definitions).
- When identified or needed create components.

### TypeScript Quality
- Strive for 100% type safety.
- **NEVER** use `any`. Use `unknown` if the shape is truly dynamic, and narrow it with Zod or type guards.
- Extract complex interfaces into `types/` or feature-specific type files.

## 4. Security & Workflows
- **Secrets:** Never log, print, or commit `.env` values or credentials.
- **Code Consistency:** Prioritize the existing established patterns in a file before introducing new libraries or architectures.
- **Verification:** Always verify UI changes and assure form handling logic includes proper error state visualizations based on Zod validation errors.