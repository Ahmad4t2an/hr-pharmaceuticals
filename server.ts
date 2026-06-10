import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { 
  SystemState, 
  ClientProduct, 
  ClientCategory, 
  ClientBrand, 
  Supplier, 
  Customer, 
  InventoryLog, 
  Sale, 
  PurchaseOrder, 
  NotificationItem, 
  CompanySettings,
  User
} from "./src/types";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Path to data file
const DATA_DIR = path.join(process.cwd(), "data");
const DATABASE_FILE = path.join(DATA_DIR, "database.json");

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// Initial mockup database generator
function getInitialState(): SystemState {
  const categories: ClientCategory[] = [
    { id: "cat_med_1", name: "Tablets", description: "Solid oral dosage forms molded or compressed into small disks.", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150&auto=format&fit=crop&q=60" },
    { id: "cat_med_2", name: "Capsules", description: "Gelatin shells containing dry powder or liquid pharmaceutical ingredients.", image: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=150&auto=format&fit=crop&q=60" },
    { id: "cat_med_3", name: "Syrups & Suspensions", description: "Liquid oral formulations, pediatric suspensions, and soothing elixirs.", image: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=150&auto=format&fit=crop&q=60" },
    { id: "cat_med_4", name: "Injections", description: "Sterile solutions, suspensions, or emulsions for clinical parenteral infusion.", image: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=150&auto=format&fit=crop&q=60" },
    { id: "cat_med_5", name: "Creams & Ointments", description: "Semi-solid therapeutic pastes and protective topical creams.", image: "https://images.unsplash.com/photo-1628238608264-e27910080883?w=150&auto=format&fit=crop&q=60" },
    { id: "cat_med_6", name: "Inhalers & Sprays", description: "Aerosols and dry powders delivered directly to the pulmonary system.", image: "https://images.unsplash.com/photo-1599610928290-79872ee60f9e?w=150&auto=format&fit=crop&q=60" }
  ];

  const brands: ClientBrand[] = [
    { id: "br_med_1", name: "GlaxoSmithKline (GSK)", logoUrl: "#0369a1" },
    { id: "br_med_2", name: "Searle Pakistan", logoUrl: "#0d9488" },
    { id: "br_med_3", name: "Abbott Laboratories", logoUrl: "#0284c7" },
    { id: "br_med_4", name: "Getz Pharma", logoUrl: "#4f46e5" },
    { id: "br_med_5", name: "Pfizer Pakistan", logoUrl: "#2563eb" },
    { id: "br_med_6", name: "Ferozsons Labs", logoUrl: "#7c3aed" }
  ];

  const suppliers: Supplier[] = [
    { id: "sup_med_1", name: "HR Pharma Distributors", contact: "Zafar Iqbal", email: "zafar@hrpharma.com.pk", phone: "+92-300-555-1200", address: "Plot 14, I-9 Industrial Area, Islamabad" },
    { id: "sup_med_2", name: "Khyber Medical Supplies", contact: "Amir Khan", email: "amir@khybermed.com", phone: "+92-91-555-8902", address: "Karkhano Market, Peshawar" },
    { id: "sup_med_3", name: "Karachi Drug House", contact: "Tariq Saeed", email: "sales@kdh.com.pk", phone: "+92-21-3555-1033", address: "Medicine Market, Clifton, Karachi" },
    { id: "sup_med_4", name: "Lahore Allied Drug Syndicate", contact: "Zainab Malik", email: "zainab@alliedlahore.pk", phone: "+92-42-111-222-333", address: "Circular Road, Lahore" }
  ];

  const customers: Customer[] = [
    { id: "cust_med_1", name: "Aga Khan University Hospital Pharmacy", email: "pharmacy@akuh.edu", phone: "+92-21-111-911-911", address: "Stadium Road, Karachi" },
    { id: "cust_med_2", name: "Fazal Din & Sons Drugstore", email: "orders@fazaldins.com.pk", phone: "+92-42-111-329-329", address: "The Mall, Lahore" },
    { id: "cust_med_3", name: "Servaid Pharmacy HQ", email: "procurement@servaid.com.pk", phone: "+92-42-111-737-824", address: "Gulberg III, Lahore" },
    { id: "cust_med_4", name: "Mayo Hospital Surgical Drugstore", email: "mayo@punjab.gov.pk", phone: "+92-42-99211129", address: "Hospital Road, Lahore" },
    { id: "cust_med_5", name: "Shifa International Pharmacy", email: "shifa@shifa.com.pk", phone: "+92-51-846-3000", address: "H-8/4, Islamabad" }
  ];

  const medSpecs = [
    { name: "Panadol 500mg Tablets (Paracetamol)", sku: "MED-PAN-500", catId: "cat_med_1", brandId: "br_med_1", purchasePrice: 15, sellingPrice: 20, quantity: 245, description: "Effective painkiller and fever reducer." },
    { name: "Augmentin 375mg (Co-Amoxiclav)", sku: "MED-AUG-375", catId: "cat_med_1", brandId: "br_med_1", purchasePrice: 220, sellingPrice: 280, quantity: 45, description: "Broad-spectrum antibacterial therapy." },
    { name: "Augmentin DS Suspension 156mg/5ml", sku: "MED-AUG-DSP", catId: "cat_med_3", brandId: "br_med_1", purchasePrice: 180, sellingPrice: 220, quantity: 18, description: "Pediatric liquid antibiotic suspension." },
    { name: "Amoxil 250mg Capsules", sku: "MED-AMX-250", catId: "cat_med_2", brandId: "br_med_1", purchasePrice: 90, sellingPrice: 110, quantity: 85, description: "Bacterial infections treatment capsule." },
    { name: "Brufen 400mg Tablets (Ibuprofen)", sku: "MED-BRU-400", catId: "cat_med_1", brandId: "br_med_3", purchasePrice: 35, sellingPrice: 48, quantity: 190, description: "Anti-inflammatory pain relief tablets." },
    { name: "Brufen Pediatric Oral Syrup", sku: "MED-BRU-SYP", catId: "cat_med_3", brandId: "br_med_3", purchasePrice: 65, sellingPrice: 85, quantity: 12, description: "Fever and pain relief syrup for children." },
    { name: "Flagyl 400mg Tablets (Metronidazole)", sku: "MED-FLG-400", catId: "cat_med_1", brandId: "br_med_2", purchasePrice: 42, sellingPrice: 55, quantity: 300, description: "Anti-protozoal and anti-bacterial therapy." },
    { name: "Flagyl Suspension 200mg/5ml", sku: "MED-FLG-SYP", catId: "cat_med_3", brandId: "br_med_2", purchasePrice: 50, sellingPrice: 65, quantity: 94, description: "For stomach infections and amoebiasis." },
    { name: "Ponstan 250mg Capsules (Mefenamic Acid)", sku: "MED-PON-250", catId: "cat_med_2", brandId: "br_med_5", purchasePrice: 25, sellingPrice: 35, quantity: 450, description: "Provides relief from dental and menstrual pain." },
    { name: "Surbex-Z High-Potency Tablets", sku: "MED-SRB-Z", catId: "cat_med_1", brandId: "br_med_3", purchasePrice: 280, sellingPrice: 350, quantity: 8, description: "Vitamin B-Complex with Vitamin C & Zinc." },
    { name: "Cac-1000 Plus Orange Effervescent", sku: "MED-CAC-1K", catId: "cat_med_1", brandId: "br_med_1", purchasePrice: 250, sellingPrice: 310, quantity: 0, description: "Daily Calcium + Vitamin D3 supplements." },
    { name: "Risek 40mg Capsules (Omeprazole)", sku: "MED-RIS-40", catId: "cat_med_2", brandId: "br_med_4", purchasePrice: 320, sellingPrice: 400, quantity: 110, description: "Inhibits gastric acid secretion." },
    { name: "Neuromet 500mcg (Methylcobalamin)", sku: "MED-NEU-500", catId: "cat_med_1", brandId: "br_med_4", purchasePrice: 180, sellingPrice: 230, quantity: 60, description: "Active Vitamin B12 for nerve regeneration." },
    { name: "Loprin 75mg Low-Dose Aspirin", sku: "MED-LOP-75", catId: "cat_med_1", brandId: "br_med_4", purchasePrice: 15, sellingPrice: 22, quantity: 500, description: "Cardioprotection blood thinner." },
    { name: "Ventolin Inhaler 100mcg (Salbutamol)", sku: "MED-VEN-INH", catId: "cat_med_6", brandId: "br_med_1", purchasePrice: 190, sellingPrice: 240, quantity: 5, description: "Bronchodiator for asthma relief." },
    { name: "Ventolin Expectorant Syrup", sku: "MED-VEN-SYP", catId: "cat_med_3", brandId: "br_med_1", purchasePrice: 75, sellingPrice: 95, quantity: 38, description: "Cough and breathing relief syrup." },
    { name: "Hydryllin Cough Syrup", sku: "MED-HYD-SYP", catId: "cat_med_3", brandId: "br_med_2", purchasePrice: 80, sellingPrice: 105, quantity: 125, description: "Relieves dry cough and allergic congestion." },
    { name: "Zantac 150mg Tablets (Ranitidine)", sku: "MED-ZAN-150", catId: "cat_med_1", brandId: "br_med_1", purchasePrice: 40, sellingPrice: 55, quantity: 0, description: "Reduces stomach acid to treat ulcers." },
    { name: "Arinac Forte Tablets", sku: "MED-ARI-FT", catId: "cat_med_1", brandId: "br_med_3", purchasePrice: 60, sellingPrice: 80, quantity: 72, description: "Cold, sinus pressure, and pain relief." },
    { name: "Avil 25mg Tablets (Pheniramine)", sku: "MED-AVL-25", catId: "cat_med_1", brandId: "br_med_2", purchasePrice: 15, sellingPrice: 20, quantity: 350, description: "Allergy and motion sickness therapy." },
    { name: "Septran DS Tablets", sku: "MED-SEP-DS", catId: "cat_med_1", brandId: "br_med_1", purchasePrice: 110, sellingPrice: 140, quantity: 65, description: "Bacterial chest and urinary tract therapies." },
    { name: "Klaricid 500mg (Clarithromycin)", sku: "MED-KLC-500", catId: "cat_med_1", brandId: "br_med_3", purchasePrice: 450, sellingPrice: 550, quantity: 48, description: "Macrolide antibiotic for severe chest infections." },
    { name: "Lowplat 75mg (Clopidogrel)", sku: "MED-LWP-75", catId: "cat_med_1", brandId: "br_med_4", purchasePrice: 130, sellingPrice: 170, quantity: 120, description: "Prevents stroke and blood clots." },
    { name: "Softin 10mg Tablets (Loratadine)", sku: "MED-SFT-10", catId: "cat_med_1", brandId: "br_med_4", purchasePrice: 90, sellingPrice: 120, quantity: 15, description: "Non-drowsy 24-hour allergy relief." },
    { name: "Epival Chrono 500mg Tablets", sku: "MED-EPI-500", catId: "cat_med_1", brandId: "br_med_3", purchasePrice: 380, sellingPrice: 470, quantity: 33, description: "Anti-seizure and mood stabilizer." },
    { name: "Tegral 200mg (Carbamazepine)", sku: "MED-TEG-200", catId: "cat_med_1", brandId: "br_med_2", purchasePrice: 140, sellingPrice: 180, quantity: 80, description: "Treatment of neuralgia and epilepsy." },
    { name: "Lipiget 10mg (Atorvastatin)", sku: "MED-LIP-10", catId: "cat_med_1", brandId: "br_med_4", purchasePrice: 210, sellingPrice: 260, quantity: 14, description: "Cholesterol lowering statin therapy." },
    { name: "Concor 5mg Tablets (Bisoprolol)", sku: "MED-CON-5", catId: "cat_med_1", brandId: "br_med_3", purchasePrice: 190, sellingPrice: 240, quantity: 95, description: "Beta-blocker for blood pressure management." },
    { name: "Capoten 25mg (Captopril)", sku: "MED-CAP-25", catId: "cat_med_1", brandId: "br_med_1", purchasePrice: 120, sellingPrice: 160, quantity: 0, description: "ACE inhibitor for heart failure patients." },
    { name: "Xanax 0.5mg Tablets (Alprazolam)", sku: "MED-XAN-05", catId: "cat_med_1", brandId: "br_med_5", purchasePrice: 90, sellingPrice: 125, quantity: 160, description: "Treatment of extreme anxiety panic." },
    { name: "Lexotanil 3mg Tablets (Bromazepam)", sku: "MED-LEX-3", catId: "cat_med_1", brandId: "br_med_2", purchasePrice: 130, sellingPrice: 175, quantity: 140, description: "Anxiolytic muscle-relaxation therapy." },
    { name: "Rivotril 2mg Tablets (Clonazepam)", sku: "MED-RIV-2", catId: "cat_med_1", brandId: "br_med_2", purchasePrice: 110, sellingPrice: 150, quantity: 180, description: "Controls severe panic disorders & seizures." },
    { name: "Polyfax Skin Ointment 20g", sku: "MED-POL-SKN", catId: "cat_med_5", brandId: "br_med_1", purchasePrice: 85, sellingPrice: 110, quantity: 210, description: "Double antibiotic ointment for skin wounds." },
    { name: "Polyfax Eye Ointment 4g", sku: "MED-POL-EYE", catId: "cat_med_5", brandId: "br_med_1", purchasePrice: 45, sellingPrice: 60, quantity: 19, description: "Sterile ophthalmic dual-antibiotic." },
    { name: "Betnovate-N Cream 20g", sku: "MED-BET-N", catId: "cat_med_5", brandId: "br_med_1", purchasePrice: 70, sellingPrice: 92, quantity: 145, description: "Anti-inflammatory topical steroid with antibacterial." },
    { name: "Dermovate Cream 20g (Clobetasol)", sku: "MED-DER-CRM", catId: "cat_med_5", brandId: "br_med_1", purchasePrice: 95, sellingPrice: 125, quantity: 130, description: "Highly potent corticosteroid cream." },
    { name: "Sancos Syrup 120ml", sku: "MED-SNC-SYP", catId: "cat_med_3", brandId: "br_med_2", purchasePrice: 90, sellingPrice: 115, quantity: 110, description: "Productive chest congestion cough syrup." },
    { name: "Ascard 75mg Cardio Tablets", sku: "MED-ASC-75", catId: "cat_med_1", brandId: "br_med_2", purchasePrice: 20, sellingPrice: 28, quantity: 340, description: "Prevents platelet aggregation." },
    { name: "Glucophage 500mg (Metformin)", sku: "MED-GLU-500", catId: "cat_med_1", brandId: "br_med_3", purchasePrice: 80, sellingPrice: 110, quantity: 380, description: "First line anti-diabetic medication." },
    { name: "Amaryl 2mg Tablets (Glimepiride)", sku: "MED-AMR-2", catId: "cat_med_1", brandId: "br_med_2", purchasePrice: 170, sellingPrice: 220, quantity: 145, description: "Sulfanylurea anti-diabetic blood regulator." },
    { name: "Solocense 50mg Tablets", sku: "MED-SOL-50", catId: "cat_med_1", brandId: "br_med_4", purchasePrice: 110, sellingPrice: 154, quantity: 90, description: "Fast-acting pain and arthritis relief." },
    { name: "Myrin P Tablets", sku: "MED-MYR-P", catId: "cat_med_1", brandId: "br_med_2", purchasePrice: 480, sellingPrice: 590, quantity: 28, description: "Anti-tuberculosis drug combination." },
    { name: "Fefol-Vit Spansule Capsules", sku: "MED-FEF-VIT", catId: "cat_med_2", brandId: "br_med_1", purchasePrice: 120, sellingPrice: 160, quantity: 195, description: "Iron & vitamin supplement for pregnancy." },
    { name: "Zentel 400mg (Albendazole)", sku: "MED-ZEN-400", catId: "cat_med_1", brandId: "br_med_1", purchasePrice: 45, sellingPrice: 60, quantity: 11, description: "Single-dose anthelmintic dewormer." },
    { name: "Velocef 500mg Capsules (Cephradine)", sku: "MED-VEL-500", catId: "cat_med_2", brandId: "br_med_1", purchasePrice: 380, sellingPrice: 460, quantity: 82, description: "Cephalosporin antibiotic capsule." },
    { name: "Leflox 500mg (Levofloxacin)", sku: "MED-LEF-500", catId: "cat_med_1", brandId: "br_med_4", purchasePrice: 280, sellingPrice: 350, quantity: 60, description: "Fluoroquinolone for sinus and pneumonia." },
    { name: "Sitara 50mg Tablets (Sitagliptin)", sku: "MED-SIT-50", catId: "cat_med_1", brandId: "br_med_4", purchasePrice: 420, sellingPrice: 520, quantity: 0, description: "DPP-4 inhibitor for type 2 diabetes." },
    { name: "Neurobion Amps Injections", sku: "MED-NRB-INJ", catId: "cat_med_4", brandId: "br_med_3", purchasePrice: 150, sellingPrice: 190, quantity: 90, description: "High dose vitamin B1, B6, B12 injections." },
    { name: "Gravinate Inj 50mg/1ml", sku: "MED-GRV-INJ", catId: "cat_med_4", brandId: "br_med_2", purchasePrice: 60, sellingPrice: 80, quantity: 18, description: "Injectable for acute nausea and vomiting." },
    { name: "Amoxil Forte Injection 500mg", sku: "MED-AMX-INJ", catId: "cat_med_4", brandId: "br_med_1", purchasePrice: 110, sellingPrice: 145, quantity: 42, description: "Intravenous antibiotic vial." }
  ];

  const products: ClientProduct[] = medSpecs.map((spec, index) => {
    const id = `prod_med_${index + 1}`;
    const qty = spec.quantity;
    const minStock = spec.sku === "MED-SRB-Z" || spec.sku === "MED-VEN-INH" || spec.sku === "MED-POL-EYE" || spec.sku === "MED-GRV-INJ" || spec.sku === "MED-ZEN-400" ? 20 : 20; // default 20 limit

    let status: "In Stock" | "Low Stock" | "Out of Stock" = "In Stock";
    if (qty <= 0) {
      status = "Out of Stock";
    } else if (qty <= 20) {
      status = "Low Stock";
    }

    let image = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80"; // capsules
    if (spec.catId === "cat_med_3") {
      image = "https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&auto=format&fit=crop&q=80"; // liquid
    } else if (spec.catId === "cat_med_5") {
      image = "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400&auto=format&fit=crop&q=80"; // creams
    } else if (spec.catId === "cat_med_4") {
      image = "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400&auto=format&fit=crop&q=80"; // syringe
    } else if (spec.catId === "cat_med_6") {
      image = "https://images.unsplash.com/photo-1599610928290-79872ee60f9e?w=400&auto=format&fit=crop&q=80"; // spray
    }

    return {
      id,
      name: spec.name,
      sku: spec.sku,
      barcode: `89012345${(index + 1).toString().padStart(5, "0")}`,
      categoryId: spec.catId,
      brandId: spec.brandId,
      description: spec.description,
      purchasePrice: spec.purchasePrice,
      sellingPrice: spec.sellingPrice,
      quantity: qty,
      minimumStockLevel: minStock,
      supplierId: index % 3 === 0 ? "sup_med_1" : index % 3 === 1 ? "sup_med_2" : "sup_med_3",
      status,
      images: [image]
    };
  });

  // Logs spanning past weeks
  const inventoryLogs: InventoryLog[] = [
    { id: "log_1", productId: "prod_med_1", productName: "Panadol 500mg Tablets (Paracetamol)", sku: "MED-PAN-500", type: "Stock In", quantity: 500, reason: "Initial setup batch from GSK Pakistan", timestamp: "2026-06-01T10:30:00Z", user: "Alex Mercer" },
    { id: "log_2", productId: "prod_med_11", productName: "Cac-1000 Plus Orange Effervescent", sku: "MED-CAC-1K", type: "Stock Out", quantity: 50, reason: "Bulk supply delivery to Servaid Pharmacy HQ", timestamp: "2026-06-04T14:22:00Z", user: "David Vance" },
    { id: "log_3", productId: "prod_med_5", productName: "Brufen 400mg Tablets (Ibuprofen)", sku: "MED-BRU-400", type: "Stock Adjustment", quantity: -5, reason: "Damaged tablet strip disposal during audit", timestamp: "2026-06-08T09:12:00Z", user: "Alex Mercer" }
  ];

  const sales: Sale[] = [
    {
      id: "sale_1",
      invoiceNumber: "HRP-2026-0001",
      customerId: "cust_med_1",
      customerName: "Aga Khan University Hospital Pharmacy",
      items: [
        { productId: "prod_med_1", productName: "Panadol 500mg Tablets (Paracetamol)", sku: "MED-PAN-500", quantity: 15, priceAtSale: 20, totalPrice: 300 },
        { productId: "prod_med_2", productName: "Augmentin 375mg (Co-Amoxiclav)", sku: "MED-AUG-375", quantity: 10, priceAtSale: 280, totalPrice: 2800 }
      ],
      subtotal: 3100,
      discount: 100,
      tax: 240, // 8% of (3100 - 100)
      total: 3240,
      status: "Paid",
      timestamp: "2026-06-07T11:45:00Z"
    },
    {
      id: "sale_2",
      invoiceNumber: "HRP-2026-0002",
      customerId: "cust_med_3",
      customerName: "Servaid Pharmacy HQ",
      items: [
        { productId: "prod_med_12", productName: "Risek 40mg Capsules (Omeprazole)", sku: "MED-RIS-40", quantity: 30, priceAtSale: 400, totalPrice: 12000 },
        { productId: "prod_med_14", productName: "Loprin 75mg Low-Dose Aspirin", sku: "MED-LOP-75", quantity: 50, priceAtSale: 22, totalPrice: 1100 }
      ],
      subtotal: 13100,
      discount: 500,
      tax: 1008,
      total: 13608,
      status: "Paid",
      timestamp: "2026-06-09T16:10:00Z"
    },
    {
      id: "sale_3",
      invoiceNumber: "HRP-2026-0003",
      customerId: "cust_med_5",
      customerName: "Shifa International Pharmacy",
      items: [
        { productId: "prod_med_22", productName: "Klaricid 500mg (Clarithromycin)", sku: "MED-KLC-500", quantity: 4, priceAtSale: 550, totalPrice: 2200 },
        { productId: "prod_med_1", productName: "Panadol 500mg Tablets (Paracetamol)", sku: "MED-PAN-500", quantity: 40, priceAtSale: 20, totalPrice: 800 }
      ],
      subtotal: 3000,
      discount: 0,
      tax: 240,
      total: 3240,
      status: "Pending",
      timestamp: "2026-06-10T05:22:00Z" // Today!
    }
  ];

  const purchases: PurchaseOrder[] = [
    {
      id: "po_1",
      poNumber: "PO-2026-0001",
      supplierId: "sup_med_1",
      supplierName: "HR Pharma Distributors",
      items: [
        { productId: "prod_med_2", productName: "Augmentin 375mg (Co-Amoxiclav)", sku: "MED-AUG-375", quantity: 100, costAtPurchase: 220, totalCost: 22000 }
      ],
      subtotal: 22000,
      tax: 1760,
      total: 23760,
      status: "Completed",
      paymentStatus: "Paid",
      timestamp: "2026-05-28T09:00:00Z"
    },
    {
      id: "po_2",
      poNumber: "PO-2026-0002",
      supplierId: "sup_med_2",
      supplierName: "Khyber Medical Supplies",
      items: [
        { productId: "prod_med_10", productName: "Surbex-Z High-Potency Tablets", sku: "MED-SRB-Z", quantity: 50, costAtPurchase: 280, totalCost: 14000 }
      ],
      subtotal: 14000,
      tax: 1120,
      total: 15120,
      status: "Pending",
      paymentStatus: "Unpaid",
      timestamp: "2026-06-09T10:15:00Z"
    }
  ];

  const notifications: NotificationItem[] = [
    { id: "notif_1", type: "low_stock", title: "Low Stock Warning (20 Limit)", message: "Cac-1000 Effervescent has reached absolute 0 units.", timestamp: "2026-06-09T08:00:00Z", read: false },
    { id: "notif_2", type: "out_of_stock", title: "Out of Stock Warning (20 Limit)", message: "Only 5 units of Ventolin Inhaler remaining.", timestamp: "2026-06-09T14:23:00Z", read: false }
  ];

  const settings: CompanySettings = {
    companyName: "HR Pharmaceuticals",
    email: "info@hrpharma.com.pk",
    phone: "+92-51-111-HR-PHARMA",
    address: "Industrial Area Sector I-9, Islamabad, Pakistan",
    currency: "PKR",
    taxRate: 8,
    invoicePrefix: "HRP-"
  };

  const users: User[] = [
    { id: "u_1", email: "admin@inventra.ai", name: "Alex Mercer", role: "Admin", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80" },
    { id: "u_2", email: "manager@inventra.ai", name: "David Vance", role: "Manager", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80" },
    { id: "u_3", email: "employee@inventra.ai", name: "Clara Oswald", role: "Employee", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80" }
  ];

  return {
    users,
    products,
    categories,
    brands,
    suppliers,
    customers,
    inventoryLogs,
    sales,
    purchases,
    notifications,
    settings
  };
}

// Memory database instance
let db: SystemState;

function loadDatabase() {
  let needsReset = false;
  if (fs.existsSync(DATABASE_FILE)) {
    try {
      const content = fs.readFileSync(DATABASE_FILE, "utf-8");
      db = JSON.parse(content);
      console.log("Database successfully loaded from file.");
      
      // Auto migrate older non-pharmaceutical/USD configurations
      const hasHardware = db.products.some(p => p.name.includes("Tensor") || p.name.includes("Quantum") || p.name.includes("Cryo"));
      if (hasHardware || db.settings.currency !== "PKR" || db.products.length < 25) {
        console.log("Migrating older computer inventory storage to 50 medicines schema...");
        needsReset = true;
      }
    } catch (e) {
      console.error("Failed to parse database file, recovering with mock template.", e);
      needsReset = true;
    }
  } else {
    needsReset = true;
  }

  if (needsReset) {
    db = getInitialState();
    saveDatabase();
    console.log("Database initialized with modern pharmaceutical inventory state.");
  }
}

function saveDatabase() {
  try {
    fs.writeFileSync(DATABASE_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write to database file.", e);
  }
}

// Initialise DB
loadDatabase();

// --- Express API Endpoints ---

// Get complete database state
app.get("/api/db", (req, res) => {
  res.json(db);
});

// Update settings
app.post("/api/settings", (req, res) => {
  db.settings = { ...db.settings, ...req.body };
  saveDatabase();
  res.json({ success: true, settings: db.settings });
});

// Helper to dynamically calculate stock alert level - with standard threshold of <= 20 units
export function getProductStatus(quantity: number, minimumStockLevel: number): "In Stock" | "Low Stock" | "Out of Stock" {
  if (quantity <= 0) {
    return "Out of Stock";
  }
  // Auto alert kicks in if quantity is 20 or fewer products, or custom minimum level
  if (quantity <= 20 || quantity < minimumStockLevel) {
    return "Low Stock";
  }
  return "In Stock";
}

// 1. Products CRUD
app.post("/api/products", (req, res) => {
  const newProd: ClientProduct = {
    id: "prod_" + Date.now(),
    name: req.body.name || "Unnamed Product",
    sku: req.body.sku || "SKU-NEW",
    barcode: req.body.barcode || "",
    categoryId: req.body.categoryId || "",
    brandId: req.body.brandId || "",
    description: req.body.description || "",
    purchasePrice: Number(req.body.purchasePrice) || 0,
    sellingPrice: Number(req.body.sellingPrice) || 0,
    quantity: Number(req.body.quantity) || 0,
    minimumStockLevel: Number(req.body.minimumStockLevel) || 20, // Default minimum level to 20!
    supplierId: req.body.supplierId || "",
    status: "In Stock",
    images: req.body.images && req.body.images.length ? req.body.images : ["https://images.unsplash.com/photo-1591453089816-0fbb971b454c?w=400&auto=format&fit=crop&q=80"]
  };

  // set status
  newProd.status = getProductStatus(newProd.quantity, newProd.minimumStockLevel);

  db.products.push(newProd);

  // Trigger automated inventory lock log
  const newLog: InventoryLog = {
    id: "log_" + Date.now(),
    productId: newProd.id,
    productName: newProd.name,
    sku: newProd.sku,
    type: "Stock In",
    quantity: newProd.quantity,
    reason: "New product entry validation",
    timestamp: new Date().toISOString(),
    user: req.body.user || "Admin"
  };
  db.inventoryLogs.unshift(newLog);

  // Auto trigger stock alert if needed
  if (newProd.status !== "In Stock") {
    db.notifications.unshift({
      id: "notif_" + Date.now(),
      type: newProd.status === "Out of Stock" ? "out_of_stock" : "low_stock",
      title: `${newProd.status} Warning`,
      message: `${newProd.name} is stored at critical inventory status (${newProd.quantity} items).`,
      timestamp: new Date().toISOString(),
      read: false
    });
  }

  saveDatabase();
  res.json({ success: true, product: newProd });
});

app.put("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const index = db.products.findIndex(p => p.id === id);
  if (index !== -1) {
    const oldQty = db.products[index].quantity;
    const bodyQty = Number(req.body.quantity);
    const qtyDiff = bodyQty - oldQty;

    db.products[index] = {
      ...db.products[index],
      ...req.body,
      purchasePrice: Number(req.body.purchasePrice),
      sellingPrice: Number(req.body.sellingPrice),
      quantity: bodyQty,
      minimumStockLevel: Number(req.body.minimumStockLevel) || 20
    };

    // Calculate status again
    db.products[index].status = getProductStatus(bodyQty, db.products[index].minimumStockLevel);

    // Add log if quantity has changed
    if (qtyDiff !== 0) {
      db.inventoryLogs.unshift({
        id: "log_" + Date.now(),
        productId: id,
        productName: db.products[index].name,
        sku: db.products[index].sku,
        type: qtyDiff > 0 ? "Stock In" : "Stock Out",
        quantity: Math.abs(qtyDiff),
        reason: `Manual stock adjustment edit`,
        timestamp: new Date().toISOString(),
        user: req.body.user || "System"
      });
    }

    saveDatabase();
    res.json({ success: true, product: db.products[index] });
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

app.delete("/api/products/:id", (req, res) => {
  const { id } = req.params;
  db.products = db.products.filter(p => p.id !== id);
  saveDatabase();
  res.json({ success: true });
});

// 2. Categories CRUD
app.post("/api/categories", (req, res) => {
  const newCat: ClientCategory = {
    id: "cat_" + Date.now(),
    name: req.body.name || "New Category",
    description: req.body.description || "",
    image: req.body.image || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&auto=format&fit=crop&q=60"
  };
  db.categories.push(newCat);
  saveDatabase();
  res.json({ success: true, category: newCat });
});

app.put("/api/categories/:id", (req, res) => {
  const { id } = req.params;
  const idx = db.categories.findIndex(c => c.id === id);
  if (idx !== -1) {
    db.categories[idx] = { ...db.categories[idx], ...req.body };
    saveDatabase();
    res.json({ success: true, category: db.categories[idx] });
  } else {
    res.status(404).json({ error: "Category not found" });
  }
});

app.delete("/api/categories/:id", (req, res) => {
  const { id } = req.params;
  db.categories = db.categories.filter(c => c.id !== id);
  saveDatabase();
  res.json({ success: true });
});

// 3. Brands CRUD
app.post("/api/brands", (req, res) => {
  const newBrand: ClientBrand = {
    id: "br_" + Date.now(),
    name: req.body.name || "New Brand",
    logoUrl: req.body.logoUrl || "#6366f1"
  };
  db.brands.push(newBrand);
  saveDatabase();
  res.json({ success: true, brand: newBrand });
});

app.put("/api/brands/:id", (req, res) => {
  const { id } = req.params;
  const idx = db.brands.findIndex(b => b.id === id);
  if (idx !== -1) {
    db.brands[idx] = { ...db.brands[idx], ...req.body };
    saveDatabase();
    res.json({ success: true, brand: db.brands[idx] });
  } else {
    res.status(404).json({ error: "Brand not found" });
  }
});

app.delete("/api/brands/:id", (req, res) => {
  const { id } = req.params;
  db.brands = db.brands.filter(b => b.id !== id);
  saveDatabase();
  res.json({ success: true });
});

// 4. Stock Movement Operations
app.post("/api/inventory/movement", (req, res) => {
  const { productId, type, quantity, reason, targetWarehouse, user } = req.body;
  const qtyNum = Number(quantity);
  const pIndex = db.products.findIndex(p => p.id === productId);

  if (pIndex !== -1) {
    const product = db.products[pIndex];
    let movementLabel = "";

    if (type === "Stock In") {
      product.quantity += qtyNum;
      movementLabel = "Stock In";
    } else if (type === "Stock Out") {
      if (product.quantity < qtyNum) {
        return res.status(400).json({ error: "Insufficient inventory units." });
      }
      product.quantity -= qtyNum;
      movementLabel = "Stock Out";
    } else if (type === "Stock Adjustment") {
      // Direct rewrite
      product.quantity = qtyNum;
      movementLabel = "Stock Adjustment";
    } else if (type === "Stock Transfer") {
      if (product.quantity < qtyNum) {
        return res.status(400).json({ error: "Insufficient transfer quantities." });
      }
      product.quantity -= qtyNum;
      movementLabel = "Stock Transfer";
    }

    // Set Status
    product.status = getProductStatus(product.quantity, product.minimumStockLevel);

    // Add movement historical ledger
    const newLog: InventoryLog = {
      id: "log_" + Date.now(),
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      type: type,
      quantity: qtyNum,
      reason: reason || `${movementLabel} manual action`,
      timestamp: new Date().toISOString(),
      user: user || "System Operator"
    };

    db.inventoryLogs.unshift(newLog);

    // Auto trigger alert notification if low/out stock
    if (product.status !== "In Stock") {
      db.notifications.unshift({
        id: "notif_" + Date.now(),
        type: product.status === "Out of Stock" ? "out_of_stock" : "low_stock",
        title: `${product.status} Alarm`,
        message: `${product.name} transitioned to critical level (${product.quantity} items).`,
        timestamp: new Date().toISOString(),
        read: false
      });
    }

    saveDatabase();
    res.json({ success: true, product, log: newLog });
  } else {
    res.status(404).json({ error: "Inventory registry not found." });
  }
});

// 5. Purchases Management
app.post("/api/purchases", (req, res) => {
  const { supplierId, items, tax, user } = req.body;
  const supplierName = db.suppliers.find(s => s.id === supplierId)?.name || "Unknown Supplier";

  const formattedItems = items.map((i: any) => {
    const prod = db.products.find(p => p.id === i.productId);
    return {
      productId: i.productId,
      productName: prod?.name || "Unknown Product",
      sku: prod?.sku || "SKU-MOCK",
      quantity: Number(i.quantity),
      costAtPurchase: Number(i.costAtPurchase),
      totalCost: Number(i.quantity) * Number(i.costAtPurchase)
    };
  });

  const subtotal = formattedItems.reduce((acc: number, item: any) => acc + item.totalCost, 0);
  const taxFlat = subtotal * (Number(tax || db.settings.taxRate) / 100);
  const total = subtotal + taxFlat;

  const newPO: PurchaseOrder = {
    id: "po_" + Date.now(),
    poNumber: "PO-2026-" + String(db.purchases.length + 1).padStart(4, "0"),
    supplierId,
    supplierName,
    items: formattedItems,
    subtotal,
    tax: taxFlat,
    total,
    status: "Pending",
    paymentStatus: "Unpaid",
    timestamp: new Date().toISOString()
  };

  db.purchases.unshift(newPO);

  // Trigger Purchase Notification
  db.notifications.unshift({
    id: "notif_" + Date.now(),
    type: "purchase",
    title: "New Purchase Order Drafted",
    message: `PO ${newPO.poNumber} created for ${supplierName} seeking items (£${total.toFixed(2)})`,
    timestamp: new Date().toISOString(),
    read: false
  });

  saveDatabase();
  res.json({ success: true, purchaseOrder: newPO });
});

app.put("/api/purchases/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, paymentStatus } = req.body;
  const idx = db.purchases.findIndex(p => p.id === id);

  if (idx !== -1) {
    const oldStatus = db.purchases[idx].status;
    db.purchases[idx].status = status || db.purchases[idx].status;
    db.purchases[idx].paymentStatus = paymentStatus || db.purchases[idx].paymentStatus;

    // If transitioned to "Completed", auto update stock quantity!
    if (status === "Completed" && oldStatus !== "Completed") {
      db.purchases[idx].items.forEach(item => {
        const pIdx = db.products.findIndex(p => p.id === item.productId);
        if (pIdx !== -1) {
          db.products[pIdx].quantity += item.quantity;
          db.products[pIdx].status = getProductStatus(db.products[pIdx].quantity, db.products[pIdx].minimumStockLevel);

          // Register in storage movement ledger
          db.inventoryLogs.unshift({
            id: "log_" + Date.now() + "_" + item.productId,
            productId: item.productId,
            productName: item.productName,
            sku: item.sku,
            type: "Stock In",
            quantity: item.quantity,
            reason: `Sourced from finalized order ${db.purchases[idx].poNumber}`,
            timestamp: new Date().toISOString(),
            user: "Supplier Automatic Entry"
          });
        }
      });
    }

    saveDatabase();
    res.json({ success: true, purchaseOrder: db.purchases[idx] });
  } else {
    res.status(404).json({ error: "Purchase Order not found." });
  }
});

// 6. Sales Management
app.post("/api/sales", (req, res) => {
  const { customerId, items, discount, user } = req.body;
  const customerName = db.customers.find(c => c.id === customerId)?.name || "Retail Buyer";

  const formattedItems = items.map((i: any) => {
    const prod = db.products.find(p => p.id === i.productId);
    if (!prod) throw new Error(`Product ${i.productId} vanished.`);
    if (prod.quantity < Number(i.quantity)) {
      throw new Error(`Insufficient stock for ${prod.name}.`);
    }
    return {
      productId: i.productId,
      productName: prod.name,
      sku: prod.sku,
      quantity: Number(i.quantity),
      priceAtSale: Number(i.priceAtSale),
      totalPrice: Number(i.quantity) * Number(i.priceAtSale)
    };
  });

  const subtotal = formattedItems.reduce((acc: number, item: any) => acc + item.totalPrice, 0);
  const discountFlat = Number(discount || 0);
  const taxFlat = (subtotal - discountFlat) * (db.settings.taxRate / 100);
  const total = subtotal - discountFlat + taxFlat;

  // Realise quantity changes instantly for stock
  formattedItems.forEach((item: any) => {
    const pIdx = db.products.findIndex(p => p.id === item.productId);
    if (pIdx !== -1) {
      db.products[pIdx].quantity -= item.quantity;
      db.products[pIdx].status = getProductStatus(db.products[pIdx].quantity, db.products[pIdx].minimumStockLevel);

      // Movement logger
      db.inventoryLogs.unshift({
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

      // Notification check
      if (db.products[pIdx].status !== "In Stock") {
        db.notifications.unshift({
          id: "notif_" + Date.now(),
          type: db.products[pIdx].status === "Out of Stock" ? "out_of_stock" : "low_stock",
          title: "Automated Stock Trigger Alarm",
          message: `${db.products[pIdx].name} sold down to ${db.products[pIdx].quantity} units.`,
          timestamp: new Date().toISOString(),
          read: false
        });
      }
    }
  });

  const newSale: Sale = {
    id: "sale_" + Date.now(),
    invoiceNumber: `${db.settings.invoicePrefix}2026-` + String(db.sales.length + 1).padStart(4, "0"),
    customerId,
    customerName,
    items: formattedItems,
    subtotal,
    discount: discountFlat,
    tax: taxFlat,
    total,
    status: "Paid",
    timestamp: new Date().toISOString()
  };

  db.sales.unshift(newSale);

  db.notifications.unshift({
    id: "notif_sa_" + Date.now(),
    type: "new_order",
    title: "Sale Invoiced successfully",
    message: `Invoice ${newSale.invoiceNumber} verified for ${customerName} (£${total.toFixed(2)})`,
    timestamp: new Date().toISOString(),
    read: false
  });

  saveDatabase();
  res.json({ success: true, sale: newSale });
});

// 7. Customers CRUD
app.post("/api/customers", (req, res) => {
  const newC: Customer = {
    id: "cust_" + Date.now(),
    name: req.body.name || "Anonymous",
    phone: req.body.phone || "",
    email: req.body.email || "",
    address: req.body.address || ""
  };
  db.customers.push(newC);
  saveDatabase();
  res.json({ success: true, customer: newC });
});

app.put("/api/customers/:id", (req, res) => {
  const { id } = req.params;
  const idx = db.customers.findIndex(c => c.id === id);
  if (idx !== -1) {
    db.customers[idx] = { ...db.customers[idx], ...req.body };
    saveDatabase();
    res.json({ success: true, customer: db.customers[idx] });
  } else {
    res.status(404).json({ error: "Customer not registered." });
  }
});

app.delete("/api/customers/:id", (req, res) => {
  const { id } = req.params;
  db.customers = db.customers.filter(c => c.id !== id);
  saveDatabase();
  res.json({ success: true });
});

// 8. Suppliers CRUD
app.post("/api/suppliers", (req, res) => {
  const newS: Supplier = {
    id: "sup_" + Date.now(),
    name: req.body.name || "New Partner",
    contact: req.body.contact || "",
    email: req.body.email || "",
    phone: req.body.phone || "",
    address: req.body.address || ""
  };
  db.suppliers.push(newS);
  saveDatabase();
  res.json({ success: true, supplier: newS });
});

app.put("/api/suppliers/:id", (req, res) => {
  const { id } = req.params;
  const idx = db.suppliers.findIndex(s => s.id === id);
  if (idx !== -1) {
    db.suppliers[idx] = { ...db.suppliers[idx], ...req.body };
    saveDatabase();
    res.json({ success: true, supplier: db.suppliers[idx] });
  } else {
    res.status(404).json({ error: "Supplier not registered." });
  }
});

app.delete("/api/suppliers/:id", (req, res) => {
  const { id } = req.params;
  db.suppliers = db.suppliers.filter(s => s.id !== id);
  saveDatabase();
  res.json({ success: true });
});

// Notifications mark as read
app.post("/api/notifications/read", (req, res) => {
  db.notifications.forEach(n => { n.read = true; });
  saveDatabase();
  res.json({ success: true });
});

// Reset database trigger
app.post("/api/db/reset", (req, res) => {
  db = getInitialState();
  saveDatabase();
  res.json({ success: true, db });
});

// --- AI ASSISTANT BACKEND ---
// Real secure server-side endpoint calling Gemini API with live warehouse state context.
app.post("/api/assistant/chat", async (req, res) => {
  const { message, history } = req.body;

  // Check state to assemble telemetry/context
  const lowStockList = db.products.filter(p => p.status === "Low Stock").map(p => `- ${p.name} (SKU: ${p.sku}, Qty: ${p.quantity}, Min: ${p.minimumStockLevel})`).join("\n");
  const outOfStockList = db.products.filter(p => p.status === "Out of Stock").map(p => `- ${p.name} (SKU: ${p.sku})`).join("\n");
  
  // Sales aggregates
  const totalSalesCount = db.sales.length;
  const totalInvoicedVal = db.sales.reduce((acc, s) => acc + s.total, 0);
  const currentTotalVal = db.products.reduce((acc, p) => acc + (p.quantity * p.purchasePrice), 0);
  const currentSellVal = db.products.reduce((acc, p) => acc + (p.quantity * p.sellingPrice), 0);
  
  // Custom context construction
  const systemContext = `
  You are 'Inventra AI - Virtual Warehouse Co-Pilot', an enterprise-grade AI assistant operating over a high-performance inventory system.
  Here is the live, active database telemetry of the warehouse:
  
  COMPANY SETTINGS:
  - Currency: ${db.settings.currency}
  - Global Tax Rate: ${db.settings.taxRate}%
  - Active Location: Cupertino HQ
  
  WAREHOUSE HEALTH METRICS:
  - Total Active Products: ${db.products.length}
  - Total Stock Quantity: ${db.products.reduce((acc, p) => acc + p.quantity, 0)} units
  - Total Inventory Cost Valuation (Asset Value): ${db.settings.currency} ${db.products.reduce((acc, p) => acc + (p.quantity * p.purchasePrice), 0).toFixed(2)}
  - Potential Retail Valuation: ${db.settings.currency} ${db.products.reduce((acc, p) => acc + (p.quantity * p.sellingPrice), 0).toFixed(2)}
  - Unrealised Gross Margin Profit: ${db.settings.currency} ${(currentSellVal - currentTotalVal).toFixed(2)}
  
  LOW STOCK PRODUCTS (${db.products.filter(p => p.status === "Low Stock").length} items):
  ${lowStockList.length > 0 ? lowStockList : "None. All products have healthy stock ratios."}
  
  OUT OF STOCK PRODUCTS (${db.products.filter(p => p.status === "Out of Stock").length} items):
  ${outOfStockList.length > 0 ? outOfStockList : "None."}
  
  FINANCIALS & SALES SUMMARY:
  - Total Invoiced Sales Transactions: ${totalSalesCount}
  - Dynamic Sales Ledger Revenue Sum: ${db.settings.currency} ${totalInvoicedVal.toFixed(2)}
  - Net Invoiced Margin Profit Estimate: ${db.settings.currency} ${db.sales.reduce((sum, s) => {
    // estimate profit
    const costOfGoods = s.items.reduce((acc, item) => {
      const dbProd = db.products.find(p => p.id === item.productId);
      const purchasePrice = dbProd ? dbProd.purchasePrice : (item.priceAtSale * 0.6);
      return acc + (item.quantity * purchasePrice);
    }, 0);
    return sum + (s.total - costOfGoods - s.tax);
  }, 0).toFixed(2)}
  
  RECENT INVOICES LEDGER:
  ${db.sales.map(s => `- Invoice ${s.invoiceNumber}: ${s.customerName}, Status: ${s.status}, Total: ${db.settings.currency} ${s.total.toFixed(2)} (Date: ${s.timestamp})`).join("\n")}

  RECENT PURCHASES DRAFTS LEDGER:
  ${db.purchases.map(p => `- PO ${p.poNumber}: Supplier: ${p.supplierName}, Status: ${p.status}, Total: ${db.settings.currency} ${p.total.toFixed(2)}`).join("\n")}
  
  SUPPLIER BASE:
  ${db.suppliers.map(s => `- ${s.name} (Contact: ${s.contact}, Email: ${s.email})`).join("\n")}
  
  INSTRUCTIONS FOR AI COPILOT ANALYTICS:
  1. Base all your logic and figures strictly on the provided warehouse telemetry. Be precise!
  2. Maintain a highly professional, business-grade, analytical copilot vibe. Do not use overly enthusiastic or cartoonish speech.
  3. Format beautiful markdown responses, using bold tables, list highlights, and clean typography.
  4. Understand and reply fluently in Roman Urdu, Urdu, or English based on how the user asks questions!
  5. If the user asks about stock availability (e.g. "kitna stock hy total kitna para hy" / "total stock"), state that the total quantity stored is exactly ${db.products.reduce((acc, p) => acc + p.quantity, 0)} units across ${db.products.length} active SKUs.
  6. If the user asks about daily sales (e.g. "daily sales kitni hen" / "today sales" / "aaj ki sale"), point out that today's total registered sales revenue is ${db.settings.currency} ${db.sales.filter(s => s.timestamp.startsWith("2026-06-10") && s.status === "Paid").reduce((acc, s) => acc + s.total, 0).toFixed(2)} across ${db.sales.filter(s => s.timestamp.startsWith("2026-06-10") && s.status === "Paid").length} completed paid customer invoices today.
  7. If asked about the top-selling product (e.g. "top selling product kaunsa hy" / "sabse zyada bikne wala"), retrieve the top seller: the top seller is '${
    (() => {
      const sold: Record<string, {name: string; qty: number}> = {};
      db.sales.filter(s => s.status === "Paid").forEach(s => s.items.forEach(i => {
        sold[i.productId] = { name: i.productName, qty: (sold[i.productId]?.qty || 0) + i.quantity };
      }));
      let top = { name: "Quantum Super-RAM 64G", qty: 0 };
      Object.values(sold).forEach(o => { if (o.qty > top.qty) top = o; });
      return `${top.name} (${top.qty} units sold)`;
    })()
  }'.
  8. If asked about the Auto Alert feature (e.g. "auto alert options" / "20 products alert"), explain that a smart auto-alert triggers exactly when a product's stock reaches 20 or fewer products, raising the 'Low Stock Alert' flag immediately.
  `;

  // Start secure server-side Gemini request
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return res.status(200).json({ 
        role: "assistant", 
        message: "⚠️ **Gemini API Key missing.** To activate AI Co-Pilot answers, configure `GEMINI_API_KEY` in the **Settings > Secrets** panel in the AI Studio UI index." 
      });
    }

    const ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    // We build the full prompt incorporating history for continuity
    const promptHistory = (history || []).map((h: any) => `${h.role === "user" ? "User" : "Assistant"}: ${h.message}`).join("\n");
    const currentPrompt = `${promptHistory}\nUser: ${message}\nAssistant:`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: currentPrompt,
      config: {
        systemInstruction: systemContext,
        temperature: 0.1 // Keeping it accurate and analytical
      }
    });

    const reply = response.text || "Cannot retrieve a precise co-pilot response.";
    res.json({ role: "assistant", message: reply });
  } catch (error: any) {
    console.error("Gemini invocation error, fallback to Local Intelligence:", error);
    
    // Generate an incredibly high-quality, state-aware local fallback reply so the UI never breaks.
    const getLocalReply = (userMessage: string): string => {
      const msg = userMessage.toLowerCase();
      const cSign = db.settings.currency === "PKR" ? "Rs. " : db.settings.currency === "GBP" ? "£" : db.settings.currency === "EUR" ? "€" : "$";
      const numProducts = db.products.length;
      const totalUnits = db.products.reduce((acc, p) => acc + p.quantity, 0);
      const totalValuation = db.products.reduce((acc, p) => acc + (p.quantity * p.purchasePrice), 0).toFixed(2);
      const totalRetailVal = db.products.reduce((acc, p) => acc + (p.quantity * p.sellingPrice), 0).toFixed(2);
      const lowStockItems = db.products.filter(p => p.status === "Low Stock");
      const outOfStockItems = db.products.filter(p => p.status === "Out of Stock");
      
      // Calculate daily sales dynamic
      const todaySales = db.sales.filter(s => s.timestamp.startsWith("2026-06-10") && s.status === "Paid");
      const dailyEarned = todaySales.reduce((acc, s) => acc + s.total, 0).toFixed(2);
      const dailySalesCount = todaySales.length;

      // Calculate top selling dynamic
      const productSoldCount: Record<string, { name: string; quantity: number }> = {};
      db.sales.filter(s => s.status === "Paid").forEach(s => {
        s.items.forEach(item => {
          if (!productSoldCount[item.productId]) {
            productSoldCount[item.productId] = { name: item.productName, quantity: 0 };
          }
          productSoldCount[item.productId].quantity += item.quantity;
        });
      });
      let topSeller = { name: "Quantum Super-RAM 64G", quantity: 18 };
      Object.values(productSoldCount).forEach(p => {
        if (p.quantity > topSeller.quantity) {
          topSeller = p;
        }
      });

      let reply = `🤖 **Inventra Local Analytics Co-Pilot**\n\n`;

      // 1. Urdu / Roman Urdu total stock query detection
      if (msg.includes("total stock") || msg.includes("kitna stock") || msg.includes("kitna para") || msg.includes("stock kitna") || msg.includes("maal kitna") || msg.includes("mal kitna")) {
        reply += `### 🏭 Warehouse Stock Analytics (گودام کا سٹاک)\n`;
        reply += `Aapke warehouse me is waqt total **${totalUnits} units** available hain, jin me unique SKUs ki tadad **${numProducts}** hai.\n\n`;
        reply += `- **Total Inventory Value (Cost Price)**: **${cSign}${totalValuation}**\n`;
        reply += `- **Expected Retail Valuation**: **${cSign}${totalRetailVal}**\n`;
        reply += `- **Depleted Products (Out of Stock)**: \`${outOfStockItems.length}\` items\n`;
        reply += `- **Low Stock Alarms (Under 20 Units)**: \`${lowStockItems.length}\` items currently triggered!\n\n`;
        
        if (lowStockItems.length > 0) {
          reply += `#### ⚠️ Yeh items low stock alert levels par hain (Inka stock 20 ya is se kam hai):\n`;
          lowStockItems.slice(0, 5).forEach(p => {
            reply += `- **${p.name}** | Stock: \`${p.quantity} units left\` | Alert Threshold: \`<=${Math.max(20, p.minimumStockLevel)}\`\n`;
          });
        }
        return reply;
      }

      // 2. Daily sales & profit query detection (today/daily/aaj/sales)
      if (msg.includes("sales") || msg.includes("sell") || msg.includes("daily") || msg.includes("aaj") || msg.includes("rozana") || msg.includes("bikne") || msg.includes("sale") || msg.includes("profit")) {
        reply += `### 💼 Daily Sales Ledger & Revenue Analytics (روزانہ کی فروخت)\n`;
        reply += `Aapki aaj ki dynamic transaction ledgers details ye hain:\n\n`;
        reply += `- **Aaj Ki Total Sales (Revenue)**: **${cSign}${dailyEarned}**\n`;
        reply += `- **Completed Paid Invoices Today**: \`${dailySalesCount}\` invoices finalized today.\n`;
        reply += `- **Bento Top Selling Product**: **${topSeller.name}** (${topSeller.quantity} units sold overall).\n\n`;
        
        reply += `#### 📈 Sourcing Financial Health Overview\n`;
        reply += `| Invoice | Customer | Date | Total | Status |\n`;
        reply += `| :--- | :--- | :---: | :---: | :---: |\n`;
        db.sales.slice(0, 5).forEach(s => {
          reply += `| **${s.invoiceNumber}** | ${s.customerName} | ${s.timestamp.slice(0, 10)} | **${cSign}${s.total.toFixed(2)}** | \`${s.status}\` |\n`;
        });
        return reply;
      }

      // 3. Auto Alert / 20 products details
      if (msg.includes("alert") || msg.includes("warning") || msg.includes("limit") || msg.includes("khatam") || msg.includes("saftey") || msg.includes("alarm") || msg.includes("auto")) {
        reply += `### 🚨 Automatic Safety Stock Alert (آٹو الرٹ سسٹم)\n`;
        reply += `Humne system me automatic safety alert option active kar diya hai. \n\n`;
        reply += `> **Rule Applied**: Jab bhi kisi item ka stock **khatam hone se 20 units pehle** (<=\`20\` quantity) pahuchega, system automatic **Low Stock Alert** notification triggers kar dega taake aap time par restocking order place kar sakein.\n\n`;
        reply += `- Active Low Stock Trigger Items count: \`${lowStockItems.length}\` items active.\n`;
        reply += `- Critical Out of Stock count: \`${outOfStockItems.length}\` items.\n`;
        return reply;
      }

      // 4. Top selling specific query
      if (msg.includes("top") || msg.includes("best") || msg.includes("mashoor") || msg.includes("sabse zyada") || msg.includes("unche")) {
        reply += `### 🏆 Top Selling Inventory Leaderboard\n`;
        reply += `Aapke record logs me is waqt sabse zyada demand aur sales wala product ye hai:\n\n`;
        reply += `- **Top Product**: **${topSeller.name}**\n`;
        reply += `- **Total Quantity Sold**: \`${topSeller.quantity} units sold\`\n`;
        reply += `- **Current Stock Available**: \`${db.products.find(p => p.name === topSeller.name)?.quantity || 0} units left\` in Cupertino warehouse HQ.\n`;
        return reply;
      }

      // Sourcing Default Help Index
      reply += `### 👋 Welcome to Intelletech Bento Co-Pilot! (انوینٹرا اسمارٹ کو پائلٹ)\n`;
      reply += `Main dynamically aapka daily analytics perform kar sakta hu. Mujhse ye sawalat poohein:\n\n`;
      reply += `1. **Stock levels** 🏭: *"total stock kitna hy total kitna para hy"* ya *"show stock levels"*\n`;
      reply += `2. **Daily Sales** 💼: *"daily sales kitni hen"* ya *"aaj ki sale kitni hui"* ya *"revenue summary"*\n`;
      reply += `3. **Alert details** 🚨: *"auto alert option kya hy"* ya *"which items triggered alarm at 20 products limit"*\n`;
      reply += `4. **Top Selling** 🏆: *"kaun sa product top selling may hy"* ya *"best selling items list"*\n\n`;
      reply += `**Current Quick Operations Summary:**\n`;
      reply += `- Total SKUs: \`${numProducts}\` | Total Units: \`${totalUnits}\`\n`;
      reply += `- Low Stock Trigger Alerts (Qty <= 20): **${lowStockItems.length}** alarms.`;
      
      return reply;
    };

    const friendlyFallback = getLocalReply(message);
    res.status(200).json({ role: "assistant", message: friendlyFallback });
  }
});


// Serve React build in production, otherwise hook Vite dev server
async function startFullStackServer() {
  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Inventra AI custom full-stack engine running on http://localhost:${PORT}`);
  });
}

startFullStackServer();
