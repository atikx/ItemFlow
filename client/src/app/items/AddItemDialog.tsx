import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { ItemFormData } from "@/types/items.types";

interface AddItemDialogProps {
  onAddItem: (formData: ItemFormData) => Promise<boolean>;
  isLoading: boolean;
  trigger?: React.ReactNode;
}

export const AddItemDialog = ({ onAddItem, isLoading, trigger }: AddItemDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<ItemFormData>({ name: "", quantityTotal: "" });

  const resetForm = () => {
    setFormData({ name: "", quantityTotal: "" });
  };

  const handleSubmit = async () => {
    const success = await onAddItem(formData);
    if (success) {
      resetForm();
      setIsOpen(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open && !isLoading) {
      setIsOpen(false);
      resetForm();
    } else if (open) {
      setIsOpen(true);
    }
  };

  const defaultTrigger = (
    <Button size="lg" onClick={resetForm}>
      <Plus className="h-4 w-4 mr-2" />
      Add Item
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
          <DialogDescription>
            Add a new item to your inventory.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Item Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter item name"
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="quantityTotal">Total Quantity</Label>
            <Input
              id="quantityTotal"
              type="number"
              value={formData.quantityTotal}
              onChange={(e) => setFormData({ ...formData, quantityTotal: e.target.value })}
              placeholder="Enter total quantity"
              min="1"
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleDialogClose(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Item"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
