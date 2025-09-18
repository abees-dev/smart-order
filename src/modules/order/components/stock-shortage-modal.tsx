import DialogResponsive from "@/components/ui/dialog-responsive";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Package,
  ShoppingCart,
  TrendingDown,
  AlertCircle,
} from "lucide-react";
import type { SupplyShortage } from "../types";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface StockShortageModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortages: SupplyShortage[];
  orderNumber: string;
  onContinueAnyway?: () => void;
  showContinueButton?: boolean;
}

export function StockShortageModal({
  isOpen,
  onClose,
  shortages,
  orderNumber,
  onContinueAnyway,
  showContinueButton = false,
}: StockShortageModalProps) {
  const { t } = useTranslation();

  const totalShortage = shortages.reduce(
    (sum, shortage) => sum + shortage.shortage,
    0
  );

  const actions = {
    cancel: {
      label: t("common.close"),
      onClick: onClose,
      disabled: false,
    },
    ...(showContinueButton &&
      onContinueAnyway && {
        submit: {
          label: t("order.stockShortage.continueAnyway"),
          onClick: onContinueAnyway,
          disabled: false,
        },
      }),
  };

  return (
    <DialogResponsive
      open={isOpen}
      onOpenChange={onClose}
      title={
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          {t("order.stockShortage.title")}
        </div>
      }
      description={t("order.stockShortage.description")}
      className="max-w-5xl"
      actions={actions}
    >
      <div className="space-y-6">
        {/* Summary Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-muted/40 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                {t("order.orderNumber")}
              </span>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-lg font-semibold">{orderNumber}</div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-orange-700 dark:text-orange-400">
                {t("order.stockShortage.totalItems")}
              </span>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </div>
            <div className="text-lg font-semibold text-orange-900 dark:text-orange-300">
              {shortages.length} {t("order.stockShortage.items")}
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-red-700 dark:text-red-400">
                {t("order.stockShortage.totalShortage")}
              </span>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
            <div className="text-lg font-semibold text-red-900 dark:text-red-300">
              -{totalShortage} {t("common.units")}
            </div>
          </div>
        </div>

        {/* Shortage Items */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            {t("order.stockShortage.description")}
          </div>

          {shortages.map((shortage, index) => {
            const availabilityPercentage =
              (shortage.available / shortage.required) * 100;

            return (
              <Card
                key={`${shortage.supplyId}-${index}`}
                className="border-l-4 border-l-destructive/60 hover:shadow-sm transition-shadow"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-2">
                        <Package className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base leading-tight">
                          {shortage.supplyName}
                        </CardTitle>
                        <div className="text-sm text-muted-foreground mt-1">
                          SKU: <span className="font-mono">{shortage.sku}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="destructive" className="shrink-0">
                      -{shortage.shortage} {t("common.units")}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Stock Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {t("order.stockShortage.stockAvailability")}
                      </span>
                      <span
                        className={cn(
                          "font-medium",
                          availabilityPercentage >= 50
                            ? "text-yellow-600"
                            : "text-red-600"
                        )}
                      >
                        {availabilityPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={availabilityPercentage}
                      className="h-2"
                      // Custom color based on availability
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {shortage.available}{" "}
                        {t("order.stockShortage.availableText")}
                      </span>
                      <span>
                        {shortage.required}{" "}
                        {t("order.stockShortage.neededText")}
                      </span>
                    </div>
                  </div>

                  {/* Stock Details Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3">
                      <div className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">
                        {t("order.stockShortage.required")}
                      </div>
                      <div className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                        {shortage.required}
                      </div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3">
                      <div className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">
                        {t("order.stockShortage.available")}
                      </div>
                      <div className="text-sm font-semibold text-green-900 dark:text-green-300">
                        {shortage.available}
                      </div>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3">
                      <div className="text-xs font-medium text-purple-700 dark:text-purple-400 mb-1">
                        {t("order.stockShortage.orderQuantity")}
                      </div>
                      <div className="text-sm font-semibold text-purple-900 dark:text-purple-300">
                        {shortage.orderItemQuantity}
                      </div>
                    </div>

                    <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-3">
                      <div className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">
                        {t("order.stockShortage.shortage")}
                      </div>
                      <div className="text-sm font-semibold text-red-900 dark:text-red-300">
                        -{shortage.shortage}
                      </div>
                    </div>
                  </div>

                  {/* Product Context */}
                  {shortage.usedInProduct && (
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <ShoppingCart className="h-4 w-4 text-slate-600" />
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {t("order.stockShortage.usedInProduct")}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {t("product.name")}:
                          </span>
                          <div className="text-slate-900 dark:text-slate-100 mt-1">
                            {shortage.usedInProduct.productName}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {t("product.code")}:
                          </span>
                          <div className="text-slate-900 dark:text-slate-100 font-mono mt-1">
                            {shortage.usedInProduct.productCode}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {t("order.stockShortage.quantityPerProduct")}:
                          </span>
                          <div className="text-slate-900 dark:text-slate-100 mt-1">
                            {shortage.usedInProduct.quantityPerProduct}{" "}
                            {t("common.units")}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {shortage.error && (
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                        <div className="text-sm text-red-800 dark:text-red-200">
                          <span className="font-medium">
                            {t("common.error")}:
                          </span>{" "}
                          {shortage.error}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DialogResponsive>
  );
}
