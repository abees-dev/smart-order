import { useState, useEffect } from "react";
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
  SheetTrigger,
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
import { customerFiltersSchema, type CustomerFiltersData } from "../validation";
import type { CustomerFilters } from "../types";

interface CustomerFilterSheetProps {
  filters: CustomerFilters;
  onFiltersChange: (filters: CustomerFilters) => void;
  onClearFilters: () => void;
}

export function CustomerFilterSheet({
  filters,
  onFiltersChange,
  onClearFilters,
}: CustomerFilterSheetProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const form = useForm<CustomerFiltersData>({
    resolver: zodResolver(customerFiltersSchema),
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
      search: filters.search || "",
      city: filters.city || "",
      country: filters.country || "",
      isActive: filters.isActive,
    });
  }, [filters, form]);

  const onSubmit = (data: CustomerFiltersData) => {
    const newFilters: CustomerFilters = {};

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

    onFiltersChange(newFilters);
    setOpen(false);
  };

  const handleClearFilters = () => {
    const clearValues = {
      search: "",
      city: "",
      country: "",
      isActive: undefined,
    };
    form.reset(clearValues);
    onClearFilters();
    setOpen(false);
  };

  // Count active filters
  const activeFilterCount = Object.keys(filters).length;

  // Common cities for quick selection
  const commonCities = [
    "Hà Nội",
    "Hồ Chí Minh",
    "Đà Nẵng",
    "Hải Phòng",
    "Cần Thơ",
    "Vũng Tàu",
    "Nha Trang",
    "Huế",
    "Vinh",
    "Buôn Ma Thuột",
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="default" className="relative">
          <Filter className="mr-2 h-4 w-4" />
          {t("common.filter")}
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>{t("customers.filterCustomers")}</SheetTitle>
          <SheetDescription>
            {t("customers.filterCustomersDescription")}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mt-6 px-4"
          >
            {/* Search */}
            <FormField
              control={form.control}
              name="search"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("customers.searchByName")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("customers.searchPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* City Filter */}
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("customers.filterByCity")}</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value === "all" ? "" : value);
                    }}
                    value={field.value || "all"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("customers.selectCity")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">{t("common.all")}</SelectItem>
                      {commonCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {/* Status Filter */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("customers.filterByStatus")}</FormLabel>
                  <Select
                    onValueChange={(value: string) => {
                      if (value === "all") {
                        field.onChange(undefined);
                      } else {
                        field.onChange(value === "true");
                      }
                    }}
                    value={
                      field.value === undefined
                        ? "all"
                        : field.value
                        ? "true"
                        : "false"
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("customers.selectStatus")}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">{t("common.all")}</SelectItem>
                      <SelectItem value="true">{t("common.active")}</SelectItem>
                      <SelectItem value="false">
                        {t("common.inactive")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClearFilters}
                disabled={activeFilterCount === 0}
              >
                <X className="mr-2 h-4 w-4" />
                {t("customers.clearFilters")}
              </Button>
              <Button type="submit">{t("customers.applyFilters")}</Button>
            </div>
          </form>
        </Form>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">
              {t("customers.activeFilters")}
            </h4>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="secondary">
                  {t("customers.search")}: {filters.search}
                </Badge>
              )}
              {filters.city && (
                <Badge variant="secondary">
                  {t("customers.city")}: {filters.city}
                </Badge>
              )}
              {filters.country && (
                <Badge variant="secondary">
                  {t("customers.country")}: {filters.country}
                </Badge>
              )}
              {filters.isActive !== undefined && (
                <Badge variant="secondary">
                  {t("customers.status")}:{" "}
                  {filters.isActive ? t("common.active") : t("common.inactive")}
                </Badge>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
