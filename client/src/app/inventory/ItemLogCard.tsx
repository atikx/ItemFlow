import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package2,
  Clock,
  CheckCircle,
  TrendingUp,
  Calendar,
  User,
  Building,
  Hash,
} from "lucide-react";
import { ItemLog } from "@/types/itemLogs.types";
import { EditQuantityDialog } from "./EditQuantityDialog";

interface ItemLogCardProps {
  log: ItemLog;
  getItemName: (itemId: string) => string;
  getMemberName: (memberId: string) => string;
  getDepartmentName: (deptId: string) => string;
  formatDate: (dateString: string | null) => string;
  isOverdue: (expectedReturnDate: string | null, returnedAt: string | null) => boolean;
  onMarkReturned: (logId: string) => void;
  onUpdateQuantity: (logId: string, newQuantity: number) => void;
}

export const ItemLogCard = ({
  log,
  getItemName,
  getMemberName,
  getDepartmentName,
  formatDate,
  isOverdue,
  onMarkReturned,
  onUpdateQuantity,
}: ItemLogCardProps) => {
  const isReturned = !!log.returnedAt;
  const overdue = isOverdue(log.expectedReturnDate, log.returnedAt);

  return (
    <div 
      className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
        isReturned 
          ? 'border-green-200 bg-gradient-to-r from-green-50 to-green-100/50 hover:border-green-300' 
          : overdue 
            ? 'border-red-200 bg-gradient-to-r from-red-50 to-red-100/50 hover:border-red-300' 
            : 'border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100/50 hover:border-blue-300'
      }`}
    >
      {/* Status Indicator Strip */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        isReturned ? 'bg-green-500' : overdue ? 'bg-red-500' : 'bg-blue-500'
      }`} />
      
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-sm ${
              isReturned 
                ? 'bg-green-200 text-green-700' 
                : overdue 
                  ? 'bg-red-200 text-red-700' 
                  : 'bg-blue-200 text-blue-700'
            }`}>
              {isReturned ? (
                <CheckCircle className="h-6 w-6" />
              ) : overdue ? (
                <TrendingUp className="h-6 w-6" />
              ) : (
                <Package2 className="h-6 w-6" />
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-foreground">
                  {getItemName(log.itemId)}
                </h3>
                {isReturned ? (
                  <Badge className="bg-green-500 hover:bg-green-600 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Returned
                  </Badge>
                ) : overdue ? (
                  <Badge variant="destructive" className="animate-pulse">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Overdue
                  </Badge>
                ) : (
                  <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-6 text-sm font-medium">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="text-foreground">{getMemberName(log.issuedBy)}</span>
                </span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Building className="h-4 w-4" />
                  <span className="text-foreground">{getDepartmentName(log.departmentId)}</span>
                </span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  <span className="text-foreground font-bold">{log.quantityIssued} items</span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <EditQuantityDialog log={log} onUpdateQuantity={onUpdateQuantity} />
            {!isReturned && (
              <Button
                size="sm"
                onClick={() => onMarkReturned(log.id)}
                className="bg-green-600 hover:bg-green-700 text-white shadow-md"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Mark Returned
              </Button>
            )}
          </div>
        </div>
        
        {/* Date Information */}
        {(log.expectedReturnDate || log.returnedAt) && (
          <div className={`mt-4 p-3 rounded-lg border ${
            isReturned 
              ? 'bg-green-100 border-green-200' 
              : overdue 
                ? 'bg-red-100 border-red-200' 
                : 'bg-blue-100 border-blue-200'
          }`}>
            <div className="flex items-center gap-4 text-sm font-medium">
              {log.expectedReturnDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Expected: {formatDate(log.expectedReturnDate)}
                </span>
              )}
              {isReturned && log.returnedAt && (
                <span className="flex items-center gap-1 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  Returned: {formatDate(log.returnedAt)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
