import React from "react";
import { ClientProduct, Sale, PurchaseOrder, ClientCategory, CompanySettings } from "../types";
import { 
  FileSpreadsheet, 
  TrendingUp, 
  Database, 
  Download, 
  FileText, 
  BarChart, 
  Calendar, 
  RefreshCw, 
  PieChart as PieIcon,
  CheckCircle,
  Clock
} from "lucide-react";

interface ReportsProps {
  products: ClientProduct[];
  categories: ClientCategory[];
  sales: Sale[];
  purchases: PurchaseOrder[];
  settings: CompanySettings;
}

export default function Reports({
  products,
  categories,
  sales,
  purchases,
  settings
}: ReportsProps) {
  
  const [reportType, setReportType] = React.useState<"inventory" | "sales" | "purchases" | "profit">("inventory");
  const [period, setPeriod] = React.useState<"30" | "90" | "365">("30");
  const [generating, setGenerating] = React.useState(false);
  const [reportedDataFeedback, setReportedDataFeedback] = React.useState<string | null>(null);

  const fCur = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: settings.currency || "USD"
    }).format(val);
  };

  // Dynamic values
  const totalStockQty = products.reduce((acc, p) => acc + p.quantity, 0);
  const totalAssetsVal = products.reduce((acc, p) => acc + (p.quantity * p.purchasePrice), 0);
  const retailRevenueEst = products.reduce((acc, p) => acc + (p.quantity * p.sellingPrice), 0);

  const handleGenerateAndDownload = (format: "csv" | "excel" | "json") => {
    setGenerating(true);
    setReportedDataFeedback(`Generating stock and analytics reports in background...`);

    setTimeout(() => {
      let fileContent = "";
      let fileName = `Inventra_${reportType}_Report_Period_${period}d.${format === "json" ? "json" : format === "csv" ? "csv" : "xls"}`;
      let contentType = "text/csv;charset=utf-8;";

      if (reportType === "inventory") {
        if (format === "json") {
          contentType = "application/json;charset=utf-8;";
          fileContent = JSON.stringify({
            generatedAt: new Date().toISOString(),
            assetsCount: products.length,
            totalStockQuantity: totalStockQty,
            totalValuation: totalAssetsVal,
            items: products.map(p => ({ sku: p.sku, name: p.name, qty: p.quantity, costPrice: p.purchasePrice, sellPrice: p.sellingPrice, status: p.status }))
          }, null, 2);
        } else {
          // CSV / XLS compatibility string
          fileContent = "Product Name,SKU,Available Qty,Purchase Cost per Unit,Selling Price per Unit,Total Asset Cost Valuation,Status\n";
          products.forEach(p => {
            fileContent += `"${p.name}","${p.sku}",${p.quantity},${p.purchasePrice},${p.sellingPrice},${p.quantity * p.purchasePrice},"${p.status}"\n`;
          });
        }
      } else if (reportType === "sales") {
        if (format === "json") {
          contentType = "application/json;charset=utf-8;";
          fileContent = JSON.stringify(sales, null, 2);
        } else {
          fileContent = "Invoice Number,Customer Name,Subtotal,Discount Applied,VAT Tax Amount,Grand Total,Invoice Timestamp\n";
          sales.forEach(s => {
            fileContent += `"${s.invoiceNumber}","${s.customerName}",${s.subtotal},${s.discount},${s.tax},${s.total},"${s.timestamp}"\n`;
          });
        }
      } else if (reportType === "purchases") {
        if (format === "json") {
          fileContent = JSON.stringify(purchases, null, 2);
        } else {
          fileContent = "PO Number,Supplier Name,Subtotal,Regulatory Tax,Total Procurement,Completion Status\n";
          purchases.forEach(p => {
            fileContent += `"${p.poNumber}","${p.supplierName}",${p.subtotal},${p.tax},${p.total},"${p.status}"\n`;
          });
        }
      } else {
        // Profitability matrix
        fileContent = "Product Name,SKU,Invoiced Units Sourced,Purchase Cost Cost-of-goods,Invoiced Gross Retail Value,Estimated Sourcing Net Profit,Profit Margin Ratio\n";
        products.forEach(p => {
          const margin = p.sellingPrice - p.purchasePrice;
          const ratio = p.sellingPrice > 0 ? ((margin / p.sellingPrice) * 100).toFixed(1) : "0.0";
          fileContent += `"${p.name}","${p.sku}",${p.quantity},${p.purchasePrice},${p.sellingPrice},${margin},"${ratio}%"\n`;
        });
      }

      const blob = new Blob([fileContent], { type: contentType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setGenerating(false);
      setReportedDataFeedback(`Report compiled successfully and downloaded!`);
      setTimeout(() => setReportedDataFeedback(null), 3000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-lg font-sans font-bold tracking-tight text-white flex items-center gap-2">
          Operations Analytics & Intelligence Reports
        </h2>
        <p className="text-xs text-zinc-400 font-sans">
          Construct structured historical CSV audits, compile Excel financial ledger forecasts, and download certified system exports instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Settings options card */}
        <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-800 space-y-4">
          <div className="pb-2.5 border-b border-zinc-900">
            <span className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <FileSpreadsheet size={14} className="text-indigo-400" />
              CONFIGURE REPORT PARAMETERS
            </span>
          </div>

          <div className="space-y-3 font-sans text-xs">
            
            {/* Report subject select */}
            <div className="space-y-1.5">
              <label className="block text-[10px] text-zinc-400 uppercase font-semibold">Audit Target Scope</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setReportType("inventory")}
                  className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all ${
                    reportType === "inventory" 
                      ? "bg-indigo-600/10 border-indigo-500 text-white" 
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <Database size={15} className="mb-1" />
                  <span className="font-semibold text-xs leading-none">Storage Stocks</span>
                </button>
                <button
                  onClick={() => setReportType("sales")}
                  className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all ${
                    reportType === "sales" 
                      ? "bg-indigo-600/10 border-indigo-500 text-white" 
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <TrendingUp size={15} className="mb-1" />
                  <span className="font-semibold text-xs leading-none">Invoicing Sales</span>
                </button>
                <button
                  onClick={() => setReportType("purchases")}
                  className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all ${
                    reportType === "purchases" 
                      ? "bg-indigo-600/10 border-indigo-500 text-white" 
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <FileText size={15} className="mb-1" />
                  <span className="font-semibold text-xs leading-none">PO Procurements</span>
                </button>
                <button
                  onClick={() => setReportType("profit")}
                  className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all ${
                    reportType === "profit" 
                      ? "bg-indigo-600/10 border-indigo-500 text-white" 
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <BarChart size={15} className="mb-1" />
                  <span className="font-semibold text-xs leading-none">Net Profit Margins</span>
                </button>
              </div>
            </div>

            {/* Interval period picker */}
            <div className="space-y-1">
              <label className="block text-[10px] text-zinc-400 uppercase font-semibold">Audit Window Interval</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as any)}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded px-2.5 py-1.5 focus:border-indigo-500 outline-none text-xs h-[34px]"
              >
                <option value="30">Past 30 Days Operations Timeline</option>
                <option value="90">Past Quarter (90 Days) Operational Audit</option>
                <option value="365">Cumulative Annual Sourcing Audit (365 Days)</option>
              </select>
            </div>

            {reportedDataFeedback && (
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs rounded-lg flex items-center gap-2 font-mono">
                {generating ? <RefreshCw className="animate-spin text-indigo-400" size={13} /> : <CheckCircle className="text-emerald-400" size={13} />}
                {reportedDataFeedback}
              </div>
            )}

            {/* Download immediate buttons */}
            <div className="pt-3 border-t border-zinc-900 space-y-2">
              <p className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase">EXPORT FILE FORMAT</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={generating}
                  onClick={() => handleGenerateAndDownload("csv")}
                  className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-sans text-xs font-semibold py-2 rounded-lg border border-zinc-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download size={13} /> Squeeze CSV
                </button>
                <button
                  disabled={generating}
                  onClick={() => handleGenerateAndDownload("excel")}
                  className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-sans text-xs font-semibold py-2 rounded-lg border border-zinc-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet size={13} /> Squeeze Excel
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Live calculated report summary charts / list preview */}
        <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-800 lg:col-span-2 space-y-4 font-sans text-xs">
          <div className="pb-2 borders-b border-zinc-900 flex justify-between items-center bg-zinc-950 text-zinc-300">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest flex items-center gap-1.5">
              <Clock size={14} className="text-zinc-500" />
              Operational Ledger Analytics Preview
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">Status: REALTIME SYNCED</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-zinc-900/35 p-4 rounded-xl border border-zinc-900 space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase font-medium">Cumulative asset stock value</span>
              <p className="text-lg font-mono font-bold text-white">{fCur(totalAssetsVal)}</p>
              <p className="text-[10px] text-zinc-400">Calculated across {products.length} registered SKUs.</p>
            </div>
            
            <div className="bg-zinc-900/35 p-4 rounded-xl border border-zinc-900 space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase font-medium">Estimated Retail Assets value</span>
              <p className="text-lg font-mono font-bold text-indigo-400">{fCur(retailRevenueEst)}</p>
              <p className="text-[10px] text-zinc-400">Total revenue generated if all storage assets are sold.</p>
            </div>
          </div>

          {/* Sourcing Profit overview list preview */}
          <div className="border border-zinc-900 rounded-lg overflow-hidden">
            <div className="p-3 bg-zinc-900/20 text-zinc-400 font-mono text-[10px] font-semibold border-b border-zinc-900 flex justify-between uppercase">
              <span>MEDICINE PRODUCT / SKU</span>
              <span>ESTIMATED NET MARGIN PERCENTAGE</span>
            </div>
            <div className="divide-y divide-zinc-900/50">
              {products.slice(0, 5).map(p => {
                const margin = p.sellingPrice - p.purchasePrice;
                const ratio = p.sellingPrice > 0 ? ((margin / p.sellingPrice) * 100).toFixed(1) : "0.0";
                return (
                  <div key={p.id} className="p-3 flex justify-between items-center text-xs text-zinc-300">
                    <div>
                      <p className="font-semibold text-white leading-none">{p.name}</p>
                      <span className="text-[10px] font-mono text-zinc-500 mt-1 block">SKU Code: {p.sku}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-emerald-400 font-semibold">+{fCur(margin)} margin</p>
                      <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">Ratio: {ratio}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
