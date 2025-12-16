/* eslint-disable @typescript-eslint/no-explicit-any */
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
  ChevronDown,
  ChevronRight as ChevronRightIcon,
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
import clsx from "clsx";

export interface TableAction<T> {
  key: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (record: T) => void;
  variant?: "default" | "destructive";
  show?: (record: T) => boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface SubTableConfig<T, SubT = any> {
  // Function to check if record has expandable data
  hasSubData?: (record: T) => boolean;
  // Function to get sub data for a record
  getSubData?: (record: T) => SubT[] | Promise<SubT[]>;
  // Sub table columns configuration
  columns: ResponsiveTableColumn<SubT>[];
  // Sub table title (optional)
  title?: (record: T) => string;
  // Loading state for async sub data
  loading?: Set<string | number>;
  // Error state
  error?: Set<string | number>;
  // Actions for sub table rows
  actions?: TableAction<SubT>[];

  onDoubleClick?: (record: T, index: number) => void;
  className?: string;
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

  // Sub-table functionality
  subTable?: SubTableConfig<T>;

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

  // Preserve expanded state on data updates
  preserveExpandedOnUpdate?: boolean;
}

export function EnhancedTable<T = Record<string, unknown>>({
  columns,
  searchable = false,
  searchPlaceholder = "Tìm kiếm...",
  searchValue = "",
  onSearchChange,
  actions = [],
  subTable,
  pagination,
  headerActions,
  title,
  description,
  hasMore = false,
  preserveExpandedOnUpdate = false,
  onLoadMore,
  loadingMore = false,
  isMobile = false,
  ...tableProps
}: EnhancedTableProps<T>) {
  // State for expanded rows
  const [expandedRows, setExpandedRows] = React.useState<Set<string | number>>(
    new Set()
  );
  const [subDataCache, setSubDataCache] = React.useState<
    Map<string | number, unknown[]>
  >(new Map());

  // Infinite scroll for mobile
  const { triggerRef } = useInfiniteScroll({
    hasMore,
    isLoading: loadingMore,
    onLoadMore: onLoadMore || (() => {}),
    threshold: 0.1,
    rootMargin: "100px",
  });

  // Get row key function
  const getRowKey = React.useCallback(
    (record: T, index: number): string | number => {
      if (tableProps.rowKey) {
        if (typeof tableProps.rowKey === "function") {
          return tableProps.rowKey(record);
        }
        return record[tableProps.rowKey] as string | number;
      }
      return index;
    },
    [tableProps.rowKey]
  );

  // Handle row expansion
  const handleRowExpand = React.useCallback(
    async (record: T, index: number) => {
      if (!subTable) return;

      const rowKey = getRowKey(record, index);
      const isExpanded = expandedRows.has(rowKey);

      if (isExpanded) {
        // Collapse row
        setExpandedRows((prev) => {
          const newSet = new Set(prev);
          newSet.delete(rowKey);
          return newSet;
        });
      } else {
        // Expand row
        setExpandedRows((prev) => new Set(prev).add(rowKey));

        // Load sub data if not cached
        if (subTable.getSubData) {
          try {
            const subData = await subTable.getSubData(record);
            setSubDataCache((prev) => new Map(prev).set(rowKey, subData));
          } catch (error) {
            console.error("Failed to load sub data:", error);
            // Could add error state handling here
          }
        }
      }
    },
    [subTable, expandedRows, subDataCache, getRowKey]
  );

  // Add expand column if subTable is enabled
  const enhancedColumns = React.useMemo(() => {
    let resultColumns = [...columns.filter((col) => col.view !== false)];

    // Add expand column at the beginning if subTable is enabled
    if (subTable) {
      const expandColumn: ResponsiveTableColumn<T> = {
        key: "expand",
        title: "",
        width: 40,
        align: "center",
        render: (_, record, index) => {
          const hasData = subTable.hasSubData
            ? subTable.hasSubData(record)
            : true;
          if (!hasData) return null;

          const rowKey = getRowKey(record, index);
          const isExpanded = expandedRows.has(rowKey);
          const isLoading = subTable.loading?.has(rowKey);

          return (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              disabled={isLoading}
              onClick={(e) => {
                e.stopPropagation();
                handleRowExpand(record, index);
              }}
            >
              {isLoading ? (
                <Loading width={12} thickness={2} />
              ) : isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </Button>
          );
        },
      };
      resultColumns = [expandColumn, ...resultColumns];
    }

    // Add actions column if actions are provided
    if (actions.length > 0) {
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
      resultColumns.push(actionColumn);
    }

    return resultColumns;
  }, [columns, actions, subTable, expandedRows, getRowKey, handleRowExpand]);

  // Render expanded row content
  const renderExpandedRow = React.useCallback(
    (record: T, index: number) => {
      if (!subTable) return null;

      const rowKey = getRowKey(record, index);
      const isExpanded = expandedRows.has(rowKey);

      if (!isExpanded) return null;

      const subData = subDataCache.get(rowKey) || [];
      const isLoading = subTable.loading?.has(rowKey);
      const hasError = subTable.error?.has(rowKey);

      return (
        <div className="p-3 bg-muted/30 border-t">
          {subTable.title && (
            <h4 className="text-sm font-medium mb-3">
              {subTable.title(record)}
            </h4>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loading width={16} thickness={2} />
                <span className="text-sm">Đang tải dữ liệu...</span>
              </div>
            </div>
          ) : hasError ? (
            <div className="flex items-center justify-center py-8 text-destructive">
              <span className="text-sm">Có lỗi xảy ra khi tải dữ liệu</span>
            </div>
          ) : subData.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <span className="text-sm">Không có dữ liệu chi tiết</span>
            </div>
          ) : (
            <EnhancedTable
              dataSource={subData}
              columns={subTable.columns}
              actions={subTable.actions}
              showHeader={true}
              className={clsx("bg-background rounded-md", subTable.className)}
              onDoubleClick={subTable.onDoubleClick as any}
            />
          )}
        </div>
      );
    },
    [subTable, expandedRows, subDataCache, getRowKey]
  );

  React.useEffect(() => {
    if (preserveExpandedOnUpdate) {
      // Clear only subDataCache to force refresh of subtable data but keep expanded state
      setSubDataCache(new Map());
    } else {
      // Collapse all rows when data source changes
      setExpandedRows(new Set());
      setSubDataCache(new Map());
    }
  }, [tableProps.dataSource, preserveExpandedOnUpdate]);

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
      <ResponsiveTable<T>
        {...tableProps}
        columns={enhancedColumns}
        expandedRowRender={subTable ? renderExpandedRow : undefined}
      />

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
    (
      key: keyof T,
      title: string,
      view: boolean = true
    ): ResponsiveTableColumn<T> => ({
      key: String(key),
      title,
      dataIndex: key,
      align: "right",
      view: view,
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
