"use client";

import { useEffect, useState } from "react";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Package2,
  Clock,
  CheckCircle,
  Edit3,
  Calendar,
  User,
  Building,
  Hash,
  Filter,
  TrendingUp,
  Loader2,
  AlertCircle,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Item,
  Member,
  Department,
  ItemLog,
  ItemLogFormData,
  EditQuantityFormData,
} from "@/types/itemLogs.types";
import { useMutation, useQuery } from "@apollo/client";
import {
  CREATE_ITEM_LOG,
  GET_ITEM_LOGS,
  RETURN_ITEM_LOG,
} from "@/graphql/itemLogs.graphql";
import { GET_MEMBERS } from "@/graphql/members.graphql";
import { GET_DEPARTMENTS } from "@/graphql/departments.graphql";
import { GET_ITEMS } from "@/graphql/items.graphql";
import { useRouter } from "next/navigation";

export default function InventoryPage() {
  const [eventId, setEventId] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [itemLogs, setItemLogs] = useState<ItemLog[]>([]);
  const [eventName, seteventName] = useState("");
  const router = useRouter();
  // Popover states for searchable dropdowns
  const [itemOpen, setItemOpen] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);
  const [departmentOpen, setDepartmentOpen] = useState(false);
  const [redirecting, setRedirecting] = useState(false); // 

  // Return mutation loading state
  const [returningLogId, setReturningLogId] = useState<string | null>(null);

  // Set eventId first so it can be used in the query
  useEffect(() => {
    const storedEventId = localStorage.getItem("eventId");
    if (!storedEventId) {
      setRedirecting(true);
      toast.error("No event selected. Please select an event first.");
      router.push("/events");
    }
    const storedEventName = localStorage.getItem("eventName") || "Event";
    seteventName(storedEventName);
    storedEventId && setEventId(storedEventId);
    console.log("Using eventId:", storedEventId);
    console.log("Using eventName:", storedEventName);
  }, [eventId]);

  // GraphQL queries
  const {
    data: itemLogsData,
    loading: itemLogsLoading,
    error: itemLogsError,
    refetch: refetchItemLogs,
  } = useQuery(GET_ITEM_LOGS, {
    variables: {
      eventId: eventId,
    },
    skip: !eventId || redirecting, // Skip query until eventId is set
  });

  const {
    data: membersData,
    loading: membersLoading,
    error: membersError,
  } = useQuery(GET_MEMBERS);

  const {
    data: departmentsData,
    loading: departmentsLoading,
    error: departmentsError,
  } = useQuery(GET_DEPARTMENTS);

  const {
    data: itemsData,
    loading: itemsLoading,
    error: itemsError,
  } = useQuery(GET_ITEMS);

  const [createItemLog] = useMutation(CREATE_ITEM_LOG, {
    refetchQueries: [
      { query: GET_ITEM_LOGS, variables: { eventId } },
      { query: GET_ITEMS },
    ],
  });

  const [returnItemLog] = useMutation(RETURN_ITEM_LOG, {
    refetchQueries: [
      { query: GET_ITEM_LOGS, variables: { eventId } },
      { query: GET_ITEMS },
    ],
  });

  // Update local state when GraphQL data changes
  useEffect(() => {
    if (membersData?.members) {
      setMembers(membersData.members);
    }
  }, [membersData]);

  useEffect(() => {
    if (departmentsData?.departments) {
      setDepartments(departmentsData.departments);
    }
  }, [departmentsData]);

  useEffect(() => {
    if (itemsData?.items) {
      setItems(itemsData.items);
    }
  }, [itemsData]);

  useEffect(() => {
    if (itemLogsData?.itemLogs) {
      setItemLogs(itemLogsData.itemLogs);
    }
  }, [itemLogsData]);

  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<ItemLog | null>(null);
  const [formData, setFormData] = useState<ItemLogFormData>({
    itemId: "",
    issuedBy: "",
    departmentId: "",
    quantityIssued: "",
    expectedReturnDate: "",
  });
  const [editQuantityData, setEditQuantityData] =
    useState<EditQuantityFormData>({
      quantityIssued: "",
    });
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isCreateLoading, setIsCreateLoading] = useState(false);

  const handleIssueItem = async () => {
    if (
      !formData.itemId ||
      !formData.issuedBy ||
      !formData.departmentId ||
      !formData.quantityIssued
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const quantity = parseInt(formData.quantityIssued);
    if (quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    setIsCreateLoading(true);

    try {
      const res = await createItemLog({
        variables: {
          createItemLogInput: {
            itemId: formData.itemId,
            eventId: eventId,
            issuedBy: formData.issuedBy,
            quantityIssued: quantity,
            expectedReturnDate: formData.expectedReturnDate || null,
            departmentId: formData.departmentId,
          },
        },
      });

      console.log("Item log created:", res.data.createItemLog);
      setFormData({
        itemId: "",
        issuedBy: "",
        departmentId: "",
        quantityIssued: "",
        expectedReturnDate: "",
      });
      setIsIssueDialogOpen(false);
      toast.success("Item issued successfully!");
    } catch (error: any) {
      console.error("Error creating item log:", error);
      const errorMessage =
        error?.message || "Failed to issue item. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsCreateLoading(false);
    }
  };

  const handleMarkReturned = async (logId: string) => {
    setReturningLogId(logId);

    try {
      const res = await returnItemLog({
        variables: { returnItemLogId: logId },
      });

      console.log("Item returned:", res.data);
      toast.success("Item marked as returned!");
    } catch (error: any) {
      console.error("Error marking item as returned:", error);
      const errorMessage =
        error?.message || "Failed to mark item as returned. Please try again.";
      toast.error(errorMessage);
    } finally {
      setReturningLogId(null);
    }
  };

  const handleEditQuantity = () => {
    if (!editingLog || !editQuantityData.quantityIssued.trim()) {
      toast.error("Please enter a valid quantity");
      return;
    }

    const quantity = parseInt(editQuantityData.quantityIssued);
    if (quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    const updatedLogs = itemLogs.map((log) =>
      log.id === editingLog.id ? { ...log, quantityIssued: quantity } : log
    );

    console.log("Updating quantity for log:", editingLog.id, "to:", quantity);
    setItemLogs(updatedLogs);
    setEditingLog(null);
    setEditQuantityData({ quantityIssued: "" });
    setIsEditDialogOpen(false);
    toast.success("Quantity updated successfully!");
  };

  const openEditDialog = (log: ItemLog) => {
    setEditingLog(log);
    setEditQuantityData({ quantityIssued: log.quantityIssued.toString() });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      itemId: "",
      issuedBy: "",
      departmentId: "",
      quantityIssued: "",
      expectedReturnDate: "",
    });
  };

  const handleDialogClose = (open: boolean) => {
    if (!open && !isCreateLoading) {
      setIsIssueDialogOpen(false);
      resetForm();
    } else if (open) {
      setIsIssueDialogOpen(true);
    }
  };

  const getItemName = (itemId: string) => {
    const realItem = items.find((item) => item.id === itemId);
    return realItem?.name || "Unknown Item";
  };

  const getMemberName = (memberId: string) => {
    const realMember = members.find((member) => member.id === memberId);
    return realMember?.name || "Unknown Member";
  };

  const getDepartmentName = (deptId: string) => {
    const realDept = departments.find((dept) => dept.id === deptId);
    return realDept?.name || "Unknown Department";
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    // Handle timestamp format (milliseconds since epoch)
    const timestamp = parseInt(dateString);
    if (!isNaN(timestamp)) {
      return new Date(timestamp).toLocaleDateString();
    }
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (
    expectedReturnDate: string | null,
    returnedAt: string | null
  ) => {
    if (!expectedReturnDate || returnedAt) return false;
    // Handle timestamp format
    const timestamp = parseInt(expectedReturnDate);
    const returnDate = !isNaN(timestamp)
      ? new Date(timestamp)
      : new Date(expectedReturnDate);
    return returnDate < new Date();
  };

  // Properly categorize logs based on returnedAt field
  const pendingLogs = itemLogs.filter((log) => !log.returnedAt);
  const returnedLogs = itemLogs.filter((log) => !!log.returnedAt);
  const overdueLogs = itemLogs.filter(
    (log) =>
      !log.returnedAt && isOverdue(log.expectedReturnDate, log.returnedAt)
  );

  const filteredLogs = itemLogs.filter((log) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "pending") return !log.returnedAt;
    if (filterStatus === "returned") return !!log.returnedAt;
    if (filterStatus === "overdue")
      return (
        !log.returnedAt && isOverdue(log.expectedReturnDate, log.returnedAt)
      );
    return true;
  });

  // Loading state
  const isLoading =
    membersLoading || departmentsLoading || itemsLoading || itemLogsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-6 px-4">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-lg text-muted-foreground">
                Loading inventory data...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  const hasError =
    membersError || departmentsError || itemsError || itemLogsError;

  if (hasError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-6 px-4">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <div className="p-4 bg-destructive/10 rounded-full w-fit mx-auto">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Failed to load inventory data
                </h3>
                <p className="text-muted-foreground mb-4">
                  {membersError?.message ||
                    departmentsError?.message ||
                    itemsError?.message ||
                    itemLogsError?.message}
                </p>
                <Button onClick={() => window.location.reload()} size="lg">
                  <Loader2 className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4">
        {/* Modern Header */}
        <div className="flex flex-col space-y-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Inventory Tracker ({eventName || "Event"})
              </h1>
              <p className="text-muted-foreground">
                Monitor item issuance and returns
              </p>
            </div>
            <Dialog open={isIssueDialogOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Issue Item
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Issue New Item</DialogTitle>
                  <DialogDescription>
                    Create a new item log by issuing an item to a member.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {/* Searchable Item Selection */}
                  <div className="grid gap-2">
                    <Label>Item *</Label>
                    <Popover open={itemOpen} onOpenChange={setItemOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={itemOpen}
                          className="w-full justify-between"
                          disabled={isCreateLoading}
                        >
                          {formData.itemId
                            ? items.find((item) => item.id === formData.itemId)
                                ?.name +
                              ` (Available: ${
                                items.find(
                                  (item) => item.id === formData.itemId
                                )?.quantityAvailable
                              })`
                            : "Select an item..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search items..." />
                          <CommandEmpty>No item found.</CommandEmpty>
                          <CommandGroup>
                            {items.map((item) => (
                              <CommandItem
                                key={item.id}
                                value={item.name}
                                onSelect={() => {
                                  setFormData({ ...formData, itemId: item.id });
                                  setItemOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.itemId === item.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {item.name} (Available: {item.quantityAvailable}
                                )
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Searchable Member Selection */}
                  <div className="grid gap-2">
                    <Label>Issued By *</Label>
                    <Popover open={memberOpen} onOpenChange={setMemberOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={memberOpen}
                          className="w-full justify-between"
                          disabled={isCreateLoading}
                        >
                          {formData.issuedBy
                            ? (() => {
                                const member = members.find(
                                  (m) => m.id === formData.issuedBy
                                );
                                return member
                                  ? `${member.name} (Batch ${member.batch})`
                                  : "Unknown Member";
                              })()
                            : "Select a member..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search members..." />
                          <CommandEmpty>No member found.</CommandEmpty>
                          <CommandGroup>
                            {[...members]
                              .sort((a, b) => b.batch - a.batch)
                              .map((member) => (
                                <CommandItem
                                  key={member.id}
                                  value={`${member.name} ${member.batch}`}
                                  onSelect={() => {
                                    setFormData({
                                      ...formData,
                                      issuedBy: member.id,
                                    });
                                    setMemberOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.issuedBy === member.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {member.name} (Batch {member.batch})
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Searchable Department Selection */}
                  <div className="grid gap-2">
                    <Label>Department *</Label>
                    <Popover
                      open={departmentOpen}
                      onOpenChange={setDepartmentOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={departmentOpen}
                          className="w-full justify-between"
                          disabled={isCreateLoading}
                        >
                          {formData.departmentId
                            ? departments.find(
                                (dept) => dept.id === formData.departmentId
                              )?.name
                            : "Select a department..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search departments..." />
                          <CommandEmpty>No department found.</CommandEmpty>
                          <CommandGroup>
                            {departments.map((dept) => (
                              <CommandItem
                                key={dept.id}
                                value={dept.name}
                                onSelect={() => {
                                  setFormData({
                                    ...formData,
                                    departmentId: dept.id,
                                  });
                                  setDepartmentOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.departmentId === dept.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {dept.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantityIssued}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quantityIssued: e.target.value,
                        })
                      }
                      placeholder="Enter quantity"
                      min="1"
                      disabled={isCreateLoading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="returnDate">Expected Return Date</Label>
                    <Input
                      id="returnDate"
                      type="date"
                      value={formData.expectedReturnDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          expectedReturnDate: e.target.value,
                        })
                      }
                      disabled={isCreateLoading}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => handleDialogClose(false)}
                    disabled={isCreateLoading}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleIssueItem} disabled={isCreateLoading}>
                    {isCreateLoading ? (
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
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Logs
                  </p>
                  <p className="text-2xl font-bold">{itemLogs.length}</p>
                </div>
                <Package2 className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Pending
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {pendingLogs.length}
                  </p>
                </div>
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Returned
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {returnedLogs.length}
                  </p>
                </div>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Overdue
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {overdueLogs.length}
                  </p>
                </div>
                <TrendingUp className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Layout */}
        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all" onClick={() => setFilterStatus("all")}>
                All Logs
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                onClick={() => setFilterStatus("pending")}
              >
                Pending
              </TabsTrigger>
              <TabsTrigger
                value="returned"
                onClick={() => setFilterStatus("returned")}
              >
                Returned
              </TabsTrigger>
              <TabsTrigger
                value="overdue"
                onClick={() => setFilterStatus("overdue")}
              >
                Overdue
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {filteredLogs.length} logs
              </span>
            </div>
          </div>

          <TabsContent value="all" className="space-y-4">
            {filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <Package2 className="h-10 w-10 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No logs found</h3>
                <p className="mb-4 mt-2 text-sm text-muted-foreground">
                  Start by issuing your first item to create a log entry.
                </p>
                <Dialog
                  open={isIssueDialogOpen}
                  onOpenChange={handleDialogClose}
                >
                  <DialogTrigger asChild>
                    <Button onClick={resetForm}>
                      <Plus className="h-4 w-4 mr-2" />
                      Issue Your First Item
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredLogs.map((log) => {
                  const isReturned = !!log.returnedAt;
                  const overdue =
                    !log.returnedAt &&
                    isOverdue(log.expectedReturnDate, log.returnedAt);

                  return (
                    <div key={log.id} className="rounded-lg border bg-card">
                      <div className="flex items-center justify-between p-6">
                        <div className="flex items-center space-x-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            <Package2 className="h-5 w-5" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {getItemName(log.itemId)}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {getMemberName(log.issuedBy)}
                              </span>
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(log)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          {!isReturned && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkReturned(log.id)}
                              disabled={returningLogId === log.id}
                            >
                              {returningLogId === log.id ? (
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
                      {log.expectedReturnDate && (
                        <div className="border-t px-6 py-3">
                          <p className="text-xs text-muted-foreground">
                            Expected return:{" "}
                            {formatDate(log.expectedReturnDate)}
                            {isReturned &&
                              ` • Returned: ${formatDate(log.returnedAt)}`}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending">
            <div className="grid gap-4">
              {pendingLogs.map((log) => (
                <div key={log.id} className="rounded-lg border bg-card p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                        <Clock className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">{getItemName(log.itemId)}</p>
                        <p className="text-sm text-muted-foreground">
                          {getMemberName(log.issuedBy)} •{" "}
                          {getDepartmentName(log.departmentId)} • Qty:{" "}
                          {log.quantityIssued}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(log)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkReturned(log.id)}
                        disabled={returningLogId === log.id}
                      >
                        {returningLogId === log.id ? (
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="returned">
            <div className="grid gap-4">
              {returnedLogs.map((log) => (
                <div key={log.id} className="rounded-lg border bg-card p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{getItemName(log.itemId)}</p>
                        <p className="text-sm text-muted-foreground">
                          {getMemberName(log.issuedBy)} • Returned on{" "}
                          {formatDate(log.returnedAt)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      Completed
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="overdue">
            <div className="grid gap-4">
              {overdueLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-lg border border-red-200 bg-red-50 p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                        <TrendingUp className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-red-900">
                          {getItemName(log.itemId)}
                        </p>
                        <p className="text-sm text-red-700">
                          {getMemberName(log.issuedBy)} • Due:{" "}
                          {formatDate(log.expectedReturnDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(log)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkReturned(log.id)}
                        disabled={returningLogId === log.id}
                      >
                        {returningLogId === log.id ? (
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
                  value={editQuantityData.quantityIssued}
                  onChange={(e) =>
                    setEditQuantityData({ quantityIssued: e.target.value })
                  }
                  placeholder="Enter quantity"
                  min="1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleEditQuantity}>Update Quantity</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
