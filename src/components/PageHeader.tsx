import type { ReactNode } from "react";
import { Button } from "./ui";
import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  shouldCreateAction: boolean;
  onCreateAction: () => void;
  createActionLabel?: string;
  title: string;
  description?: ReactNode;
  filterActions?: React.ReactNode;
  isBackButton?: boolean;
}
export const PageHeader = ({
  shouldCreateAction,
  onCreateAction,
  createActionLabel,
  title,
  description,
  filterActions,
  isBackButton = false,
}: PageHeaderProps) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-4">
      {isBackButton && (
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-start gap-3">
        <div className="w-full">
          <h1 className="text-lg font-semibold">{title}</h1>
          <div className="text-sm text-muted-foreground">{description}</div>
        </div>
        {shouldCreateAction && (
          <div className="flex gap-2">
            <Button size="sm" onClick={onCreateAction}>
              <Plus className="h-4 w-4 mr-2" />
              {createActionLabel}
            </Button>
          </div>
        )}
      </div>
      {filterActions}
    </div>
  );
};
