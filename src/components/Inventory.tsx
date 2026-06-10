import React from "react";
import { 
  ClientProduct, 
  InventoryLog, 
  UserRole, 
  MovementType 
} from "../types";
import { 
  History, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  AlertCircle, 
  Search, 
  Calendar, 
  ShieldAlert,
  ArrowRightLeft,
  SlidersHorizontal,
  ChevronRight,
  Package
} from "lucide-react";

interface InventoryProps {
  products: ClientProduct[];
  inventoryLogs: InventoryLog[];
  currentUserRole: UserRole;
  currentUserName: string;
  onPostMovement: (movement: {
    productId: string;
    type: MovementType;
    quantity: number;
    reason: string;
    user: string;
  }) => Promise<any>;
}

export default function Inventory({
  products,
  inventoryLogs,
  currentUserRole,
  currentUserName,
  onPostMovement
}: InventoryProps) {
  
  // UI States
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterType, setFilterType] = React.useState("all");

  // Form states
  const [selectedProdId, setSelectedProdId] = React.useState("");
  const [moveType, setMoveType] = React.useState<MovementType>("Stock In");
  const [qty, setQty] = React.useState("1");
  const [reason, setReason] = React.useState("");
  const [feedback, setFeedback] = React.useState("");

  const isEmployee = currentUserRole === "Employee";

  const handleMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback("");

    if (!selectedProdId) {
      alert("Please select a target medicine SKU.");
      return;
    }

    const qtyVal = Number(qty);
    if (!qtyVal || qtyVal <= 0) {
      alert("Please designate a quantity greater than zero.");
      return;
    }

    const targetProduct = products.find(p => p.id === selectedProdId);
    if (!targetProduct) return;

    // Additional validations
    if ((moveType === "Stock Out" || moveType === "Stock Transfer") && targetProduct.quantity < qtyVal) {
      alert(`Unrealisable quantities requested. ${targetProduct.name} only holds ${targetProduct.quantity} units, seeking to withdraw ${qtyVal}.`);
      return;
    }

    try {
      await onPostMovement({
        productId: selectedProdId,
        type: moveType,
        quantity: qtyVal,
        reason: reason.trim() || `Manual operator ${moveType} action`,
        user: currentUserName
      });

      setFeedback("Inventory ledger successfully updated!");
      // Reset inputs
      setQty("1");
      setReason("");
      setTimeout(() => setFeedback(""), 3000);
    } catch (err: any) {
      alert(err.message || "Failed post movement parameters.");
    }
  };

  const filteredLogs = inventoryLogs.filter(log => {
    const matchesSearch = log.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.sku.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || log.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div>
        <h2 className="text-lg font-sans font-bold tracking-tight text-white flex items-center gap-2">
          Physical Warehouse Movements Ledger
        </h2>
        <p className="text-xs text-zinc-400 font-sans">
          Execute Stock In/Out entries, adjust stock levels, and audit the full chronological movement ledger.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Execute action form */}
        <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-805">
          <div className="pb-3 border-b border-zinc-900 mb-4 flex items-center justify-between">
            <h3 className="font-sans font-semibold text-white text-sm">Post Stock Movement Code</h3>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Operator Console</span>
          </div>

          {feedback && (
            <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs py-2 px-3 rounded-lg flex items-center gap-2 font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {feedback}
            </div>
          )}

          {isEmployee && (
            <div className="mb-4 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] leading-relaxed p-3 rounded-xl flex gap-2 font-sans">
              <ShieldAlert className="text-amber-400 flex-shrink-0" size={16} />
              <div>
                <p className="font-semibold">Security Level: Employee Read-Only</p>
                <p className="text-zinc-450 mt-0.5">Your credentials restrict writing to physical warehouse quantities directly. Sourcing is handled via purchase/sales modules.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleMovementSubmit} className="space-y-4 font-sans text-xs">
            <div>
              <label className="block text-[10px] text-zinc-400 uppercase tracking-wider mb-1.5 font-semibold">Select Catalog Asset</label>
              <select
                disabled={isEmployee}
                value={selectedProdId}
                onChange={(e) => setSelectedProdId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg px-3 py-2.5 outline-none text-xs focus:border-indigo-500 h-[38px]"
              >
                <option value="">-- Choose target product ID --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku} | Qty: {p.quantity})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase tracking-wider mb-1.5 font-semibold">Movement Action</label>
                <select
                  disabled={isEmployee}
                  value={moveType}
                  onChange={(e) => setMoveType(e.target.value as MovementType)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg px-3 py-2.5 outline-none text-xs focus:border-indigo-500 h-[38px]"
                >
                  <option value="Stock In">Stock In (+ Increase)</option>
                  <option value="Stock Out">Stock Out (- Decrease)</option>
                  <option value="Stock Transfer">Stock Transfer (- Transfer)</option>
                  <option value="Stock Adjustment">Stock Adjustment (= Override)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 uppercase tracking-wider mb-1.5 font-semibold">Quantity Delta</label>
                <input
                  disabled={isEmployee}
                  type="number"
                  required
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2 text-xs focus:border-indigo-500 outline-none h-[38px] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 uppercase tracking-wider mb-1.5 font-semibold">Movement Justification / Reason</label>
              <textarea
                disabled={isEmployee}
                rows={3}
                placeholder="Write specific ledger remarks: e.g. Damaged packaging replacement, bulk supplier replenishment..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg p-2.5 text-xs outline-none focus:border-indigo-500"
              />
            </div>

            <button
              disabled={isEmployee || !selectedProdId}
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-sans text-xs font-semibold py-2.5 rounded-lg border border-teal-500/50 shadow-lg shadow-teal-600/10 transition-all font-medium disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              Post Stock Movement
            </button>
          </form>
        </div>

        {/* Right Side: Ledger history list */}
        <div className="bg-zinc-950 p-0 rounded-xl border border-zinc-800 lg:col-span-2 overflow-hidden">
          
          {/* Header filter matrix */}
          <div className="p-4 bg-zinc-950/80 border-b border-zinc-900/60 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-300 font-mono text-xs">
              <History size={15} className="text-zinc-400" />
              <span> TAMPER-PROOF HISTORY LEDGER </span>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-zinc-500">
                  <Search size={13} />
                </span>
                <input
                  type="text"
                  placeholder="Filter logs justification..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 text-white text-[11px] rounded px-2.5 py-1.5 pl-8 focus:border-indigo-500 outline-none w-full sm:w-48"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px] rounded px-2.5 py-1.5 focus:border-indigo-500 outline-none"
              >
                <option value="all">All Movements</option>
                <option value="Stock In">Stock In (+) </option>
                <option value="Stock Out">Stock Out (-)</option>
                <option value="Stock Transfer">Stock Transfer</option>
                <option value="Stock Adjustment">Adjustments (=)</option>
              </select>
            </div>
          </div>

          {/* Timeline Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-950 text-zinc-500 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="p-3">Logged Date</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Sku</th>
                  <th className="p-3 text-center">Movement Type</th>
                  <th className="p-3 text-center">Qty Delta</th>
                  <th className="p-3">Operator Remarks / Reason</th>
                  <th className="p-3 text-right">User Node</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/60 text-zinc-300">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-zinc-500 font-mono text-[11px] space-y-1">
                      <History size={18} className="mx-auto text-zinc-700" />
                      <p>Inventory logging registry empty.</p>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const isPlus = log.type === "Stock In";
                    const isAdjustment = log.type === "Stock Adjustment";
                    const isTransfer = log.type === "Stock Transfer";
                    
                    return (
                      <tr key={log.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="p-3 text-zinc-500 font-mono text-[10px] whitespace-nowrap">
                          {new Date(log.timestamp || "").toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit"
                          })}
                        </td>
                        <td className="p-3 font-semibold text-white whitespace-nowrap truncate max-w-[150px]">
                          {log.productName}
                        </td>
                        <td className="p-3 font-mono text-zinc-400">{log.sku}</td>
                        <td className="p-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-medium ${
                            isPlus 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" 
                              : isAdjustment 
                              ? "bg-purple-500/10 text-purple-400 border border-purple-500/10"
                              : isTransfer
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/10"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/10"
                          }`}>
                            {isPlus ? <ArrowDownLeft size={10} /> : isAdjustment ? <SlidersHorizontal size={10} /> : isTransfer ? <ArrowRightLeft size={10} /> : <ArrowUpRight size={10} />}
                            {log.type}
                          </span>
                        </td>
                        <td className={`p-3 text-center font-mono font-bold ${isPlus ? "text-emerald-400" : isAdjustment ? "text-purple-400" : "text-rose-400"}`}>
                          {isPlus ? "+" : isAdjustment ? "=" : "-"}{Math.abs(log.quantity)}
                        </td>
                        <td className="p-3 text-zinc-400 leading-snug font-sans text-[11px] max-w-xs truncate" title={log.reason}>
                          {log.reason}
                        </td>
                        <td className="p-3 text-right font-mono text-zinc-500 text-[10px]">{log.user || "System"}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

    </div>
  );
}
