import { Package2, Clock, CheckCircle, TrendingUp } from "lucide-react";

interface StatsGridProps {
  totalLogs: number;
  pendingCount: number;
  returnedCount: number;
  overdueCount: number;
}

export const StatsGrid = ({ 
  totalLogs, 
  pendingCount, 
  returnedCount, 
  overdueCount 
}: StatsGridProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Logs</p>
            <p className="text-2xl font-bold">{totalLogs}</p>
          </div>
          <Package2 className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
          </div>
          <Clock className="h-4 w-4 text-orange-600" />
        </div>
      </div>
      
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Returned</p>
            <p className="text-2xl font-bold text-green-600">{returnedCount}</p>
          </div>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </div>
      </div>
      
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Overdue</p>
            <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
          </div>
          <TrendingUp className="h-4 w-4 text-red-600" />
        </div>
      </div>
    </div>
  );
};
