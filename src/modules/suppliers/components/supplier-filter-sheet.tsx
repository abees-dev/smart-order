import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Filter, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  supplierFiltersSchema,
  type SupplierFiltersFormData,
} from "../validation";
import type { SupplierFilters } from "../types";

interface SupplierFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (filters: SupplierFilters) => void;
  initialFilters: SupplierFilters;
}

export function SupplierFilterSheet({
  open,
  onOpenChange,
  onApply,
  initialFilters,
}: SupplierFilterSheetProps) {
  const { t } = useTranslation();

  const form = useForm<SupplierFiltersFormData>({
    resolver: zodResolver(supplierFiltersSchema),
    defaultValues: {
      search: "",
      city: "",
      country: "",
      isActive: undefined,
    },
  });

  // Update form when filters change
  useEffect(() => {
    form.reset({
      search: initialFilters.search || "",
      city: initialFilters.city || "",
      country: initialFilters.country || "",
      isActive: initialFilters.isActive,
    });
  }, [initialFilters, form]);

  const onSubmit = (data: SupplierFiltersFormData) => {
    const newFilters: SupplierFilters = {};

    if (data.search && data.search.trim()) {
      newFilters.search = data.search.trim();
    }
    if (data.city && data.city.trim()) {
      newFilters.city = data.city.trim();
    }
    if (data.country && data.country.trim()) {
      newFilters.country = data.country.trim();
    }
    if (data.isActive !== undefined) {
      newFilters.isActive = data.isActive;
    }

    onApply(newFilters);
  };

  const handleClearFilters = () => {
    const clearValues = {
      search: "",
      city: "",
      country: "",
      isActive: undefined,
    };
    form.reset(clearValues);
    onApply({});
  };

  // Count active filters
  const activeFiltersCount = Object.values(initialFilters).filter(
    (value) => value !== undefined && value !== ""
  ).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t("suppliers.filterSuppliers")}
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {activeFiltersCount}
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            {t("suppliers.filterDescription")}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mt-6"
          >
            <FormField
              control={form.control}
              name="search"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("common.search")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("suppliers.searchPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("common.status")}</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(
                        value === "" ? undefined : value === "true"
                      )
                    }
                    value={field.value === undefined ? "" : String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("common.selectStatus")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">{t("common.all")}</SelectItem>
                      <SelectItem value="true">{t("common.active")}</SelectItem>
                      <SelectItem value="false">
                        {t("common.inactive")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {t("common.apply")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClearFilters}
                className="flex-1"
              >
                <X className="mr-2 h-4 w-4" />
                {t("common.clear")}
              </Button>
            </div>
          </form>
        </Form>

        {/* Active Filters Summary */}
        {activeFiltersCount > 0 && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-sm mb-2">
              {t("common.activeFilters")}
            </h4>
            <div className="space-y-2">
              {initialFilters.search && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("common.search")}:
                  </span>
                  <span className="font-medium">"{initialFilters.search}"</span>
                </div>
              )}
              {initialFilters.city && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("suppliers.city")}:
                  </span>
                  <span className="font-medium">{initialFilters.city}</span>
                </div>
              )}
              {initialFilters.country && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("suppliers.country")}:
                  </span>
                  <span className="font-medium">{initialFilters.country}</span>
                </div>
              )}
              {initialFilters.isActive !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("common.status")}:
                  </span>
                  <Badge
                    variant={initialFilters.isActive ? "default" : "secondary"}
                  >
                    {initialFilters.isActive
                      ? t("common.active")
                      : t("common.inactive")}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
