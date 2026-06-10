import React from "react";
import { getInitialState } from "./seed";
import { User, UserRole, SystemState, CompanySettings } from "./types";
import Sidebar from "./components/Sidebar";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import Products from "./components/Products";
import CategoriesAndBrands from "./components/CategoriesAndBrands";
import Inventory from "./components/Inventory";
import Sales from "./components/Sales";
import Purchases from "./components/Purchases";
import CustomersAndSuppliers from "./components/CustomersAndSuppliers";
import Reports from "./components/Reports";
import AiAssistant from "./components/AiAssistant";
import Notifications from "./components/Notifications";
import Settings from "./components/Settings";
import { RefreshCw, LayoutDashboard } from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [db, setDb] = React.useState<SystemState | null>(null);
  const [dbError, setDbError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState("dashboard");
  const [loading, setLoading] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(true);

  // Parse cached user session on mount
  React.useEffect(() => {
    const cachedUser = localStorage.getItem("inventra_user");
    if (cachedUser) {
      try {
        setCurrentUser(JSON.parse(cachedUser));
      } catch (e) {
        localStorage.removeItem("inventra_user");
      }
    }
    fetchDb();
  }, []);

  // Sync dark theme with HTML element
  React.useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  // Load database from Local Storage
  const fetchDb = async () => {
    try {
      let stateStr = localStorage.getItem("inventra_db");
      if (!stateStr) {
        stateStr = JSON.stringify(getInitialState());
        localStorage.setItem("inventra_db", stateStr);
      }
      setDb(JSON.parse(stateStr));
    } catch (e: any) {
      console.error("Database fetch error: ", e);
      setDbError(e.message || "Failed to load local database.");
    } finally {
      setLoading(false);
    }
  };

  const updateDb = (updater: (prev: SystemState) => SystemState) => {
    setDb((prevDb) => {
      if (!prevDb) return prevDb;
      const newDb = updater(prevDb);
      localStorage.setItem("inventra_db", JSON.stringify(newDb));
      return newDb;
    });
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("inventra_user", JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("inventra_user");
  };

  const handleRoleChange = (role: UserRole) => {
    if (currentUser) {
      const updated = { ...currentUser, role };
      setCurrentUser(updated);
      localStorage.setItem("inventra_user", JSON.stringify(updated));
    }
  };

  // --- CRUD LOCAL BINDING PIPES ---

  // Products
  const handleAddProduct = async (prod: any) => {
    const newDoc = { ...prod, id: "prod_" + Date.now() };
    updateDb((prev) => ({ ...prev, products: [...prev.products, newDoc] }));
    return { success: true, product: newDoc };
  };

  const handleEditProduct = async (id: string, prod: any) => {
    updateDb((prev) => ({
      ...prev,
      products: prev.products.map(p => p.id === id ? { ...p, ...prod } : p)
    }));
    return { success: true };
  };

  const handleRawDeleteProduct = async (id: string) => {
    updateDb((prev) => ({ ...prev, products: prev.products.filter(p => p.id !== id) }));
    return { success: true };
  };

  // Categories
  const handleAddCategory = async (cat: any) => {
    const newDoc = { ...cat, id: "cat_" + Date.now() };
    updateDb((prev) => ({ ...prev, categories: [...prev.categories, newDoc] }));
    return { success: true, category: newDoc };
  };

  const handleEditCategory = async (id: string, cat: any) => {
    updateDb((prev) => ({
      ...prev,
      categories: prev.categories.map(c => c.id === id ? { ...c, ...cat } : c)
    }));
    return { success: true };
  };

  const handleDeleteCategory = async (id: string) => {
    updateDb((prev) => ({ ...prev, categories: prev.categories.filter(c => c.id !== id) }));
    return { success: true };
  };

  // Brands
  const handleAddBrand = async (brand: any) => {
    const newDoc = { ...brand, id: "br_" + Date.now() };
    updateDb((prev) => ({ ...prev, brands: [...prev.brands, newDoc] }));
    return { success: true, brand: newDoc };
  };

  const handleEditBrand = async (id: string, brand: any) => {
    updateDb((prev) => ({
      ...prev,
      brands: prev.brands.map(b => b.id === id ? { ...b, ...brand } : b)
    }));
    return { success: true };
  };

  const handleDeleteBrand = async (id: string) => {
    updateDb((prev) => ({ ...prev, brands: prev.brands.filter(b => b.id !== id) }));
    return { success: true };
  };

  // Inventory movement logic
  const handlePostMovement = async (movement: any) => {
    updateDb((prev) => {
      const log = { ...movement, id: "log_" + Date.now(), timestamp: new Date().toISOString() };
      return { ...prev, inventoryLogs: [log, ...prev.inventoryLogs] };
    });
    return { success: true };
  };

  // Sales Point of Sale Invoice commits
  const handlePostSale = async (sourceSale: any) => {
    const newDoc = { ...sourceSale, id: "sale_" + Date.now(), timestamp: new Date().toISOString() };
    updateDb((prev) => ({ ...prev, sales: [newDoc, ...prev.sales] }));
    return { success: true, sale: newDoc };
  };

  // Sourcing Procurement purchase orders
  const handlePostPurchase = async (sourcePO: any) => {
    const newDoc = { ...sourcePO, id: "po_" + Date.now(), timestamp: new Date().toISOString() };
    updateDb((prev) => ({ ...prev, purchases: [newDoc, ...prev.purchases] }));
    return { success: true, purchaseOrder: newDoc };
  };

  const handleUpdatePOStatus = async (id: string, status: string, paymentStatus: string) => {
    updateDb((prev) => ({
      ...prev,
      purchases: prev.purchases.map(po => po.id === id ? { ...po, status: status as any, paymentStatus: paymentStatus as any } : po)
    }));
    return { success: true };
  };

  // Customers (CRUDS)
  const handleAddCustomer = async (cust: any) => {
    const newDoc = { ...cust, id: "cust_" + Date.now() };
    updateDb((prev) => ({ ...prev, customers: [...prev.customers, newDoc] }));
    return { success: true, customer: newDoc };
  };

  const handleEditCustomer = async (id: string, cust: any) => {
    updateDb((prev) => ({
      ...prev,
      customers: prev.customers.map(c => c.id === id ? { ...c, ...cust } : c)
    }));
    return { success: true };
  };

  const handleDeleteCustomer = async (id: string) => {
    updateDb((prev) => ({ ...prev, customers: prev.customers.filter(c => c.id !== id) }));
    return { success: true };
  };

  // Suppliers (CRUDS)
  const handleAddSupplier = async (sup: any) => {
    const newDoc = { ...sup, id: "sup_" + Date.now() };
    updateDb((prev) => ({ ...prev, suppliers: [...prev.suppliers, newDoc] }));
    return { success: true, supplier: newDoc };
  };

  const handleEditSupplier = async (id: string, sup: any) => {
    updateDb((prev) => ({
      ...prev,
      suppliers: prev.suppliers.map(s => s.id === id ? { ...s, ...sup } : s)
    }));
    return { success: true };
  };

  const handleDeleteSupplier = async (id: string) => {
    updateDb((prev) => ({ ...prev, suppliers: prev.suppliers.filter(s => s.id !== id) }));
    return { success: true };
  };

  // Global configurations & notifications
  const handleUpdateSettings = async (settingsPayload: CompanySettings) => {
    updateDb((prev) => ({ ...prev, settings: { ...prev.settings, ...settingsPayload } }));
    return { success: true };
  };

  const handleMarkAllAsRead = async () => {
    updateDb((prev) => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, read: true }))
    }));
    return { success: true };
  };

  const handleResetDatabase = async () => {
    const freshState = getInitialState();
    localStorage.setItem("inventra_db", JSON.stringify(freshState));
    setDb(freshState);
    return { success: true };
  };


  // Loading Screen Layout
  if (loading || !db) {
    if (dbError) {
      return (
        <div className="h-screen w-screen bg-zinc-950 flex flex-col items-center justify-center p-6 space-y-4">
          <div className="max-w-md bg-red-950/40 border border-red-500/50 rounded-xl p-6 text-center space-y-3 shadow-lg shadow-red-500/10">
            <h2 className="text-xl font-bold text-red-400">Database Connection Error</h2>
            <p className="text-red-200/80 text-sm leading-relaxed">{dbError}</p>
            <p className="text-zinc-400 text-xs mt-2 border-t border-red-500/20 pt-4">
              Fix your environment variables or MongoDB IP Access List and refresh the page.
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="h-screen w-screen bg-zinc-950 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="animate-spin text-indigo-500" size={32} />
        <h3 className="text-sm font-mono font-bold tracking-widest text-zinc-400">CONNECTING TO MEDICAL INVENTORY STORAGE DATA...</h3>
      </div>
    );
  }

  // Auth Guard
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center font-sans">
        <Auth onLoginSuccess={handleLoginSuccess} users={db.users} />
      </div>
    );
  }

  const unreadNotificationsCount = db.notifications.filter(n => !n.read).length;

  // Render correct dashboard module corresponding to activeTab selection
  const renderSelectedModule = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard 
            products={db.products} 
            categories={db.categories} 
            sales={db.sales} 
            settings={db.settings} 
            onNavigate={(id) => setActiveTab(id)} 
          />
        );
      case "products":
        return (
          <Products
            products={db.products}
            categories={db.categories}
            brands={db.brands}
            suppliers={db.suppliers}
            currentUserRole={currentUser.role}
            settings={db.settings}
            onAddProduct={handleAddProduct}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleRawDeleteProduct}
          />
        );
      case "categories":
        return (
          <CategoriesAndBrands
            initialSubTab="categories"
            categories={db.categories}
            brands={db.brands}
            currentUserRole={currentUser.role}
            onAddCategory={handleAddCategory}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
            onAddBrand={handleAddBrand}
            onEditBrand={handleEditBrand}
            onDeleteBrand={handleDeleteBrand}
          />
        );
      case "brands":
        return (
          <CategoriesAndBrands
            initialSubTab="brands"
            categories={db.categories}
            brands={db.brands}
            currentUserRole={currentUser.role}
            onAddCategory={handleAddCategory}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
            onAddBrand={handleAddBrand}
            onEditBrand={handleEditBrand}
            onDeleteBrand={handleDeleteBrand}
          />
        );
      case "inventory":
        return (
          <Inventory
            products={db.products}
            inventoryLogs={db.inventoryLogs}
            currentUserRole={currentUser.role}
            currentUserName={currentUser.name}
            onPostMovement={handlePostMovement}
          />
        );
      case "sales":
        return (
          <Sales
            products={db.products}
            customers={db.customers}
            sales={db.sales}
            settings={db.settings}
            onPostSale={handlePostSale}
          />
        );
      case "purchases":
        return (
          <Purchases
            products={db.products}
            suppliers={db.suppliers}
            purchases={db.purchases}
            settings={db.settings}
            currentUserRole={currentUser.role}
            onPostPurchase={handlePostPurchase}
            onUpdatePOStatus={handleUpdatePOStatus}
          />
        );
      case "customers":
        return (
          <CustomersAndSuppliers
            initialSubTab="customers"
            customers={db.customers}
            suppliers={db.suppliers}
            currentUserRole={currentUser.role}
            onAddCustomer={handleAddCustomer}
            onEditCustomer={handleEditCustomer}
            onDeleteCustomer={handleDeleteCustomer}
            onAddSupplier={handleAddSupplier}
            onEditSupplier={handleEditSupplier}
            onDeleteSupplier={handleDeleteSupplier}
          />
        );
      case "suppliers":
        return (
          <CustomersAndSuppliers
            initialSubTab="suppliers"
            customers={db.customers}
            suppliers={db.suppliers}
            currentUserRole={currentUser.role}
            onAddCustomer={handleAddCustomer}
            onEditCustomer={handleEditCustomer}
            onDeleteCustomer={handleDeleteCustomer}
            onAddSupplier={handleAddSupplier}
            onEditSupplier={handleEditSupplier}
            onDeleteSupplier={handleDeleteSupplier}
          />
        );
      case "reports":
        return (
          <Reports
            products={db.products}
            categories={db.categories}
            sales={db.sales}
            purchases={db.purchases}
            settings={db.settings}
          />
        );
      case "assistant":
        return <AiAssistant settings={db.settings} />;
      case "notifications":
        return (
          <Notifications
            notifications={db.notifications}
            onMarkAllAsRead={handleMarkAllAsRead}
          />
        );
      case "settings":
        return (
          <Settings
            settings={db.settings}
            users={db.users}
            currentUserRole={currentUser.role}
            onUpdateSettings={handleUpdateSettings}
            onResetDatabase={handleResetDatabase}
          />
        );
      default:
        return (
          <div className="p-8 text-center bg-zinc-950 rounded-2xl border border-zinc-900 text-zinc-500 font-mono text-xs">
            Unknown section selected. Loading default dashboard node...
          </div>
        );
    }
  };

  return (
    <div className={`flex flex-col lg:flex-row h-screen w-screen overflow-hidden ${darkMode ? "bg-[#09090b] text-white dark" : "bg-white text-zinc-900"}`}>
      {/* Universal Sidebar */}
      <Sidebar
        activeTab={activeTab === "notifications" ? "" : activeTab}
        setActiveTab={(id) => setActiveTab(id)}
        currentUser={currentUser}
        onRoleChange={handleRoleChange}
        users={db.users}
        notificationsCount={unreadNotificationsCount}
        openNotifications={() => setActiveTab("notifications")}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onLogout={handleLogout}
      />

      {/* Main Content Workspace viewport */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
        {renderSelectedModule()}
      </main>
    </div>
  );
}
