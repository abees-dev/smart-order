import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Supply } from "@/modules/supplies/types";

interface SupplySelectDialogProps {
  supplies: Supply[];
  loading: boolean;
  onSelect: (supply: Supply) => void;
  children: React.ReactNode;
}

export function SupplySelectDialog({
  supplies,
  loading,
  onSelect,
  children,
}: SupplySelectDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredSupplies = supplies.filter((supply) => {
    const matchesSearch =
      supply.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supply.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || supply.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(supplies.map((s) => s.category)));

  const handleSelect = (supply: Supply) => {
    onSelect(supply);
    setOpen(false);
    setSearchTerm("");
    setSelectedCategory("all");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chọn vật tư</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Tìm kiếm vật tư..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tất cả danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredSupplies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Không tìm thấy vật tư nào
                </div>
              ) : (
                filteredSupplies.map((supply) => (
                  <div
                    key={supply.id}
                    onClick={() => handleSelect(supply)}
                    className="p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{supply.name}</p>
                        <p className="text-sm text-muted-foreground">
                          SKU: {supply.sku} • Danh mục: {supply.category}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Đơn vị: {supply.unit} • Tồn kho: {supply.currentStock}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {supply.salePrice.toLocaleString("vi-VN")} ₫
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
