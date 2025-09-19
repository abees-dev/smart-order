import * as React from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type TableProps,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileX } from "lucide-react";

export interface ResponsiveTableColumn<T> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
  width?: string | number;
  align?: "left" | "center" | "right";
  responsive?: boolean; // Hide on mobile if false
  sortable?: boolean;
  className?: string;
}

export interface ResponsiveTableProps<T>
  extends Omit<TableProps, "onDoubleClick"> {
  columns: ResponsiveTableColumn<T>[];
  dataSource: T[];
  loading?: boolean;
  emptyText?: React.ReactNode;
  onRowClick?: (record: T, index: number) => void;
  rowKey?: keyof T | ((record: T) => string | number);
  className?: string;
  mobileCardRender?: (record: T, index: number) => React.ReactNode;
  showHeader?: boolean;
  loadingRows?: number;
  onDoubleClick?: (record: T, index: number) => void;
}

export function ResponsiveTable<T = Record<string, unknown>>({
  columns,
  dataSource,
  loading = false,
  emptyText = "No data",
  onRowClick,
  rowKey,
  className,
  mobileCardRender,
  showHeader = true,
  loadingRows = 5,
  onDoubleClick,
  ...other
}: ResponsiveTableProps<T>) {
  const isMobile = useIsMobile();

  console.log("Rendering table skeleton with", other, "rows");

  const getRowKey = React.useCallback(
    (record: T, index: number): string => {
      if (rowKey) {
        if (typeof rowKey === "function") {
          return String(rowKey(record));
        }
        return String(record[rowKey]);
      }
      return String(index);
    },
    [rowKey]
  );

  const responsiveColumns = React.useMemo(() => {
    if (!isMobile) return columns;
    return columns.filter((col) => col.responsive !== false);
  }, [columns, isMobile]);

  const renderCellValue = React.useCallback(
    (
      column: ResponsiveTableColumn<T>,
      record: T,
      index: number
    ): React.ReactNode => {
      if (column.render) {
        return column.render(
          column.dataIndex ? record[column.dataIndex] : undefined,
          record,
          index
        );
      }
      const value = column.dataIndex ? record[column.dataIndex] : "";
      return String(value);
    },
    []
  );

  // Loading Skeleton Component
  const LoadingSkeleton = () => {
    if (isMobile && mobileCardRender) {
      return (
        <div className={cn("space-y-3", className)}>
          {Array.from({ length: loadingRows }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    return (
      <Table className={className} {...other}>
        {showHeader && (
          <TableHeader>
            <TableRow>
              {responsiveColumns.map((column) => (
                <TableHead key={column.key}>
                  <Skeleton className="h-4 w-full" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        )}
        <TableBody>
          {Array.from({ length: loadingRows }).map((_, index) => (
            <TableRow key={index}>
              {responsiveColumns.map((column) => (
                <TableCell key={column.key}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  // Enhanced Empty State Component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/30 mb-4">
        <FileX className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-foreground">
          Không có dữ liệu
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          {typeof emptyText === "string"
            ? emptyText
            : "Chưa có dữ liệu để hiển thị"}
        </p>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (dataSource.length === 0) {
    return <EmptyState />;
  }

  const actionsColumn = columns.find((col) => col.key === "actions");

  // Mobile Card View
  if (isMobile && mobileCardRender) {
    return (
      <div className={cn("space-y-3", className)}>
        {dataSource.map((record, index) => (
          <Card
            key={getRowKey(record, index)}
            className={cn(
              "group transition-all duration-200 border-border/50 hover:border-border hover:shadow-md",
              onRowClick && "cursor-pointer active:scale-[0.98]"
            )}
            onClick={() => onRowClick?.(record, index)}
          >
            <CardContent className="p-5">
              {actionsColumn && actionsColumn.render && (
                <div className="flex justify-end">
                  {actionsColumn?.render(record, record, index)}
                </div>
              )}
              {mobileCardRender(record, index)}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Desktop/Mobile Table View

  const isHasActions = Boolean(actionsColumn);
  const borderNumberLast = isHasActions ? 2 : 1;
  return (
    <Table className={className} {...other}>
      {showHeader && (
        <TableHeader>
          <TableRow className="hover:bg-transparent !border-b !border-border/80">
            {responsiveColumns.map((column, colIndex) => (
              <TableHead
                key={column.key}
                className={cn(
                  "text-xs uppercase font-bold tracking-wider",
                  column.align === "center" && "text-center",
                  column.align === "right" && "text-right",
                  column.className,
                  {
                    "sticky right-0 bg-muted/30 border-l-inner":
                      column.key === "actions",
                    "border-r":
                      colIndex !==
                        responsiveColumns.length - borderNumberLast &&
                      column.key !== "actions",
                  }
                )}
                style={{ width: column.width }}
              >
                {column.key === "actions" ? "" : column.title}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
      )}
      <TableBody>
        {dataSource.map((record, index) => (
          <TableRow
            key={getRowKey(record, index)}
            onDoubleClick={() => onDoubleClick?.(record, index)}
            className={cn(
              "transition-all duration-200",
              onRowClick && "cursor-pointer active:bg-muted/60",
              "group",
              {
                "border-b border-border/80": index !== dataSource.length - 1,
              }
            )}
            onClick={() => onRowClick?.(record, index)}
          >
            {responsiveColumns.map((column, colIndex) => (
              <TableCell
                key={column.key}
                className={cn(
                  "relative",
                  column.key === "customer" &&
                    "whitespace-normal min-w-[200px]",
                  column.key !== "customer" && "whitespace-nowrap",
                  column.align === "center" && "text-center",
                  column.align === "right" && "text-right",
                  column.className,
                  {
                    "sticky right-0 bg-background border-l-inner":
                      column.key === "actions",
                    "border-r":
                      colIndex !==
                        responsiveColumns.length - borderNumberLast &&
                      column.key !== "actions",
                  }
                )}
              >
                {renderCellValue(column, record, index)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// Hook for table column configuration
export function useResponsiveTableColumns<T>() {
  const isMobile = useIsMobile();

  const createColumn = React.useCallback(
    (config: ResponsiveTableColumn<T>): ResponsiveTableColumn<T> => ({
      responsive: true,
      align: "left",
      ...config,
    }),
    []
  );

  const createMobileHiddenColumn = React.useCallback(
    (
      config: Omit<ResponsiveTableColumn<T>, "responsive">
    ): ResponsiveTableColumn<T> => ({
      ...config,
      responsive: false,
    }),
    []
  );

  return {
    isMobile,
    createColumn,
    createMobileHiddenColumn,
  };
}
