import React from "react";
import { 
  ClientProduct, 
  Customer, 
  Sale, 
  CompanySettings 
} from "../types";
import { 
  Coins, 
  Plus, 
  Trash2, 
  Percent, 
  FileCheck, 
  Search, 
  Printer, 
  X, 
  CheckCircle, 
  Calendar, 
  FileText,
  UserCheck
} from "lucide-react";

interface SalesProps {
  products: ClientProduct[];
  customers: Customer[];
  sales: Sale[];
  settings: CompanySettings;
  onPostSale: (sale: {
    customerId: string;
    items: { productId: string; quantity: number; priceAtSale: number }[];
    discount: number;
    user: string;
  }) => Promise<any>;
}

export default function Sales({
  products,
  customers,
  sales,
  settings,
  onPostSale
}: SalesProps) {
  
  // States of Active Sale
  const [selectedCustomerId, setSelectedCustomerId] = React.useState("");
  const [cartItems, setCartItems] = React.useState<{ productId: string; quantity: number }[]>([]);
  const [discountInput, setDiscountInput] = React.useState("0");
  
  // Cart selection utilities
  const [candidateProdId, setCandidateProdId] = React.useState("");
  const [candidateQty, setCandidateQty] = React.useState("1");

  // Invoicing display modal
  const [activeInvoice, setActiveInvoice] = React.useState<Sale | null>(null);
  const [successMsg, setSuccessMsg] = React.useState("");

  // Search filter
  const [searchTerm, setSearchTerm] = React.useState("");

  const fCur = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: settings.currency || "USD"
    }).format(val);
  };

  const handleAddCartItem = () => {
    if (!candidateProdId) {
      alert("Please select a valid medicine SKU.");
      return;
    }

    const qtyVal = Number(candidateQty);
    if (!qtyVal || qtyVal <= 0) {
      alert("Choose quantities greater than zero.");
      return;
    }

    const targetProduct = products.find(p => p.id === candidateProdId);
    if (!targetProduct) return;

    // Verify stock availability
    const existingCartItem = cartItems.find(c => c.productId === candidateProdId);
    const existingQty = existingCartItem ? existingCartItem.quantity : 0;
    const requestedTotal = existingQty + qtyVal;

    if (targetProduct.quantity < requestedTotal) {
      alert(`Critical stock limitation. ${targetProduct.name} only has ${targetProduct.quantity} units, you seek to cart ${requestedTotal}.`);
      return;
    }

    if (existingCartItem) {
      setCartItems(cartItems.map(c => 
        c.productId === candidateProdId 
          ? { ...c, quantity: requestedTotal } 
          : c
      ));
    } else {
      setCartItems([...cartItems, { productId: candidateProdId, quantity: qtyVal }]);
    }

    // Reset picker
    setCandidateQty("1");
    setCandidateProdId("");
  };

  const handleRemoveCartItem = (pId: string) => {
    setCartItems(cartItems.filter(c => c.productId !== pId));
  };

  // Derived financials of draft cart
  const draftSubtotal = cartItems.reduce((acc, c) => {
    const p = products.find(prod => prod.id === c.productId);
    const price = p ? p.sellingPrice : 0;
    return acc + (c.quantity * price);
  }, 0);

  const flatDiscount = Number(discountInput) || 0;
  const draftTax = (draftSubtotal - flatDiscount) * (settings.taxRate / 100);
  const draftTotal = draftSubtotal - flatDiscount + draftTax;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      alert("Please designate a target buyer Customer profile.");
      return;
    }
    if (cartItems.length === 0) {
      alert("Selected shopping line items is currently empty.");
      return;
    }

    const payload = {
      customerId: selectedCustomerId,
      items: cartItems.map(c => {
        const p = products.find(prod => prod.id === c.productId);
        return {
          productId: c.productId,
          quantity: c.quantity,
          priceAtSale: p ? p.sellingPrice : 0
        };
      }),
      discount: flatDiscount,
      user: "Sales Operator Alex"
    };

    try {
      const response = await onPostSale(payload);
      setSuccessMsg("Sale transaction finalized and invoice archived.");
      
      // Auto pop invoice for printable satisfaction
      if (response && response.sale) {
        setActiveInvoice(response.sale);
      }

      // Reset
      setCartItems([]);
      setSelectedCustomerId("");
      setDiscountInput("0");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e: any) {
      alert("Checkout failure: " + e.message);
    }
  };

  // Print command handler
  const handlePrintCommand = () => {
    window.print();
  };

  // Search filter
  const filteredSales = sales.filter(s => 
    s.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Title Layout */}
      <div>
        <h2 className="text-lg font-sans font-bold tracking-tight text-white flex items-center gap-2">
          Operations Point of Sale & Invoices
        </h2>
        <p className="text-xs text-zinc-400 font-sans">
          Draft direct cash registers, register customer nodes, choose tax settings, and print highly polished invoices.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* POS terminal column */}
        <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 xl:col-span-2 space-y-4">
          <div className="pb-3 border-b border-zinc-900 flex justify-between items-center bg-zinc-950">
            <span className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <Coins size={14} className="text-emerald-400" />
              INTEGRATED TERMINAL DRAFT
            </span>
            <span className="text-[10px] font-mono text-zinc-500">Invoice: AUTO-PREFIX</span>
          </div>

          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs py-2 px-3 rounded-lg flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {successMsg}
            </div>
          )}

          <form onSubmit={handleCheckoutSubmit} className="space-y-4 font-sans text-xs text-zinc-300">
            {/* Customer Picker */}
            <div>
              <label className="block text-[10px] text-zinc-400 uppercase tracking-wider mb-1.5 font-semibold">Select Customer Profile</label>
              <select
                required
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 h-[38px] text-xs h-[38px]"
              >
                <option value="">-- Associate Customer buyer node --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.email || "Retail Sales"})</option>
                ))}
              </select>
            </div>

            {/* Inline shopping line item adder */}
            <div className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-900 space-y-2.5">
              <p className="text-[10px] font-mono text-teal-400 font-semibold uppercase tracking-wider">Add Medicine Item</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <select
                    value={candidateProdId}
                    onChange={(e) => setCandidateProdId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-350 rounded px-2.5 py-1.5 focus:border-indigo-500 outline-none h-[34px] text-xs"
                  >
                    <option value="">-- Pick stock SKU --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id} disabled={p.quantity <= 0}>
                        {p.name} (Sell: {fCur(p.sellingPrice)} | Avail: {p.quantity})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <input
                    type="number"
                    min={1}
                    value={candidateQty}
                    onChange={(e) => setCandidateQty(e.target.value)}
                    className="w-16 bg-zinc-900 border border-zinc-800 text-white rounded px-2 py-1 h-[34px] font-mono text-xs text-center"
                  />
                  <button
                    type="button"
                    onClick={handleAddCartItem}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-750 text-white rounded font-sans text-xs font-semibold flex items-center justify-center gap-1 border border-zinc-700 hover:border-zinc-600 transition-all cursor-pointer"
                  >
                    <Plus size={14} /> Add SKU
                  </button>
                </div>
              </div>
            </div>

            {/* Shopping Cart Lines Table */}
            <div className="border border-zinc-900 rounded-lg overflow-hidden bg-zinc-950">
              <table className="w-full text-left text-xs border-collapse font-sans text-zinc-300">
                <thead>
                  <tr className="border-b border-zinc-900/60 bg-zinc-900/20 text-zinc-500 uppercase tracking-wider font-semibold text-[9px]">
                    <th className="p-3">Medicine item</th>
                    <th className="p-3 text-center">Invoiced Qty</th>
                    <th className="p-3 text-right">Selling Price</th>
                    <th className="p-3 text-right">Sum Val</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/40">
                  {cartItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-zinc-500 text-[11px] font-mono">
                        No medicines added to cart. Choose medicine items from the selection above.
                      </td>
                    </tr>
                  ) : (
                    cartItems.map((c) => {
                      const p = products.find(prod => prod.id === c.productId);
                      if (!p) return null;
                      return (
                        <tr key={c.productId} className="hover:bg-zinc-900/25">
                          <td className="p-3 font-semibold text-white">{p.name}</td>
                          <td className="p-3 text-center font-mono">{c.quantity} items</td>
                          <td className="p-3 text-right font-mono">{fCur(p.sellingPrice)}</td>
                          <td className="p-3 text-right font-mono text-emerald-400 font-semibold">{fCur(c.quantity * p.sellingPrice)}</td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveCartItem(c.productId)}
                              className="text-zinc-500 hover:text-rose-500 p-1 rounded-md hover:bg-zinc-900 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* POS Financial aggregate drawer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase tracking-wider mb-1.5 font-semibold">Flat Custom Discount ({settings.currency})</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500 font-semibold text-xs">$</span>
                  <input
                    type="number"
                    value={discountInput}
                    onChange={(e) => setDiscountInput(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-850 text-white rounded-lg pl-8 pr-3 py-2 text-xs focus:border-indigo-500 outline-none font-mono"
                  />
                </div>
              </div>

              {/* Aggregates block summary list */}
              <div className="bg-zinc-900/20 p-4 rounded-xl border border-zinc-900 space-y-1.5 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>Invoiced Subtotal:</span>
                  <span className="font-mono text-zinc-300">{fCur(draftSubtotal)}</span>
                </div>
                {flatDiscount > 0 && (
                  <div className="flex justify-between text-rose-400">
                    <span>Campaign Discount:</span>
                    <span className="font-mono">-{fCur(flatDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Operations Tax ({settings.taxRate}%):</span>
                  <span className="font-mono text-zinc-300">{fCur(draftTax)}</span>
                </div>
                <div className="border-t border-zinc-900 pt-2 flex justify-between font-bold text-sm text-white">
                  <span>Grand Total Value:</span>
                  <span className="font-mono text-emerald-450 text-emerald-400">{fCur(draftTotal)}</span>
                </div>
              </div>
            </div>

            <button
              disabled={cartItems.length === 0 || !selectedCustomerId}
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 border border-emerald-500/40 text-white font-sans text-xs font-semibold py-3 rounded-xl shadow-lg shadow-emerald-600/10 transition-all font-semibold uppercase tracking-wider disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              Verify Checkout Invoices & Register Sale
            </button>
          </form>
        </div>

        {/* Sales history archive sidebar */}
        <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="pb-2.5 border-b border-zinc-900 flex justify-between items-center">
              <span className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <FileText size={14} className="text-zinc-500" /> SALES LEDGERS
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Count: {sales.length}</span>
            </div>

            {/* Quick search */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-zinc-500">
                <Search size={12} />
              </span>
              <input
                type="text"
                placeholder="Search invoices, buyers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-white text-[10px] rounded px-2.5 py-1.5 pl-8 focus:border-indigo-500 outline-none font-sans"
              />
            </div>

            {/* Invoices List */}
            <div className="space-y-2 max-h-[420px] overflow-y-auto custom-scrollbar pr-0.5">
              {filteredSales.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setActiveInvoice(s)}
                  className="bg-zinc-900/35 border border-zinc-900 hover:border-zinc-800/80 p-3 rounded-lg flex justify-between items-center cursor-pointer group transition-all"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-white text-xs group-hover:text-indigo-400 transition-colors leading-none tracking-tight">
                      {s.invoiceNumber}
                    </p>
                    <span className="text-[10px] text-zinc-500 font-sans mt-1 block truncate">
                      Buyer: {s.customerName}
                    </span>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-xs font-mono font-bold text-emerald-400 leading-none">
                      {fCur(s.total)}
                    </span>
                    <span className="text-[9px] text-zinc-500 font-mono mt-1 leading-none">
                      {new Date(s.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              ))}
              {filteredSales.length === 0 && (
                <p className="text-[10px] text-zinc-500 text-center font-mono py-8">No invoice matching parameter.</p>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* FULL PRINTABLE INVOICE DRAWER OVERLAY */}
      {activeInvoice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white text-zinc-900 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl p-6 relative flex flex-col justify-between my-8 border border-zinc-200">
            
            {/* Action Bar (Not printed) */}
            <div className="flex justify-between items-center pb-3 border-b border-zinc-200/80 mb-6 print:hidden">
              <div className="flex items-center gap-2">
                <FileCheck size={18} className="text-emerald-600" />
                <span className="text-xs font-sans font-bold uppercase tracking-wider text-zinc-500">Official Operational Receipt</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintCommand}
                  className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-sans text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <Printer size={13} /> Print Invoice
                </button>
                <button
                  onClick={() => setActiveInvoice(null)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-650 rounded-lg hover:bg-zinc-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* PRINT COMPONENT WRAPPER */}
            <div className="space-y-6 font-sans text-xs flex-1">
              
              {/* Receipt Header logo block */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-8 h-8 rounded bg-zinc-950 flex items-center justify-center font-bold text-white text-md">
                      IV
                    </div>
                    <h2 className="font-sans font-bold tracking-tight text-zinc-900 text-lg leading-none">
                      Inventra AI
                    </h2>
                  </div>
                  <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">{settings.companyName}</p>
                  <p className="text-[9px] text-zinc-500 mt-1">{settings.address}</p>
                  <p className="text-[9px] text-zinc-500 leading-none">{settings.email} | {settings.phone}</p>
                </div>

                <div className="text-right">
                  <h3 className="font-bold text-zinc-900 text-xl font-sans tracking-tight">SALES INVOICE</h3>
                  <p className="text-sm font-mono text-indigo-600 font-bold tracking-tight mt-1">{activeInvoice.invoiceNumber}</p>
                  <p className="text-[10px] text-zinc-400 font-mono mt-1">
                    Date: {new Date(activeInvoice.timestamp).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>

              {/* Buyer / Seller details */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-zinc-100 font-sans">
                <div>
                  <p className="text-[9px] uppercase font-mono tracking-wider text-zinc-400 font-semibold mb-1">CLIENT ASSOC</p>
                  <p className="font-bold text-zinc-800 text-sm leading-tight">{activeInvoice.customerName}</p>
                  <p className="text-zinc-500 mt-1">Corporate Client buyer Account</p>
                  <p className="text-zinc-500">Sourced logistics parameters secured.</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase font-mono tracking-wider text-zinc-400 font-semibold mb-1">TRANS VALUE</p>
                  <p className="font-bold text-zinc-900 text-base font-mono">{fCur(activeInvoice.total)}</p>
                  <p className="text-emerald-600 font-semibold uppercase text-[9px] bg-emerald-50 inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded">
                    <CheckCircle size={9} /> PAID FULL
                  </p>
                </div>
              </div>

              {/* Items tabular */}
              <div className="space-y-2">
                <p className="text-[9px] uppercase font-mono tracking-wider text-zinc-400 font-semibold">SKU ITEMIZATION LIST</p>
                <table className="w-full text-left text-xs font-sans border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 uppercase tracking-wider font-semibold text-[9px]">
                      <th className="p-2">Medicine / Drug Description</th>
                      <th className="p-2">Barcode</th>
                      <th className="p-2 text-center">Unit Volume</th>
                      <th className="p-2 text-right">Invoiced Unit Value</th>
                      <th className="p-2 text-right">Invoiced Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-750">
                    {activeInvoice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-semibold text-zinc-900">{item.productName}</td>
                        <td className="p-2 font-mono text-zinc-400 tracking-tight">{item.sku}</td>
                        <td className="p-2 text-center font-mono">{item.quantity} units</td>
                        <td className="p-2 text-right font-mono">{fCur(item.priceAtSale)}</td>
                        <td className="p-2 text-right font-mono font-bold text-zinc-900">{fCur(item.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Receipt Aggregates block */}
              <div className="pt-2 border-t border-zinc-200 flex justify-end">
                <div className="w-64 space-y-1.5 text-[11px] text-zinc-500">
                  <div className="flex justify-between">
                    <span>Invoiced Subtotal sum:</span>
                    <span className="font-mono text-zinc-900">{fCur(activeInvoice.subtotal)}</span>
                  </div>
                  {activeInvoice.discount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Campaign discount:</span>
                      <span className="font-mono">-{fCur(activeInvoice.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Regulatory VAT ({settings.taxRate}%):</span>
                    <span className="font-mono text-zinc-900">{fCur(activeInvoice.tax)}</span>
                  </div>
                  <div className="border-t border-zinc-200 pt-1.5 flex justify-between font-bold text-xs text-zinc-900">
                    <span>Grand Total Invoiced:</span>
                    <span className="font-mono text-indigo-700">{fCur(activeInvoice.total)}</span>
                  </div>
                </div>
              </div>

              {/* Print notice details */}
              <div className="pt-8 border-t border-zinc-150 text-center space-y-1">
                <p className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-widest">Inventra AI Systems Group Corporation</p>
                <p className="text-[9px] text-zinc-400">Electronic verification secured. Standard thermal receipt template v2.4.</p>
              </div>

            </div>

            {/* Print Dismiss (Not printed) */}
            <div className="mt-6 pt-4 border-t border-zinc-100 flex justify-end print:hidden">
              <button
                onClick={() => setActiveInvoice(null)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Dismiss Receipt
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
