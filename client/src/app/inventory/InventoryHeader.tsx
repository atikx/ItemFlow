import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface InventoryHeaderProps {
  eventName: string;
  onIssueClick: () => void;
}

export const InventoryHeader = ({ eventName, onIssueClick }: InventoryHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Inventory Tracker ({eventName})
        </h1>
        <p className="text-muted-foreground">
          Monitor item issuance and returns
        </p>
      </div>
      <Button onClick={onIssueClick} className="gap-2">
        <Plus className="h-4 w-4" />
        Issue Item
      </Button>
    </div>
  );
};
