import React from "react";
import { CompanySettings, User, UserRole } from "../types";
import { 
  Building2, 
  Settings2, 
  RefreshCw, 
  Check, 
  HelpCircle, 
  ShieldCheck, 
  Coins, 
  Percent, 
  UserPlus, 
  Trash2,
  FileCode2,
  HardDriveDownload
} from "lucide-react";

interface SettingsProps {
  settings: CompanySettings;
  users: User[];
  currentUserRole: UserRole;
  onUpdateSettings: (s: CompanySettings) => Promise<any>;
  onResetDatabase: () => Promise<any>;
}

export default function Settings({
  settings,
  users,
  currentUserRole,
  onUpdateSettings,
  onResetDatabase
}: SettingsProps) {
  
  // Fields states
  const [compName, setCompName] = React.useState(settings.companyName);
  const [email, setEmail] = React.useState(settings.email);
  const [phone, setPhone] = React.useState(settings.phone);
  const [address, setAddress] = React.useState(settings.address);
  const [currency, setCurrency] = React.useState(settings.currency);
  const [taxRate, setTaxRate] = React.useState(String(settings.taxRate));
  const [invoicePrefix, setInvoicePrefix] = React.useState(settings.invoicePrefix);

  const [saveFeedback, setSaveFeedback] = React.useState("");
  const [resetFeedback, setResetFeedback] = React.useState("");

  const isEmployee = currentUserRole === "Employee";
  const isAdmin = currentUserRole === "Admin";

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEmployee) return;

    try {
      await onUpdateSettings({
        companyName: compName,
        email,
        phone,
        address,
        currency,
        taxRate: Number(taxRate) || 0,
        invoicePrefix
      });
      setSaveFeedback("Configuration parameters saved successfully!");
      setTimeout(() => setSaveFeedback(""), 3000);
    } catch (err: any) {
      alert("Failed updating company profile settings: " + err.message);
    }
  };

  const triggerResetDatabase = async () => {
    if (!isAdmin) {
      alert("Full system schema resets require Admin authorization credentials.");
      return;
    }
    const check = confirm("⚠️ CRITICAL ACTION: Are you sure you wish to wipe the database back to initial factory baseline metrics?");
    if (!check) return;

    try {
      setResetFeedback("Purging database records...");
      await onResetDatabase();
      setResetFeedback("System reset successfully finished!");
      // reload
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch(e: any) {
      alert("Reset error: " + e.message);
      setResetFeedback("");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Title */}
      <div>
        <h2 className="text-lg font-sans font-bold tracking-tight text-white flex items-center gap-2">
          Enterprise Control Configuration Settings
        </h2>
        <p className="text-xs text-zinc-400 font-sans">
          Regulate billing parameters, calibrate global VAT ratios, inspect active operator node profiles, and audit hardware states.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Left Form: configuration settings */}
        <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-800 md:col-span-2">
          <div className="pb-3 border-b border-zinc-900 mb-4 flex justify-between items-center bg-zinc-955">
            <span className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <Building2 size={14} className="text-indigo-400" />
              COMPANY PROFILE PROFILE
            </span>
            <span className="text-[10px] font-mono text-zinc-500">Node ID: DEPLOYED</span>
          </div>

          {saveFeedback && (
            <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs py-2 px-3 rounded-lg flex items-center gap-2">
              <Check size={14} />
              {saveFeedback}
            </div>
          )}

          {isEmployee && (
            <div className="mb-4 p-3 bg-zinc-900 text-zinc-400 text-xs rounded-lg font-sans">
              🔒 **Employee Level Access**: Read-only permission profile. General settings adjustment is unavailable.
            </div>
          )}

          <form onSubmit={handleUpdateSubmit} className="space-y-4 font-sans text-xs">
            {/* Comp Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase tracking-wider mb-1.5 font-semibold">Company Profile Title</label>
                <input
                  disabled={isEmployee}
                  type="text"
                  required
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-white rounded-lg px-3.5 py-2.5 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase tracking-wider mb-1.5 font-semibold">Corporate Email Sourcing</label>
                <input
                  disabled={isEmployee}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-white rounded-lg px-3.5 py-2.5 transition-colors"
                />
              </div>
            </div>

            {/* Phone & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase tracking-wider mb-1.5 font-semibold">Direct Sourcing Telephone</label>
                <input
                  disabled={isEmployee}
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-white rounded-lg px-3.5 py-2.5 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase tracking-wider mb-1.5 font-semibold">Headquarters Mailing Address</label>
                <input
                  disabled={isEmployee}
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-white rounded-lg px-3.5 py-2.5 transition-colors"
                />
              </div>
            </div>

            {/* Financial Calibration Tab */}
            <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-900 space-y-4">
              <p className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">Financial Sourcing Calibrations</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Currency select */}
                <div>
                  <label className="block text-[9px] uppercase mb-1.5 font-semibold text-zinc-450">Active Currency</label>
                  <select
                    disabled={isEmployee}
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded px-2.5 py-1.5 outline-none focus:border-indigo-500 h-[34px]"
                  >
                    <option value="USD">USD ($) Dollars</option>
                    <option value="GBP">GBP (£) Sterling</option>
                    <option value="EUR">EUR (€) Euros</option>
                    <option value="JPY">JPY (¥) Yen</option>
                  </select>
                </div>

                {/* Tax Rate */}
                <div>
                  <label className="block text-[9px] uppercase mb-1.5 font-semibold text-zinc-450">Flat VAT Tax rate (%)</label>
                  <input
                    disabled={isEmployee}
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded px-2.5 py-1.5 focus:border-indigo-500 outline-none h-[34px] font-mono text-center animate-pulse"
                  />
                </div>

                {/* Invoice Prefix */}
                <div>
                  <label className="block text-[9px] uppercase mb-1.5 font-semibold text-zinc-450">Invoice prefix code</label>
                  <input
                    disabled={isEmployee}
                    type="text"
                    value={invoicePrefix}
                    onChange={(e) => setInvoicePrefix(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded px-2.5 py-1.5 focus:border-indigo-500 outline-none h-[34px] font-mono text-center tracking-wider"
                  />
                </div>

              </div>
            </div>

            <button
              disabled={isEmployee}
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-semibold py-2.5 rounded-lg border border-indigo-500/40 shadow-lg shadow-indigo-600/10 transition-all font-medium disabled:opacity-40"
            >
              Commit Configuration Profile
            </button>
          </form>
        </div>

        {/* Right Info: active users & database purge */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Active node operators list */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-4">
            <span className="text-[10px] font-mono text-zinc-400 font-semibold uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="text-emerald-400" size={15} />
              Authorised operators
            </span>

            <div className="space-y-3">
              {users.map((u) => {
                const isActive = currentUserRole === u.role;
                return (
                  <div key={u.id} className={`flex items-center gap-3 p-2 bg-zinc-900/30 rounded-lg border transition-all ${isActive ? "border-indigo-500/50 bg-indigo-500/[0.02]" : "border-transparent"}`}>
                    <img src={u.avatarUrl} alt={u.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                    <div>
                      <p className="font-sans font-bold text-xs text-white leading-none">
                        {u.name} {isActive && <span className="text-[9px] font-mono bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded ml-1 font-semibold uppercase">Me</span>}
                      </p>
                      <span className="text-[10px] text-zinc-500 leading-none block mt-1 font-mono">{u.role}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Database Reset controls */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3 text-xs leading-relaxed text-zinc-400">
            <p className="text-[10px] font-mono font-semibold text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
              <RefreshCw size={14} className="animate-spin text-rose-500" />
              SYSTEM MAINTENANCE
            </p>

            <p className="font-sans text-[11px]">
              Erase custom transactions, invoices, and restock actions, restoring databases back to standard system values (e.g., Tensor Core elements specs).
            </p>

            {resetFeedback && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded font-mono text-[10px]">
                {resetFeedback}
              </div>
            )}

            <button
              onClick={triggerResetDatabase}
              className="w-full py-2 bg-rose-600/10 hover:bg-rose-600/25 border border-rose-500/30 text-rose-300 font-sans text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 size={12} /> RESTORE SYSTEM METRICS
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
