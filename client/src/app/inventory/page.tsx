"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Package2,
  Filter,
  Loader2,
  AlertCircle,
  Download,
} from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useInventoryData } from "@/hooks/useInventoryData";
import { useInventoryActions } from "@/hooks/useInventoryActions";
import {
  categorizeItemLogs,
  filterLogs,
  getItemName,
  getMemberName,
  getDepartmentName,
} from "@/utils/inventoryUtils";
import { InventoryHeader } from "./InventoryHeader";
import { StatsGrid } from "./StatsGrid";
import { IssueItemDialog } from "./IssueItemDialog";
import { ItemLogCard } from "./ItemLogCard";
import api from "@/lib/axiosinstance";
import { toast } from "sonner";

export default function InventoryPage() {
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const {
    eventId,
    eventName,
    items,
    members,
    departments,
    itemLogs,
    isLoading,
    hasError,
  } = useInventoryData();

  const {
    isCreateLoading,
    returningLogId,
    handleIssueItem,
    handleMarkReturned,
  } = useInventoryActions(eventId);

  const { pendingLogs, returnedLogs, overdueLogs } =
    categorizeItemLogs(itemLogs);
  const filteredLogs = filterLogs(itemLogs, filterStatus);

  console.log("Filtered logs:", filteredLogs);

  // Helper functions with bound data
  const getItemNameBound = (itemId: string) => getItemName(itemId, items);
  const getMemberNameBound = (memberId: string) =>
    getMemberName(memberId, members);
  const getDepartmentNameBound = (deptId: string) =>
    getDepartmentName(deptId, departments);

  // Excel export function
  const handleExportToExcel = async () => {
    try {
      const response = await api.get(`/export-item-logs/download/${eventId}`, {
        responseType: "arraybuffer",
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;

      link.setAttribute("download", "exported_itemLogs.xlsx");

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
        <div className="flex flex-col space-y-6 mb-8">
          <InventoryHeader
            eventName={eventName}
            onIssueClick={() => setIsIssueDialogOpen(true)}
          />

          <StatsGrid
            totalLogs={itemLogs.length}
            pendingCount={pendingLogs.length}
            returnedCount={returnedLogs.length}
            overdueCount={overdueLogs.length}
          />
        </div>

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
            <div className="flex items-center gap-4">
              <Button
                variant="default"
                size="sm"
                onClick={handleExportToExcel}
                disabled={filteredLogs.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export to Excel
              </Button>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {filteredLogs.length} logs
                </span>
              </div>
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
                <Button onClick={() => setIsIssueDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Issue Your First Item
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredLogs.map((log) => (
                  <ItemLogCard
                    key={log.id}
                    log={log}
                    getItemName={getItemNameBound}
                    getMemberName={getMemberNameBound}
                    getDepartmentName={getDepartmentNameBound}
                    onMarkReturned={handleMarkReturned}
                    returningLogId={returningLogId}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Similar TabsContent for pending, returned, overdue... */}
        </Tabs>

        <IssueItemDialog
          open={isIssueDialogOpen}
          onOpenChange={setIsIssueDialogOpen}
          items={items}
          members={members}
          departments={departments}
          isLoading={isCreateLoading}
          onSubmit={handleIssueItem}
        />
      </div>
    </div>
  );
}
