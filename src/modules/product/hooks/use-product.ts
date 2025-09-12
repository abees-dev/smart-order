import { useState, useEffect, useCallback } from "react";
import { DocumentSnapshot } from "firebase/firestore";
import { useIsMobile } from "@/hooks/use-mobile";
import { ProductService } from "../services/product.service";
import type {
  Product,
  ProductFilters,
  ProductListState,
  ProductFormState,
  CreateProductData,
  UpdateProductData,
} from "../types";

export function useProducts(filters: ProductFilters = {}, pageSize = 10) {
  const isMobile = useIsMobile();

  const [state, setState] = useState<ProductListState>({
    products: [],
    loading: true,
    error: null,
    total: 0,
    page: 1,
    pageSize,
    hasMore: false,
  });

  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadProducts = useCallback(
    async (reset = false, targetPage = 1) => {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      try {
        let result;

        if (isMobile) {
          // Mobile: Use infinite loading with Firestore pagination
          result = await ProductService.getAllProducts(
            filters,
            pageSize,
            reset ? undefined : lastDoc || undefined
          );
        } else {
          // Desktop: Use traditional pagination
          result = await ProductService.getProductsWithPagination(
            filters,
            pageSize,
            targetPage
          );
        }

        const products = result.products;
        const newHasMore = result.hasMore;
        const newLastDoc = result.lastDoc;
        const newTotal =
          "total" in result ? (result.total as number) : undefined;

        setState((prev) => ({
          ...prev,
          products:
            isMobile && !reset ? [...prev.products, ...products] : products,
          loading: false,
          total:
            newTotal !== undefined
              ? newTotal
              : reset
              ? products.length
              : prev.total + products.length,
          page: isMobile ? (reset ? 1 : prev.page + 1) : targetPage,
          hasMore: newHasMore,
        }));

        setHasMore(newHasMore);
        setLastDoc(newLastDoc || null);

        return { success: true };
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Đã xảy ra lỗi",
        }));

        return { success: false, error };
      }
    },
    [filters, pageSize, lastDoc, isMobile]
  );

  const refreshProducts = useCallback(async () => {
    setLastDoc(null);
    setHasMore(true);
    await loadProducts(true, 1);
  }, [loadProducts]);

  const loadMore = useCallback(async () => {
    if (!state.loading && hasMore && isMobile && !loadingMore) {
      setLoadingMore(true);
      try {
        await loadProducts(false);
      } finally {
        setLoadingMore(false);
      }
    }
  }, [state.loading, hasMore, isMobile, loadingMore, loadProducts]);

  const changePage = useCallback(
    async (newPage: number) => {
      if (!isMobile) {
        await loadProducts(true, newPage);
      }
    },
    [isMobile, loadProducts]
  );

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      setLastDoc(null);
      setHasMore(true);

      try {
        let result;

        if (isMobile) {
          result = await ProductService.getAllProducts(filters, pageSize);
        } else {
          result = await ProductService.getProductsWithPagination(
            filters,
            pageSize,
            1
          );
        }

        const { products, hasMore: newHasMore, lastDoc: newLastDoc } = result;
        const total =
          "total" in result ? (result.total as number) : products.length;

        setState({
          products,
          loading: false,
          error: null,
          total,
          page: 1,
          pageSize,
          hasMore: newHasMore,
        });

        setHasMore(newHasMore);
        setLastDoc(newLastDoc || null);
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Đã xảy ra lỗi",
        }));
      }
    };

    loadData();
  }, [JSON.stringify(filters), pageSize, isMobile]);

  return {
    ...state,
    hasMore,
    loadMore,
    refreshProducts,
    changePage,
    isMobile,
    loadingMore,
  };
}

export function useProduct(id?: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const productData = await ProductService.getProductById(id);
        setProduct(productData);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Có lỗi xảy ra");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  return { product, loading, error };
}

export function useProductActions() {
  const [state, setState] = useState<ProductFormState>({
    loading: false,
    error: null,
  });

  const createProduct = useCallback(
    async (data: CreateProductData): Promise<Product> => {
      try {
        setState({ loading: true, error: null });
        const product = await ProductService.createProduct(data);
        setState({ loading: false, error: null });
        return product;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Có lỗi xảy ra";
        setState({ loading: false, error: errorMessage });
        throw error;
      }
    },
    []
  );

  const updateProduct = useCallback(
    async (id: string, data: UpdateProductData): Promise<Product> => {
      try {
        setState({ loading: true, error: null });
        const product = await ProductService.updateProduct(id, data);
        setState({ loading: false, error: null });
        return product;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Có lỗi xảy ra";
        setState({ loading: false, error: errorMessage });
        throw error;
      }
    },
    []
  );

  const deleteProduct = useCallback(async (id: string): Promise<void> => {
    try {
      setState({ loading: true, error: null });
      await ProductService.deleteProduct(id);
      setState({ loading: false, error: null });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Có lỗi xảy ra";
      setState({ loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  return {
    state,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}

export function useProductsByCategory(category?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!category) {
      setProducts([]);
      return;
    }

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const productList = await ProductService.getProductsByCategory(
          category
        );
        setProducts(productList);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Có lỗi xảy ra");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  return { products, loading, error };
}

export function useActiveProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const productList = await ProductService.getActiveProducts();
      setProducts(productList);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveProducts();
  }, [fetchActiveProducts]);

  return { products, loading, error, refreshProducts: fetchActiveProducts };
}

export function useProductCodeValidation() {
  const checkProductCode = useCallback(
    async (productCode: string, excludeId?: string) => {
      try {
        const exists = await ProductService.isProductCodeExists(
          productCode,
          excludeId
        );
        return !exists; // Return true if valid (not exists)
      } catch (error) {
        console.error("Error checking product code:", error);
        return false; // Assume invalid on error
      }
    },
    []
  );

  const getProductByCode = useCallback(async (productCode: string) => {
    try {
      return await ProductService.getProductByCode(productCode);
    } catch (error) {
      console.error("Error getting product by code:", error);
      return null;
    }
  }, []);

  const searchByCode = useCallback(async (productCode: string) => {
    try {
      return await ProductService.searchByProductCode(productCode);
    } catch (error) {
      console.error("Error searching by product code:", error);
      return [];
    }
  }, []);

  return {
    checkProductCode,
    getProductByCode,
    searchByCode,
  };
}
