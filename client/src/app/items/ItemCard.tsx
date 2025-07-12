
import { Separator } from "@/components/ui/separator";
import { Package } from "lucide-react";
import { Item } from "@/types/item.types";
import { EditItemDialog } from "./EditItemDialog";
import { DeleteItemDialog } from "./DeleteItemDialog";

interface ItemCardProps {
  item: Item;
  onEditItem: (itemId: string, formData: any) => Promise<boolean>;
  onDeleteItem: (id: string, itemName: string) => Promise<boolean>;
  isEditLoading: boolean;
  deletingItemId: string | null;
}

export const ItemCard = ({
  item,
  onEditItem,
  onDeleteItem,
  isEditLoading,
  deletingItemId,
}: ItemCardProps) => {
  const inUse = item.quantityTotal - item.quantityAvailable;

  return (
    <div className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-muted rounded-lg">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-card-foreground">
              {item.name}
            </h3>
            <div className="flex items-center gap-6 mt-2 text-sm text-muted-foreground">
              <span>
                Total:{" "}
                <span className="font-medium text-foreground">
                  {item.quantityTotal}
                </span>
              </span>
              <Separator orientation="vertical" className="h-4" />
              <span>
                Available:{" "}
                <span className="font-medium text-foreground">
                  {item.quantityAvailable}
                </span>
              </span>
              <Separator orientation="vertical" className="h-4" />
              <span>
                In Use:{" "}
                <span className="font-medium text-foreground">
                  {inUse}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <EditItemDialog
            item={item}
            onEditItem={onEditItem}
            isLoading={isEditLoading}
          />
          <DeleteItemDialog
            item={item}
            onDeleteItem={onDeleteItem}
            isDeleting={deletingItemId === item.id}
          />
        </div>
      </div>
    </div>
  );
};
