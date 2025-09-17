import { Badge } from "@/components/ui";
import { CheckCircle, Clock, InfoIcon, XCircle } from "lucide-react";

type SupplyStatus = "completed" | "cancelled" | "warehouse" | "pending";

interface SupplyStatusBadgeProps {
  status: SupplyStatus;
}
const SupplyStatusBadge = ({ status }: SupplyStatusBadgeProps) => {
  const mapStatus = {
    completed: (
      <Badge variant="outline" color="success">
        <CheckCircle className="w-3 h-3 mr-1" />
        Đã hoàn thành
      </Badge>
    ),
    cancelled: (
      <Badge variant="outline" color="error">
        <XCircle className="w-3 h-3 mr-1" />
        Đã hủy
      </Badge>
    ),
    warehouse: (
      <Badge variant="outline" color="info">
        <InfoIcon className="w-3 h-3 mr-1" />
        Đã nhập kho
      </Badge>
    ),
    pending: (
      <Badge variant="outline" color="warning">
        <Clock className="w-3 h-3 mr-1 animate-pulse" />
        Đang chờ
      </Badge>
    ),
  };
  return <>{mapStatus[status as keyof typeof mapStatus] || null}</>;
};

export default SupplyStatusBadge;
