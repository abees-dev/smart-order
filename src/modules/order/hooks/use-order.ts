import { useState, useCallback, useEffect } from "react";
import { DocumentSnapshot } from "firebase/firestore";
import { useIsMobile } from "@/hooks/use-mobile";
import type {
  CreateOrderData,
  Order,
  OrderFilters,
  OrderFormState,
  OrderListState,
  OrderStatus,
  UpdateOrderData,
} from "../types";
import { OrderService } from "../services/order.service";

// Hook for managing order list with filters and pagination
export function useOrders(filters: OrderFilters = {}, pageSize = 8) {
  const isMobile = useIsMobile();

  const [state, setState] = useState<OrderListState>({
    orders: [],
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

  const loadOrders = useCallback(
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
          result = await OrderService.getAllOrders(
            filters,
            pageSize,
            reset ? undefined : lastDoc || undefined
          );
        } else {
          // Desktop: Use traditional pagination
          result = await OrderService.getOrdersWithPagination(
            filters,
            pageSize,
            targetPage
          );
        }

        const orders = result.orders;
        const newHasMore = result.hasMore;
        const newLastDoc = result.lastDoc;
        const newTotal =
          "total" in result ? (result.total as number) : undefined;

        setState((prev) => ({
          ...prev,
          orders: isMobile && !reset ? [...prev.orders, ...orders] : orders,
          loading: false,
          total:
            newTotal !== undefined
              ? newTotal
              : reset
              ? orders.length
              : prev.total + orders.length,
          page: isMobile ? (reset ? 1 : prev.page + 1) : targetPage,
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

  const refreshOrders = useCallback(async () => {
    setLastDoc(null);
    setHasMore(true);
    await loadOrders(true, 1);
  }, [loadOrders]);

  const loadMore = useCallback(async () => {
    if (!state.loading && hasMore && isMobile && !loadingMore) {
      setLoadingMore(true);
      try {
        await loadOrders(false);
      } finally {
        setLoadingMore(false);
      }
    }
  }, [state.loading, hasMore, isMobile, loadingMore, loadOrders]);

  const changePage = useCallback(
    async (newPage: number) => {
      if (!isMobile) {
        await loadOrders(true, newPage);
      }
    },
    [isMobile, loadOrders]
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
          result = await OrderService.getAllOrders(filters, pageSize);
        } else {
          result = await OrderService.getOrdersWithPagination(
            filters,
            pageSize,
            1
          );
        }

        const { orders, hasMore: newHasMore, lastDoc: newLastDoc } = result;
        const total =
          "total" in result ? (result.total as number) : orders.length;

        setState({
          orders,
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
    refreshOrders,
    changePage,
    isMobile,
    loadingMore,
  };
}

// Hook for getting a single order
export function useOrder(orderId?: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;

    setLoading(true);
    setError(null);

    try {
      const orderData = await OrderService.getOrderById(orderId);
      setOrder(orderData);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  return {
    order,
    loading,
    error,
    refetch: fetchOrder,
  };
}

// Hook for order actions (create, update, delete, change status)
export function useOrderActions() {
  const [state, setState] = useState<OrderFormState>({
    loading: false,
    error: null,
  });

  const createOrder = useCallback(
    async (data: CreateOrderData): Promise<string> => {
      setState({ loading: true, error: null });

      try {
        const orderId = await OrderService.createOrder(data);
        setState({ loading: false, error: null });
        return orderId;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Không thể tạo đơn hàng";
        setState({ loading: false, error: errorMessage });
        throw new Error(errorMessage);
      }
    },
    []
  );

  const updateOrder = useCallback(
    async (orderId: string, data: UpdateOrderData): Promise<void> => {
      setState({ loading: true, error: null });

      try {
        await OrderService.updateOrder(orderId, data);
        setState({ loading: false, error: null });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Không thể cập nhật đơn hàng";
        setState({ loading: false, error: errorMessage });
        throw new Error(errorMessage);
      }
    },
    []
  );

  const deleteOrder = useCallback(async (orderId: string): Promise<void> => {
    setState({ loading: true, error: null });

    try {
      await OrderService.deleteOrder(orderId);
      setState({ loading: false, error: null });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Không thể xóa đơn hàng";
      setState({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  }, []);

  const changeOrderStatus = useCallback(
    async (orderId: string, newStatus: OrderStatus): Promise<void> => {
      setState({ loading: true, error: null });

      try {
        await OrderService.changeOrderStatus(orderId, newStatus);
        setState({ loading: false, error: null });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Không thể thay đổi trạng thái đơn hàng";
        setState({ loading: false, error: errorMessage });
        throw new Error(errorMessage);
      }
    },
    []
  );

  const checkOrderNumberExists = useCallback(
    async (orderNumber: string): Promise<boolean> => {
      try {
        return await OrderService.checkOrderNumberExists(orderNumber);
      } catch (error) {
        console.error("Error checking order number:", error);
        return false;
      }
    },
    []
  );

  return {
    ...state,
    createOrder,
    updateOrder,
    deleteOrder,
    changeOrderStatus,
    checkOrderNumberExists,
  };
}

// Hook for order statistics
export function useOrderStats() {
  const [stats, setStats] = useState<{
    total: number;
    byStatus: Record<OrderStatus, number>;
    totalRevenue: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const statsData = await OrderService.getOrderStats();
      setStats(statsData);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Không thể tải thống kê"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}
