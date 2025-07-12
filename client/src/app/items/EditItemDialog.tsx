"use client"

import { useState, useEffect } from "react";
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
import { Edit, Loader2 } from "lucide-react";
import { Item, ItemFormData } from "@/types/items.types";

interface EditItemDialogProps {
  item: Item;
  onEditItem: (itemId: string, formData: ItemFormData) => Promise<boolean>;
  isLoading: boolean;
}

export const EditItemDialog = ({ item, onEditItem, isLoading }: EditItemDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<ItemFormData>({ name: "", quantityTotal: "" });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: item.name,
        quantityTotal: item.quantityTotal.toString(),
      });
    }
  }, [isOpen, item]);

  const handleSubmit = async () => {
    const success = await onEditItem(item.id, formData);
    if (success) {
      setIsOpen(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open && !isLoading) {
      setIsOpen(false);
    } else if (open) {
      setIsOpen(true);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription>
            Update the item information.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">Item Name</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter item name"
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-quantityTotal">Total Quantity</Label>
            <Input
              id="edit-quantityTotal"
              type="number"
              value={formData.quantityTotal}
              onChange={(e) => setFormData({ ...formData, quantityTotal: e.target.value })}
              placeholder="Enter total quantity"
              min="1"
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label>Current Available Quantity</Label>
            <div className="p-2 bg-muted rounded-md text-sm text-muted-foreground">
              {item.quantityAvailable} (managed by system)
            </div>
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
                Updating...
              </>
            ) : (
              "Update Item"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
