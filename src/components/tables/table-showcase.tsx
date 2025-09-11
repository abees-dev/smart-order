import React from "react";
import { EnhancedTable, useEnhancedTableColumns } from "@/components/tables";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";

// Demo data interface
interface DemoRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  amount: number;
  date: Date;
}

// Demo data
const demoData: DemoRecord[] = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    phone: "0123456789",
    status: "active",
    amount: 1500000,
    date: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "Trần Thị B",
    email: "tranthib@email.com",
    phone: "0987654321",
    status: "inactive",
    amount: 2300000,
    date: new Date("2024-01-20"),
  },
  {
    id: "3",
    name: "Lê Văn C",
    email: "levanc@email.com",
    phone: "0555666777",
    status: "active",
    amount: 890000,
    date: new Date("2024-01-25"),
  },
];

export function TableShowcasePage() {
  const [data, setData] = React.useState<DemoRecord[]>(demoData);
  const [loading, setLoading] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const {
    createColumn,
    createStatusColumn,
    createDateColumn,
    createCurrencyColumn,
  } = useEnhancedTableColumns<DemoRecord>();

  // Filter data based on search
  const filteredData = React.useMemo(() => {
    if (!searchValue) return data;
    return data.filter(
      (item) =>
        item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.email.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.phone.includes(searchValue)
    );
  }, [data, searchValue]);

  const columns = [
    createColumn({
      key: "user",
      title: "Thông tin người dùng",
      render: (_, record) => (
        <div className="space-y-1">
          <div className="font-semibold text-foreground">{record.name}</div>
          <div className="text-sm text-muted-foreground">{record.email}</div>
          <div className="text-xs text-muted-foreground font-mono">
            {record.phone}
          </div>
        </div>
      ),
    }),
    createStatusColumn("status", "Trạng thái"),
    createCurrencyColumn("amount", "Số tiền"),
    createDateColumn("date", "Ngày tạo"),
  ];

  const actions = [
    {
      key: "view",
      label: "Xem chi tiết",
      icon: Eye,
      onClick: (record: DemoRecord) => {
        console.log("View:", record);
        alert(`Xem chi tiết: ${record.name}`);
      },
    },
    {
      key: "edit",
      label: "Chỉnh sửa",
      icon: Pencil,
      onClick: (record: DemoRecord) => {
        console.log("Edit:", record);
        alert(`Chỉnh sửa: ${record.name}`);
      },
    },
    {
      key: "delete",
      label: "Xóa",
      icon: Trash2,
      variant: "destructive" as const,
      onClick: (record: DemoRecord) => {
        if (confirm(`Bạn có chắc muốn xóa ${record.name}?`)) {
          setData((prev) => prev.filter((item) => item.id !== record.id));
        }
      },
    },
  ];

  const mobileCardRender = (record: DemoRecord) => (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="font-semibold">{record.name}</h3>
          <p className="text-sm text-muted-foreground">{record.email}</p>
        </div>
        <div>
          {createStatusColumn("status", "Status").render?.(
            record.status,
            record,
            0
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-muted-foreground">Số tiền:</span>
          <p className="font-semibold">
            {createCurrencyColumn("amount", "Amount").render?.(
              record.amount,
              record,
              0
            )}
          </p>
        </div>
        <div>
          <span className="text-muted-foreground">Ngày:</span>
          <p className="font-medium">
            {createDateColumn("date", "Date").render?.(record.date, record, 0)}
          </p>
        </div>
      </div>
    </div>
  );

  const handleAddNew = () => {
    const newRecord: DemoRecord = {
      id: Date.now().toString(),
      name: `Người dùng ${data.length + 1}`,
      email: `user${data.length + 1}@email.com`,
      phone: `09${Math.floor(Math.random() * 100000000)}`,
      status: Math.random() > 0.5 ? "active" : "inactive",
      amount: Math.floor(Math.random() * 5000000) + 100000,
      date: new Date(),
    };

    setData((prev) => [newRecord, ...prev]);
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const handleLoadMore = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const newRecords: DemoRecord[] = Array.from({ length: 3 }, (_, i) => ({
        id: `${Date.now()}-${i}`,
        name: `Người dùng mới ${i + 1}`,
        email: `newuser${i + 1}@email.com`,
        phone: `09${Math.floor(Math.random() * 100000000)}`,
        status: (Math.random() > 0.5 ? "active" : "inactive") as
          | "active"
          | "inactive",
        amount: Math.floor(Math.random() * 3000000) + 100000,
        date: new Date(),
      }));

      setData((prev) => [...prev, ...newRecords]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="container mx-auto p-6">
      <EnhancedTable<DemoRecord>
        title="Bảng dữ liệu tối ưu"
        description="Thử nghiệm các tính năng mới của bảng: tìm kiếm, sắp xếp, responsive, loading states và mobile cards"
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        loading={false}
        emptyText="Không có dữ liệu để hiển thị"
        actions={actions}
        hasMore={true}
        onLoadMore={handleLoadMore}
        loadingMore={loading}
        searchable
        searchPlaceholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
        searchValue={searchValue}
        onSearchChange={handleSearch}
        mobileCardRender={mobileCardRender}
        headerActions={
          <Button onClick={handleAddNew} className="shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            Thêm mới
          </Button>
        }
      />
    </div>
  );
}
