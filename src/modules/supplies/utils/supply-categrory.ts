export const SUPPLY_CATEGORIES = [
  { id: "supplies", name: "Vật tư" },
  { id: "goods", name: "Hàng hóa" },
] as const;
export type SupplyCategory = (typeof SUPPLY_CATEGORIES)[number]["id"];
export const SUPPLY_CATEGORY_MAP: Record<string, string> =
  SUPPLY_CATEGORIES.reduce((map, category) => {
    map[category.id] = category.name;
    return map;
  }, {} as Record<string, string>);
