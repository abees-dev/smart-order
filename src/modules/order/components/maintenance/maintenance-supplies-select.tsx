import { useState, useCallback } from "react";
import {
  useFieldArray,
  type Control,
  type UseFormSetValue,
  type UseFormGetValues,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SupplySelect } from "@/components/forms/supply-select";
import { X, Plus } from "lucide-react";
import type { Supply } from "@/modules/supplies/types";
import type { CreateMaintenanceFormData } from "../../validation";

interface MaintenanceSuppliesSelectProps {
  control: Control<CreateMaintenanceFormData>;
  setValue: UseFormSetValue<CreateMaintenanceFormData>;
  getValues: UseFormGetValues<CreateMaintenanceFormData>;
  className?: string;
}

export function MaintenanceSuppliesSelect({
  control,
  getValues,
  setValue,
  className,
}: MaintenanceSuppliesSelectProps) {
  const [selectedSupplies, setSelectedSupplies] = useState<Map<number, Supply>>(
    new Map()
  );

  const { fields, append, remove } = useFieldArray({
    control,
    name: "supplies",
  });

  const handleAddSupply = () => {
    append({
      supplyId: "",
      quantity: 1,
      unitPrice: 0,
      notes: "",
    });
  };

  const handleRemoveSupply = useCallback(
    (index: number) => {
      remove(index);
      setSelectedSupplies((prev) => {
        const newMap = new Map(prev);
        newMap.delete(index);
        return newMap;
      });
    },
    [remove]
  );

  const handleSupplySelect = useCallback(
    (index: number, supply: Supply | null) => {
      setSelectedSupplies((prev) => {
        const newMap = new Map(prev);
        if (supply) {
          newMap.set(index, supply);
        } else {
          newMap.delete(index);
        }
        return newMap;
      });
      setValue(`supplies.${index}.unitPrice`, supply?.purchasePrice || 0);
    },
    []
  );

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <Label className="text-sm font-medium">Vật tư sử dụng</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddSupply}
          className="h-8"
        >
          <Plus className="h-4 w-4 mr-1" />
          Thêm vật tư
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">Chưa có vật tư nào được chọn</p>
          <p className="text-xs mt-1">
            Nhấn "Thêm vật tư" để thêm vật tư cần thiết cho bảo trì
          </p>
        </div>
      )}

      <div className="space-y-4">
        {fields.map((field, index) => {
          const selectedSupply = selectedSupplies.get(index);

          return (
            <Card key={field.id} className="relative">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveSupply(index)}
                className="absolute top-2 right-2 h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>

              <CardHeader className="pb-3">
                <CardTitle className="text-sm">
                  Vật tư #{index + 1}
                  {selectedSupply && (
                    <span className="text-xs font-normal text-muted-foreground ml-2">
                      {selectedSupply.name} - {selectedSupply.sku}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <FormField
                  control={control}
                  name={`supplies.${index}.supplyId`}
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Chọn vật tư</FormLabel>
                      <SupplySelect
                        value={field.value}
                        onValueChange={field.onChange}
                        onSupplySelect={(supply) =>
                          handleSupplySelect(index, supply)
                        }
                        placeholder="Tìm kiếm và chọn vật tư..."
                        error={fieldState.error?.message}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4 items-start">
                  <FormField
                    control={control}
                    name={`supplies.${index}.quantity`}
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Số lượng</FormLabel>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          placeholder="1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value) || 1)
                          }
                          className={
                            fieldState.error ? "border-destructive" : ""
                          }
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`supplies.${index}.unitPrice`}
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Đơn giá</FormLabel>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value) || 0)
                          }
                          className={
                            fieldState.error ? "border-destructive" : ""
                          }
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormLabel>Thành tiền</FormLabel>
                    <div className="h-9 px-3 py-2 bg-muted rounded-md flex items-center">
                      <span className="text-sm font-mono">
                        {(() => {
                          const values = getValues();
                          const quantity =
                            values.supplies?.[index]?.quantity || 0;
                          const unitPrice =
                            values.supplies?.[index]?.unitPrice || 0;
                          const total = quantity * unitPrice;
                          return new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(total);
                        })()}
                      </span>
                    </div>
                    {selectedSupply?.unit && (
                      <div className="text-xs text-muted-foreground">
                        Đơn vị: {selectedSupply.unit}
                      </div>
                    )}
                  </div>
                </div>

                <FormField
                  control={control}
                  name={`supplies.${index}.notes`}
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Ghi chú (tùy chọn)</FormLabel>
                      <Input
                        placeholder="Ghi chú về vật tư này..."
                        {...field}
                        className={fieldState.error ? "border-destructive" : ""}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {fields.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Tổng số vật tư:</span>
                <span>{fields.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Tổng chi phí vật tư:</span>
                <span className="font-mono">
                  {(() => {
                    const values = getValues();
                    const total = (values.supplies || []).reduce(
                      (sum, supply) => {
                        return (
                          sum + (supply.quantity || 0) * (supply.unitPrice || 0)
                        );
                      },
                      0
                    );
                    return new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(total);
                  })()}
                </span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Tối đa 20 vật tư có thể được sử dụng trong một lần bảo trì
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MaintenanceSuppliesSelect;
