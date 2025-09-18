/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  DollarSign,
  Wrench,
  Clock,
  Edit,
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
  COST_TYPE_LABELS,
  COST_TYPE_COLORS,
  type OrderStatus,
  type CostType,
  type Order,
  type OrderItem,
  type CostIncurred,
  type MaintenanceRecord,
} from "../types";
import { formatCurrency, formatDate, formatDateTime } from "@/utils/format";
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
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard/orders")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isMobile ? "" : "Quay lại"}
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {order.orderNumber}
            </h1>
            <p className="text-sm text-gray-600">
              Ngày tạo: {formatDateTime(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <StatusBadge status={order.status} />
          <Button size="sm" variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            {isMobile ? "" : "Chỉnh sửa"}
          </Button>
        </div>
      </div>

      {/* Order Summary Card */}
      <OrderSummaryCard order={order} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="items" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="items" className="flex items-center">
            <Package className="w-4 h-4 mr-2" />
            {isMobile ? "Mặt hàng" : "Mặt hàng"}
          </TabsTrigger>
          <TabsTrigger value="cost-analysis" className="flex items-center">
            <Calculator className="w-4 h-4 mr-2" />
            {isMobile ? "Tính giá" : "Tính giá thành"}
          </TabsTrigger>
          <TabsTrigger value="costs" className="flex items-center">
            <DollarSign className="w-4 h-4 mr-2" />
            {isMobile ? "Chi phí" : "Chi phí phát sinh"}
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center">
            <Wrench className="w-4 h-4 mr-2" />
            {isMobile ? "Bảo trì" : "Bảo trì"}
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            {isMobile ? "Lịch sử" : "Lịch sử"}
          </TabsTrigger>
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
                    {item.itemData?.name || `Item ${item.itemId}`}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {item.itemData?.sku || item.itemData["productCode"]}
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
                      {calculateVatAmount({
                        amount: item.quantity * item.unitPrice,
                        vatRate: item.vatRate,
                      })}
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

function CostsIncurredSection({
  costs,
  summary,
}: {
  costs: CostIncurred[];
  summary?: Order["costSummary"];
}) {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Tổng quan chi phí</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`grid gap-4 ${
                isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3"
              }`}
            >
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Tổng chi phí phát sinh</p>
                <p className="font-semibold text-lg text-red-600">
                  {formatCurrency(summary.totalCostsIncurred)}
                </p>
              </div>

              {summary.costsByType &&
                Object.entries(summary.costsByType).map(([type, amount]) => (
                  <div key={type} className="space-y-2">
                    <p className="text-sm text-gray-600">
                      {COST_TYPE_LABELS[type as CostType] || type}
                    </p>
                    <p className="font-medium">
                      {formatCurrency(amount as number)}
                    </p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Costs List */}
      <Card>
        <CardHeader>
          <CardTitle>Chi phí phát sinh ({costs?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {!costs || costs.length === 0 ? (
            <div className="py-8 text-center">
              <DollarSign className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Chưa có chi phí phát sinh nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {costs.map((cost, index) => (
                <div key={cost.id || index} className="border rounded-lg p-4">
                  <div
                    className={`${
                      isMobile
                        ? "space-y-3"
                        : "flex items-center justify-between"
                    }`}
                  >
                    <div className={`${isMobile ? "" : "flex-1"}`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge
                          variant="outline"
                          color={COST_TYPE_COLORS[cost.costType]}
                        >
                          {COST_TYPE_LABELS[cost.costType]}
                        </Badge>
                        {cost.invoiceNumber && (
                          <span className="text-sm text-gray-600">
                            Hóa đơn: {cost.invoiceNumber}
                          </span>
                        )}
                      </div>
                      <h4 className="font-medium">{cost.description}</h4>
                      {cost.supplier && (
                        <p className="text-sm text-gray-600">
                          Nhà cung cấp: {cost.supplier}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        Ngày phát sinh: {formatDate(cost.incurredDate)}
                      </p>
                    </div>

                    <div
                      className={`${
                        isMobile
                          ? "grid grid-cols-2 gap-4"
                          : "flex items-center space-x-6"
                      }`}
                    >
                      {cost.quantity && (
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Số lượng</p>
                          <p className="font-medium">{cost.quantity}</p>
                        </div>
                      )}

                      {cost.unitPrice && (
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Đơn giá</p>
                          <p className="font-medium">
                            {formatCurrency(cost.unitPrice)}
                          </p>
                        </div>
                      )}

                      <div className="text-center">
                        <p className="text-sm text-gray-600">Tổng tiền</p>
                        <p className="font-semibold text-red-600">
                          {formatCurrency(cost.amount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {cost.notes && (
                    <div className="pt-2 border-t mt-3">
                      <p className="text-sm text-gray-600">{cost.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MaintenanceSection({
  maintenance,
  summary,
}: {
  maintenance: MaintenanceRecord[];
  summary?: Order["maintenanceSummary"];
}) {
  return (
    <div className="space-y-4">
      {/* Summary Card */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Tổng quan bảo trì</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Tổng chi phí bảo trì</p>
                <p className="font-semibold text-lg">
                  {formatCurrency(summary.totalMaintenanceCost)}
                </p>
              </div>

              {summary.lastMaintenanceDate && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Bảo trì cuối</p>
                  <p className="font-medium">
                    {formatDate(summary.lastMaintenanceDate)}
                  </p>
                </div>
              )}

              {summary.upcomingMaintenance && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Bảo trì tiếp theo</p>
                  <p className="font-medium">
                    {formatDate(summary.upcomingMaintenance)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Maintenance List */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử bảo trì ({maintenance?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {!maintenance || maintenance.length === 0 ? (
            <div className="py-8 text-center">
              <Wrench className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Chưa có lịch sử bảo trì</p>
            </div>
          ) : (
            <div className="space-y-4">
              {maintenance.map((record, index) => (
                <div key={record.id || index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{record.description}</h4>
                    <Badge variant="outline">{record.maintenanceType}</Badge>
                  </div>

                  <div className="grid gap-2 md:grid-cols-3">
                    <div>
                      <p className="text-sm text-gray-600">Ngày thực hiện</p>
                      <p className="font-medium">
                        {formatDate(record.performedDate)}
                      </p>
                    </div>

                    {record.performedBy && (
                      <div>
                        <p className="text-sm text-gray-600">Người thực hiện</p>
                        <p className="font-medium">{record.performedBy}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm text-gray-600">Chi phí</p>
                      <p className="font-medium">
                        {formatCurrency(record.cost)}
                      </p>
                    </div>
                  </div>

                  {record.notes && (
                    <div className="pt-2 border-t mt-3">
                      <p className="text-sm text-gray-600">{record.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
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
    <div className="container mx-auto p-4 space-y-6">
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
