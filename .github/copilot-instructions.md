# Smart Order - Copilot Instructions

## Architecture Overview

React 19 + TypeScript + Vite application with **dual deployment targets**: standard web app and **Zalo Mini App (ZMP)**. Features modular architecture with Vietnamese-first i18n, REST API backend, shadcn/ui "new-york" style, and Tailwind v4.
Skip install packages

### Tech Stack Essentials

- **Frontend**: React 19, React Router v7, TanStack Query v5, React Hook Form + Zod
- **UI**: shadcn/ui (new-york), Tailwind v4 with CSS variables, Radix UI, Lucide icons
- **Backend**: REST API with Axios (Firebase migration in progress)
- **Build**: Vite with SSL dev server (port 4000), package manager: Yarn v4
- **i18n**: Vietnamese default, English fallback via react-i18next

### Module Architecture Pattern

Each feature lives in `src/modules/[feature]/` with **strict structure**:

```
components/     # UI with barrel exports via index.ts
hooks/         # React hooks (use-[feature].ts pattern)
services/      # Service classes (REST API)
types/         # TypeScript interfaces from index.ts
validation/    # Zod schemas with inferred types
router.tsx     # Exports RouteObject[] array
index.tsx      # Module's public API barrel export
```

Active modules: `auth`, `customer`, `suppliers`, `supplies`, `product`, `order`, `invoice`, `reports`

### Backend Patterns (MIGRATION IN PROGRESS)

**NEW MODULES** (customer, suppliers): REST API via Axios
**LEGACY MODULES** (supplies, invoice, reports): Firebase/Firestore v9+ → **API migration coming soon**

### Routing & ZMP Integration

```typescript
// src/router.tsx - Module registration under DashboardLayout
const router = createBrowserRouter(
  [
    ...authRouter,
    {
      path: "/dashboard",
      element: <DashboardLayout />,
      children: [
        ...customerRouter, // NEW: spreads RouteObject[]
        ...suppliersRouter, // NEW: spreads RouteObject[]
        ...suppliesRouter, // LEGACY: spreads RouteObject[] (API migration coming soon)
        reportsRouter, // LEGACY: single RouteObject (API migration coming soon)
      ],
    },
  ],
  {
    basename:
      import.meta.env.MODE === "miniapp" ? "/zapps/1309730958729066148" : "/",
  }
);
```

**ZMP (Zalo Mini App) Deployment:**

- Build: `yarn build-miniapp` (copies `app-config.json` to dist/)
- SSL dev server required: https://localhost:4000 (uses localhost.pem certificates)
- Route basename switches for ZMP vs web deployment

### Key Development Workflows

**Commands:**

```bash
yarn dev              # HTTPS dev server on port 4000 (required for ZMP)
yarn build-miniapp    # ZMP build with app-config.json
yarn seed:customers   # Populate customer data via tsx script
```

**Module Creation Steps:**

1. Copy `src/modules/customer/` structure exactly
2. Create service class using REST API pattern
3. Export router as `RouteObject[]` from `router.tsx`
4. Import and **spread** router in `src/router.tsx` under DashboardLayout
5. Barrel export public APIs from module's `index.tsx`

### Component & Form Patterns

**Enhanced Table (Standard Pattern):**

```typescript
<EnhancedTable
  data={customers}
  columns={columns}
  searchable
  actions={[{ key: "edit", label: "Sửa", onClick: handleEdit }]}
  loading={loading}
  onLoadMore={fetchNextPage}
  hasMore={hasNextPage}
/>
```

**Validation (Zod + React Hook Form):**

```typescript
// validation/index.ts
export const createCustomerSchema = z.object({
  name: z.string().min(2, "Tên khách hàng phải có ít nhất 2 ký tự"),
  // Vietnamese error messages
});
export type CreateCustomerFormData = z.infer<typeof createCustomerSchema>;
```

**Form Component Pattern:**

```typescript
const form = useForm<CreateCustomerFormData>({
  resolver: zodResolver(createCustomerSchema),
});
// Use FormField + FormSelect/FormTextField from @/components/forms
```

**FormTextField (Standard Input Pattern):**

```typescript
<FormTextField
  control={form.control}
  name="name"
  label="Tên khách hàng"
  placeholder="Nhập tên khách hàng"
  required
  helpText="Tên khách hàng phải có ít nhất 2 ký tự"
/>
// Supports: text, textarea, number types with Vietnamese labels
```

**FormSelect (Searchable Select Pattern):**

```typescript
<FormSelect
  options={[
    { value: "1", label: "Khách hàng A", description: "Mô tả khách hàng" },
    { value: "2", label: "Khách hàng B", disabled: true },
  ]}
  value={selectedValue}
  onValueChange={setSelectedValue}
  label="Chọn khách hàng"
  placeholder="Chọn tùy chọn..."
  searchPlaceholder="Tìm kiếm..."
  required
  clearable
  loading={isLoading}
/>
// Built-in search, Vietnamese placeholders, custom option rendering
```

**DialogResponsive (Mobile-First Modal Pattern):**

```typescript
<DialogResponsive
  title="Thêm khách hàng mới"
  description="Nhập thông tin khách hàng"
  open={isOpen}
  onOpenChange={setIsOpen}
  formId="customer-form"
  actions={{
    submit: { label: "Lưu", loading: isSubmitting },
    cancel: { label: "Hủy", onClick: () => setIsOpen(false) },
  }}
>
  <form id="customer-form" onSubmit={handleSubmit}>
    {/* Form content */}
  </form>
</DialogResponsive>
// Auto switches between Dialog (desktop) and Drawer (mobile)
```

```typescript
// REST API Service (Standard Pattern)
export class CustomerService {
  static async getAllCustomers(
    filters: CustomerFilters = {}
  ): Promise<ApiResponsePagination<Customer[]>> {
    return await axiosInstance.get("/customers", { params: filters });
  }
  // Axios interceptor auto-extracts response.data
}

// TanStack Query Hook Pattern
export function useCustomers(filters: CustomerFilters = {}) {
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["customers", { ...filters }],
    queryFn: ({ pageParam = filters.page }) =>
      CustomerService.getAllCustomers({ ...filters, page: pageParam }),
    // Returns flat-mapped data with pagination
  });
}
```

### Configuration & Environment

**shadcn/ui Setup:** "new-york" style, Tailwind v4 with CSS variables, Radix UI base

- Use `cn()` from `@/lib/utils` for className merging
- Import pattern: `@/components/ui/[component]`

**Axios Configuration:**

- Base URL: `import.meta.env.VITE_API_BASE_URL`
- Response interceptor auto-extracts `.data`
- Vietnamese error messages: `{ message: "Đã xảy ra lỗi" }`

**i18n (Vietnamese Primary):**

- Files: `src/locales/vi/common.json` (default), `src/locales/en/common.json`
- Detection: localStorage → navigator → htmlTag
- Fallback: Vietnamese (`vi`)
- Initialized in `src/main.tsx` before React render

### Critical Implementation Notes

**Type Patterns:**

- All modules export types from `types/index.ts`

**Error Handling:**

- Axios: Global interceptor with Vietnamese messages

**Package Manager:** Yarn v4 (see `package.json` packageManager field)

When extending this codebase, prioritize REST API patterns for new modules and maintain Firebase patterns only for existing legacy modules (supplies, invoice, reports). Always follow the Vietnamese-first approach for user-facing content.
