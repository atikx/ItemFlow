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
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { FormData } from "@/types/inventory.types";
import { Item, Member, Department } from "@/types/itemLogs.types";
import { SearchableSelect } from "./SearchableSelect";

interface IssueItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: Item[];
  members: Member[];
  departments: Department[];
  isLoading: boolean;
  onSubmit: (formData: FormData) => Promise<boolean>;
}

export const IssueItemDialog = ({
  open,
  onOpenChange,
  items,
  members,
  departments,
  isLoading,
  onSubmit,
}: IssueItemDialogProps) => {
  const [formData, setFormData] = useState<FormData>({
    itemId: "",
    issuedBy: "",
    departmentId: "",
    quantityIssued: "",
    expectedReturnDate: "",
  });

  const resetForm = () => {
    setFormData({
      itemId: "",
      issuedBy: "",
      departmentId: "",
      quantityIssued: "",
      expectedReturnDate: "",
    });
  };

  const handleSubmit = async () => {
    const success = await onSubmit(formData);
    if (success) {
      resetForm();
      onOpenChange(false);
    }
  };

  const handleDialogClose = (newOpen: boolean) => {
    if (!newOpen && !isLoading) {
      onOpenChange(false);
      resetForm();
    } else if (newOpen) {
      onOpenChange(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Issue New Item</DialogTitle>
          <DialogDescription>
            Create a new item log by issuing an item to a member.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <SearchableSelect
            label="Item *"
            placeholder="Select an item..."
            searchPlaceholder="Search items..."
            value={formData.itemId}
            onValueChange={(value) => setFormData({ ...formData, itemId: value })}
            options={items.map(item => ({
              value: item.id,
              label: `${item.name} (Available: ${item.quantityAvailable})`
            }))}
            disabled={isLoading}
          />

          <SearchableSelect
            label="Issued By *"
            placeholder="Select a member..."
            searchPlaceholder="Search members..."
            value={formData.issuedBy}
            onValueChange={(value) => setFormData({ ...formData, issuedBy: value })}
            options={[...members]
              .sort((a, b) => b.batch - a.batch)
              .map(member => ({
                value: member.id,
                label: `${member.name} (Batch ${member.batch})`
              }))}
            disabled={isLoading}
          />

          <SearchableSelect
            label="Department *"
            placeholder="Select a department..."
            searchPlaceholder="Search departments..."
            value={formData.departmentId}
            onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
            options={departments.map(dept => ({
              value: dept.id,
              label: dept.name
            }))}
            disabled={isLoading}
          />

          <div className="grid gap-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              value={formData.quantityIssued}
              onChange={(e) => setFormData({ ...formData, quantityIssued: e.target.value })}
              placeholder="Enter quantity"
              min="1"
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="returnDate">Expected Return Date</Label>
            <Input
              id="returnDate"
              type="date"
              value={formData.expectedReturnDate}
              onChange={(e) => setFormData({ ...formData, expectedReturnDate: e.target.value })}
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
                Issuing...
              </>
            ) : (
              "Issue Item"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
