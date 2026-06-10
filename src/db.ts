import mongoose from "mongoose";

const StringReq = { type: String, required: true };
const StringOpt = { type: String };

export const Product: any = mongoose.models.Product || mongoose.model("Product", new mongoose.Schema({
  id: { type: String, unique: true },
  name: String,
  sku: String,
  barcode: String,
  categoryId: String,
  brandId: String,
  description: String,
  purchasePrice: Number,
  sellingPrice: Number,
  quantity: Number,
  minimumStockLevel: Number,
  supplierId: String,
  status: String,
  images: [String]
}));

export const Category: any = mongoose.models.Category || mongoose.model("Category", new mongoose.Schema({
  id: { type: String, unique: true },
  name: String,
  description: String,
  image: String
}));

export const Brand: any = mongoose.models.Brand || mongoose.model("Brand", new mongoose.Schema({
  id: { type: String, unique: true },
  name: String,
  logoUrl: String
}));

export const Supplier: any = mongoose.models.Supplier || mongoose.model("Supplier", new mongoose.Schema({
  id: { type: String, unique: true },
  name: String,
  contact: String,
  email: String,
  phone: String,
  address: String
}));

export const Customer: any = mongoose.models.Customer || mongoose.model("Customer", new mongoose.Schema({
  id: { type: String, unique: true },
  name: String,
  email: String,
  phone: String,
  address: String
}));

export const InventoryLog: any = mongoose.models.InventoryLog || mongoose.model("InventoryLog", new mongoose.Schema({
  id: { type: String, unique: true },
  productId: String,
  productName: String,
  sku: String,
  type: { type: String }, // 'Stock In', 'Stock Out', etc.
  quantity: Number,
  reason: String,
  timestamp: String,
  user: String
}));

const SaleItemSchema = new mongoose.Schema({
  productId: String,
  productName: String,
  sku: String,
  quantity: Number,
  priceAtSale: Number,
  totalPrice: Number
}, { _id: false });

export const Sale: any = mongoose.models.Sale || mongoose.model("Sale", new mongoose.Schema({
  id: { type: String, unique: true },
  invoiceNumber: String,
  customerId: String,
  customerName: String,
  items: [SaleItemSchema],
  subtotal: Number,
  discount: Number,
  tax: Number,
  total: Number,
  status: String,
  timestamp: String
}));

const PurchaseItemSchema = new mongoose.Schema({
  productId: String,
  productName: String,
  sku: String,
  quantity: Number,
  costAtPurchase: Number,
  totalCost: Number
}, { _id: false });

export const PurchaseOrder: any = mongoose.models.PurchaseOrder || mongoose.model("PurchaseOrder", new mongoose.Schema({
  id: { type: String, unique: true },
  poNumber: String,
  supplierId: String,
  supplierName: String,
  items: [PurchaseItemSchema],
  subtotal: Number,
  tax: Number,
  total: Number,
  status: String,
  paymentStatus: String,
  timestamp: String
}));

export const NotificationItem: any = mongoose.models.NotificationItem || mongoose.model("NotificationItem", new mongoose.Schema({
  id: { type: String, unique: true },
  type: { type: String },
  title: String,
  message: String,
  timestamp: String,
  read: Boolean
}));

export const CompanySettings: any = mongoose.models.CompanySettings || mongoose.model("CompanySettings", new mongoose.Schema({
  companyName: String,
  email: String,
  phone: String,
  address: String,
  currency: String,
  taxRate: Number,
  invoicePrefix: String
}));

export const User: any = mongoose.models.User || mongoose.model("User", new mongoose.Schema({
  id: { type: String, unique: true },
  email: String,
  name: String,
  role: String,
  avatarUrl: String
}));

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes("127.0.0.1") || uri.includes("user:password")) {
    throw new Error("Missing or invalid MONGODB_URI environment variable.");
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 }).then((mongoose) => mongoose);
  }
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
}
