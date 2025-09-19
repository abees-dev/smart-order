import { Button } from "./ui";
import { Plus } from "lucide-react";

interface PageHeaderProps {
  shouldCreateAction: boolean;
  onCreateAction: () => void;
  createActionLabel: string;
  title: string;
  description: string;
  filterActions: React.ReactNode;
}
export const PageHeader = ({
  shouldCreateAction,
  onCreateAction,
  createActionLabel,
  title,
  description,
  filterActions,
}: PageHeaderProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row justify-between items-start gap-3">
        <div>
          <h1 className="text-lg font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground hidden md:block">
            {description}
          </p>
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
