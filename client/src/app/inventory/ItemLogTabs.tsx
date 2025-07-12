import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter, Package2, Plus } from "lucide-react";
import { ItemLog } from "@/types/itemLogs.types";
import { ItemLogCard } from "./ItemLogCard";
import { IssueItemDialog } from "./IssueItemDialog";

interface ItemLogTabsProps {
  filteredLogs: ItemLog[];
  pendingLogs: ItemLog[];
  returnedLogs: ItemLog[];
  overdueLogs: ItemLog[];
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  getItemName: (itemId: string) => string;
  getMemberName: (memberId: string) => string;
  getDepartmentName: (deptId: string) => string;
  formatDate: (dateString: string | null) => string;
  isOverdue: (expectedReturnDate: string | null, returnedAt: string | null) => boolean;
  onMarkReturned: (logId: string) => void;
  onUpdateQuantity: (logId: string, newQuantity: number) => void;
  issueItemDialog: React.ReactNode;
}

export const ItemLogTabs = ({
  filteredLogs,
  pendingLogs,
  returnedLogs,
  overdueLogs,
  filterStatus,
  setFilterStatus,
  getItemName,
  getMemberName,
  getDepartmentName,
  formatDate,
  isOverdue,
  onMarkReturned,
  onUpdateQuantity,
  issueItemDialog,
}: ItemLogTabsProps) => {
  const EmptyState = ({ message, showAddButton = false }: { message: string; showAddButton?: boolean }) => (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted p-12 text-center bg-muted/20">
      <div className="p-4 bg-muted rounded-full mb-4">
        <Package2 className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No logs found</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">{message}</p>
      {showAddButton && issueItemDialog}
    </div>
  );

  return (
    <Tabs defaultValue="all" className="space-y-6">
      <div className="flex items-center justify-between">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="all" onClick={() => setFilterStatus("all")}>All</TabsTrigger>
          <TabsTrigger value="pending" onClick={() => setFilterStatus("pending")}>Pending</TabsTrigger>
          <TabsTrigger value="returned" onClick={() => setFilterStatus("returned")}>Returned</TabsTrigger>
          <TabsTrigger value="overdue" onClick={() => setFilterStatus("overdue")}>Overdue</TabsTrigger>
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
          <EmptyState 
            message="Start by issuing your first item to create a log entry and track inventory movement."
            showAddButton={true}
          />
        ) : (
          <div className="grid gap-4">
            {filteredLogs.map((log) => (
              <ItemLogCard
                key={log.id}
                log={log}
                getItemName={getItemName}
                getMemberName={getMemberName}
                getDepartmentName={getDepartmentName}
                formatDate={formatDate}
                isOverdue={isOverdue}
                onMarkReturned={onMarkReturned}
                onUpdateQuantity={onUpdateQuantity}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="pending">
        {pendingLogs.length === 0 ? (
          <EmptyState message="No pending items found." />
        ) : (
          <div className="grid gap-4">
            {pendingLogs.map((log) => (
              <ItemLogCard
                key={log.id}
                log={log}
                getItemName={getItemName}
                getMemberName={getMemberName}
                getDepartmentName={getDepartmentName}
                formatDate={formatDate}
                isOverdue={isOverdue}
                onMarkReturned={onMarkReturned}
                onUpdateQuantity={onUpdateQuantity}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="returned">
        {returnedLogs.length === 0 ? (
          <EmptyState message="No returned items found." />
        ) : (
          <div className="grid gap-4">
            {returnedLogs.map((log) => (
              <ItemLogCard
                key={log.id}
                log={log}
                getItemName={getItemName}
                getMemberName={getMemberName}
                getDepartmentName={getDepartmentName}
                formatDate={formatDate}
                isOverdue={isOverdue}
                onMarkReturned={onMarkReturned}
                onUpdateQuantity={onUpdateQuantity}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="overdue">
        {overdueLogs.length === 0 ? (
          <EmptyState message="No overdue items found." />
        ) : (
          <div className="grid gap-4">
            {overdueLogs.map((log) => (
              <ItemLogCard
                key={log.id}
                log={log}
                getItemName={getItemName}
                getMemberName={getMemberName}
                getDepartmentName={getDepartmentName}
                formatDate={formatDate}
                isOverdue={isOverdue}
                onMarkReturned={onMarkReturned}
                onUpdateQuantity={onUpdateQuantity}
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};
