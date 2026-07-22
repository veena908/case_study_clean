export type Role = "ADMIN" | "SALES" | "WAREHOUSE" | "ACCOUNTS";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export type CustomerType = "RETAIL" | "WHOLESALE" | "DISTRIBUTOR";
export type CustomerStatus = "LEAD" | "ACTIVE" | "INACTIVE";

export interface FollowUpNote {
  id: string;
  note: string;
  createdAt: string;
  createdBy?: { name: string };
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  businessName: string;
  gstNumber?: string | null;
  customerType: CustomerType;
  address: string;
  status: CustomerStatus;
  followUpDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  followUpNotes?: FollowUpNote[];
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: string;
  currentStock: number;
  minStockAlert: number;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export type MovementType = "IN" | "OUT";

export interface StockMovement {
  id: string;
  productId: string;
  quantityChanged: number;
  movementType: MovementType;
  reason: string;
  createdAt: string;
  createdBy?: { name: string };
}

export type ChallanStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";

export interface ChallanItem {
  id: string;
  productId: string | null;
  productNameSnapshot: string;
  productSkuSnapshot: string;
  unitPriceSnapshot: string;
  quantity: number;
}

export interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  totalQuantity: number;
  status: ChallanStatus;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  items: ChallanItem[];
  createdBy?: { name: string };
}

export interface Paginated<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
