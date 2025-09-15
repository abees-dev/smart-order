# Smart Order - Copilot Instructions

## Architecture Overview

This is a React + TypeScript + Vite application built for both web and **Zalo Mini App (ZMP)** deployment. Features a modular architecture with Vietnamese-first i18n, **hybrid backend** (migrating from Firebase to REST API), and shadcn/ui component system.

### Current Modules

Active modules: `auth`, `customer`, `suppliers`, `supplies`, `product`, `order`, `invoice`, `reports` - each follows identical structure patterns.

### Backend Architecture (HYBRID STATE)

**⚠️ CRITICAL: Mixed Backend Patterns**

- **New modules** (e.g., `customer`): Use REST API with Axios (`@/utils/axios`)
- **Legacy modules** (e.g., `supplies`, `invoice`, `reports`): Still use Firebase/Firestore
- Use the correct service pattern based on the module you're working with

### Key Patterns & Conventions

**Module-Based Architecture:**
Each feature lives in `src/modules/[feature]/` with this exact structure:

- `components/` - UI components with barrel exports via `index.ts`
- `hooks/` - React hooks for state/business logic (e.g., `use-customer.ts`)
- `services/` - **Service classes** (REST API or Firebase - see Backend Architecture)
- `types/` - TypeScript interfaces exported from `index.ts`
- `validation/` - Zod schemas with form type inference
- `router.tsx` - Exports `RouteObject[]` for React Router v7
- `index.tsx` - Public API barrel export of all module components/hooks/services

**Critical Routing Setup:**

```typescript
// src/router.tsx - Module routes registered under DashboardLayout
const router = createBrowserRouter(
  [
    ...authRouter,
    {
      path: "/dashboard",
      element: <DashboardLayout />,
      children: [
        ...customerRouter,
        ...suppliersRouter,
        ...suppliesRouter,
        ...productRouter,
        ...orderRouter,
        ...invoiceRouter,
        reportsRouter, // Note: this one doesn't spread (single RouteObject)
      ],
    },
  ],
  {
    basename:
      import.meta.env.MODE === "miniapp" ? "/zapps/1309730958729066148" : "/",
  }
);
```

**ZMP (Zalo Mini App) Integration:**

- Build mode: `npm run build-miniapp` copies `app-config.json` to dist
- Route basename changes for ZMP deployment (`/zapps/1309730958729066148`)
- `zmp-sdk` package included for Zalo-specific features
- SSL dev server (port 4000) with local certificates for ZMP testing

**REST API Service Pattern (New Modules):**

```typescript
// New pattern using Axios for REST API
export class CustomerService {
  static async getAllCustomers(
    filters: CustomerFilters = {}
  ): Promise<ApiResponsePagination<Customer[]>> {
    return await axiosInstance.get("/customers", { params: filters });
  }

  static async createCustomer(data: CreateCustomerData): Promise<Customer> {
    return await axiosInstance.post("/customers", data);
  }
  // Axios instance auto-handles response.data extraction
}
```

**Firebase Service Pattern (Legacy Modules):**

```typescript
// Legacy pattern still used in supplies, invoice, reports
export class CustomerService {
  private static collectionRef = collection(db, "customers");

  static async getAllCustomers(
    filters: CustomerFilters = {},
    pageSize = 10,
    lastDoc?: DocumentSnapshot
  ) {
    // Firestore v9+ modular API with pagination
    const constraints: QueryConstraint[] = [];
    if (filters.search) {
      constraints.push(where("name", ">=", filters.search));
      constraints.push(where("name", "<=", filters.search + "\uf8ff"));
    }
    // Returns { customers, hasMore, lastDoc } for infinite scroll
  }
}
```

**Custom Hook Patterns:**

```typescript
// REST API pattern (new modules) - uses React Query infinite queries
export function useCustomers(filters: CustomerFilters = {}) {
  const { data, fetchNextPage, hasNextPage, isFetching, refetch, error } =
    useInfiniteQuery({
      queryKey: ["customers", { ...filters }],
      queryFn: ({ pageParam = filters.page }) =>
        CustomerService.getAllCustomers({ ...filters, page: pageParam }),
      // Returns { customers: flatMapped data, pagination, fetchNextPage, ... }
    });
}

// Firebase pattern (legacy modules) - manual state management
export function useSupplies(filters: SupplyFilters = {}, pageSize = 10) {
  const [state, setState] = useState<SupplyListState>({
    supplies: [],
    loading: true,
    error: null,
    total: 0,
    page: 1,
    pageSize,
  });
  // Returns { state, refreshSupplies, loadMore, hasMore }
}
```

### Development Workflow

**Commands:**

```bash
yarn dev                 # Vite dev server on https://localhost:4000 (SSL for ZMP)
yarn build-miniapp       # ZMP build with app-config.json
yarn build               # Standard web build
yarn seed:customers      # Seed customer data via tsx script
```

**Dev Console Utilities:**

- `seedCustomers()` function auto-loaded in dev mode console for quick data seeding

**i18n Setup (Vietnamese Default):**

- Translations: `src/locales/vi/common.json` (default), `src/locales/en/common.json`
- Initialized in `src/main.tsx` before React render
- Detection order: localStorage → navigator → htmlTag
- Form validation messages in Vietnamese

**shadcn/ui Configuration:**

- Style: "new-york", Tailwind v4 with CSS variables
- Aliases: `@/components`, `@/lib/utils`, `@/components/ui`, `@/lib`, `@/hooks`
- Use `cn()` utility from `@/lib/utils` for className merging

**Component Libraries:**

- **Table System**: `EnhancedTable` with built-in search, actions, pagination, mobile cards
- **Form Controls**: `FormSelect` (searchable), `FormTextField`, `SupplierSelect` with specialized patterns
- **UI Components**: Full shadcn/ui set with React 19 + Radix UI + Lucide icons

### Critical Implementation Details

**Module Registration (Required Steps):**

1. Create module following `src/modules/customer/` pattern
2. Export router from `router.tsx` as `RouteObject[]`
3. Import and spread in `src/router.tsx` under DashboardLayout children
4. Barrel export all public APIs from module's `index.tsx`

**Firebase Integration:**

```typescript
import { db } from "@/config/firebase"; // Pre-configured Firestore instance
// Use Firebase v9+ modular SDK: collection(), doc(), getDocs(), etc.
```

**Table Component Patterns:**

```typescript
// Use EnhancedTable for feature-rich data tables
<EnhancedTable
  data={customers}
  columns={columns}
  searchable
  actions={[{ key: "edit", label: "Edit", onClick: handleEdit }]}
  loading={state.loading}
  onLoadMore={loadMore}
  hasMore={hasMore}
/>
```

**Validation Pattern:**

```typescript
// validation/index.ts in each module
export const createCustomerSchema = z.object({
  name: z.string().min(2, "Tên khách hàng phải có ít nhất 2 ký tự"),
  // Vietnamese error messages
});
export type CreateCustomerFormData = z.infer<typeof createCustomerSchema>;
```

**Layout Structure:**

- `DashboardLayout` wraps all authenticated routes with `SidebarProvider`
- `AppSidebar` component provides navigation
- All dashboard routes render inside `<Outlet />` with padding

When creating new features, clone the `src/modules/customer/` structure and follow the established service class + custom hooks + Zod validation pattern.
