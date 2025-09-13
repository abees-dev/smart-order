const productCategories = [
  {
    value: "finished_product",
    label: "Thành phẩm",
  },
  {
    value: "goods",
    label: "Hàng hóa",
  },
];

const productCategoriesMap = productCategories.reduce((acc, category) => {
  acc[category.value] = category.label;
  return acc;
}, {} as Record<string, string>);

export const PRODUCT_CATEGORIES = productCategories;
export const PRODUCT_CATEGORIES_MAP = productCategoriesMap;
