import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { toast } from "sonner";
import { CREATE_ITEM_LOG } from "@/graphql/itemLogs.graphql";
import { 
  Item, 
  Member, 
  Department, 
  ItemLog, 
  ItemLogFormData, 
  CreateItemLogInput 
} from "@/types/itemLogs.types";
import { GET_MEMBERS } from "@/graphql/members.graphql";
import { GET_DEPARTMENTS } from "@/graphql/departments.graphql";
import { GET_ITEMS } from "@/graphql/items.graphql";

export const useInventory = () => {
  const [eventId, setEventId] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isCreateLoading, setIsCreateLoading] = useState(false);

  // Sample item logs data
  const [itemLogs, setItemLogs] = useState<ItemLog[]>([
    {
      id: "log1",
      itemId: "aa5e5792-2ffa-459f-8a83-879e93c473e2", // spike
      eventId: "event1",
      issuedBy: "3f086933-c738-4fa8-b6cb-793656ca3632", // Shoaib khan
      quantityIssued: 2,
      expectedReturnDate: "2025-08-01",
      returnedAt: null,
      organisationId: "org1",
      departmentId: "ccf800e1-c600-4e5d-b15b-e8049948cdde", // swd
      createdAt: "2025-07-01T10:00:00Z",
    },
    {
      id: "log2",
      itemId: "22dc0587-be2b-483c-9148-a033e1d9ea14", // mono-mono
      eventId: "event2",
      issuedBy: "7f5ee641-e489-4ac7-8bb8-1e36c1221305", // Shrivansh
      quantityIssued: 1,
      expectedReturnDate: "2025-07-20",
      returnedAt: "2025-07-19T15:00:00Z",
      organisationId: "org1",
      departmentId: "bbe558ab-ed24-49e4-9c3c-474f82c0d179", // dota
      createdAt: "2025-06-15T09:30:00Z",
    },
    {
      id: "log3",
      itemId: "adabc6ca-2e18-4b8e-ac50-316a617a382d", // xlr
      eventId: "event3",
      issuedBy: "a54d27b4-f8a2-451b-bb14-6c437ab0c0fb", // Atiksh
      quantityIssued: 3,
      expectedReturnDate: "2025-07-25",
      returnedAt: null,
      organisationId: "org1",
      departmentId: "ccf800e1-c600-4e5d-b15b-e8049948cdde", // swd
      createdAt: "2025-07-05T14:30:00Z",
    },
  ]);

  // GraphQL queries
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

  const [createItemLog] = useMutation(CREATE_ITEM_LOG);

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
    setEventId(
      localStorage.getItem("eventId") || "dca60310-e538-4bab-8dc9-c731a33d7d8d"
    );
  }, []);

  const issueItem = async (formData: ItemLogFormData) => {
    if (
      !formData.itemId ||
      !formData.issuedBy ||
      !formData.departmentId ||
      !formData.quantityIssued
    ) {
      toast.error("Please fill in all required fields");
      return false;
    }

    const quantity = parseInt(formData.quantityIssued);
    if (quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return false;
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
          } as CreateItemLogInput,
        },
      });

      // Add to local state for demo purposes
      const newLog: ItemLog = {
        id: Date.now().toString(),
        itemId: formData.itemId,
        eventId: eventId,
        issuedBy: formData.issuedBy,
        quantityIssued: quantity,
        expectedReturnDate: formData.expectedReturnDate || null,
        returnedAt: null,
        organisationId: "org1",
        departmentId: formData.departmentId,
        createdAt: new Date().toISOString(),
      };

      setItemLogs([newLog, ...itemLogs]);
      console.log("Item log created:", res.data.createItemLog);
      toast.success("Item issued successfully!");
      return true;
    } catch (error: any) {
      console.error("Error creating item log:", error);
      const errorMessage = error?.message || "Failed to issue item. Please try again.";
      toast.error(errorMessage);
      return false;
    } finally {
      setIsCreateLoading(false);
    }
  };

  const markReturned = (logId: string) => {
    const updatedLogs = itemLogs.map((log) =>
      log.id === logId ? { ...log, returnedAt: new Date().toISOString() } : log
    );
    setItemLogs(updatedLogs);
    toast.success("Item marked as returned!");
  };

  const updateQuantity = (logId: string, newQuantity: number) => {
    const updatedLogs = itemLogs.map((log) =>
      log.id === logId ? { ...log, quantityIssued: newQuantity } : log
    );
    setItemLogs(updatedLogs);
    toast.success("Quantity updated successfully!");
  };

  const getItemName = (itemId: string) => {
    return items.find((item) => item.id === itemId)?.name || "Unknown Item";
  };

  const getMemberName = (memberId: string) => {
    return members.find((member) => member.id === memberId)?.name || "Unknown Member";
  };

  const getDepartmentName = (deptId: string) => {
    return departments.find((dept) => dept.id === deptId)?.name || "Unknown Department";
  };

  const isOverdue = (expectedReturnDate: string | null, returnedAt: string | null) => {
    if (!expectedReturnDate || returnedAt) return false;
    return new Date(expectedReturnDate) < new Date();
  };

  const pendingLogs = itemLogs.filter((log) => !log.returnedAt);
  const returnedLogs = itemLogs.filter((log) => !!log.returnedAt);
  const overdueLogs = itemLogs.filter((log) =>
    isOverdue(log.expectedReturnDate, log.returnedAt)
  );

  const isLoading = membersLoading || departmentsLoading || itemsLoading;
  const hasError = membersError || departmentsError || itemsError;

  return {
    // Data
    items,
    members,
    departments,
    itemLogs,
    pendingLogs,
    returnedLogs,
    overdueLogs,
    
    // Loading & Error states
    isLoading,
    hasError,
    isCreateLoading,
    
    // Functions
    issueItem,
    markReturned,
    updateQuantity,
    getItemName,
    getMemberName,
    getDepartmentName,
    isOverdue,
    
    // Error details
    error: membersError || departmentsError || itemsError,
  };
};
