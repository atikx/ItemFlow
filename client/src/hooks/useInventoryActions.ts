import { useState } from "react";
import { useMutation } from "@apollo/client";
import { toast } from "sonner";

import { FormData } from "@/types/inventory.types";
import {
  CREATE_ITEM_LOG,
  GET_ITEM_LOGS,
  RETURN_ITEM_LOG,
} from "@/graphql/itemLogs.graphql";
import { GET_ITEMS } from "@/graphql/items.graphql";

export const useInventoryActions = (eventId: string) => {
  const [isCreateLoading, setIsCreateLoading] = useState(false);
  const [returningLogId, setReturningLogId] = useState<string | null>(null);

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

  const handleIssueItem = async (formData: FormData) => {
    if (
      !formData.itemId ||
      !formData.issuedBy ||
      !formData.departmentId ||
      !formData.quantityIssued ||
      !formData.phone
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
      await createItemLog({
        variables: {
          createItemLogInput: {
            itemId: formData.itemId,
            eventId,
            issuedBy: formData.issuedBy,
            phone: formData.phone,
            quantityIssued: quantity,
            expectedReturnDate: formData.expectedReturnDate || null,
            departmentId: formData.departmentId,
          },
        },
      });

      toast.success("Item issued successfully!");
      return true;
    } catch (error: any) {
      console.error("Error creating item log:", error);
      toast.error(error?.message || "Failed to issue item. Please try again.");
      return false;
    } finally {
      setIsCreateLoading(false);
    }
  };

  const handleMarkReturned = async (logId: string, returnedBy: string) => {
    setReturningLogId(logId);

    try {
      await returnItemLog({
        variables: {
          returnItemLogInput: {
            id: logId,
            returnedBy,
          },
        },
      });

      toast.success("Item marked as returned!");
    } catch (error: any) {
      console.error("Error marking item as returned:", error);
      toast.error(
        error?.message || "Failed to mark item as returned. Please try again."
      );
    } finally {
      setReturningLogId(null);
    }
  };

  return {
    isCreateLoading,
    returningLogId,
    handleIssueItem,
    handleMarkReturned,
  };
};
