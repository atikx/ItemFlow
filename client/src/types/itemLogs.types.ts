export interface Item {
  __typename?: string;
  id: string;
  name: string;
  quantityTotal: number;
  quantityAvailable: number;
}

export interface Member {
  __typename?: string;
  id: string;
  name: string;
  batch: number;
}

export interface Department {
  __typename?: string;
  id: string;
  name: string;
  email: string;
}

export interface ItemLog {
  id: string;
  itemId: string;
  eventId: string;
  issuedBy: string;
  phone: string;
  quantityIssued: number;
  expectedReturnDate: string | null;
  returnedAt: string | null;
  returnedBy: string | null;
  organisationId: string;
  departmentId: string;
  createdAt: string;
}

export interface ItemLogFormData {
  itemId: string;
  issuedBy: string;
  departmentId: string;
  quantityIssued: string;
  expectedReturnDate: string;
}

export interface EditQuantityFormData {
  quantityIssued: string;
}

export interface CreateItemLogInput {
  itemId: string;
  eventId: string;
  issuedBy: string;
  quantityIssued: number;
  expectedReturnDate?: string;
  departmentId: string;
}
