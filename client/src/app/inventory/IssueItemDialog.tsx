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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { Item, Member, Department, ItemLogFormData } from "@/types/itemLogs.types";

interface IssueItemDialogProps {
  items: Item[];
  members: Member[];
  departments: Department[];
  onIssueItem: (formData: ItemLogFormData) => Promise<boolean>;
  isLoading: boolean;
  trigger?: React.ReactNode;
}

export const IssueItemDialog = ({
  items,
  members,
  departments,
  onIssueItem,
  isLoading,
  trigger,
}: IssueItemDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<ItemLogFormData>({
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
    const success = await onIssueItem(formData);
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
    <Button onClick={resetForm} className="gap-2">
      <Plus className="h-4 w-4" />
      Issue Item
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Issue New Item</DialogTitle>
          <DialogDescription>
            Create a new item log by issuing an item to a member.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="item">Item *</Label>
            <Select
              value={formData.itemId}
              onValueChange={(value) => setFormData({ ...formData, itemId: value })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an item" />
              </SelectTrigger>
              <SelectContent>
                {items.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} (Available: {item.quantityAvailable})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="member">Issued To *</Label>
            <Select
              value={formData.issuedBy}
              onValueChange={(value) => setFormData({ ...formData, issuedBy: value })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a member" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name} (Batch {member.batch})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="department">Department *</Label>
            <Select
              value={formData.departmentId}
              onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
