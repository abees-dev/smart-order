/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  DollarSign,
  Wrench,
  Clock,
  Calculator,
} from "lucide-react";
import { useEffect } from "react";
import { Timestamp } from "firebase/firestore";
import { useOrderById } from "../hooks/use-order";
import { useOrderCostCalculation } from "../hooks/use-order-cost-calculation";
import { OrderCostCalculationSection } from "./order-cost-calculation";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  type OrderStatus,
  type Order,
  type OrderItem,
} from "../types";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Separator,
  Skeleton,
} from "@/components/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateVatAmount } from "@/utils/currency";
import { PageHeader } from "@/components/PageHeader";
import { PermissionGuard } from "@/components/guards";
import { Actions, Resources } from "@/constants";
import CostsIncurredSection from "./costs-incurred-section";
import { MaintenanceSection } from "./maintenance/maintenance-section";

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const { order, isLoading, error } = useOrderById(id!);
  const {
    costCalculation,
    isLoading: costLoading,
    error: costError,
  } = useOrderCostCalculation(id!);

  // Set document title
  useEffect(() => {
    if (order) {
      document.title = `Đơn hàng ${order.orderNumber} - Smart Order`;
    } else {
      document.title = "Chi tiết đơn hàng - Smart Order";
    }
  }, [order]);

  if (isLoading) {
    return <OrderDetailSkeleton />;
  }

  if (error || !order) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <h2 className="text-2xl font-semibold text-gray-900">
            Không tìm thấy đơn hàng
          </h2>
          <p className="text-gray-600 mt-2">
            {error || "Đơn hàng có thể đã bị xóa hoặc không tồn tại."}
          </p>
          <Button
            onClick={() => navigate("/dashboard/orders")}
            className="mt-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6">
      <PageHeader
        title={order.orderNumber}
        description={
          <div className="flex flex-1 flex-col md:flex-row-reverse md:justify-between md:items-center gap-1">
            <StatusBadge status={order.status} />
            <div>Ngày tạo: ${formatDateTime(order.createdAt)}</div>
          </div>
        }
        onCreateAction={() => {}}
        shouldCreateAction={false}
        isBackButton={true}
      />

      {/* Order Summary Card */}
      <OrderSummaryCard order={order} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="items" className="w-full">
        <TabsList className="w-full flex flex-nowrap overflow-x-auto">
          <TabsTrigger value="items" className="flex items-center">
            <Package className="w-4 h-4 mr-2" />
            {isMobile ? "" : "Mặt hàng"}
          </TabsTrigger>
          <PermissionGuard resource={Resources.ORDERS} action={Actions.COST}>
            <TabsTrigger value="cost-analysis" className="flex items-center">
              <Calculator className="w-4 h-4 mr-2" />
              {isMobile ? "" : "Tính giá thành"}
            </TabsTrigger>
          </PermissionGuard>

          {!order.parentOrderId && (
            <>
              <TabsTrigger value="costs" className="flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                {isMobile ? "" : "Chi phí phát sinh"}
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="flex items-center">
                <Wrench className="w-4 h-4 mr-2" />
                {isMobile ? "" : "Bảo trì"}
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                {isMobile ? "" : "Lịch sử"}
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          <OrderItemsSection items={order.items || []} />
        </TabsContent>

        <TabsContent value="cost-analysis" className="space-y-4">
          <OrderCostCalculationSection
            orderId={id!}
            costCalculation={costCalculation}
            isLoading={costLoading}
            error={costError}
          />
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <CostsIncurredSection
            costs={order.costsIncurred || []}
            summary={order.costSummary}
          />
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <MaintenanceSection
            maintenance={order.maintenanceHistory || []}
            summary={order.maintenanceSummary}
          />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <TimelineSection order={order} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const color = ORDER_STATUS_COLORS[status];
  return (
    <Badge variant="outline" color={color}>
      {ORDER_STATUS_LABELS[status]}
    </Badge>
  );
}

function OrderSummaryCard({ order }: { order: Order }) {
  const isMobile = useIsMobile();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin đơn hàng</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`grid gap-4 ${
            isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-4"
          }`}
        >
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Khách hàng</p>
            <p className="font-medium">
              {order.customer?.name || order.customerName || "Khách lẻ"}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">Tổng tiền hàng</p>
            <p className="font-medium">{formatCurrency(order.subtotal)}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">VAT ({order.vatRate}%)</p>
            <p className="font-medium">{formatCurrency(order.vatAmount)}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">Tổng cộng</p>
            <p className="font-semibold text-lg text-blue-600">
              {formatCurrency(order.totalAmount)}
            </p>
          </div>
        </div>

        {order.notes && (
          <>
            <Separator className="my-4" />
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Ghi chú</p>
              <p className="text-sm">{order.notes}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function OrderItemsSection({ items }: { items: OrderItem[] }) {
  const isMobile = useIsMobile();

  if (!items || items.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Không có mặt hàng nào</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh sách mặt hàng ({items.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item: any, index) => (
            <div
              key={item.id || index}
              className={`border rounded-lg p-4 ${isMobile ? "space-y-3" : ""}`}
            >
              <div
                className={`${
                  isMobile ? "space-y-2" : "flex items-center justify-between"
                }`}
              >
                <div className={`${isMobile ? "" : "flex-1"}`}>
                  <h4 className="font-medium">
                    {item.type === "service"
                      ? `Chi phí bảo trì`
                      : item.itemData?.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {item.itemData?.sku || item?.itemData?.["productCode"]}
                  </p>
                </div>

                <div
                  className={`${
                    isMobile
                      ? "grid grid-cols-2 gap-4"
                      : "flex items-center space-x-4"
                  }`}
                >
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Số lượng</p>
                    <p className="font-medium">
                      {item.quantity} {item.itemData?.unit || ""}
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">Đơn giá</p>
                    <p className="font-medium">
                      {formatCurrency(item.unitPrice)}
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">Tạm tính</p>
                    <p className="font-medium">
                      {formatCurrency(
                        item.subtotal || item.quantity * item.unitPrice
                      )}
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      VAT ({item.vatRate || 0}%)
                    </p>
                    <p className="font-medium text-orange-600">
                      {formatCurrency(
                        calculateVatAmount({
                          amount: item.quantity * item.unitPrice,
                          vatRate: item.vatRate,
                        })
                      )}
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">Thành tiền</p>
                    <p className="font-semibold text-blue-600">
                      {formatCurrency(item.totalPrice)}
                    </p>
                  </div>
                </div>
              </div>

              {item.description && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TimelineSection({ order }: { order: Order }) {
  const events = [];

  // Add creation event
  events.push({
    type: "created",
    date: order.createdAt,
    title: "Đơn hàng được tạo",
    description: `Đơn hàng ${order.orderNumber} được tạo`,
  });

  // Add exported event
  if (order.exportedAt) {
    events.push({
      type: "exported",
      date: order.exportedAt,
      title: "Đã xuất kho",
      description: "Đơn hàng đã được xuất kho",
    });
  }

  // Add cancelled event
  if (order.cancelledAt) {
    events.push({
      type: "cancelled",
      date: order.cancelledAt,
      title: "Đơn hàng bị hủy",
      description: "Đơn hàng đã bị hủy",
    });
  }

  // Sort events by date
  events.sort((a, b) => {
    const getDateValue = (date: string | Date | Timestamp) => {
      if (date instanceof Date) return date.getTime();
      if (typeof date === "string") return new Date(date).getTime();
      if (date && typeof date.toDate === "function")
        return date.toDate().getTime(); // Timestamp
      return 0;
    };
    return getDateValue(a.date) - getDateValue(b.date);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch sử đơn hàng</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full mt-2" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{event.title}</h4>
                  <span className="text-sm text-gray-600">
                    {formatDateTime(event.date)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="container mx-auto space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-9 w-20" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* Summary Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
