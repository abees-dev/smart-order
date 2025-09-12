import { useState, useCallback, useEffect } from "react";
import { DocumentSnapshot } from "firebase/firestore";
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
export function useOrders(filters: OrderFilters = {}, pageSize = 20) {
  const [state, setState] = useState<OrderListState>({
    orders: [],
    loading: true,
    error: null,
    hasMore: false,
    total: 0,
  });

  const [lastDoc, setLastDoc] = useState<DocumentSnapshot>();

  const fetchOrders = useCallback(
    async (reset = false) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const docToUse = reset ? undefined : lastDoc;
        const {
          orders: newOrders,
          hasMore,
          lastDoc: newLastDoc,
        } = await OrderService.getAllOrders(filters, pageSize, docToUse);

        setState((prev) => ({
          ...prev,
          orders: reset ? newOrders : [...prev.orders, ...newOrders],
          hasMore,
          total: reset ? newOrders.length : prev.total + newOrders.length,
          loading: false,
        }));

        setLastDoc(newLastDoc);
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Đã có lỗi xảy ra",
          loading: false,
        }));
      }
    },
    [filters, pageSize, lastDoc]
  );

  const refreshOrders = useCallback(() => {
    setLastDoc(undefined);
    fetchOrders(true);
  }, [fetchOrders]);

  const loadMoreOrders = useCallback(() => {
    if (state.hasMore && !state.loading) {
      fetchOrders(false);
    }
  }, [fetchOrders, state.hasMore, state.loading]);

  useEffect(() => {
    refreshOrders();
  }, [filters]);

  return {
    ...state,
    refreshOrders,
    loadMoreOrders,
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
