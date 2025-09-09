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
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

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

export interface ResponsiveTableProps<T> {
  columns: ResponsiveTableColumn<T>[];
  dataSource: T[];
  loading?: boolean;
  emptyText?: React.ReactNode;
  onRowClick?: (record: T, index: number) => void;
  rowKey?: keyof T | ((record: T) => string | number);
  className?: string;
  mobileCardRender?: (record: T, index: number) => React.ReactNode;
  showHeader?: boolean;
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
}: ResponsiveTableProps<T>) {
  const isMobile = useIsMobile();

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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (dataSource.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">{emptyText}</div>
      </div>
    );
  }

  // Mobile Card View
  if (isMobile && mobileCardRender) {
    return (
      <div className={cn("space-y-3", className)}>
        {dataSource.map((record, index) => (
          <Card
            key={getRowKey(record, index)}
            className={cn(
              "cursor-pointer transition-colors",
              onRowClick && "hover:bg-muted/50"
            )}
            onClick={() => onRowClick?.(record, index)}
          >
            <CardContent className="p-4">
              {mobileCardRender(record, index)}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Desktop/Mobile Table View
  return (
    <Table className={className}>
      {showHeader && (
        <TableHeader>
          <TableRow>
            {responsiveColumns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(
                  "px-2 sm:px-4 py-3",
                  column.align === "center" && "text-center",
                  column.align === "right" && "text-right",
                  column.className
                )}
                style={{ width: column.width }}
              >
                {column.title}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
      )}
      <TableBody>
        {dataSource.map((record, index) => (
          <TableRow
            key={getRowKey(record, index)}
            className={cn(onRowClick && "cursor-pointer", "hover:bg-muted/50")}
            onClick={() => onRowClick?.(record, index)}
          >
            {responsiveColumns.map((column) => (
              <TableCell
                key={column.key}
                className={cn(
                  "px-2 sm:px-4 py-3 align-top",
                  column.key === "customer" && "whitespace-normal",
                  column.key !== "customer" && "whitespace-nowrap",
                  column.align === "center" && "text-center",
                  column.align === "right" && "text-right",
                  column.className
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
