import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { toast } from "sonner";
import { GET_ITEMS } from "@/graphql/items.graphql";
import { CREATE_ITEM, UPDATE_ITEM, DELETE_ITEM } from "@/graphql/items.graphql";
import { Item, ItemFormData, CreateItemInput, UpdateItemInput } from "@/types/items.types";

export const useItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [isAddLoading, setIsAddLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery(GET_ITEMS);

  const [createItem] = useMutation(CREATE_ITEM, {
    refetchQueries: [{ query: GET_ITEMS }],
  });

  const [updateItem] = useMutation(UPDATE_ITEM, {
    refetchQueries: [{ query: GET_ITEMS }],
  });

  const [deleteItem] = useMutation(DELETE_ITEM, {
    refetchQueries: [{ query: GET_ITEMS }],
  });

  // Update local state when GraphQL data changes
  useEffect(() => {
    if (data?.items) {
      setItems(data.items);
    }
  }, [data]);

  const addItem = async (formData: ItemFormData) => {
    if (!formData.name.trim() || !formData.quantityTotal.trim()) {
      toast.error("Please fill in all fields");
      return false;
    }

    const quantityTotal = parseInt(formData.quantityTotal);

    if (quantityTotal <= 0) {
      toast.error("Total quantity must be greater than 0");
      return false;
    }

    setIsAddLoading(true);
    try {
      const res = await createItem({
        variables: {
          createItemInput: {
            name: formData.name.trim(),
            quantityTotal,
          } as CreateItemInput,
        },
      });

      console.log("Item created:", res.data.createItem);
      toast.success("Item added successfully!");
      return true;
    } catch (error: any) {
      console.error("Error adding item:", error);
      const errorMessage = error?.message || "Failed to add item. Please try again.";
      toast.error(errorMessage);
      return false;
    } finally {
      setIsAddLoading(false);
    }
  };

  const editItem = async (itemId: string, formData: ItemFormData) => {
    if (!formData.name.trim() || !formData.quantityTotal.trim()) {
      toast.error("Please fill in all fields");
      return false;
    }

    const quantityTotal = parseInt(formData.quantityTotal);

    if (quantityTotal <= 0) {
      toast.error("Total quantity must be greater than 0");
      return false;
    }

    setIsEditLoading(true);
    try {
      const res = await updateItem({
        variables: {
          updateItemInput: {
            id: itemId,
            name: formData.name.trim(),
            quantityTotal,
          } as UpdateItemInput,
        },
      });

      console.log("Item updated:", res.data.updateItem);
      toast.success("Item updated successfully!");
      return true;
    } catch (error: any) {
      console.error("Error updating item:", error);
      const errorMessage = error?.message || "Failed to update item. Please try again.";
      toast.error(errorMessage);
      return false;
    } finally {
      setIsEditLoading(false);
    }
  };

  const removeItem = async (id: string, itemName: string) => {
    setDeletingItemId(id);
    try {
      await deleteItem({
        variables: { removeItemId: id },
      });
      console.log("Item deleted:", id);
      toast.success(`"${itemName}" deleted successfully!`);
      return true;
    } catch (error: any) {
      console.error("Error deleting item:", error);
      const errorMessage = error?.message || "Failed to delete item. Please try again.";
      toast.error(errorMessage);
      return false;
    } finally {
      setDeletingItemId(null);
    }
  };

  return {
    items,
    loading,
    error,
    refetch,
    addItem,
    editItem,
    removeItem,
    isAddLoading,
    isEditLoading,
    deletingItemId,
  };
};
