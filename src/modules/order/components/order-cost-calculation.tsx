import {
  TrendingDown,
  TrendingUp,
  DollarSign,
  Package,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Wrench,
  Box,
  Clipboard,
  Edit,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  CreditCard,
  Link as LinkIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Skeleton,
} from "@/components/ui";
import { formatCurrency } from "@/utils/format";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import type {
  OrderCostCalculation,
  OrderCostBreakdown,
  SupplyBreakdown,
} from "../types";
import { ROUTES } from "@/constants";
import { Link } from "react-router-dom";

interface OrderCostCalculationSectionProps {
  orderId: string;
  costCalculation: OrderCostCalculation | undefined;
  isLoading: boolean;
  error: string | null;
}

export function OrderCostCalculationSection({
  costCalculation,
  isLoading,
  error,
}: OrderCostCalculationSectionProps) {
  if (isLoading) {
    return <CostCalculationSkeleton />;
  }

  if (error || !costCalculation) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">
            {error || "Không thể tải thông tin tính toán chi phí"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const profit = costCalculation.profit;
  const profitMargin = parseFloat(costCalculation.profitMargin);
  const isProfit = profit >= 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ProfitLossCard
          profit={profit}
          profitMargin={profitMargin}
          isProfit={isProfit}
        />
        <SummaryCard
          title="Doanh thu"
          value={costCalculation.totalRevenue}
          icon={<DollarSign className="w-5 h-5" />}
          color="blue"
        />
        <SummaryCard
          title="Chi phí linh kiện"
          value={costCalculation.materialCost}
          icon={<Package className="w-5 h-5" />}
          color="orange"
        />
        <SummaryCard
          title="Chi phí bổ sung"
          value={costCalculation.additionalCosts}
          icon={<DollarSign className="w-5 h-5" />}
          color="gray"
        />
      </div>

      {/* Cost Breakdown */}
      <CostBreakdownSection costBreakdown={costCalculation.costBreakdown} />

      {/* Import Data Status */}
      <ImportDataStatusCard hasImportData={costCalculation.hasImportData} />
    </div>
  );
}

function ProfitLossCard({
  profit,
  profitMargin,
  isProfit,
}: {
  profit: number;
  profitMargin: number;
  isProfit: boolean;
}) {
  return (
    <Card
      className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg ${
        isProfit
          ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50"
          : "border-rose-200 bg-gradient-to-br from-rose-50 to-red-50"
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center space-x-2">
          <div
            className={`p-2 rounded-full ${
              isProfit ? "bg-emerald-100" : "bg-rose-100"
            }`}
          >
            {isProfit ? (
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-600" />
            )}
          </div>
          <CardTitle
            className={`text-sm font-semibold ${
              isProfit ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            {isProfit ? "Lợi nhuận" : "Thua lỗ"}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div
            className={`text-2xl font-bold ${
              isProfit ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            {formatCurrency(Math.abs(profit))}
          </div>
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className={`text-xs font-medium px-2.5 py-1 ${
                isProfit
                  ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                  : "border-rose-300 bg-rose-100 text-rose-700"
              }`}
            >
              {profitMargin >= 0 ? "+" : ""}
              {profitMargin.toFixed(2)}%
            </Badge>
            <span className="text-xs text-gray-600 font-medium">
              Tỷ lệ {isProfit ? "lợi nhuận" : "lỗ"}
            </span>
          </div>
        </div>
        {/* Decorative element */}
        <div
          className={`absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 -mr-10 -mt-10 ${
            isProfit ? "bg-emerald-500" : "bg-rose-500"
          }`}
        ></div>
      </CardContent>
    </Card>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "orange" | "gray";
}) {
  const colorConfig = {
    blue: {
      bg: "bg-gradient-to-br from-blue-50 to-indigo-50",
      border: "border-blue-200",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      textColor: "text-blue-700",
    },
    orange: {
      bg: "bg-gradient-to-br from-orange-50 to-amber-50",
      border: "border-orange-200",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      textColor: "text-orange-700",
    },
    gray: {
      bg: "bg-gradient-to-br from-gray-50 to-slate-50",
      border: "border-gray-200",
      iconBg: "bg-gray-100",
      iconColor: "text-gray-600",
      textColor: "text-gray-700",
    },
  };

  const config = colorConfig[color];

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-200 hover:shadow-md ${config.bg} ${config.border}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-semibold text-gray-700">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-full ${config.iconBg}`}>
          <div className={config.iconColor}>{icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${config.textColor}`}>
          {formatCurrency(value)}
        </div>
        {/* Decorative element */}
        <div
          className={`absolute bottom-0 right-0 w-16 h-16 rounded-full opacity-5 -mr-8 -mb-8 ${config.iconColor.replace(
            "text-",
            "bg-",
          )}`}
        ></div>
      </CardContent>
    </Card>
  );
}

function CostBreakdownSection({
  costBreakdown,
}: {
  costBreakdown: OrderCostBreakdown[];
}) {
  const isMobile = useIsMobile();

  if (!costBreakdown || costBreakdown.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết chi phí</CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Không có dữ liệu chi phí chi tiết</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-800">
              Chi tiết chi phí
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {costBreakdown.length} mặt hàng
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {costBreakdown.map((item, index) => (
            <CostBreakdownItem
              key={`${item.itemId}-${index}`}
              item={item}
              isMobile={isMobile}
            />
          ))}

          {/* Total */}
          <div className="border-t-2 border-orange-100 pt-4 mt-6">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-200">
              <div className="flex md:justify-between items-center flex-col md:flex-row">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                  <span className="font-bold text-lg text-gray-800">
                    Tổng chi phí linh kiện
                  </span>
                </div>
                <span className="text-2xl font-bold text-orange-700 text-wrap text-center md:text-right">
                  {formatCurrency(
                    costBreakdown.reduce(
                      (sum, item) => sum + item.totalCost,
                      0,
                    ),
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CostBreakdownItem({
  item,
  isMobile,
}: {
  item: OrderCostBreakdown;
  isMobile: boolean;
}) {
  const [isSuppliesOpen, setIsSuppliesOpen] = useState(false);

  console.log(item);
  const hasSupplies =
    item.type === "product" && item.supplies && item.supplies.length > 0;
  const hashSourceNumber = !!item.sourceInvoiceNumber;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div
        className={`${
          isMobile ? "space-y-4" : "flex items-center justify-between"
        }`}
      >
        <div className={`${isMobile ? "" : "flex-1"}`}>
          <div className="flex items-center flex-wrap gap-2 mb-3">
            <Badge
              className={`px-3 py-1 font-medium ${
                item.type === "supply"
                  ? "bg-blue-100 text-blue-700 border-blue-300"
                  : "bg-emerald-100 text-emerald-700 border-emerald-300"
              }`}
              variant="outline"
            >
              <div className="flex items-center space-x-1">
                {item.type === "supply" ? (
                  <Wrench className="w-3 h-3" />
                ) : (
                  <Box className="w-3 h-3" />
                )}
                <span>{item.type === "supply" ? "Linh kiện" : "Sản phẩm"}</span>
              </div>
            </Badge>
            <Badge
              className={`px-3 py-1 font-medium ${
                item.source === "import"
                  ? "bg-purple-100 text-purple-700 border-purple-300"
                  : "bg-gray-100 text-gray-700 border-gray-300"
              }`}
              variant="outline"
            >
              <div className="flex items-center space-x-1">
                {item.source === "import" ? (
                  <Clipboard className="w-3 h-3" />
                ) : (
                  <Edit className="w-3 h-3" />
                )}
                <span>
                  {item.source === "import" ? "Từ phiếu nhập" : "Thủ công"}
                </span>
              </div>
            </Badge>
            {hasSupplies && (
              <Badge
                className="bg-amber-100 text-amber-700 border-amber-300 px-3 py-1 font-medium"
                variant="outline"
              >
                <div className="flex items-center space-x-1">
                  <LinkIcon className="w-3 h-3" />
                  <span>{item.supplies!.length} linh kiện</span>
                </div>
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <div>
              <h4 className="font-semibold text-lg text-gray-800 mb-1">
                {item.itemName}
              </h4>
              <p className="text-sm text-gray-500 font-mono">SKU: {item.sku}</p>
              {hashSourceNumber && (
                <Link
                  to={`${ROUTES.DASHBOARD.SUPPLIES.IMPORTS}/${item.sourceImportId}`}
                  className="text-xs text-blue-600 mt-1 font-mono"
                >
                  Mã phiếu nhập: {item.sourceInvoiceNumber}
                </Link>
              )}
            </div>
            {hasSupplies && (
              <button
                onClick={() => setIsSuppliesOpen(!isSuppliesOpen)}
                className="ml-auto flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 hover:scale-105"
                aria-label="Toggle supplies detail"
              >
                {isSuppliesOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>

        <div
          className={`${
            isMobile
              ? "grid grid-cols-2 gap-4 mt-4"
              : "flex items-center space-x-8 mt-4"
          }`}
        >
          <div className="bg-gray-50 rounded-lg p-3 text-center border">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
              Số lượng
            </p>
            <p className="font-bold text-gray-800 text-lg">
              {item.quantity.toLocaleString()}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 text-center border">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
              Đơn giá
            </p>
            <p className="font-bold text-gray-800 wrap-break-word">
              {formatCurrency(item.unitCost)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-3 text-center border border-orange-200">
            <p className="text-xs text-orange-600 font-medium uppercase tracking-wide mb-1">
              Thành tiền
            </p>
            <p className="font-bold text-orange-700 text-lg wrap-break-word">
              {formatCurrency(item.totalCost)}
            </p>
          </div>
        </div>
      </div>

      {/* Supplies Breakdown */}
      {hasSupplies && isSuppliesOpen && (
        <div className="mt-5 pt-5 border-t border-gray-200 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-4 h-4 text-blue-600" />
              </div>
              <h5 className="font-semibold text-blue-800">
                Linh kiện cần thiết
              </h5>
            </div>
            <div className="space-y-3">
              {item.supplies!.map((supply, supplyIndex) => (
                <SupplyBreakdownItem
                  key={`${supply.supplyId}-${supplyIndex}`}
                  supply={supply}
                  isMobile={isMobile}
                />
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="bg-white rounded-lg p-3 border border-blue-300">
                <div className="flex md:justify-between md:items-center flex-col md:flex-row">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-gray-800">
                      Tổng chi phí linh kiện
                    </span>
                  </div>
                  <span className="text-lg font-bold text-orange-700 wrap-break-word text-center md:text-right">
                    {formatCurrency(
                      item.supplies!.reduce(
                        (sum, supply) => sum + supply.totalCost,
                        0,
                      ),
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SupplyBreakdownItem({
  supply,
  isMobile,
}: {
  supply: SupplyBreakdown;
  isMobile: boolean;
}) {
  // Check if current stock is insufficient
  const isStockInsufficient =
    supply.currentStock !== undefined &&
    supply.currentStock < supply.totalQuantityNeeded;

  const hashSourceNumber = supply.sourceInvoiceNumber !== undefined;
  console.log("hashSourceNumber", hashSourceNumber);
  console.log("supply.invoiceNumber", supply);

  return (
    <div
      className={`bg-white rounded-lg p-4 hover:shadow-sm transition-all duration-200 ${
        isStockInsufficient
          ? "border-2 border-red-500 bg-red-50"
          : "border border-gray-200"
      }`}
    >
      <div
        className={`${
          isMobile ? "space-y-3" : "flex items-center justify-between"
        }`}
      >
        <div className={`${isMobile ? "" : "flex-1"}`}>
          <div className="flex items-center flex-wrap gap-2 mb-2 max-w-[300px]">
            <h6 className="font-semibold text-gray-800  text-wrap">
              {supply.supplyName}
            </h6>
            <Badge
              variant="outline"
              className={`text-xs font-medium px-2 py-1 ${
                supply.source === "import"
                  ? "bg-purple-50 text-purple-700 border-purple-300"
                  : "bg-gray-50 text-gray-700 border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-1">
                {supply.source === "import" ? (
                  <Clipboard className="w-3 h-3" />
                ) : (
                  <CreditCard className="w-3 h-3" />
                )}
                <span>
                  {supply.source === "import" ? "Phiếu nhập" : "Giá mua"}
                </span>
              </div>
            </Badge>
          </div>
          <p className="text-xs text-gray-500 font-mono">SKU: {supply.sku}</p>
          {hashSourceNumber && (
            <Link
              to={`${ROUTES.DASHBOARD.SUPPLIES.IMPORTS}/${supply.sourceImportId}`}
              className="text-xs text-blue-600 mt-1 font-mono"
            >
              Mã phiếu nhập: {supply.sourceInvoiceNumber}
            </Link>
          )}
        </div>

        <div
          className={`${
            isMobile
              ? "grid grid-cols-2 gap-3 mt-3"
              : "grid grid-cols-5 gap-4 mt-4"
          }`}
        >
          <div className="bg-gray-50 rounded-lg p-2 text-center border">
            <p className="text-xs text-gray-500 font-medium mb-1">SL/SP</p>
            <p className="font-bold text-gray-800 text-sm">
              {supply.quantityPerProduct}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-2 text-center border">
            <p className="text-xs text-gray-500 font-medium mb-1">Tổng SL</p>
            <p className="font-bold text-gray-800 text-sm">
              {supply.totalQuantityNeeded}
            </p>
          </div>

          {/* Current Stock Display - Always show */}
          <div
            className={`rounded-lg p-2 text-center border ${
              supply.currentStock !== undefined
                ? isStockInsufficient
                  ? "bg-red-100 border-red-300"
                  : "bg-green-50 border-green-200"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <p
              className={`text-xs font-medium mb-1 ${
                supply.currentStock !== undefined
                  ? isStockInsufficient
                    ? "text-red-600"
                    : "text-green-600"
                  : "text-gray-500"
              }`}
            >
              Tồn kho
            </p>
            <p
              className={`font-bold text-sm ${
                supply.currentStock !== undefined
                  ? isStockInsufficient
                    ? "text-red-800"
                    : "text-green-800"
                  : "text-gray-600"
              }`}
            >
              {supply.currentStock !== undefined ? supply.currentStock : "---"}
            </p>
            {supply.currentStock !== undefined && isStockInsufficient && (
              <p className="text-xs text-red-600 mt-1">
                Thiếu: {supply.totalQuantityNeeded - supply.currentStock}
              </p>
            )}
          </div>

          <div className="bg-blue-50 rounded-lg p-2 text-center border border-blue-200">
            <p className="text-xs text-blue-600 font-medium mb-1">Đơn giá</p>
            <p className="font-bold text-blue-700 text-sm wrap-break-word">
              {formatCurrency(supply.unitCost)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-2 text-center border border-orange-200">
            <p className="text-xs text-orange-600 font-medium mb-1">
              Thành tiền
            </p>
            <p className="font-bold text-orange-700 wrap-break-word">
              {formatCurrency(supply.totalCost)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImportDataStatusCard({ hasImportData }: { hasImportData: boolean }) {
  return (
    <Card
      className={`relative overflow-hidden transition-all duration-200 hover:shadow-md ${
        hasImportData
          ? "border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50"
          : "border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50"
      }`}
    >
      <CardContent className="pt-6">
        <div className="flex items-start space-x-4">
          <div
            className={`p-3 rounded-full ${
              hasImportData
                ? "bg-emerald-100 text-emerald-600"
                : "bg-amber-100 text-amber-600"
            }`}
          >
            {hasImportData ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h4
                className={`font-bold text-lg ${
                  hasImportData ? "text-emerald-800" : "text-amber-800"
                }`}
              >
                <div className="flex items-center space-x-2">
                  {hasImportData ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                  <span>
                    {hasImportData
                      ? "Có dữ liệu phiếu nhập"
                      : "Chưa có dữ liệu phiếu nhập"}
                  </span>
                </div>
              </h4>
              <Badge
                variant="outline"
                className={`${
                  hasImportData
                    ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                    : "bg-amber-100 text-amber-700 border-amber-300"
                } px-3 py-1 font-medium`}
              >
                {hasImportData ? "Chính xác" : "Ước tính"}
              </Badge>
            </div>
            <p
              className={`text-sm leading-relaxed ${
                hasImportData ? "text-emerald-700" : "text-amber-700"
              }`}
            >
              <div className="flex items-start space-x-2">
                <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  {hasImportData
                    ? "Chi phí được tính toán dựa trên dữ liệu phiếu nhập thực tế, đảm bảo độ chính xác cao."
                    : "Chi phí được tính toán dựa trên giá mua cấu hình trong sản phẩm/linh kiện. Khuyến nghị cập nhật phiếu nhập để có độ chính xác cao hơn."}
                </span>
              </div>
            </p>
          </div>
        </div>
        {/* Decorative element */}
        <div
          className={`absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 -mr-12 -mt-12 ${
            hasImportData ? "bg-emerald-500" : "bg-amber-500"
          }`}
        ></div>
      </CardContent>
    </Card>
  );
}

function CostCalculationSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-16 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cost Breakdown Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Card Skeleton */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-5 w-5 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-80" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
