import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Package, DollarSign, Box, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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
import {
  useCreateProduct,
  useUpdateProduct,
} from "../hooks/use-product-actions";
import { toast } from "sonner";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
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
  const [highlightedSupplies, setHighlightedSupplies] = useState<Set<string>>(
    new Set()
  );

  const isEditMode = mode === "edit" && product;

  // Clear highlights when dialog closes or mode changes
  useEffect(() => {
    if (!open) {
      setHighlightedSupplies(new Set());
    }
  }, [open]);

  // Reset supplies when product changes
  useEffect(() => {
    setSupplies(product?.supplies || []);
    setHighlightedSupplies(new Set());
  }, [product]);

  const handleSuccess = () => {
    onSuccess?.();
    form.reset();
    setSupplies([]);
    onOpenChange(false); // Close dialog after successful creation
    if (!isEditMode) {
      toast.success("Tạo sản phẩm thành công");
    } else {
      toast.success("Cập nhật sản phẩm thành công");
    }
  };

  const { updateProduct } = useUpdateProduct({
    onSuccess: handleSuccess,
    onError: (error) => {
      console.error("Error updating product:", error);
      toast.error("Cập nhật sản phẩm thất bại. Vui lòng thử lại.");
    },
  });
  const { createProduct } = useCreateProduct({
    onSuccess: handleSuccess,
    onError: (error) => {
      console.error("Error creating product:", error);
      toast.error("Tạo sản phẩm thất bại. Vui lòng thử lại.");
    },
  });
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
    const productData = {
      ...data,
      supplies: supplies.map((supply) => ({
        supplyId: supply.supplyId,
        quantity: supply.quantity,
      })), // ensure supplies is included
      price: Number(
        data.price ||
          supplies.reduce(
            (total, supply) =>
              total + (supply.purchasePrice || 0) * supply.quantity,
            0
          )
      ),
    };

    if (isEditMode && product) {
      updateProduct({
        id: product.id,
        data: productData as UpdateProductFormData,
      });
    } else {
      createProduct(productData as CreateProductFormData);
    }
  };

  const handleAddSupply = (supply: Supply) => {
    setSupplies((prevSupplies) => {
      const existingSupply = prevSupplies.find((s) => s.supplyId === supply.id);
      if (existingSupply) {
        // If supply already exists, increment quantity
        return prevSupplies.map((s) =>
          s.supplyId === supply.id ? { ...s, quantity: s.quantity + 1 } : s
        );
      } else {
        // If supply doesn't exist, add it
        return [
          {
            supplyId: supply.id,
            supplyName: supply.name,
            quantity: 1,
            unit: supply.unit,
            purchasePrice: supply.purchasePrice,
          },
          ...prevSupplies,
        ];
      }
    });

    // Add highlighting effect for newly added supply in edit mode
    if (isEditMode) {
      setHighlightedSupplies((prev) => new Set(prev).add(supply.id));
    }
  };

  const handleUpdateSupplyQuantity = (supplyId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveSupply(supplyId);
      return;
    }
    setSupplies((prevSupplies) =>
      prevSupplies.map((s) =>
        s.supplyId === supplyId ? { ...s, quantity } : s
      )
    );
  };

  const handleRemoveSupply = (supplyId: string) => {
    setSupplies((prevSupplies) =>
      prevSupplies.filter((s) => s.supplyId !== supplyId)
    );
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
        <div className={`space-y-4 transition-all duration-500`}>
          <div
            className={`flex items-center gap-2 pb-2 border-b transition-colors duration-500`}
          >
            <Box className={`h-4 w-4 transition-colors duration-500`} />
            <h3
              className={`font-semibold text-sm transition-colors duration-500`}
            >
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
                  className={`flex items-center gap-3 p-3 border rounded-md transition-all duration-500 ${
                    isEditMode && highlightedSupplies.has(supply.supplyId)
                      ? "bg-green-50 border-green-100 shadow-md ring-2 ring-green-100 ring-opacity-50"
                      : "bg-muted/50"
                  }`}
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

        {/* {state.error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{state.error}</span>
          </div>
        )} */}
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
        },
        submit: {
          label: isEditMode ? "Cập nhật sản phẩm" : "Tạo sản phẩm",
          onClick: () => {},
        },
      }}
    >
      {formContent}
    </DialogResponsive>
  );
}
