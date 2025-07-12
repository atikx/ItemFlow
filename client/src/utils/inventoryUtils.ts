import { Item, Member, Department, ItemLog } from "@/types/itemLogs.types";

export const getItemName = (itemId: string, items: Item[]) => {
  const item = items.find((item) => item.id === itemId);
  return item?.name || "Unknown Item";
};

export const getMemberName = (memberId: string, members: Member[]) => {
  const member = members.find((member) => member.id === memberId);
  return member?.name || "Unknown Member";
};

export const getDepartmentName = (deptId: string, departments: Department[]) => {
  const dept = departments.find((dept) => dept.id === deptId);
  return dept?.name || "Unknown Department";
};

export const formatDate = (dateString: string | null) => {
  if (!dateString) return "Not set";
  const timestamp = parseInt(dateString);
  if (!isNaN(timestamp)) {
    return new Date(timestamp).toLocaleDateString();
  }
  return new Date(dateString).toLocaleDateString();
};

export const isOverdue = (expectedReturnDate: string | null, returnedAt: string | null) => {
  if (!expectedReturnDate || returnedAt) return false;
  const timestamp = parseInt(expectedReturnDate);
  const returnDate = !isNaN(timestamp) ? new Date(timestamp) : new Date(expectedReturnDate);
  return returnDate < new Date();
};

export const categorizeItemLogs = (itemLogs: ItemLog[]) => {
  const pendingLogs = itemLogs.filter((log) => !log.returnedAt);
  const returnedLogs = itemLogs.filter((log) => !!log.returnedAt);
  const overdueLogs = itemLogs.filter((log) => 
    !log.returnedAt && isOverdue(log.expectedReturnDate, log.returnedAt)
  );

  return { pendingLogs, returnedLogs, overdueLogs };
};

export const filterLogs = (itemLogs: ItemLog[], filterStatus: string) => {
  return itemLogs.filter((log) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "pending") return !log.returnedAt;
    if (filterStatus === "returned") return !!log.returnedAt;
    if (filterStatus === "overdue") 
      return !log.returnedAt && isOverdue(log.expectedReturnDate, log.returnedAt);
    return true;
  });
};
