import { useState } from "react";
import { Button } from "@/components/ui/button";
import MaintenanceFormDialog from "./maintenance-form-dialog";

interface MaintenanceExampleProps {
  orderId: string;
}

/**
 * Example component showing how to use the MaintenanceFormDialog
 * This can be integrated into order detail pages or any other component
 * where maintenance operations need to be performed.
 */
export const MaintenanceExample = ({ orderId }: MaintenanceExampleProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleMaintenanceSuccess = () => {
    console.log("Maintenance created successfully!");
    // You can add additional logic here like refreshing data, showing notifications, etc.
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <h3 className="text-lg font-semibold">Quản lý bảo trì</h3>
        <Button onClick={() => setIsDialogOpen(true)} size="sm">
          Tạo bảo trì mới
        </Button>
      </div>

      <MaintenanceFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        orderId={orderId}
        onSuccess={handleMaintenanceSuccess}
      />
    </div>
  );
};

export default MaintenanceExample;
