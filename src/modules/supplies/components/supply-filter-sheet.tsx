import { useState, useEffect } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSupplySearch } from "../hooks/use-supply";
import type { SupplyFilters } from "../types";

interface SupplyFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: SupplyFilters;
  onFiltersChange: (filters: SupplyFilters) => void;
}

export function SupplyFilterSheet({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
}: SupplyFilterSheetProps) {
  const [localFilters, setLocalFilters] = useState<SupplyFilters>(filters);
  const { categories, suppliers, loading } = useSupplySearch();

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (
    key: keyof SupplyFilters,
    value: string | boolean | undefined
  ) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
    }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: SupplyFilters = {};
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    return Object.values(localFilters).filter(
      (value) => value !== undefined && value !== "" && value !== false
    ).length;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Lọc vật tư
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary">
                {getActiveFiltersCount()} bộ lọc
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            Sử dụng các bộ lọc để tìm kiếm vật tư theo tiêu chí cụ thể.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Tìm kiếm</Label>
            <Input
              id="search"
              placeholder="Tìm theo tên hoặc SKU..."
              value={localFilters.search || ""}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Danh mục</Label>
            <Select
              value={localFilters.category || ""}
              onValueChange={(value) => handleFilterChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả danh mục</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Supplier */}
          <div className="space-y-2">
            <Label htmlFor="supplier">Nhà cung cấp</Label>
            <Select
              value={localFilters.supplier || ""}
              onValueChange={(value) => handleFilterChange("supplier", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn nhà cung cấp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả nhà cung cấp</SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier} value={supplier}>
                    {supplier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Vị trí lưu trữ</Label>
            <Input
              id="location"
              placeholder="Nhập vị trí lưu trữ..."
              value={localFilters.location || ""}
              onChange={(e) => handleFilterChange("location", e.target.value)}
            />
          </div>

          {/* Status filters */}
          <div className="space-y-4">
            <Label>Trạng thái</Label>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={localFilters.isActive === true}
                  onCheckedChange={(checked) =>
                    handleFilterChange(
                      "isActive",
                      checked === true ? true : undefined
                    )
                  }
                />
                <Label htmlFor="isActive" className="text-sm">
                  Chỉ hiển thị vật tư đang hoạt động
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lowStock"
                  checked={localFilters.lowStock === true}
                  onCheckedChange={(checked) =>
                    handleFilterChange(
                      "lowStock",
                      checked === true ? true : undefined
                    )
                  }
                />
                <Label htmlFor="lowStock" className="text-sm">
                  Chỉ hiển thị vật tư sắp hết hàng
                </Label>
              </div>
            </div>
          </div>

          {/* Active filters display */}
          {getActiveFiltersCount() > 0 && (
            <div className="space-y-2">
              <Label>Bộ lọc đang áp dụng</Label>
              <div className="flex flex-wrap gap-2">
                {localFilters.search && (
                  <Badge variant="outline" className="gap-1">
                    Tìm kiếm: "{localFilters.search}"
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => handleFilterChange("search", "")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {localFilters.category && (
                  <Badge variant="outline" className="gap-1">
                    Danh mục: {localFilters.category}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => handleFilterChange("category", "")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {localFilters.supplier && (
                  <Badge variant="outline" className="gap-1">
                    Nhà cung cấp: {localFilters.supplier}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => handleFilterChange("supplier", "")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {localFilters.location && (
                  <Badge variant="outline" className="gap-1">
                    Vị trí: {localFilters.location}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => handleFilterChange("location", "")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {localFilters.isActive && (
                  <Badge variant="outline" className="gap-1">
                    Đang hoạt động
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => handleFilterChange("isActive", undefined)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {localFilters.lowStock && (
                  <Badge variant="outline" className="gap-1">
                    Sắp hết hàng
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => handleFilterChange("lowStock", undefined)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={handleClearFilters}>
            Xóa tất cả
          </Button>
          <Button onClick={handleApplyFilters} disabled={loading}>
            Áp dụng
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
