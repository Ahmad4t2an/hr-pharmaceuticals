import { SystemState, ClientProduct, ClientCategory, ClientBrand, Supplier, Customer, InventoryLog, Sale, PurchaseOrder, NotificationItem, CompanySettings, User } from "./src/types";

export function getInitialState(): any {
  const categories: any[] = [
    { id: "cat_med_1", name: "Tablets", description: "Solid oral dosage forms molded or compressed into small disks.", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150&auto=format&fit=crop&q=60" },
    { id: "cat_med_2", name: "Capsules", description: "Gelatin shells containing dry powder or liquid pharmaceutical ingredients.", image: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=150&auto=format&fit=crop&q=60" },
    { id: "cat_med_3", name: "Syrups & Suspensions", description: "Liquid oral formulations, pediatric suspensions, and soothing elixirs.", image: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=150&auto=format&fit=crop&q=60" },
    { id: "cat_med_4", name: "Injections", description: "Sterile solutions, suspensions, or emulsions for clinical parenteral infusion.", image: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=150&auto=format&fit=crop&q=60" },
    { id: "cat_med_5", name: "Creams & Ointments", description: "Semi-solid therapeutic pastes and protective topical creams.", image: "https://images.unsplash.com/photo-1628238608264-e27910080883?w=150&auto=format&fit=crop&q=60" },
    { id: "cat_med_6", name: "Inhalers & Sprays", description: "Aerosols and dry powders delivered directly to the pulmonary system.", image: "https://images.unsplash.com/photo-1599610928290-79872ee60f9e?w=150&auto=format&fit=crop&q=60" }
  ];

  const brands: any[] = [
    { id: "br_med_1", name: "GlaxoSmithKline (GSK)", logoUrl: "#0369a1" },
    { id: "br_med_2", name: "Searle Pakistan", logoUrl: "#0d9488" },
    { id: "br_med_3", name: "Abbott Laboratories", logoUrl: "#0284c7" },
    { id: "br_med_4", name: "Getz Pharma", logoUrl: "#4f46e5" },
    { id: "br_med_5", name: "Pfizer Pakistan", logoUrl: "#2563eb" },
    { id: "br_med_6", name: "Ferozsons Labs", logoUrl: "#7c3aed" }
  ];

  const suppliers: any[] = [
    { id: "sup_med_1", name: "HR Pharma Distributors", contact: "Zafar Iqbal", email: "zafar@hrpharma.com.pk", phone: "+92-300-555-1200", address: "Plot 14, I-9 Industrial Area, Islamabad" },
    { id: "sup_med_2", name: "Khyber Medical Supplies", contact: "Amir Khan", email: "amir@khybermed.com", phone: "+92-91-555-8902", address: "Karkhano Market, Peshawar" },
    { id: "sup_med_3", name: "Karachi Drug House", contact: "Tariq Saeed", email: "sales@kdh.com.pk", phone: "+92-21-3555-1033", address: "Medicine Market, Clifton, Karachi" },
    { id: "sup_med_4", name: "Lahore Allied Drug Syndicate", contact: "Zainab Malik", email: "zainab@alliedlahore.pk", phone: "+92-42-111-222-333", address: "Circular Road, Lahore" }
  ];

  const customers: any[] = [
    { id: "cust_med_1", name: "Aga Khan University Hospital Pharmacy", email: "pharmacy@akuh.edu", phone: "+92-21-111-911-911", address: "Stadium Road, Karachi" },
    { id: "cust_med_2", name: "Fazal Din & Sons Drugstore", email: "orders@fazaldins.com.pk", phone: "+92-42-111-329-329", address: "The Mall, Lahore" },
    { id: "cust_med_3", name: "Servaid Pharmacy HQ", email: "procurement@servaid.com.pk", phone: "+92-42-111-737-824", address: "Gulberg III, Lahore" },
    { id: "cust_med_4", name: "Mayo Hospital Surgical Drugstore", email: "mayo@punjab.gov.pk", phone: "+92-42-99211129", address: "Hospital Road, Lahore" },
    { id: "cust_med_5", name: "Shifa International Pharmacy", email: "shifa@shifa.com.pk", phone: "+92-51-846-3000", address: "H-8/4, Islamabad" }
  ];

  const medSpecs = [
    { name: "Panadol 500mg Tablets (Paracetamol)", sku: "MED-PAN-500", catId: "cat_med_1", brandId: "br_med_1", purchasePrice: 15, sellingPrice: 20, quantity: 245, description: "Effective painkiller and fever reducer." },
    { name: "Augmentin 375mg (Co-Amoxiclav)", sku: "MED-AUG-375", catId: "cat_med_1", brandId: "br_med_1", purchasePrice: 220, sellingPrice: 280, quantity: 45, description: "Broad-spectrum antibacterial therapy." }
  ];

  const products: any[] = medSpecs.map((spec, index) => {
    const id = `prod_med_${index + 1}`;
    const qty = spec.quantity;
    const minStock = 20;

    let status = "In Stock";
    if (qty <= 0) status = "Out of Stock";
    else if (qty <= 20) status = "Low Stock";

    let image = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80";

    return {
      id, name: spec.name, sku: spec.sku, barcode: `89012345${(index + 1).toString().padStart(5, "0")}`,
      categoryId: spec.catId, brandId: spec.brandId, description: spec.description,
      purchasePrice: spec.purchasePrice, sellingPrice: spec.sellingPrice, quantity: qty,
      minimumStockLevel: minStock, supplierId: "sup_med_1", status, images: [image]
    };
  });

  const inventoryLogs: any[] = [
    { id: "log_1", productId: "prod_med_1", productName: "Panadol 500mg Tablets (Paracetamol)", sku: "MED-PAN-500", type: "Stock In", quantity: 500, reason: "Initial setup batch from GSK Pakistan", timestamp: "2026-06-01T10:30:00Z", user: "Alex Mercer" }
  ];

  const sales: any[] = [
    {
      id: "sale_1",
      invoiceNumber: "HRP-2026-0001",
      customerId: "cust_med_1",
      customerName: "Aga Khan University Hospital Pharmacy",
      items: [
        { productId: "prod_med_1", productName: "Panadol 500mg Tablets (Paracetamol)", sku: "MED-PAN-500", quantity: 15, priceAtSale: 20, totalPrice: 300 }
      ],
      subtotal: 300, discount: 0, tax: 24, total: 324, status: "Paid", timestamp: "2026-06-07T11:45:00Z"
    }
  ];

  const purchases: any[] = [
    {
      id: "po_1", poNumber: "PO-2026-0001", supplierId: "sup_med_1", supplierName: "HR Pharma Distributors",
      items: [{ productId: "prod_med_2", productName: "Augmentin 375mg (Co-Amoxiclav)", sku: "MED-AUG-375", quantity: 100, costAtPurchase: 220, totalCost: 22000 }],
      subtotal: 22000, tax: 1760, total: 23760, status: "Completed", paymentStatus: "Paid", timestamp: "2026-05-28T09:00:00Z"
    }
  ];

  const notifications: any[] = [];

  const settings = {
    companyName: "HR Pharmaceuticals", email: "info@hrpharma.com.pk", phone: "+92-51-111-HR-PHARMA",
    address: "Industrial Area Sector I-9, Islamabad, Pakistan", currency: "PKR", taxRate: 8, invoicePrefix: "HRP-"
  };

  const users: any[] = [
    { id: "u_1", email: "admin@inventra.ai", name: "Alex Mercer", role: "Admin", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80" },
    { id: "u_2", email: "manager@inventra.ai", name: "David Vance", role: "Manager", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80" }
  ];

  return { users, products, categories, brands, suppliers, customers, inventoryLogs, sales, purchases, notifications, settings };
}
