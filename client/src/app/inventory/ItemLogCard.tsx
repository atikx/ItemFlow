import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package2,
  User,
  Building,
  Hash,
  CheckCircle,
  Clock,
  Loader2,
  Phone,
} from "lucide-react";
import { ItemLog } from "@/types/itemLogs.types";
import { formatDate, isOverdue } from "@/utils/inventoryUtils";

interface ItemLogCardProps {
  log: ItemLog;
  getItemName: (itemId: string) => string;
  getMemberName: (memberId: string) => string;
  getDepartmentName: (deptId: string) => string;
  onMarkReturned: (logId: string) => void;
  returningLogId: string | null;
}

export const ItemLogCard = ({
  log,
  getItemName,
  getMemberName,
  getDepartmentName,
  onMarkReturned,
  returningLogId,
}: ItemLogCardProps) => {
  const isReturned = !!log.returnedAt;
  const overdue = !log.returnedAt && isOverdue(log.expectedReturnDate, log.returnedAt);

  return (
    <div key={log.id} className="rounded-lg border bg-card">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <Package2 className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">
              {getItemName(log.itemId)}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {getMemberName(log.issuedBy)}
              </span>
              {log.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {log.phone}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Building className="h-3 w-3" />
                {getDepartmentName(log.departmentId)}
              </span>
              <span className="flex items-center gap-1">
                <Hash className="h-3 w-3" />
                Qty: {log.quantityIssued}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isReturned ? (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Returned
            </Badge>
          ) : overdue ? (
            <Badge variant="destructive">
              <Clock className="h-3 w-3 mr-1" />
              Overdue
            </Badge>
          ) : (
            <Badge variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              Pending
            </Badge>
          )}

          {!isReturned && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMarkReturned(log.id)}
              disabled={returningLogId === log.id}
            >
              {returningLogId === log.id ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Returning...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Return
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      {log.expectedReturnDate && (
        <div className="border-t px-6 py-3">
          <p className="text-xs text-muted-foreground">
            Expected return: {formatDate(log.expectedReturnDate)}
            {isReturned && ` • Returned: ${formatDate(log.returnedAt)}`}
          </p>
        </div>
      )}
    </div>
  );
};
