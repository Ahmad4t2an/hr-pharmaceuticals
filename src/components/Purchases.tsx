import React from "react";
import { 
  ClientProduct, 
  Supplier, 
  PurchaseOrder, 
  UserRole,
  CompanySettings 
} from "../types";
import { 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Search, 
  RefreshCw, 
  FileText,
  AlertCircle,
  Truck
} from "lucide-react";

interface PurchasesProps {
  products: ClientProduct[];
  suppliers: Supplier[];
  purchases: PurchaseOrder[];
  settings: CompanySettings;
  currentUserRole: UserRole;
  onPostPurchase: (po: {
    supplierId: string;
    items: { productId: string; quantity: number; costAtPurchase: number }[];
    tax: number;
    user: string;
  }) => Promise<any>;
  onUpdatePOStatus: (id: string, status: "Pending" | "Completed" | "Cancelled", paymentStatus: "Paid" | "Unpaid" | "Partial") => Promise<any>;
}

export default function Purchases({
  products,
  suppliers,
  purchases,
  settings,
  currentUserRole,
  onPostPurchase,
  onUpdatePOStatus
}: PurchasesProps) {
  
  // States
  const [selectedSupplierId, setSelectedSupplierId] = React.useState("");
  const [poItems, setPoItems] = React.useState<{ productId: string; quantity: number; costAtPurchase: number }[]>([]);
  
  // Items drafting picker
  const [candidateProdId, setCandidateProdId] = React.useState("");
  const [candidateQty, setCandidateQty] = React.useState("10");
  const [candidateCost, setCandidateCost] = React.useState("100");

  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFeedback, setStatusFeedback] = React.useState("");

  const isEmployee = currentUserRole === "Employee";

  const fCur = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: settings.currency || "USD"
    }).format(val);
  };

  const handleProductSelectChange = (pId: string) => {
    setCandidateProdId(pId);
    const targetProduct = products.find(p => p.id === pId);
    if (targetProduct) {
      setCandidateCost(String(targetProduct.purchasePrice));
    }
  };

  const handleAddPOItem = () => {
    if (!candidateProdId) {
      alert("Please select a target SKU product ID.");
      return;
    }

    const qtyVal = Number(candidateQty);
    const costVal = Number(candidateCost);

    if (qtyVal <= 0 || costVal <= 0) {
      alert("Quantities and costs must exceed zero.");
      return;
    }

    const existingItem = poItems.find(item => item.productId === candidateProdId);
    if (existingItem) {
      setPoItems(poItems.map(item => 
        item.productId === candidateProdId 
          ? { ...item, quantity: item.quantity + qtyVal, costAtPurchase: costVal } 
          : item
      ));
    } else {
      setPoItems([...poItems, { productId: candidateProdId, quantity: qtyVal, costAtPurchase: costVal }]);
    }

    // Reset picker
    setCandidateProdId("");
    setCandidateQty("10");
    setCandidateCost("100");
  };

  const handleRemovePOItem = (pId: string) => {
    setPoItems(poItems.filter(item => item.productId !== pId));
  };

  const draftSubtotal = poItems.reduce((acc, item) => acc + (item.quantity * item.costAtPurchase), 0);
  const draftTax = draftSubtotal * (settings.taxRate / 100);
  const draftTotal = draftSubtotal + draftTax;

  const handlePOSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEmployee) return;

    if (!selectedSupplierId) {
      alert("Please select a designated Supplier partner.");
      return;
    }

    if (poItems.length === 0) {
      alert("The purchase draft is empty.");
      return;
    }

    const payload = {
      supplierId: selectedSupplierId,
      items: poItems,
      tax: settings.taxRate,
      user: "Admin Alex Mercer"
    };

    try {
      await onPostPurchase(payload);
      
      // Reset
      setPoItems([]);
      setSelectedSupplierId("");
      setStatusFeedback("Purchase Order drafted and pending execution.");
      setTimeout(() => setStatusFeedback(""), 3000);
    } catch (e: any) {
      alert("PO posting failed: " + e.message);
    }
  };

  const handlePOAction = async (id: string, status: "Completed" | "Cancelled") => {
    if (isEmployee) return;
    try {
      setStatusFeedback("Updating database quantities...");
      await onUpdatePOStatus(id, status, status === "Completed" ? "Paid" : "Unpaid");
      setStatusFeedback(`PO successfully updated to ${status}!`);
      setTimeout(() => setStatusFeedback(""), 3000);
    } catch (err: any) {
      alert(err.message || "Failed execution status update.");
    }
  };

  const filteredPurchases = purchases.filter(p => 
    p.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-lg font-sans font-bold tracking-tight text-white flex items-center gap-2">
          Replenishment Sourcing (Purchases)
        </h2>
        <p className="text-xs text-zinc-400 font-sans">
          Draft incoming stock procurement contracts, choose suppliers, track cost prices, and mark as completed to automatically log units into storage.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Drag purchase draft */}
        <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 xl:col-span-2 space-y-4">
          <div className="pb-3 border-b border-zinc-900 flex justify-between items-center bg-zinc-950">
            <span className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <ShoppingBag size={14} className="text-indigo-400" />
              Sourcing Procurement draft PO
            </span>
            <span className="text-[10px] font-mono text-zinc-500">Draft Node: COMPLIANT</span>
          </div>

          {statusFeedback && (
            <div className="bg-indigo-500/10 border border-indigo-505/30 text-indigo-300 text-xs py-2 px-3 rounded-lg flex items-center gap-2 font-sans">
              <RefreshCw size={13} className="animate-spin text-indigo-400" />
              {statusFeedback}
            </div>
          )}

          {isEmployee && (
            <div className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs p-3 rounded-lg font-sans">
              🔒 **Employee restrictions**: You can review the purchase registry, but creating new purchase orders is restricted to Manager or Admin roles.
            </div>
          )}

          <form onSubmit={handlePOSubmit} className="space-y-4 font-sans text-xs text-zinc-300">
            {/* Supplier select */}
            <div>
              <label className="block text-[10px] text-zinc-400 uppercase tracking-wider mb-1.5 font-semibold">Designate Sourcing Supplier</label>
              <select
                disabled={isEmployee}
                required
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 h-[38px] text-xs h-[38px]"
              >
                <option value="">-- Associate Sourcing Partner Node --</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.contact})</option>
                ))}
              </select>
            </div>

            {/* Cartesian Item Selector */}
            <div className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-900 space-y-3">
              <p className="text-[10px] font-mono text-indigo-400 font-semibold uppercase tracking-wider">Item Cost & Volume Picker</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <select
                    disabled={isEmployee}
                    value={candidateProdId}
                    onChange={(e) => handleProductSelectChange(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-350 rounded px-2.5 py-1.5 focus:border-indigo-550 outline-none h-[34px] text-xs"
                  >
                    <option value="">-- Choose Sku segment --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (Cur Cost: ${p.purchasePrice})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <input
                    disabled={isEmployee}
                    type="number"
                    placeholder="Sourcing Vol"
                    value={candidateQty}
                    onChange={(e) => setCandidateQty(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded px-2 py-1 h-[34px] font-mono text-xs text-center"
                    title="Volume sought"
                  />
                </div>

                <div className="flex gap-2">
                  <input
                    disabled={isEmployee}
                    type="number"
                    placeholder="Sourcing cost"
                    value={candidateCost}
                    onChange={(e) => setCandidateCost(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded px-2 py-1 h-[34px] font-mono text-xs text-center"
                    title="Cost per Unit"
                  />
                  <button
                    disabled={isEmployee}
                    type="button"
                    onClick={handleAddPOItem}
                    className="bg-zinc-800 hover:bg-zinc-750 text-white rounded font-sans text-xs font-semibold px-3 border border-zinc-730 hover:border-zinc-650 transition-all flex items-center justify-center cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Dynamic Sourcing items listed table */}
            <div className="border border-zinc-900 rounded-lg overflow-hidden bg-zinc-950">
              <table className="w-full text-left text-xs border-collapse font-sans text-zinc-300">
                <thead>
                  <tr className="border-b border-zinc-900/60 bg-zinc-900/20 text-zinc-400 uppercase tracking-wider font-semibold text-[9px]">
                    <th className="p-3">Medicine / Item Name</th>
                    <th className="p-3 text-center">Procurement Vol</th>
                    <th className="p-3 text-right">Negotiated Cost</th>
                    <th className="p-3 text-right">Total Budget</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/40">
                  {poItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-zinc-500 text-[11px] font-mono">
                        Procurement list is empty. Add medicine items to procure above.
                      </td>
                    </tr>
                  ) : (
                    poItems.map((item) => {
                      const p = products.find(prod => prod.id === item.productId);
                      if (!p) return null;
                      return (
                        <tr key={item.productId} className="hover:bg-zinc-900/25">
                          <td className="p-3 font-semibold text-white">{p.name}</td>
                          <td className="p-3 text-center font-mono">{item.quantity} units</td>
                          <td className="p-3 text-right font-mono">{fCur(item.costAtPurchase)}</td>
                          <td className="p-3 text-right font-mono font-semibold text-[#8b5cf6]">{fCur(item.quantity * item.costAtPurchase)}</td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemovePOItem(item.productId)}
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

            {/* PO aggregates bar */}
            {poItems.length > 0 && (
              <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="space-y-1 text-xs text-zinc-400">
                  <p>Subtotal Cost: <span className="text-white font-mono">{fCur(draftSubtotal)}</span></p>
                  <p>Regulatory VAT ({settings.taxRate}%): <span className="text-white font-mono">{fCur(draftTax)}</span></p>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="text-right">
                    <p className="text-[10px] text-zinc-400 font-sans uppercase">Procurement Request Sum</p>
                    <p className="text-lg font-mono font-bold text-white leading-tight">{fCur(draftTotal)}</p>
                  </div>
                  <button
                    disabled={isEmployee}
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/30 text-white font-sans text-xs font-semibold px-4.5 py-2.5 rounded-lg active:translate-y-[1px] shadow-lg shadow-indigo-600/10 transition-all font-semibold uppercase tracking-wider cursor-pointer"
                  >
                    Draft PO Contract
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Right Side: Active PO entries list */}
        <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="pb-2.5 border-b border-zinc-900 flex justify-between items-center">
              <span className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <FileText size={14} className="text-zinc-500" /> ACTIVE TRACKERS
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Total POs: {purchases.length}</span>
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-zinc-500">
                <Search size={12} />
              </span>
              <input
                type="text"
                placeholder="Search PO segments, suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-white text-[10px] rounded px-2.5 py-1.5 pl-8 focus:border-indigo-500 outline-none font-sans"
              />
            </div>

            {/* Procurement history cards */}
            <div className="space-y-3 max-h-[420px] overflow-y-auto custom-scrollbar pr-0.5">
              {filteredPurchases.map((p) => {
                const isPending = p.status === "Pending";
                const isCompleted = p.status === "Completed";
                
                return (
                  <div
                    key={p.id}
                    className="bg-zinc-900/35 border border-zinc-900 p-3 rounded-lg space-y-2 group transition-all"
                  >
                    <div className="flex justify-between items-start leading-none">
                      <div className="min-w-0">
                        <p className="font-bold text-white text-xs tracking-tight">{p.poNumber}</p>
                        <span className="text-[10px] text-zinc-500 block truncate mt-1">Supplier: {p.supplierName}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-white block">{fCur(p.total)}</span>
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-mono font-medium tracking-wide mt-1.5 uppercase ${
                          isCompleted
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"
                            : isPending
                            ? "bg-amber-500/10 text-amber-450 text-amber-400 border border-amber-500/10"
                            : "bg-rose-500/10 text-rose-400 border border-[#f43f5e1a]"
                        }`}>
                          {p.status}
                        </span>
                      </div>
                    </div>

                    {/* Pending state decision buttons */}
                    {isPending && !isEmployee && (
                      <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-zinc-900">
                        <button
                          onClick={() => handlePOAction(p.id, "Completed")}
                          className="py-1 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-300 font-sans text-[10px] rounded flex items-center justify-center gap-1 transition-all"
                        >
                          <Check size={11} /> Mark Executed
                        </button>
                        <button
                          onClick={() => handlePOAction(p.id, "Cancelled")}
                          className="py-1 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 text-rose-300 font-sans text-[10px] rounded flex items-center justify-center gap-1 transition-all"
                        >
                          <X size={11} /> Cancel PO
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredPurchases.length === 0 && (
                <p className="text-[10px] text-zinc-500 text-center font-mono py-8">No PO matches parameter.</p>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
