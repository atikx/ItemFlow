"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Package,
  Search,
  Loader2,
  AlertCircle,
  Plus,
  Download,
} from "lucide-react";
import { useItems } from "@/hooks/useItems";
import { AddItemDialog } from "./AddItemDialog";
import { ItemCard } from "./ItemCard";
import { toast } from "sonner";
import api from "@/lib/axiosinstance";

export default function ItemsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const {
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
  } = useItems();

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Export function
  const handleExportItems = async () => {
    try {
      const response = await api.get("/export-items/download", {
        responseType: "arraybuffer", 
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;

      link.setAttribute("download", "exported_items.xlsx");

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Items exported successfully!");
      console.log("File download has been triggered.");
    } catch (error) {
      console.error("Error exporting items:", error);
      toast.error("Failed to export items. Please try again later.");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4 max-w-6xl">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-lg text-muted-foreground">Loading items...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4 max-w-6xl">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <div className="p-4 bg-destructive/10 rounded-full w-fit mx-auto">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Failed to load items
                </h3>
                <p className="text-muted-foreground mb-4">{error.message}</p>
                <Button onClick={() => refetch()} size="lg">
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
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <Package className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Inventory Items
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your organization's inventory
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
            <div className="flex gap-2">
              <AddItemDialog onAddItem={addItem} isLoading={isAddLoading} />
              <Button
                onClick={handleExportItems}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Items
              </Button>
            </div>
          </div>

          {/* Summary */}
          <div className="text-center text-sm text-muted-foreground">
            {filteredItems.length} of {items.length} items
          </div>
        </div>

        {/* Items List */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-muted/30 rounded-2xl p-12 max-w-md mx-auto">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {searchTerm ? "No items found" : "No items yet"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Start by adding your first item to the inventory"}
              </p>
              {!searchTerm && (
                <AddItemDialog
                  onAddItem={addItem}
                  isLoading={isAddLoading}
                  trigger={
                    <Button size="lg">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Item
                    </Button>
                  }
                />
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onEditItem={editItem}
                onDeleteItem={removeItem}
                isEditLoading={isEditLoading}
                deletingItemId={deletingItemId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
