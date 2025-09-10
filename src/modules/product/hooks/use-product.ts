import { useState, useEffect, useCallback } from "react";
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
  const [state, setState] = useState<ProductListState>({
    products: [],
    loading: true,
    error: null,
    total: 0,
    page: 1,
    pageSize,
    hasMore: false,
  });

  const loadProducts = useCallback(
    async (reset = false) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const result = await ProductService.getAllProducts(
          filters,
          pageSize,
          reset ? undefined : state.lastDoc
        );

        setState((prev) => ({
          ...prev,
          products: reset
            ? result.products
            : [...prev.products, ...result.products],
          hasMore: result.hasMore,
          lastDoc: result.lastDoc,
          loading: false,
          page: reset ? 1 : prev.page + 1,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Có lỗi xảy ra",
          loading: false,
        }));
      }
    },
    [filters, pageSize, state.lastDoc]
  );

  const refreshProducts = useCallback(() => {
    loadProducts(true);
  }, [loadProducts]);

  const loadMore = useCallback(() => {
    if (!state.loading && state.hasMore) {
      loadProducts(false);
    }
  }, [loadProducts, state.loading, state.hasMore]);

  useEffect(() => {
    refreshProducts();
  }, [filters, pageSize]);

  return {
    state,
    refreshProducts,
    loadMore,
    hasMore: state.hasMore,
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
