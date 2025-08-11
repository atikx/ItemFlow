export interface  FormData {
  itemId: string;
  issuedBy: string;
  phone: string;
  departmentId: string;
  quantityIssued: string;
  expectedReturnDate: string;
}

export interface PopoverStates {
  itemOpen: boolean;
  memberOpen: boolean;
  departmentOpen: boolean;
}

export interface LoadingStates {
  isCreateLoading: boolean;
  returningLogId: string | null;
  redirecting: boolean;
}
