export interface Item {
  __typename?: string;
  id: string;
  name: string;
  quantityTotal: number;
  quantityAvailable: number;
}

export interface ItemFormData {
  name: string;
  quantityTotal: string;
}

export interface CreateItemInput {
  name: string;
  quantityTotal: number;
}

export interface UpdateItemInput {
  id: string;
  name: string;
  quantityTotal: number;
}
