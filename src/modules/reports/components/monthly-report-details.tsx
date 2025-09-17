import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CalendarIcon,
  TrendingUpIcon,
  UsersIcon,
  PackageIcon,
  BuildingIcon,
  FileTextIcon,
  LoaderIcon,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { MonthlyReport } from "../types";

interface MonthlyReportDetailsProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  onLoadReport: (month: string) => Promise<MonthlyReport | null>;
}

export function MonthlyReportDetails({
  selectedMonth,
  onMonthChange,
  onLoadReport,
}: MonthlyReportDetailsProps) {
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate month options for the last 12 months
  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      const label = format(date, "MMMM yyyy", { locale: vi });
      options.push({ value, label });
    }

    return options;
  };

  const monthOptions = generateMonthOptions();

  // Load report when month changes
  useEffect(() => {
    if (selectedMonth) {
      loadReport();
    }
  }, [selectedMonth]);

  const loadReport = async () => {
    if (!selectedMonth) return;

    setLoading(true);
    setError(null);

    try {
      const result = await onLoadReport(selectedMonth);
      setReport(result);
    } catch (err) {
      console.error("Error loading monthly report:", err);
      setError(
        err instanceof Error ? err.message : "Có lỗi xảy ra khi tải báo cáo"
      );
    } finally {
      setLoading(false);
    }
  };

  const currentMonthText = selectedMonth
    ? format(new Date(selectedMonth + "-01"), "MMMM yyyy", { locale: vi })
    : "";

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <LoaderIcon className="h-8 w-8 animate-spin mr-2" />
            <span>Đang tải báo cáo chi tiết...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Báo cáo chi tiết tháng
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={selectedMonth} onValueChange={onMonthChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Chọn tháng" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={loadReport}
                disabled={loading || !selectedMonth}
              >
                Làm mới
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {!selectedMonth && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Vui lòng chọn tháng để xem báo cáo chi tiết
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedMonth && !loading && !report && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <FileTextIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Không có dữ liệu báo cáo cho tháng {currentMonthText}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {report && (
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Tóm tắt tháng {currentMonthText}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">
                    {report.summary.totalInputAmount.toLocaleString("vi-VN")}₫
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Hóa đơn đầu vào
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {report.summary.totalOutputAmount.toLocaleString("vi-VN")}₫
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Hóa đơn đầu ra
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">
                    {report.summary.profit.toLocaleString("vi-VN")}₫
                  </div>
                  <p className="text-sm text-muted-foreground">Lợi nhuận gộp</p>
                </div>
                <div className="text-center">
                  <div
                    className={`text-2xl font-bold ${
                      report.summary.netProfit >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {report.summary.netProfit.toLocaleString("vi-VN")}₫
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Lợi nhuận ròng
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Tabs */}
          <Tabs defaultValue="suppliers" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="suppliers">Nhà cung cấp</TabsTrigger>
              <TabsTrigger value="customers">Khách hàng</TabsTrigger>
              <TabsTrigger value="products">Sản phẩm</TabsTrigger>
              <TabsTrigger value="costs">Chi phí phát sinh</TabsTrigger>
            </TabsList>

            {/* Top Suppliers */}
            <TabsContent value="suppliers">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BuildingIcon className="h-5 w-5" />
                    Top nhà cung cấp
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {report.topSuppliers.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Không có dữ liệu nhà cung cấp
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nhà cung cấp</TableHead>
                          <TableHead className="text-right">
                            Tổng tiền
                          </TableHead>
                          <TableHead className="text-right">VAT</TableHead>
                          <TableHead className="text-right">
                            Số hóa đơn
                          </TableHead>
                          <TableHead>Hóa đơn cuối</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.topSuppliers.map((supplier, index) => (
                          <TableRow key={supplier.supplierId}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">#{index + 1}</Badge>
                                <span className="font-medium">
                                  {supplier.supplierName}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {supplier.totalAmount.toLocaleString("vi-VN")}₫
                            </TableCell>
                            <TableCell className="text-right">
                              {supplier.totalVat.toLocaleString("vi-VN")}₫
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="outline">
                                {supplier.invoiceCount}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {format(supplier.lastInvoiceDate, "dd/MM/yyyy", {
                                locale: vi,
                              })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Top Customers */}
            <TabsContent value="customers">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UsersIcon className="h-5 w-5" />
                    Top khách hàng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {report.topCustomers.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Không có dữ liệu khách hàng
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Khách hàng</TableHead>
                          <TableHead className="text-right">
                            Tổng tiền
                          </TableHead>
                          <TableHead className="text-right">VAT</TableHead>
                          <TableHead className="text-right">
                            Số hóa đơn
                          </TableHead>
                          <TableHead>Hóa đơn cuối</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.topCustomers.map((customer, index) => (
                          <TableRow key={customer.customerId || "guest"}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">#{index + 1}</Badge>
                                <span className="font-medium">
                                  {customer.customerName || "Khách vãng lai"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {customer.totalAmount.toLocaleString("vi-VN")}₫
                            </TableCell>
                            <TableCell className="text-right">
                              {customer.totalVat.toLocaleString("vi-VN")}₫
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="outline">
                                {customer.invoiceCount}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {format(customer.lastInvoiceDate, "dd/MM/yyyy", {
                                locale: vi,
                              })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Top Products */}
            <TabsContent value="products">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PackageIcon className="h-5 w-5" />
                    Top sản phẩm/vật tư
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {report.topProducts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Không có dữ liệu sản phẩm
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Sản phẩm/Vật tư</TableHead>
                          <TableHead>Loại</TableHead>
                          <TableHead className="text-right">Số lượng</TableHead>
                          <TableHead className="text-right">
                            Doanh thu
                          </TableHead>
                          <TableHead className="text-right">Giá TB</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.topProducts.map((product, index) => (
                          <TableRow key={product.itemId}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">#{index + 1}</Badge>
                                <div>
                                  <p className="font-medium">
                                    {product.itemName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {product.category}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  product.itemType === "product"
                                    ? "default"
                                    : "outline"
                                }
                              >
                                {product.itemType === "product"
                                  ? "Sản phẩm"
                                  : "Vật tư"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {product.quantitySold.toLocaleString("vi-VN")}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {product.totalRevenue.toLocaleString("vi-VN")}₫
                            </TableCell>
                            <TableCell className="text-right">
                              {product.averagePrice.toLocaleString("vi-VN")}₫
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Additional Costs */}
            <TabsContent value="costs">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUpIcon className="h-5 w-5" />
                    Chi phí phát sinh
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {report.additionalCosts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Không có chi phí phát sinh nào
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                        <div className="text-xl font-bold">
                          Tổng chi phí:{" "}
                          {report.additionalCosts
                            .reduce((sum, cost) => sum + cost.amount, 0)
                            .toLocaleString("vi-VN")}
                          ₫
                        </div>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Ngày</TableHead>
                            <TableHead>Loại chi phí</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead className="text-right">
                              Số tiền
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {report.additionalCosts.map((cost) => (
                            <TableRow key={cost.id}>
                              <TableCell>
                                {format(cost.incurredDate, "dd/MM/yyyy", {
                                  locale: vi,
                                })}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{cost.costType}</Badge>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">
                                    {cost.description}
                                  </p>
                                  {cost.notes && (
                                    <p className="text-xs text-muted-foreground">
                                      {cost.notes}
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                {cost.amount.toLocaleString("vi-VN")}₫
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
