import React from "react";
import { Customer, Supplier, UserRole } from "../types";
import { Plus, Edit, Trash2, X, Users, Truck, UserPlus, Phone, Mail, MapPin } from "lucide-react";

interface CustomersAndSuppliersProps {
  customers: Customer[];
  suppliers: Supplier[];
  currentUserRole: UserRole;
  initialSubTab?: "customers" | "suppliers";
  onAddCustomer: (customer: { name: string; email: string; phone: string; address: string }) => Promise<any>;
  onEditCustomer: (id: string, customer: { name: string; email: string; phone: string; address: string }) => Promise<any>;
  onDeleteCustomer: (id: string) => Promise<any>;
  onAddSupplier: (supplier: { name: string; contact: string; email: string; phone: string; address: string }) => Promise<any>;
  onEditSupplier: (id: string, supplier: { name: string; contact: string; email: string; phone: string; address: string }) => Promise<any>;
  onDeleteSupplier: (id: string) => Promise<any>;
}

export default function CustomersAndSuppliers({
  customers,
  suppliers,
  currentUserRole,
  initialSubTab = "customers",
  onAddCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onAddSupplier,
  onEditSupplier,
  onDeleteSupplier
}: CustomersAndSuppliersProps) {
  
  const [activeSubTab, setActiveSubTab] = React.useState<"customers" | "suppliers">(initialSubTab);

  React.useEffect(() => {
    setActiveSubTab(initialSubTab);
  }, [initialSubTab]);

  // Customer states
  const [custModalOpen, setCustModalOpen] = React.useState(false);
  const [custModalMode, setCustModalMode] = React.useState<"add" | "edit">("add");
  const [selectedCustId, setSelectedCustId] = React.useState<string | null>(null);
  const [custName, setCustName] = React.useState("");
  const [custEmail, setCustEmail] = React.useState("");
  const [custPhone, setCustPhone] = React.useState("");
  const [custAddr, setCustAddr] = React.useState("");

  // Supplier states
  const [supModalOpen, setSupModalOpen] = React.useState(false);
  const [supModalMode, setSupModalMode] = React.useState<"add" | "edit">("add");
  const [selectedSupId, setSelectedSupId] = React.useState<string | null>(null);
  const [supName, setSupName] = React.useState("");
  const [supContact, setSupContact] = React.useState("");
  const [supEmail, setSupEmail] = React.useState("");
  const [supPhone, setSupPhone] = React.useState("");
  const [supAddr, setSupAddr] = React.useState("");

  const isEmployee = currentUserRole === "Employee";
  const isAdmin = currentUserRole === "Admin";

  // Customer submit
  const handleCustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEmployee) return;

    if (!custName.trim()) {
      alert("Billing Name is required");
      return;
    }

    const payload = {
      name: custName.trim(),
      email: custEmail.trim(),
      phone: custPhone.trim(),
      address: custAddr.trim()
    };

    try {
      if (custModalMode === "add") {
        await onAddCustomer(payload);
      } else if (custModalMode === "edit" && selectedCustId) {
        await onEditCustomer(selectedCustId, payload);
      }
      setCustModalOpen(false);
      setCustName("");
      setCustEmail("");
      setCustPhone("");
      setCustAddr("");
    } catch (err: any) {
      alert(err.message || "Failed to commit customer.");
    }
  };

  // Supplier submit
  const handleSupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEmployee) return;

    if (!supName.trim()) {
      alert("Supplier name is required");
      return;
    }

    const payload = {
      name: supName.trim(),
      contact: supContact.trim(),
      email: supEmail.trim(),
      phone: supPhone.trim(),
      address: supAddr.trim()
    };

    try {
      if (supModalMode === "add") {
        await onAddSupplier(payload);
      } else if (supModalMode === "edit" && selectedSupId) {
        await onEditSupplier(selectedSupId, payload);
      }
      setSupModalOpen(false);
      setSupName("");
      setSupContact("");
      setSupEmail("");
      setSupPhone("");
      setSupAddr("");
    } catch (err: any) {
      alert(err.message || "Failed to commit supplier.");
    }
  };

  const handleOpenCustEdit = (c: Customer) => {
    if (isEmployee) return;
    setSelectedCustId(c.id);
    setCustName(c.name);
    setCustEmail(c.email);
    setCustPhone(c.phone);
    setCustAddr(c.address);
    setCustModalMode("edit");
    setCustModalOpen(true);
  };

  const handleOpenSupEdit = (s: Supplier) => {
    if (isEmployee) return;
    setSelectedSupId(s.id);
    setSupName(s.name);
    setSupContact(s.contact);
    setSupEmail(s.email);
    setSupPhone(s.phone);
    setSupAddr(s.address);
    setSupModalMode("edit");
    setSupModalOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-sans font-bold tracking-tight text-white flex items-center gap-2">
            CRM & Supplier partner databases
          </h2>
          <p className="text-xs text-zinc-400 font-sans">
            Adjust billing variables for customer targets, allocate supplier contacts, and regulate logistics relationships.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveSubTab("customers")}
            className={`px-3 py-1.5 text-xs font-sans font-medium rounded-lg flex items-center gap-1.5 transition-all ${
              activeSubTab === "customers" 
                ? "bg-zinc-900 text-white shadow-sm font-semibold" 
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Users size={13} /> Customers (CRM)
          </button>
          <button
            onClick={() => setActiveSubTab("suppliers")}
            className={`px-3 py-1.5 text-xs font-sans font-medium rounded-lg flex items-center gap-1.5 transition-all ${
              activeSubTab === "suppliers" 
                ? "bg-zinc-900 text-white shadow-sm font-semibold" 
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Truck size={13} /> Sourcing Suppliers
          </button>
        </div>
      </div>

      {activeSubTab === "customers" ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-zinc-950 px-5 py-3 rounded-xl border border-zinc-800">
            <span className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-widest">{customers.length} Client Profiles Cached</span>
            {!isEmployee && (
              <button
                onClick={() => {
                  setCustName("");
                  setCustEmail("");
                  setCustPhone("");
                  setCustAddr("");
                  setCustModalMode("add");
                  setCustModalOpen(true);
                }}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-indigo-500/30 transition-all shadow-md shadow-indigo-600/15"
              >
                <Plus size={13} /> Register Buyer
              </button>
            )}
          </div>

          {/* Customers Cards display */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {customers.map((c) => (
              <div 
                key={c.id} 
                className="bg-zinc-950 rounded-xl border border-zinc-800 p-4 space-y-3 relative group hover:border-zinc-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-xs text-white">
                      {c.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-sans font-bold text-white text-xs leading-none">{c.name}</h4>
                      <span className="text-[10px] text-zinc-500 font-mono tracking-wider">Cust Node: {c.id}</span>
                    </div>
                  </div>

                  <div className="pt-1 space-y-1 bg-zinc-900/10 p-2 rounded border border-zinc-900/40 text-[11px] font-mono text-zinc-400">
                    <p className="flex items-center gap-1.5"><Mail size={11} className="text-zinc-650" /> {c.email || "No Email listed"}</p>
                    <p className="flex items-center gap-1.5"><Phone size={11} className="text-zinc-650" /> {c.phone || "No Phone listed"}</p>
                    <p className="flex items-center gap-1.5 truncate"><MapPin size={11} className="text-zinc-650" /> {c.address || "Street Retail Walk-in"}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-900 flex justify-end gap-1.5">
                  {!isEmployee ? (
                    <>
                      <button
                        onClick={() => handleOpenCustEdit(c)}
                        className="p-1 px-2 text-zinc-400 hover:text-white rounded text-[11px] font-mono border border-zinc-900 bg-zinc-900/60 transition-colors"
                      >
                        Adjust
                      </button>
                      {isAdmin ? (
                        <button
                          onClick={() => onDeleteCustomer(c.id)}
                          className="p-1 px-2 text-zinc-550 hover:text-rose-400 rounded text-[11px] font-mono border border-zinc-900 bg-zinc-900/60 transition-colors"
                        >
                          Erase
                        </button>
                      ) : (
                        <span className="text-[10px] text-zinc-650 font-mono self-center">Admin Secure</span>
                      )}
                    </>
                  ) : (
                    <span className="text-[10px] text-zinc-600 font-mono">Restricted CRM</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4 font-sans text-xs">
          <div className="flex justify-between items-center bg-zinc-950 px-5 py-3 rounded-xl border border-zinc-800">
            <span className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-widest">{suppliers.length} Sourcing Partners Active</span>
            {!isEmployee && (
              <button
                onClick={() => {
                  setSupName("");
                  setSupContact("");
                  setSupEmail("");
                  setSupPhone("");
                  setSupAddr("");
                  setSupModalMode("add");
                  setSupModalOpen(true);
                }}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-indigo-500/30 transition-all shadow-md shadow-indigo-600/15"
              >
                <Plus size={13} /> Squeeze Supplier
              </button>
            )}
          </div>

          {/* Suppliers list layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {suppliers.map((s) => (
              <div 
                key={s.id} 
                className="bg-zinc-950 rounded-xl border border-zinc-800 p-4 space-y-3 relative group hover:border-zinc-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono font-bold text-xs text-indigo-400">
                      SUP
                    </div>
                    <div>
                      <h4 className="font-sans font-bold text-white text-xs leading-none">{s.name}</h4>
                      <span className="text-[10px] text-zinc-500 font-mono">Director: {s.contact || "Corporate Rep"}</span>
                    </div>
                  </div>

                  <div className="pt-1 space-y-1 bg-zinc-900/10 p-2 rounded border border-zinc-900/40 text-[11px] font-mono text-zinc-400">
                    <p className="flex items-center gap-1.5"><Mail size={11} className="text-zinc-650" /> {s.email || "No procurement Email"}</p>
                    <p className="flex items-center gap-1.5"><Phone size={11} className="text-zinc-650" /> {s.phone || "No Dispatch line"}</p>
                    <p className="flex items-center gap-1.5 truncate"><MapPin size={11} className="text-zinc-650" /> {s.address || "Factory Sourcing Hub"}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-900 flex justify-end gap-1.5">
                  {!isEmployee ? (
                    <>
                      <button
                        onClick={() => handleOpenSupEdit(s)}
                        className="p-1 px-2 text-zinc-400 hover:text-white rounded text-[11px] font-mono border border-zinc-900 bg-zinc-900/60 transition-colors"
                      >
                        Adjust
                      </button>
                      {isAdmin ? (
                        <button
                          onClick={() => onDeleteSupplier(s.id)}
                          className="p-1 px-2 text-zinc-550 hover:text-rose-400 rounded text-[11px] font-mono border border-zinc-900 bg-zinc-900/60 transition-colors"
                        >
                          Erase
                        </button>
                      ) : (
                        <span className="text-[10px] text-zinc-650 font-mono self-center">Admin Secure</span>
                      )}
                    </>
                  ) : (
                    <span className="text-[10px] text-zinc-600 font-mono">Restricted</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CUSTOMER MODAL */}
      {custModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md rounded-xl overflow-hidden shadow-2xl">
            <div className="px-4.5 py-3 border-b border-zinc-900 bg-zinc-950/80 flex justify-between items-center">
              <h3 className="font-sans font-bold text-white text-xs uppercase tracking-wider">
                {custModalMode === "add" ? "Register Buyer Profile" : "Revise Buyer Specifications"}
              </h3>
              <button onClick={() => setCustModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCustSubmit} className="p-4.5 space-y-3 font-sans text-xs">
              <div>
                <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1 font-semibold">Customer Billing Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Corporation"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-white rounded px-3 py-2 text-xs transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1 font-semibold">Email Channel</label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-white rounded px-3 py-2 text-xs transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1 font-semibold">Phone Contact Number</label>
                <input
                  type="text"
                  placeholder="+44 792 123 456"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-white rounded px-3 py-2 text-xs transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1 font-semibold">Client HQ Address</label>
                <input
                  type="text"
                  placeholder="e.g. 100 Shoreditch High St, London"
                  value={custAddr}
                  onChange={(e) => setCustAddr(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-white rounded px-3 py-2 text-xs transition-colors"
                />
              </div>

              <div className="pt-3 border-t border-zinc-900 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setCustModalOpen(false)}
                  className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 text-zinc-400 rounded"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-semibold"
                >
                  Confirm Buyer Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUPPLIER MODAL */}
      {supModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md rounded-xl overflow-hidden shadow-2xl">
            <div className="px-4.5 py-3 border-b border-zinc-900 bg-zinc-950/80 flex justify-between items-center">
              <h3 className="font-sans font-bold text-white text-xs uppercase tracking-wider">
                {supModalMode === "add" ? "Register Sourcing Supplier" : "Revise Supplier Specifications"}
              </h3>
              <button onClick={() => setSupModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSupSubmit} className="p-4.5 space-y-3 font-sans text-xs">
              <div>
                <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1 font-semibold">Supplier Manufacturer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Global Semiconductors Ltd"
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-white rounded px-3 py-2 text-xs transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1 font-semibold">Sourcing Rep / Contact Director</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Arthur C. Clarke"
                  value={supContact}
                  onChange={(e) => setSupContact(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-white rounded px-3 py-2 text-xs transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1 font-semibold">Procurement Email Channel</label>
                <input
                  type="email"
                  placeholder="procurements@globalmfrs.com"
                  value={supEmail}
                  onChange={(e) => setSupEmail(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-white rounded px-3 py-2 text-xs transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1 font-semibold">Direct Sourcing Dispatch Phone</label>
                <input
                  type="text"
                  placeholder="+81 445 612 990"
                  value={supPhone}
                  onChange={(e) => setSupPhone(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-white rounded px-3 py-2 text-xs transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1 font-semibold">Physical Manufacturing Facility / HQ Address</label>
                <input
                  type="text"
                  placeholder="Factory cluster 4, Kyoto Research labs"
                  value={supAddr}
                  onChange={(e) => setSupAddr(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-white rounded px-3 py-2 text-xs transition-colors"
                />
              </div>

              <div className="pt-3 border-t border-zinc-900 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSupModalOpen(false)}
                  className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 text-zinc-400 rounded"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-semibold"
                >
                  Confirm Sourcing Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
