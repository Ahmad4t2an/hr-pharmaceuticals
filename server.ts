import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { connectDB, Product, Category, Brand, Supplier, Customer, InventoryLog, Sale, PurchaseOrder, NotificationItem, CompanySettings, User } from "./src/db";
import { getInitialState } from "./src/seed";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialise DB
let isDbConnected = false;
app.use("/api", async (req, res, next) => {
  if (!isDbConnected) {
    try {
      await connectDB();
      isDbConnected = true;
      
      // Auto-migrate seed data if empty
      const settingsCount = await CompanySettings.countDocuments();
      if (settingsCount === 0) {
        console.log("Database empty, seeding init state...");
        const init = getInitialState();
        await CompanySettings.create(init.settings);
        for (const u of init.users) await User.create(u);
        for (const c of init.categories) await Category.create(c);
        for (const b of init.brands) await Brand.create(b);
        for (const s of init.suppliers) await Supplier.create(s);
        for (const c of init.customers) await Customer.create(c);
        for (const p of init.products) await Product.create(p);
        for (const l of init.inventoryLogs) await InventoryLog.create(l);
        for (const s of init.sales) await Sale.create(s);
        for (const p of init.purchases) await PurchaseOrder.create(p);
        for (const n of init.notifications) await NotificationItem.create(n);
      }
    } catch (err) {
      console.error("MongoDB Connection Error:", err);
      // Fail API gracefully instead of hanging
      return res.status(500).json({ error: "Database not connected. Ensure your MongoDB Atlas IP Access List allows connections from anywhere (0.0.0.0/0)." });
    }
  }
  next();
});

// Helper to dynamically calculate stock alert level
export function getProductStatus(quantity: number, minimumStockLevel: number): "In Stock" | "Low Stock" | "Out of Stock" {
  if (quantity <= 0) return "Out of Stock";
  if (quantity <= 20 || quantity < minimumStockLevel) return "Low Stock";
  return "In Stock";
}

// Get complete database state
app.get("/api/db", async (req, res) => {
  try {
    const [settings] = await CompanySettings.find();
    res.json({
      settings: settings || {},
      users: await User.find(),
      categories: await Category.find(),
      brands: await Brand.find(),
      suppliers: await Supplier.find(),
      customers: await Customer.find(),
      products: await Product.find(),
      inventoryLogs: (await InventoryLog.find().sort({ timestamp: -1 })).reverse(), // Keep backwards compat order
      sales: (await Sale.find().sort({ timestamp: -1 })).reverse(),
      purchases: (await PurchaseOrder.find().sort({ timestamp: -1 })).reverse(),
      notifications: (await NotificationItem.find().sort({ timestamp: -1 })).reverse(),
    });
  } catch (err) {
    res.status(500).json({ error: "DB Error" });
  }
});

// Update settings
app.post("/api/settings", async (req, res) => {
  try {
    const settings = await CompanySettings.findOneAndUpdate({}, { $set: req.body }, { new: true, upsert: true });
    res.json({ success: true, settings });
  } catch (err) { res.status(500).json({ error: "Failed to update" }); }
});

// 1. Products CRUD
app.post("/api/products", async (req, res) => {
  try {
    const minLvl = Number(req.body.minimumStockLevel) || 20;
    const qty = Number(req.body.quantity) || 0;
    const status = getProductStatus(qty, minLvl);

    const newProdData = {
      id: "prod_" + Date.now(),
      name: req.body.name || "Unnamed Product",
      sku: req.body.sku || "SKU-NEW",
      barcode: req.body.barcode || "",
      categoryId: req.body.categoryId || "",
      brandId: req.body.brandId || "",
      description: req.body.description || "",
      purchasePrice: Number(req.body.purchasePrice) || 0,
      sellingPrice: Number(req.body.sellingPrice) || 0,
      quantity: qty,
      minimumStockLevel: minLvl,
      supplierId: req.body.supplierId || "",
      status,
      images: req.body.images && req.body.images.length ? req.body.images : ["https://images.unsplash.com/photo-1591453089816-0fbb971b454c?w=400&auto=format&fit=crop&q=80"]
    };

    const newProd = await Product.create(newProdData);

    const newLog = await InventoryLog.create({
      id: "log_" + Date.now(),
      productId: newProd.id,
      productName: newProd.name,
      sku: newProd.sku,
      type: "Stock In",
      quantity: newProd.quantity,
      reason: "New product entry validation",
      timestamp: new Date().toISOString(),
      user: req.body.user || "Admin"
    });

    if (newProd.status !== "In Stock") {
      await NotificationItem.create({
        id: "notif_" + Date.now(),
        type: newProd.status === "Out of Stock" ? "out_of_stock" : "low_stock",
        title: `${newProd.status} Warning`,
        message: `${newProd.name} is stored at critical inventory status (${newProd.quantity} items).`,
        timestamp: new Date().toISOString(),
        read: false
      });
    }

    res.json({ success: true, product: newProd });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const prod = await Product.findOne({ id });
    if (!prod) return res.status(404).json({ error: "Product not found" });

    const oldQty = prod.quantity;
    const bodyQty = Number(req.body.quantity);
    const qtyDiff = bodyQty - oldQty;
    const minLvl = Number(req.body.minimumStockLevel) || 20;

    const updated = await Product.findOneAndUpdate({ id }, {
      $set: {
        ...req.body,
        purchasePrice: Number(req.body.purchasePrice),
        sellingPrice: Number(req.body.sellingPrice),
        quantity: bodyQty,
        minimumStockLevel: minLvl,
        status: getProductStatus(bodyQty, minLvl)
      }
    }, { new: true });

    if (qtyDiff !== 0) {
      await InventoryLog.create({
        id: "log_" + Date.now(),
        productId: id,
        productName: updated.name,
        sku: updated.sku,
        type: qtyDiff > 0 ? "Stock In" : "Stock Out",
        quantity: Math.abs(qtyDiff),
        reason: `Manual stock adjustment edit`,
        timestamp: new Date().toISOString(),
        user: req.body.user || "System"
      });
    }

    res.json({ success: true, product: updated });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete("/api/products/:id", async (req, res) => {
  await Product.deleteOne({ id: req.params.id });
  res.json({ success: true });
});

// Categories
app.post("/api/categories", async (req, res) => {
  const c = await Category.create({ id: "cat_" + Date.now(), name: req.body.name || "New Category", description: req.body.description || "", image: req.body.image || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&auto=format&fit=crop&q=60" });
  res.json({ success: true, category: c });
});
app.put("/api/categories/:id", async (req, res) => {
  const c = await Category.findOneAndUpdate({ id: req.params.id }, { $set: req.body }, { new: true });
  if (c) res.json({ success: true, category: c });
  else res.status(404).json({ error: "Category not found" });
});
app.delete("/api/categories/:id", async (req, res) => {
  await Category.deleteOne({ id: req.params.id });
  res.json({ success: true });
});

// Brands
app.post("/api/brands", async (req, res) => {
  const b = await Brand.create({ id: "br_" + Date.now(), name: req.body.name || "New Brand", logoUrl: req.body.logoUrl || "#6366f1" });
  res.json({ success: true, brand: b });
});
app.put("/api/brands/:id", async (req, res) => {
  const b = await Brand.findOneAndUpdate({ id: req.params.id }, { $set: req.body }, { new: true });
  if (b) res.json({ success: true, brand: b });
  else res.status(404).json({ error: "Not found" });
});
app.delete("/api/brands/:id", async (req, res) => {
  await Brand.deleteOne({ id: req.params.id });
  res.json({ success: true });
});

// Customers
app.post("/api/customers", async (req, res) => {
  const doc = await Customer.create({ id: "cust_" + Date.now(), name: req.body.name || "Anonymous", phone: req.body.phone || "", email: req.body.email || "", address: req.body.address || "" });
  res.json({ success: true, customer: doc });
});
app.put("/api/customers/:id", async (req, res) => {
  const doc = await Customer.findOneAndUpdate({ id: req.params.id }, { $set: req.body }, { new: true });
  if (doc) res.json({ success: true, customer: doc });
  else res.status(404).json({ error: "Not found" });
});
app.delete("/api/customers/:id", async (req, res) => {
  await Customer.deleteOne({ id: req.params.id });
  res.json({ success: true });
});

// Suppliers
app.post("/api/suppliers", async (req, res) => {
  const doc = await Supplier.create({ id: "sup_" + Date.now(), name: req.body.name || "New Partner", contact: req.body.contact || "", email: req.body.email || "", phone: req.body.phone || "", address: req.body.address || "" });
  res.json({ success: true, supplier: doc });
});
app.put("/api/suppliers/:id", async (req, res) => {
  const doc = await Supplier.findOneAndUpdate({ id: req.params.id }, { $set: req.body }, { new: true });
  if (doc) res.json({ success: true, supplier: doc });
  else res.status(404).json({ error: "Not found" });
});
app.delete("/api/suppliers/:id", async (req, res) => {
  await Supplier.deleteOne({ id: req.params.id });
  res.json({ success: true });
});

// Notifications
app.post("/api/notifications/read", async (req, res) => {
  await NotificationItem.updateMany({}, { read: true });
  res.json({ success: true });
});

// Reset DB
app.post("/api/db/reset", async (req, res) => {
  await Promise.all([Product.deleteMany({}), Category.deleteMany({}), Brand.deleteMany({}), Supplier.deleteMany({}), Customer.deleteMany({}), InventoryLog.deleteMany({}), Sale.deleteMany({}), PurchaseOrder.deleteMany({}), NotificationItem.deleteMany({}), CompanySettings.deleteMany({}), User.deleteMany({})]);
  
  const init = getInitialState();
  await CompanySettings.create(init.settings);
  for (const u of init.users) await User.create(u);
  for (const c of init.categories) await Category.create(c);
  for (const b of init.brands) await Brand.create(b);
  for (const s of init.suppliers) await Supplier.create(s);
  for (const c of init.customers) await Customer.create(c);
  for (const p of init.products) await Product.create(p);
  for (const l of init.inventoryLogs) await InventoryLog.create(l);
  for (const s of init.sales) await Sale.create(s);
  for (const p of init.purchases) await PurchaseOrder.create(p);
  for (const n of init.notifications) await NotificationItem.create(n);
  
  res.json({ success: true });
});

app.post("/api/inventory/movement", async (req, res) => {
  try {
    const { productId, type, quantity, reason, targetWarehouse, user } = req.body;
    const qtyNum = Number(quantity);
    const product = await Product.findOne({ id: productId });
    
    if (!product) return res.status(404).json({ error: "Inventory registry not found." });

    let movementLabel = "";
    if (type === "Stock In") {
      product.quantity += qtyNum;
      movementLabel = "Stock In";
    } else if (type === "Stock Out") {
      if (product.quantity < qtyNum) return res.status(400).json({ error: "Insufficient inventory units." });
      product.quantity -= qtyNum;
      movementLabel = "Stock Out";
    } else if (type === "Stock Adjustment") {
      product.quantity = qtyNum;
      movementLabel = "Stock Adjustment";
    } else if (type === "Stock Transfer") {
      if (product.quantity < qtyNum) return res.status(400).json({ error: "Insufficient transfer quantities." });
      product.quantity -= qtyNum;
      movementLabel = "Stock Transfer";
    }

    product.status = getProductStatus(product.quantity, product.minimumStockLevel);
    await product.save();

    const newLog = await InventoryLog.create({
      id: "log_" + Date.now(),
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      type: type,
      quantity: qtyNum,
      reason: reason || `${movementLabel} manual action`,
      timestamp: new Date().toISOString(),
      user: user || "System Operator"
    });

    if (product.status !== "In Stock") {
      await NotificationItem.create({
        id: "notif_" + Date.now(),
        type: product.status === "Out of Stock" ? "out_of_stock" : "low_stock",
        title: `${product.status} Alarm`,
        message: `${product.name} transitioned to critical level (${product.quantity} items).`,
        timestamp: new Date().toISOString(),
        read: false
      });
    }

    res.json({ success: true, product, log: newLog });
  } catch(e:any) { res.status(500).json({ error: e.message }); }
});

app.post("/api/purchases", async (req, res) => {
  try {
    const { supplierId, items, tax, user } = req.body;
    const supplier = await Supplier.findOne({ id: supplierId });
    const supplierName = supplier?.name || "Unknown Supplier";

    const formattedItems = [];
    let subtotal = 0;
    
    for (const i of items) {
      const prod = await Product.findOne({ id: i.productId });
      const itemCost = Number(i.quantity) * Number(i.costAtPurchase);
      subtotal += itemCost;
      formattedItems.push({
        productId: i.productId,
        productName: prod?.name || "Unknown Product",
        sku: prod?.sku || "SKU-MOCK",
        quantity: Number(i.quantity),
        costAtPurchase: Number(i.costAtPurchase),
        totalCost: itemCost
      });
    }

    const settings = await CompanySettings.findOne() || { taxRate: 0 };
    const taxFlat = subtotal * (Number(tax || settings.taxRate) / 100);
    const total = subtotal + taxFlat;

    const poCount = await PurchaseOrder.countDocuments();

    const newPO = await PurchaseOrder.create({
      id: "po_" + Date.now(),
      poNumber: "PO-2026-" + String(poCount + 1).padStart(4, "0"),
      supplierId,
      supplierName,
      items: formattedItems,
      subtotal,
      tax: taxFlat,
      total,
      status: "Pending",
      paymentStatus: "Unpaid",
      timestamp: new Date().toISOString()
    });

    await NotificationItem.create({
      id: "notif_" + Date.now(),
      type: "purchase",
      title: "New Purchase Order Drafted",
      message: `PO ${newPO.poNumber} created for ${supplierName} seeking items (£${total.toFixed(2)})`,
      timestamp: new Date().toISOString(),
      read: false
    });

    res.json({ success: true, purchaseOrder: newPO });
  } catch(e:any) { res.status(500).json({ error: e.message }); }
});

app.put("/api/purchases/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;
    const po = await PurchaseOrder.findOne({ id });

    if (!po) return res.status(404).json({ error: "PO not found." });

    const oldStatus = po.status;
    po.status = status || po.status;
    po.paymentStatus = paymentStatus || po.paymentStatus;
    
    if (status === "Completed" && oldStatus !== "Completed") {
      for (const item of po.items) {
        const prod = await Product.findOne({ id: item.productId });
        if (prod) {
          const qtyDiff = item.quantity;
          prod.quantity += qtyDiff;
          prod.status = getProductStatus(prod.quantity, prod.minimumStockLevel);
          await prod.save();

          await InventoryLog.create({
            id: "log_" + Date.now() + "_" + item.productId,
            productId: item.productId,
            productName: item.productName,
            sku: item.sku,
            type: "Stock In",
            quantity: item.quantity,
            reason: `Sourced from finalized order ${po.poNumber}`,
            timestamp: new Date().toISOString(),
            user: "Supplier Automatic Entry"
          });
        }
      }
    }
    
    await po.save();
    res.json({ success: true, purchaseOrder: po });
  } catch(e:any) { res.status(500).json({ error: e.message }); }
});

app.post("/api/sales", async (req, res) => {
  try {
    const { customerId, items, discount, user } = req.body;
    const customer = await Customer.findOne({ id: customerId });
    const customerName = customer?.name || "Retail Buyer";

    const formattedItems = [];
    let subtotal = 0;

    for (const i of items) {
      const prod = await Product.findOne({ id: i.productId });
      if (!prod) return res.status(400).json({ error: `Product ${i.productId} vanished.` });
      if (prod.quantity < Number(i.quantity)) return res.status(400).json({ error: `Insufficient stock for ${prod.name}.` });
      
      const itemPrice = Number(i.quantity) * Number(i.priceAtSale);
      subtotal += itemPrice;
      formattedItems.push({
        productId: i.productId,
        productName: prod.name,
        sku: prod.sku,
        quantity: Number(i.quantity),
        priceAtSale: Number(i.priceAtSale),
        totalPrice: itemPrice
      });
    }

    const settings = await CompanySettings.findOne() || { taxRate: 0, invoicePrefix: "INV-" };
    const discountFlat = Number(discount || 0);
    const taxFlat = (subtotal - discountFlat) * (settings.taxRate / 100);
    const total = subtotal - discountFlat + taxFlat;

    for (const item of formattedItems) {
      const prod = await Product.findOne({ id: item.productId });
      if (prod) {
        prod.quantity -= item.quantity;
        prod.status = getProductStatus(prod.quantity, prod.minimumStockLevel);
        await prod.save();

        await InventoryLog.create({
          id: "log_" + Date.now(),
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          type: "Stock Out",
          quantity: item.quantity,
          reason: `Customer invoice transaction sale`,
          timestamp: new Date().toISOString(),
          user: user || "Sales Agent"
        });

        if (prod.status !== "In Stock") {
          await NotificationItem.create({
            id: "notif_" + Date.now(),
            type: prod.status === "Out of Stock" ? "out_of_stock" : "low_stock",
            title: "Automated Stock Trigger Alarm",
            message: `${prod.name} sold down to ${prod.quantity} units.`,
            timestamp: new Date().toISOString(),
            read: false
          });
        }
      }
    }

    const slCount = await Sale.countDocuments();
    const newSale = await Sale.create({
      id: "sale_" + Date.now(),
      invoiceNumber: `${settings.invoicePrefix}2026-` + String(slCount + 1).padStart(4, "0"),
      customerId,
      customerName,
      items: formattedItems,
      subtotal,
      discount: discountFlat,
      tax: taxFlat,
      total,
      status: "Paid",
      timestamp: new Date().toISOString()
    });

    await NotificationItem.create({
      id: "notif_sa_" + Date.now(),
      type: "new_order",
      title: "Sale Invoiced successfully",
      message: `Invoice ${newSale.invoiceNumber} verified for ${customerName} (£${total.toFixed(2)})`,
      timestamp: new Date().toISOString(),
      read: false
    });

    res.json({ success: true, sale: newSale });
  } catch(e:any) { res.status(500).json({ error: e.message }); }
});

app.post("/api/assistant/chat", async (req, res) => {
  const { message, history } = req.body;
  
  try {
    const products = await Product.find({ status: { $in: ["Low Stock", "Out of Stock"] } });
    const lowStockList = products.filter(p => p.status === "Low Stock").map(p => `- ${p.name} (SKU: ${p.sku}, Qty: ${p.quantity})`).join("\n");
    const outOfStockList = products.filter(p => p.status === "Out of Stock").map(p => `- ${p.name}`).join("\n");
    const pl = await Product.find();
    const settingsList = await CompanySettings.findOne() || { currency: "PKR", taxRate: 8 };

    let totalVal = 0;
    let sellingVal = 0;
    let totalQty = 0;
    pl.forEach(p => { 
      totalVal += (p.quantity * p.purchasePrice); 
      sellingVal += (p.quantity * p.sellingPrice); 
      totalQty += p.quantity;
    });

    const sales = await Sale.find();
    let slTotal = 0;
    sales.forEach(s => slTotal += s.total);

    const suppliers = await Supplier.find();
    const slItems = suppliers.map(s => `- ${s.name}`).join("\n");
    
    // We trim the context to keep it concise but populated with DB values 
    const systemContext = `
    You are 'Inventra AI - Virtual Warehouse Co-Pilot'.
    Metrics:
    - Products: ${pl.length}
    - Total units: ${totalQty}
    - Inventory Cost: ${settingsList.currency} ${totalVal.toFixed(2)}
    - Sales Ledger Count: ${sales.length}
    - Sales Revenue: ${settingsList.currency} ${slTotal.toFixed(2)}
    Low Stock:
    ${lowStockList || "None"}
    Out of Stock:
    ${outOfStockList || "None"}

    Provide professional concise analytical replies based strongly on these actual DB records.
    `;

    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("Key missing");

    const ai = new GoogleGenAI({ apiKey: key });
    const currentPrompt = `${history.map((h:any) => `${h.role}: ${h.message}`).join("\n")}\nUser: ${message}\nAssistant:`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: currentPrompt,
      config: { systemInstruction: systemContext, temperature: 0.1 }
    });

    res.json({ role: "assistant", message: response.text });
  } catch (err: any) {
    res.json({ role: "assistant", message: "Sorry, I can only provide analytics when your API key is hooked up and Mongo aggregates are available. Please pass a valid query or fix secrets."});
  }
});

export default app;

if (process.env.NODE_ENV !== "production") {
  startFullStackServer();
  
  async function startFullStackServer() {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa"
      });
      app.use(vite.middlewares);
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Development Server with MongoDB running on http://localhost:${PORT}`);
      });
  }
}
