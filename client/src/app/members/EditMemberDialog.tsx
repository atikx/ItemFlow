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
import { LocalMember, MemberFormData } from "@/types/members.types";

interface EditMemberDialogProps {
  member: LocalMember;
  onUpdateMember: (memberId: string, formData: MemberFormData) => Promise<boolean>;
  isLoading: boolean;
}

export const EditMemberDialog = ({ member, onUpdateMember, isLoading }: EditMemberDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<MemberFormData>({ name: "", batch: "" });

  useEffect(() => {
    if (isOpen) {
      setFormData({ name: member.name, batch: member.batch.toString() });
    }
  }, [isOpen, member]);

  const handleSubmit = async () => {
    const success = await onUpdateMember(member.id, formData);
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
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Member</DialogTitle>
          <DialogDescription>
            Update the member information below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter member name"
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-batch">Batch Year</Label>
            <Input
              id="edit-batch"
              type="number"
              value={formData.batch}
              onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
              placeholder="Enter batch year"
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
                Updating...
              </>
            ) : (
              "Update Member"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
