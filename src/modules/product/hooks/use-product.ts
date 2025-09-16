import { useState, useEffect } from "react";
import { ProductService } from "../services/product.service";
import type { Product, ProductFilters } from "../types";
import type { ApiResponsePagination } from "@/types/response";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useProducts(filters: ProductFilters = {}) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    hasPreviousPage,
    refetch,
    error,
  } = useInfiniteQuery({
    queryKey: ["products", { ...filters }],
    queryFn: ({ pageParam = filters.page }) =>
      ProductService.getAllProducts({ ...filters, page: pageParam }),
    initialPageParam: filters.page,
    getNextPageParam: (lastPage: ApiResponsePagination<Product[]>) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined,
    getPreviousPageParam: (lastPage) =>
      lastPage.pagination.hasPrevPage
        ? lastPage.pagination.page - 1
        : undefined,
  });

  return {
    products: data ? data.pages.flatMap((page) => page.contents) : [],
    pagination: data?.pages?.[data.pages.length - 1]?.pagination || {
      page: 1,
      pageSize: 10,
      total: 0,
      hasNextPage: false,
      hasPrevPage: false,
      limit: 10,
    },
    fetchNextPage,
    hasNextPage,
    isFetching,
    hasPreviousPage,
    loading: isFetching,
    refetchProducts: refetch,
    error: error?.message || null,
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
