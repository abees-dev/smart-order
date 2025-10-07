import { create } from "zustand";

interface FilterStore {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filters: Record<string, any>;
  setFilters: (newFilters: Record<string, unknown>) => void;
  clearFilters: () => void;
  updateFilter: (key: string, value: unknown) => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  filters: {},
  setFilters: (newFilters: Record<string, unknown>) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  updateFilter: (key: string, value: unknown) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    }));
  },
  clearFilters: () => set({ filters: {} }),
}));
