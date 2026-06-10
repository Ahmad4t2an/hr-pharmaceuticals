export type UserRole = "Admin" | "Manager" | "Employee";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface ClientProduct {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  categoryId: string;
  brandId: string;
  description: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  minimumStockLevel: number;
  supplierId: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  images: string[];
}

export interface ClientCategory {
  id: string;
  name: string;
  description: string;
  image: string;
}

export interface ClientBrand {
  id: string;
  name: string;
  logoUrl: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export type MovementType = "Stock In" | "Stock Out" | "Stock Transfer" | "Stock Adjustment";

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: MovementType;
  quantity: number;
  reason: string;
  timestamp: string; // ISO string
  user: string;
}

export interface SalesItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  priceAtSale: number;
  totalPrice: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  items: SalesItem[];
  subtotal: number;
  discount: number; // as flat amount
  tax: number; // as flat amount
  total: number;
  status: "Paid" | "Pending" | "Cancelled";
  timestamp: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  costAtPurchase: number;
  totalCost: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "Completed" | "Pending" | "Cancelled";
  paymentStatus: "Paid" | "Unpaid" | "Partial";
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  type: "low_stock" | "out_of_stock" | "new_order" | "purchase" | "alert";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface CompanySettings {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  taxRate: number; // percentage
  invoicePrefix: string;
}

export interface SystemState {
  users: User[];
  products: ClientProduct[];
  categories: ClientCategory[];
  brands: ClientBrand[];
  suppliers: Supplier[];
  customers: Customer[];
  inventoryLogs: InventoryLog[];
  sales: Sale[];
  purchases: PurchaseOrder[];
  notifications: NotificationItem[];
  settings: CompanySettings;
}
