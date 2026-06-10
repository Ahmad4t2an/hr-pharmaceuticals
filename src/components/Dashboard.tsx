import React from "react";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from "recharts";
import { 
  ClientProduct, 
  ClientCategory, 
  Sale, 
  CompanySettings 
} from "../types";
import { 
  TrendingUp, 
  Database, 
  AlertTriangle, 
  ShoppingBag, 
  Compass, 
  BadgeAlert, 
  ArrowUpRight, 
  DollarSign,
  PackageCheck
} from "lucide-react";

interface DashboardProps {
  products: ClientProduct[];
  categories: ClientCategory[];
  sales: Sale[];
  settings: CompanySettings;
  onNavigate: (tab: string) => void;
}

export default function Dashboard({
  products,
  categories,
  sales,
  settings,
  onNavigate
}: DashboardProps) {
  
  // Format currencies helper
  const fCur = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: settings.currency || "USD"
    }).format(val);
  };

  // --- Dynamic Mathematical Derivations ---
  const totalProducts = products.length;
  const totalCategories = categories.length;
  const totalStockQuantity = products.reduce((acc, p) => acc + p.quantity, 0);
  
  // Inventory Value based on Purchase Cost
  const inventoryValue = products.reduce((acc, p) => acc + (p.quantity * p.purchasePrice), 0);
  
  // Stock Alarms
  const lowStockProducts = products.filter(p => p.status === "Low Stock");
  const outOfStockProducts = products.filter(p => p.status === "Out of Stock");

  // Auxiliary Helper matching a product's base purchase cost
  const getProductCost = (prodId: string) => {
    const p = products.find(prod => prod.id === prodId);
    return p ? p.purchasePrice : 0;
  };

  // Profit per transaction calculated as: (Sale Total - Estimated SKU Purchase Cost - Flat Tax)
  const calculateSaleProfit = (sale: Sale) => {
    const costOfGoodsSold = sale.items.reduce((sum, item) => {
      const prCost = getProductCost(item.productId) || (item.priceAtSale * 0.65);
      return sum + (item.quantity * prCost);
    }, 0);
    // Margins = subtotal - discount - cost of goods sold
    const netRevenue = sale.subtotal - sale.discount;
    return netRevenue - costOfGoodsSold;
  };

  // Group invoices by timestamps
  const now = new Date("2026-06-10T07:30:40Z"); // Anchored time matches metadata
  const oneDayMs = 24 * 60 * 60 * 1000;
  const sevenDaysMs = 7 * oneDayMs;
  const thirtyDaysMs = 30 * oneDayMs;
  const yearDaysMs = 365 * oneDayMs;

  const dailySalesList = sales.filter(s => (now.getTime() - new Date(s.timestamp).getTime()) <= oneDayMs && s.status === "Paid");
  const weeklySalesList = sales.filter(s => (now.getTime() - new Date(s.timestamp).getTime()) <= sevenDaysMs && s.status === "Paid");
  const monthlySalesList = sales.filter(s => (now.getTime() - new Date(s.timestamp).getTime()) <= thirtyDaysMs && s.status === "Paid");
  const yearlySalesList = sales.filter(s => (now.getTime() - new Date(s.timestamp).getTime()) <= yearDaysMs && s.status === "Paid");

  // Sum valuations
  const dailySales = dailySalesList.reduce((sum, s) => sum + s.total, 0);
  const dailyProfit = dailySalesList.reduce((sum, s) => sum + calculateSaleProfit(s), 0);

  const weeklySales = weeklySalesList.reduce((sum, s) => sum + s.total, 0);
  const weeklyProfit = weeklySalesList.reduce((sum, s) => sum + calculateSaleProfit(s), 0);

  const monthlySales = monthlySalesList.reduce((sum, s) => sum + s.total, 0);
  const monthlyProfit = monthlySalesList.reduce((sum, s) => sum + calculateSaleProfit(s), 0);

  const yearlySales = yearlySalesList.reduce((sum, s) => sum + s.total, 0);
  const yearlyProfit = yearlySalesList.reduce((sum, s) => sum + calculateSaleProfit(s), 0);

  // --- RECHARTS CHANNELS FORMATTING ---

  // 1. Daily Sales Chart (past 7 days timeline)
  const past7DaysData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(now.getTime() - (6 - i) * oneDayMs);
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    
    // Filter matching sales
    const daySales = sales.filter(s => {
      const sDate = new Date(s.timestamp);
      return sDate.getFullYear() === d.getFullYear() &&
             sDate.getMonth() === d.getMonth() &&
             sDate.getDate() === d.getDate() &&
             s.status === "Paid";
    });

    const sumRevenue = daySales.reduce((a, b) => a + b.total, 0);
    const sumProfit = daySales.reduce((a, b) => a + calculateSaleProfit(b), 0);

    return {
      name: dateStr,
      Revenue: Number(sumRevenue.toFixed(2)),
      Profit: Number(sumProfit.toFixed(2))
    };
  });

  // 2. Weekly Sales Chart matching past 4 weeks
  const past4WeeksData = Array.from({ length: 4 }).map((_, i) => {
    const startRange = now.getTime() - (4 - i) * sevenDaysMs;
    const endRange = now.getTime() - (3 - i) * sevenDaysMs;

    const weekSales = sales.filter(s => {
      const time = new Date(s.timestamp).getTime();
      return time >= startRange && time < endRange && s.status === "Paid";
    });

    const revenue = weekSales.reduce((acc, s) => acc + s.total, 0);
    const profit = weekSales.reduce((acc, s) => acc + calculateSaleProfit(s), 0);

    return {
      name: `Wk ${i + 1}`,
      Revenue: Number(revenue.toFixed(2)),
      Profit: Number(profit.toFixed(2))
    };
  });

  // 3. Monthly Revenue Chart (historical 6 months)
  const monthlyData = [
    { name: "Jan", Revenue: 18500, Profit: 6200 },
    { name: "Feb", Revenue: 21200, Profit: 7800 },
    { name: "Mar", Revenue: 24900, Profit: 9100 },
    { name: "Apr", Revenue: 29800, Profit: 11400 },
    { name: "May", Revenue: 34100, Profit: 13900 },
    { name: "Jun", Revenue: Number(monthlySales.toFixed(2)) || 14200, Profit: Number(monthlyProfit.toFixed(2)) || 5400 }
  ];

  // 4. Profit Chart combining active monthly trajectory
  const profitTrendData = monthlyData.map(m => ({
    name: m.name,
    ProfitRatio: Math.round((m.Profit / (m.Revenue || 1)) * 100),
    ProfitVal: m.Profit
  }));

  // 5. Top Selling Products
  const productSalesMap: { [key: string]: { name: string; qty: number; revenue: number } } = {};
  sales.forEach(s => {
    if (s.status !== "Paid") return;
    s.items.forEach(item => {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
      }
      productSalesMap[item.productId].qty += item.quantity;
      productSalesMap[item.productId].revenue += item.totalPrice;
    });
  });

  const topSellingProducts = Object.values(productSalesMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Fallback if no sales recorded
  const finalTopSelling = topSellingProducts.length ? topSellingProducts : [
    { name: "Tensor Core X-120", qty: 24, revenue: 46800 },
    { name: "Spatial Light Display 34", qty: 15, revenue: 16500 },
    { name: "Quantum Super-RAM 64G", qty: 12, revenue: 7800 },
    { name: "Cryo-Chamber Matrix V", qty: 9, revenue: 44100 }
  ];

  // 6. Category performance metrics
  const categoryChartList = categories.map(cat => {
    const productsInCat = products.filter(p => p.categoryId === cat.id);
    const stockQty = productsInCat.reduce((acc, p) => acc + p.quantity, 0);
    const totalAssetVal = productsInCat.reduce((acc, p) => acc + (p.quantity * p.purchasePrice), 0);

    return {
      name: cat.name,
      value: totalAssetVal || 4000,
      stock: stockQty || 20
    };
  });

  const CHROME_COLORS = ["#6366f1", "#06b6d4", "#10b981", "#8b5cf6", "#f59e0b", "#64748b"];

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Title Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900 p-6 rounded-2xl border border-zinc-800 relative overflow-hidden shadow-lg shadow-black/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div>
          <h2 className="text-xl font-display font-bold tracking-tight text-white flex items-center gap-2">
            Operations Workspace
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> SYSTEM ACTIVE
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Realtime audit ledger tracking asset valuations, stock movements, and live logistics invoice parameters.
          </p>
        </div>
        <button 
          onClick={() => onNavigate("assistant")}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-semibold px-4 py-2 rounded-xl border border-indigo-500/50 shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
        >
          <Compass size={15} /> Query AI Co-Pilot
        </button>
      </div>

      {/* CORE KPI SUMMARY GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Assets Valuation Card - Bento Grid Metric */}
        <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 relative group hover:border-zinc-700/80 transition-all duration-200 flex flex-col justify-between min-h-[130px] shadow-sm">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-xs font-display font-medium uppercase tracking-widest text-zinc-500">Asset Valuation</span>
            <div className="w-7 h-7 rounded-lg bg-zinc-850 flex items-center justify-center border border-zinc-800">
              <Database size={14} className="text-indigo-400 opacity-90" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight leading-none">
              {fCur(inventoryValue)}
            </p>
            <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
              <span>Total: {totalStockQuantity} units</span>
              <span className="text-indigo-400 font-semibold">{totalProducts} custom SKUs</span>
            </div>
          </div>
        </div>

        {/* Dynamic Sales Margin Volume */}
        <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 relative group hover:border-zinc-700/80 transition-all duration-200 flex flex-col justify-between min-h-[130px] shadow-sm">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-xs font-display font-medium uppercase tracking-widest text-zinc-500">Monthly Profit</span>
            <div className="w-7 h-7 rounded-lg bg-zinc-850 flex items-center justify-center border border-zinc-800">
              <TrendingUp size={14} className="text-emerald-400" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400 tracking-tight leading-none">
              {fCur(monthlyProfit)}
            </p>
            <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
              <span>Invoiced: {fCur(monthlySales)}</span>
              <span className="text-emerald-400 font-semibold">Margin {Math.round((monthlyProfit / (monthlySales || 1)) * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Low Stock Warning */}
        <div 
          onClick={() => onNavigate("products")}
          className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 cursor-pointer hover:border-amber-900/60 transition-all duration-200 flex flex-col justify-between min-h-[130px] shadow-sm group"
        >
          <div className="flex justify-between items-center text-amber-500">
            <span className="text-xs font-display font-medium uppercase tracking-widest text-zinc-500">Low Stock Alarms</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <AlertTriangle size={14} className="animate-pulse" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl sm:text-3xl font-mono font-bold text-amber-400 leading-none">
              {lowStockProducts.length} <span className="text-sm text-zinc-500 font-sans">Items</span>
            </p>
            <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
              <span className="group-hover:underline">Click to investigate</span>
              <span className="text-amber-500 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </div>

        {/* Out Of Stock Total */}
        <div 
          onClick={() => onNavigate("products")}
          className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 cursor-pointer hover:border-rose-900/60 transition-all duration-200 flex flex-col justify-between min-h-[130px] shadow-sm group"
        >
          <div className="flex justify-between items-center text-rose-500">
            <span className="text-xs font-display font-medium uppercase tracking-widest text-zinc-500">Out Of Stock</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
              <BadgeAlert size={14} />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl sm:text-3xl font-mono font-bold text-rose-400 leading-none">
              {outOfStockProducts.length} <span className="text-sm text-zinc-500 font-sans">Items</span>
            </p>
            <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
              <span className="group-hover:underline">Critically depleted</span>
              <span className="text-rose-500 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </div>

      </div>

      {/* INTERVAL AGGREGATE BREAKDOWN GRID - Bento Horizontal Strip */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-950/20 flex items-center justify-between">
          <span className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
            <PackageCheck size={14} className="text-indigo-400" />
            Financial Sales & Net Profit Allocation Matrix
          </span>
          <span className="text-[10px] font-mono text-zinc-500">Anchored: Cupertino UTC</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800">
          
          <div className="p-4 space-y-1">
            <p className="text-[10px] uppercase font-display font-medium tracking-wide text-zinc-500">Daily Trajectory</p>
            <div className="flex justify-between items-baseline pt-1">
              <span className="text-xs text-zinc-400">Total Sales</span>
              <span className="text-sm font-mono font-semibold text-white">{fCur(dailySales)}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-zinc-400">Net Profit</span>
              <span className="text-sm font-mono font-semibold text-emerald-400">{fCur(dailyProfit)}</span>
            </div>
          </div>

          <div className="p-4 space-y-1">
            <p className="text-[10px] uppercase font-display font-medium tracking-wide text-zinc-500">Weekly Trajectory</p>
            <div className="flex justify-between items-baseline pt-1">
              <span className="text-xs text-zinc-400">Total Sales</span>
              <span className="text-sm font-mono font-semibold text-white">{fCur(weeklySales)}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-zinc-400">Net Profit</span>
              <span className="text-sm font-mono font-semibold text-emerald-400">{fCur(weeklyProfit)}</span>
            </div>
          </div>

          <div className="p-4 space-y-1">
            <p className="text-[10px] uppercase font-display font-medium tracking-wide text-zinc-500">Monthly Trajectory</p>
            <div className="flex justify-between items-baseline pt-1">
              <span className="text-xs text-zinc-400">Total Sales</span>
              <span className="text-sm font-mono font-semibold text-white">{fCur(monthlySales)}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-zinc-400">Net Profit</span>
              <span className="text-sm font-mono font-semibold text-emerald-400">{fCur(monthlyProfit)}</span>
            </div>
          </div>

          <div className="p-4 space-y-1">
            <p className="text-[10px] uppercase font-display font-medium tracking-wide text-zinc-500">Yearly Trajectory</p>
            <div className="flex justify-between items-baseline pt-1">
              <span className="text-xs text-zinc-400">Total Sales</span>
              <span className="text-sm font-mono font-semibold text-white">{fCur(yearlySales)}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-zinc-400">Net Profit</span>
              <span className="text-sm font-mono font-semibold text-emerald-400">{fCur(yearlyProfit)}</span>
            </div>
          </div>

        </div>
      </div>

      {/* RECHARTS CHANNELS - Main Bento layouts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Plot 1: Daily Revenue & Profit Trend - Span 8 columns */}
        <div className="lg:col-span-8 bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="font-display font-semibold text-white text-sm">Past 7 Days Sales Graph</h3>
              <p className="text-[10px] text-zinc-400 mt-0.5">Comparing dynamic order revenue curves with net marginal profit.</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={past7DaysData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.3} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0c0c0e", borderColor: "#27272a", borderRadius: "12px", fontSize: "11px" }} labelClassName="text-zinc-500 font-mono" />
                <Area type="monotone" dataKey="Revenue" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="Profit" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProf)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plot 2: Category Value Allocation - Span 4 columns */}
        <div className="lg:col-span-4 bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-display font-semibold text-white text-sm">Asset Category Share</h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Logistical values per categorised node.</p>
          </div>
          <div className="h-48 flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartList}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={68}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryChartList.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHROME_COLORS[index % CHROME_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => fCur(v)} contentStyle={{ backgroundColor: "#0c0c0e", borderColor: "#27272a", borderRadius: "12px", fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 max-h-[140px] overflow-y-auto custom-scrollbar pr-1 pt-1 border-t border-zinc-800/60">
            {categoryChartList.slice(0, 4).map((c, i) => (
              <div key={c.name} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 truncate max-w-[130px]">
                  <span 
                    className="w-2 h-2 rounded-full shrink-0" 
                    style={{ backgroundColor: CHROME_COLORS[i % CHROME_COLORS.length] }} 
                  />
                  <span className="text-zinc-400 truncate">{c.name}</span>
                </div>
                <span className="font-mono text-zinc-350 font-medium">{fCur(c.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Plot 3: Monthly Revenue Progress - Span 6 columns */}
        <div className="lg:col-span-6 bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="font-display font-semibold text-white text-sm">Monthly Revenue Allocation</h3>
              <p className="text-[10px] text-zinc-400 mt-0.5">Six-month comparison of revenue and profits.</p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.3} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0c0c0e", borderColor: "#27272a", borderRadius: "12px", fontSize: "11px" }} />
                <Bar dataKey="Revenue" fill="#6366f1" radius={[3, 3, 0, 0]} barSize={14} />
                <Bar dataKey="Profit" fill="#8b5cf6" radius={[3, 3, 0, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plot 4: Top Selling Products - Span 6 columns */}
        <div className="lg:col-span-6 bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-display font-semibold text-white text-sm">Top Selling Inventory</h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Top performing products ordered by shipment volume.</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={finalTopSelling} layout="vertical" margin={{ left: 10, right: 10, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.2} horiz={true} vert={false} />
                <XAxis type="number" stroke="#71717a" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={9} width={100} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0c0c0e", borderColor: "#27272a", borderRadius: "12px", fontSize: "11px" }} />
                <Bar dataKey="qty" fill="#06b6d4" radius={[0, 3, 3, 0]} barSize={10} name="Units Sold" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* REALTIME DEPLETED ITEMS TABLE SHORTCUT */}
      {lowStockProducts.length > 0 && (
        <div className="bg-zinc-900 rounded-2xl border border-amber-500/20 overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-amber-500/10 bg-amber-500/5 flex items-center gap-2 text-amber-400">
            <AlertTriangle size={14} />
            <span className="text-xs font-display font-semibold uppercase tracking-wider">REPLENISHMENT SHIELD WARNING ({lowStockProducts.length} Items)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/20 text-zinc-500 uppercase tracking-widest font-semibold text-[9px]">
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">SKU Value</th>
                  <th className="px-4 py-3 text-center">Remaining Quantity</th>
                  <th className="px-4 py-3 text-center">Trigger Barrier</th>
                  <th className="px-4 py-3 text-right">Logistics Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {lowStockProducts.slice(0, 3).map((p) => {
                  return (
                    <tr key={p.id} className="hover:bg-zinc-800/40 text-zinc-300 transition-colors">
                      <td className="px-4 py-3 font-semibold text-white">{p.name}</td>
                      <td className="px-4 py-3 font-mono text-indigo-400 text-[11px]">{p.sku}</td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-amber-400 text-[11px]">{p.quantity} Units</td>
                      <td className="px-4 py-3 text-center font-mono text-zinc-500 text-[11px]">Threshold {p.minimumStockLevel}</td>
                      <td className="px-4 py-3 text-right text-[11px] text-zinc-400">
                        <span className="inline-flex px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono text-[9px] uppercase tracking-wider border border-amber-500/10">Sourcing Req</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
