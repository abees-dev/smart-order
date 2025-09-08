# Smart Order - Copilot Instructions

## Architecture Overview

This is a React + TypeScript + Vite application built with a modular architecture pattern. The app is internationalized (i18n) with Vietnamese as the default language and uses Firebase for backend services.

### Key Patterns & Conventions

**Module-Based Architecture:**

- Features organized in `src/modules/[feature]/` with standardized subdirectories:
  - `components/` - Feature-specific UI components
  - `hooks/` - Custom React hooks for feature logic
  - `services/` - API calls and business logic
  - `types/` - TypeScript interfaces and types
  - `validation/` - Zod schemas for form/data validation
  - `router.tsx` - Route definitions for the module
  - `index.tsx` - Public API exports

**Routing Strategy:**

- Centralized in `src/router.tsx` that imports module routers
- Each module exports its own `RouteObject[]` from `router.tsx`
- Uses React Router v7 with nested routing patterns

**UI Component System:**

- Built with shadcn/ui components in `src/components/ui/`
- Uses Radix UI primitives + Tailwind CSS v4
- `components.json` configures shadcn with "new-york" style
- Custom utilities in `src/lib/utils.ts` with `cn()` helper for className merging

**Internationalization (i18n):**

- Vietnamese (`vi`) is the default language, English (`en`) as fallback
- Translation files in `src/locales/[lang]/common.json`
- Initialized in `src/main.tsx` before React app
- Uses `useDocumentTitle()` hook to sync page titles with translations
- TypeScript support via `src/types/i18next.d.ts` module augmentation

**Firebase Integration:**

- Configuration in `src/config/firebase.ts`
- Exports Firestore `db` instance for data operations
- API keys committed (appears to be development environment)

### Development Workflow

**Build & Development:**

```bash
npm run dev          # Start Vite dev server
npm run build        # TypeScript compilation + Vite build
npm run lint         # ESLint check
npm run preview      # Preview production build
```

**Path Aliases:**

- `@/` maps to `src/` (configured in `vite.config.ts` and `tsconfig.json`)
- Import components as `@/components/ui/button` not `../../components/ui/button`

### Code Guidelines

**Component Patterns:**

- Use functional components with TypeScript interfaces
- Extract reusable logic into custom hooks (see `src/hooks/`)
- Layout components in `src/layout/` for page structure (e.g., `DashboardLayout`)

**State Management:**

- React hooks for local state
- Form handling with `react-hook-form` + `@hookform/resolvers`
- Data validation using Zod schemas

**Styling Conventions:**

- Tailwind CSS with CSS variables for theming
- Use `cn()` utility for conditional className merging
- Responsive design patterns: `hidden sm:inline` for mobile-first approach

**File Organization:**

- Group related files by feature, not by file type
- Keep components close to their usage (feature modules)
- Shared components in `src/components/`
- Business logic in `services/` directories within modules

### Critical Implementation Details

**Language Switching:**

- `LanguageSwitcher` component handles i18n language changes
- Persists selection to localStorage via i18next-browser-languagedetector

**Module Registration:**

- New feature modules must export routes and register in `src/router.tsx`
- Follow the auth module pattern in `src/modules/auth/` as reference

**Firebase Usage:**

- Import `db` from `@/config/firebase` for Firestore operations
- Follow Firebase v9+ modular SDK patterns

When adding new features, create them as self-contained modules following the established patterns in `src/modules/auth/`.
