import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Package2,
  User,
  Building,
  Hash,
  CheckCircle,
  Clock,
  Loader2,
  Phone,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { ItemLog, Member } from "@/types/itemLogs.types";
import { formatDate, isOverdue } from "@/utils/inventoryUtils";
import { cn } from "@/lib/utils";

interface ItemLogCardProps {
  log: ItemLog;
  getItemName: (itemId: string) => string;
  getMemberName: (memberId: string) => string;
  getDepartmentName: (deptId: string) => string;
  onMarkReturned: (logId: string, returnedBy: string) => void;
  returningLogId: string | null;
  members: Member[];
}

// Fixed SearchableSelect component with custom filter
const SearchableSelect = ({
  value,
  onValueChange,
  options,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  disabled = false,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);

  const selectedOption = options.find((option) => option.value === value);

  // Custom filter function to search by label instead of value
  const filter = (value: string, search: string) => {
    const option = options.find((opt) => opt.value === value);
    if (!option) return 0;
    const label = option.label.toLowerCase();
    return label.includes(search.toLowerCase()) ? 1 : 0;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command filter={filter}>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>No option found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export const ItemLogCard = ({
  log,
  getItemName,
  getMemberName,
  getDepartmentName,
  onMarkReturned,
  returningLogId,
  members,
}: ItemLogCardProps) => {
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [returnedBy, setReturnedBy] = useState("");

  const isReturned = !!log.returnedAt;
  const overdue =
    !log.returnedAt && isOverdue(log.expectedReturnDate, log.returnedAt);
  const itemName = getItemName(log.itemId);

  const handleReturnClick = () => {
    setShowReturnDialog(true);
  };

  const handleReturnSubmit = async () => {
    if (!returnedBy.trim()) return;

    try {
      await onMarkReturned(log.id, returnedBy);
      setReturnedBy("");
      setShowReturnDialog(false);
    } catch (error) {
      console.error("Error returning item:", error);
    }
  };

  const handleDialogClose = (newOpen: boolean) => {
    if (!newOpen && returningLogId !== log.id) {
      setShowReturnDialog(false);
      setReturnedBy("");
    } else if (newOpen) {
      setShowReturnDialog(true);
    }
  };

  const isFormValid = returnedBy.trim() !== "";
  const isLoading = returningLogId === log.id;

  // Prepare options for the select
  const memberOptions = members
    .filter(member => member && member.name && member.name.trim() !== '')
    .sort((a, b) => b.batch - a.batch)
    .map((member) => ({
      value: member.id,
      label: `${member.name} (Batch ${member.batch})`,
    }));

  return (
    <>
      <div key={log.id} className="rounded-lg border bg-card">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Package2 className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">{itemName}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {getMemberName(log.issuedBy)}
                </span>
                {log.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {log.phone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  {getDepartmentName(log.departmentId)}
                </span>
                <span className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  Qty: {log.quantityIssued}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isReturned ? (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Returned
              </Badge>
            ) : overdue ? (
              <Badge variant="destructive">
                <Clock className="h-3 w-3 mr-1" />
                Overdue
              </Badge>
            ) : (
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                Pending
              </Badge>
            )}

            {!isReturned && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReturnClick}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Returning...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Return
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Highlighted Returned By Section */}
        {isReturned && log.returnedBy && (
          <div className="border-t bg-green-50/50 px-6 py-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-green-800">
                Returned by: {getMemberName(log.returnedBy)}
              </span>
              <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
              </Badge>
            </div>
          </div>
        )}

        {log.expectedReturnDate && (
          <div className="border-t px-6 py-3">
            <p className="text-xs text-muted-foreground">
              Expected return: {formatDate(log.expectedReturnDate)}
              {isReturned && ` • Returned: ${formatDate(log.returnedAt)}`}
            </p>
          </div>
        )}
      </div>

      {/* Return Item Dialog */}
      <Dialog open={showReturnDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Return Item</DialogTitle>
            <DialogDescription>
              Mark "{itemName}" as returned. Please select who is returning this
              item.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="returnedBy">Returned By *</Label>
              <SearchableSelect
                value={returnedBy}
                onValueChange={setReturnedBy}
                options={memberOptions}
                placeholder="Select a member..."
                searchPlaceholder="Search members..."
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
            <Button
              onClick={handleReturnSubmit}
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Returning...
                </>
              ) : (
                "Mark as Returned"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
