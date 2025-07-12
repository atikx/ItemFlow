import { Package2, Clock, CheckCircle, TrendingUp } from "lucide-react";

interface InventoryStatsProps {
  totalLogs: number;
  pendingLogs: number;
  returnedLogs: number;
  overdueLogs: number;
}

export const InventoryStats = ({
  totalLogs,
  pendingLogs,
  returnedLogs,
  overdueLogs,
}: InventoryStatsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="rounded-xl border bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-700">Total Logs</p>
            <p className="text-3xl font-bold text-blue-900">{totalLogs}</p>
          </div>
          <div className="p-3 bg-blue-200 rounded-full">
            <Package2 className="h-6 w-6 text-blue-700" />
          </div>
        </div>
      </div>
      <div className="rounded-xl border bg-gradient-to-br from-orange-50 to-orange-100 p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-orange-700">Pending</p>
            <p className="text-3xl font-bold text-orange-900">{pendingLogs}</p>
          </div>
          <div className="p-3 bg-orange-200 rounded-full">
            <Clock className="h-6 w-6 text-orange-700" />
          </div>
        </div>
      </div>
      <div className="rounded-xl border bg-gradient-to-br from-green-50 to-green-100 p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-700">Returned</p>
            <p className="text-3xl font-bold text-green-900">{returnedLogs}</p>
          </div>
          <div className="p-3 bg-green-200 rounded-full">
            <CheckCircle className="h-6 w-6 text-green-700" />
          </div>
        </div>
      </div>
      <div className="rounded-xl border bg-gradient-to-br from-red-50 to-red-100 p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-700">Overdue</p>
            <p className="text-3xl font-bold text-red-900">{overdueLogs}</p>
          </div>
          <div className="p-3 bg-red-200 rounded-full">
            <TrendingUp className="h-6 w-6 text-red-700" />
          </div>
        </div>
      </div>
    </div>
  );
};
