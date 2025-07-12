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
import { Edit3 } from "lucide-react";
import { ItemLog } from "@/types/itemLogs.types";

interface EditQuantityDialogProps {
  log: ItemLog;
  onUpdateQuantity: (logId: string, newQuantity: number) => void;
}

export const EditQuantityDialog = ({ log, onUpdateQuantity }: EditQuantityDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    if (isOpen) {
      setQuantity(log.quantityIssued.toString());
    }
  }, [isOpen, log.quantityIssued]);

  const handleSubmit = () => {
    const newQuantity = parseInt(quantity);
    if (newQuantity > 0) {
      onUpdateQuantity(log.id, newQuantity);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="opacity-70 group-hover:opacity-100 transition-opacity"
        >
          <Edit3 className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Quantity</DialogTitle>
          <DialogDescription>
            Update the quantity for this item log.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-quantity">Quantity</Label>
            <Input
              id="edit-quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              min="1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Update Quantity</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
