import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ResponsiveTable,
  type ResponsiveTableProps,
  type ResponsiveTableColumn,
} from "./responsive-table";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import Loading from "../ui/loading";

export interface TableAction<T> {
  key: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (record: T) => void;
  variant?: "default" | "destructive";
  show?: (record: T) => boolean;
}

export interface EnhancedTableProps<T>
  extends Omit<ResponsiveTableProps<T>, "columns" | "onDoubleClick"> {
  columns: ResponsiveTableColumn<T>[];
  // Search functionality
  searchable?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;

  // Actions
  actions?: TableAction<T>[];

  // Pagination for desktop
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    showSizeChanger?: boolean;
    pageSizeOptions?: number[];
    onChange: (page: number, pageSize: number) => void;
  };

  // Header actions
  headerActions?: React.ReactNode;
  title?: string;
  description?: string;

  // Infinite loading for mobile
  hasMore?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;

  // Device detection
  isMobile?: boolean;
  onDoubleClick?: (record: T, index: number) => void;
}

export function EnhancedTable<T = Record<string, unknown>>({
  columns,
  searchable = false,
  searchPlaceholder = "Tìm kiếm...",
  searchValue = "",
  onSearchChange,
  actions = [],
  pagination,
  headerActions,
  title,
  description,
  hasMore = false,
  onLoadMore,
  loadingMore = false,
  isMobile = false,
  ...tableProps
}: EnhancedTableProps<T>) {
  // Infinite scroll for mobile
  const { triggerRef } = useInfiniteScroll({
    hasMore,
    isLoading: loadingMore,
    onLoadMore: onLoadMore || (() => {}),
    threshold: 0.1,
    rootMargin: "100px",
  });

  // Add actions column if actions are provided
  const enhancedColumns = React.useMemo(() => {
    if (actions.length === 0) return columns;

    const actionColumn: ResponsiveTableColumn<T> = {
      key: "actions",
      title: "Thao tác",
      width: 80,
      align: "center",
      render: (_, record) => {
        const visibleActions = actions.filter(
          (action) => !action.show || action.show(record)
        );

        if (visibleActions.length === 0) return null;

        if (visibleActions.length === 1) {
          const action = visibleActions[0];
          const Icon = action.icon;

          return (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                action.onClick(record);
              }}
            >
              {Icon && <Icon className="h-4 w-4" />}
            </Button>
          );
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[160px]">
              {visibleActions.map((action) => {
                const Icon = action.icon;
                return (
                  <DropdownMenuItem
                    key={action.key}
                    onClick={() => action.onClick(record)}
                    className={cn(
                      "flex items-center gap-2 cursor-pointer",
                      action.variant === "destructive" &&
                        "text-destructive focus:text-destructive"
                    )}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    {action.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    };

    return [...columns, actionColumn];
  }, [columns, actions]);

  console.log("enhancedColumns render");

  return (
    <div className="space-y-4">
      {/* Header Section */}
      {(title || description || searchable || headerActions) && (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            {title && (
              <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            )}
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {searchable && (
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
            {headerActions}
          </div>
        </div>
      )}

      {/* Table */}
      <ResponsiveTable<T> {...tableProps} columns={enhancedColumns} />

      {/* Infinite Scroll Trigger and Loading for Mobile */}
      {isMobile && (
        <>
          {/* Invisible trigger element for infinite scroll */}
          {hasMore && <div ref={triggerRef} className="h-1" />}

          {/* Loading indicator */}
          {loadingMore && (
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loading width={16} thickness={2} />
                <span className="text-sm">Đang tải thêm dữ liệu...</span>
              </div>
            </div>
          )}

          {/* Fallback load more button (optional, for when auto-scroll fails) */}
          {hasMore && onLoadMore && !loadingMore && (
            <div className="flex justify-center pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  onLoadMore();
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                Hoặc nhấn để tải thêm
              </Button>
            </div>
          )}
        </>
      )}

      {/* Pagination - Only show on desktop */}
      {!isMobile && pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Hiển thị {(pagination.current - 1) * pagination.pageSize + 1} -{" "}
            {Math.min(
              pagination.current * pagination.pageSize,
              pagination.total
            )}{" "}
            trong tổng số {pagination.total} mục
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                pagination.onChange(pagination.current - 1, pagination.pageSize)
              }
              disabled={pagination.current <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Trước
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({
                length: Math.ceil(pagination.total / pagination.pageSize),
              })
                .slice(
                  Math.max(0, pagination.current - 3),
                  Math.min(
                    Math.ceil(pagination.total / pagination.pageSize),
                    pagination.current + 2
                  )
                )
                .map((_, index) => {
                  const pageNumber =
                    Math.max(0, pagination.current - 3) + index + 1;
                  return (
                    <Button
                      key={pageNumber}
                      variant={
                        pageNumber === pagination.current
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() =>
                        pagination.onChange(pageNumber, pagination.pageSize)
                      }
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                pagination.onChange(pagination.current + 1, pagination.pageSize)
              }
              disabled={
                pagination.current >=
                Math.ceil(pagination.total / pagination.pageSize)
              }
            >
              Sau
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced column builder with common patterns
export function useEnhancedTableColumns<T>() {
  const createColumn = React.useCallback(
    (config: ResponsiveTableColumn<T>): ResponsiveTableColumn<T> => ({
      responsive: true,
      align: "left",
      ...config,
    }),
    []
  );

  const createStatusColumn = React.useCallback(
    (key: keyof T, title: string): ResponsiveTableColumn<T> => ({
      key: String(key),
      title,
      dataIndex: key,
      align: "center",
      width: 100,
      render: (value) => (
        <Badge
          variant={"outline"}
          color={value ? "success" : "error"}
          className="text-xs font-medium"
        >
          {value ? "Hoạt động" : "Không hoạt động"}
        </Badge>
      ),
    }),
    []
  );

  const createDateColumn = React.useCallback(
    (key: keyof T, title: string): ResponsiveTableColumn<T> => ({
      key: String(key),
      title,
      dataIndex: key,
      width: 120,
      render: (value) => {
        if (!value) return "-";
        const date = value instanceof Date ? value : new Date(String(value));
        return date.toLocaleDateString("vi-VN");
      },
    }),
    []
  );

  const createCurrencyColumn = React.useCallback(
    (key: keyof T, title: string): ResponsiveTableColumn<T> => ({
      key: String(key),
      title,
      dataIndex: key,
      align: "right",
      width: 120,
      render: (value) => {
        if (value === null || value === undefined) return "-";
        return new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(Number(value));
      },
    }),
    []
  );

  return {
    createColumn,
    createStatusColumn,
    createDateColumn,
    createCurrencyColumn,
  };
}
