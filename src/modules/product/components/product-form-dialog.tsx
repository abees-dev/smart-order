import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Package,
  DollarSign,
  Box,
  AlertTriangle,
  Trash2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  useProductActions,
  useProductCodeValidation,
} from "../hooks/use-product";
import { useSupplySelect } from "../hooks/use-supply-select";
import { SupplySelectDialog } from "./supply-select-dialog";
import {
  createProductSchema,
  updateProductSchema,
  type CreateProductFormData,
  type UpdateProductFormData,
} from "../validation";
import type { Product, ProductSupply } from "../types";
import type { Supply } from "@/modules/supplies/types";
import { FormSelectField } from "@/components/forms";
import { PRODUCT_CATEGORIES } from "@/constants/category";
import FormTextField from "@/components/forms/form-textfield";
import DialogResponsive from "@/components/ui/dialog-responsive";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (product: Product) => void;
  product?: Product | null;
  mode?: "create" | "edit";
}

export function ProductFormDialog({
  open,
  onOpenChange,
  onSuccess,
  product,
  mode = "create",
}: ProductFormDialogProps) {
  const [supplies, setSupplies] = useState<ProductSupply[]>(
    product?.supplies || []
  );
  const isEditMode = mode === "edit" && product;

  const { createProduct, updateProduct, state } = useProductActions();
  const { checkProductCode } = useProductCodeValidation();
  const { supplies: availableSupplies, loading: suppliesLoading } =
    useSupplySelect();

  const form = useForm<CreateProductFormData | UpdateProductFormData>({
    resolver: zodResolver(
      isEditMode ? updateProductSchema : createProductSchema
    ),
    defaultValues: {
      productCode: product?.productCode ?? "",
      name: product?.name ?? "",
      description: product?.description ?? "",
      category: product?.category ?? "",
      price: product?.price ?? 0,
      cost: product?.cost ?? 0,
      supplies: product?.supplies ?? [],
    },
  });

  const onSubmit = async (
    data: CreateProductFormData | UpdateProductFormData
  ) => {
    try {
      const isValid = await checkProductCode(data.productCode!, product?.id);
      if (!isValid) {
        form.setError("productCode", {
          type: "manual",
          message: "Mã sản phẩm đã tồn tại",
        });
        return;
      }
      const productData = {
        ...data,
        supplies,
        price: Number(
          data.price ||
            supplies.reduce(
              (total, supply) =>
                total + (supply.purchasePrice || 0) * supply.quantity,
              0
            )
        ),
      };

      let result: Product;
      if (isEditMode && product) {
        result = await updateProduct(
          product.id,
          productData as UpdateProductFormData
        );
      } else {
        result = await createProduct(productData as CreateProductFormData);
      }

      form.reset();
      setSupplies([]);
      onSuccess?.(result);
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} product:`,
        error
      );
    }
  };

  const handleAddSupply = (supply: Supply) => {
    const existingSupply = supplies.find((s) => s.supplyId === supply.id);
    if (existingSupply) {
      setSupplies(
        supplies.map((s) =>
          s.supplyId === supply.id ? { ...s, quantity: s.quantity + 1 } : s
        )
      );
    } else {
      setSupplies([
        ...supplies,
        {
          supplyId: supply.id,
          supplyName: supply.name,
          quantity: 1,
          unit: supply.unit,
          purchasePrice: supply.purchasePrice,
        },
      ]);
    }
  };

  const handleUpdateSupplyQuantity = (supplyId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveSupply(supplyId);
      return;
    }
    setSupplies(
      supplies.map((s) => (s.supplyId === supplyId ? { ...s, quantity } : s))
    );
  };

  const handleRemoveSupply = (supplyId: string) => {
    setSupplies(supplies.filter((s) => s.supplyId !== supplyId));
  };

  const formContent = (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 lg:space-y-8"
        id="product-form"
      >
        {/* Basic Information Section */}
        <div className="space-y-3 lg:space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-muted">
            <Package className="h-3 w-3 lg:h-4 lg:w-4 text-primary" />
            <h3 className="font-semibold text-sm text-primary">
              Thông tin cơ bản
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4 items-start">
            <FormTextField
              control={form.control}
              name="productCode"
              label="Mã sản phẩm"
              placeholder="Ví dụ: SP001, CAFE-01"
              required
              type="text"
              helpText="Mã duy nhất để nhận diện sản phẩm"
            />

            <FormTextField
              control={form.control}
              name="name"
              label="Tên sản phẩm"
              placeholder="Nhập tên sản phẩm"
              required
              type="text"
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field, fieldState }) => (
                <FormSelectField
                  required
                  field={field}
                  fieldState={fieldState}
                  label="Danh mục"
                  placeholder="Chọn danh mục"
                  options={PRODUCT_CATEGORIES}
                />
              )}
            />
          </div>

          <FormTextField
            control={form.control}
            name="description"
            label="Mô tả sản phẩm"
            placeholder="Mô tả chi tiết về sản phẩm... "
            required={false}
            type="textarea"
            rows={4}
          />
        </div>

        {/* Pricing Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-muted">
            <DollarSign className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm text-primary">
              Thông tin giá cả
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <FormTextField
              control={form.control}
              name="price"
              label="Giá bán"
              placeholder="0"
              required
              type="number"
              min="0"
              step="1"
              helpText="Giá bán cho khách hàng (VND)"
            />

            <FormTextField
              control={form.control}
              name="cost"
              label="Giá vốn"
              placeholder="0"
              required
              type="number"
              min="0"
              step="1"
              value={
                form.watch("cost") ||
                supplies.reduce(
                  (total, supply) =>
                    total + (supply.purchasePrice || 0) * supply.quantity,
                  0
                )
              }
              helpText="Giá vốn cho sản phẩm (VND)"
            />
          </div>
        </div>

        {/* Supplies Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-muted">
            <Box className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm text-primary">
              Vật tư sản xuất (tùy chọn)
            </h3>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Thêm các vật tư cần thiết để sản xuất sản phẩm này
            </p>
            <SupplySelectDialog
              supplies={availableSupplies}
              loading={suppliesLoading}
              onSelect={handleAddSupply}
            >
              <Button type="button" variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Thêm vật tư
              </Button>
            </SupplySelectDialog>
          </div>

          {supplies.length > 0 && (
            <div className="space-y-2">
              {supplies.map((supply) => (
                <div
                  key={supply.supplyId}
                  className="flex items-center gap-3 p-3 border rounded-md bg-muted/50"
                >
                  <div className="flex-1">
                    <p className="font-medium">{supply.supplyName}</p>
                    <p className="text-sm text-muted-foreground">
                      Đơn vị: {supply.unit}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      value={supply.quantity}
                      onChange={(e) =>
                        handleUpdateSupplyQuantity(
                          supply.supplyId,
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-20 h-8"
                    />
                    <Badge variant="secondary" className="text-xs">
                      {supply.unit}
                    </Badge>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSupply(supply.supplyId)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {state.error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{state.error}</span>
          </div>
        )}
      </form>
    </Form>
  );

  return (
    <DialogResponsive
      className="min-w-[700px]"
      open={open}
      onOpenChange={onOpenChange}
      title={isEditMode ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
      description={
        isEditMode
          ? "Cập nhật thông tin sản phẩm trong hệ thống"
          : "Tạo một sản phẩm mới trong hệ thống"
      }
      formId="product-form"
      actions={{
        cancel: {
          label: "Hủy bỏ",
          onClick: () => onOpenChange(false),
          disabled: state.loading,
        },
        submit: {
          label: isEditMode ? "Cập nhật sản phẩm" : "Tạo sản phẩm",
          disabled: state.loading,
          onClick: () => form.handleSubmit(onSubmit)(),
        },
      }}
    >
      {formContent}
    </DialogResponsive>
  );
}
