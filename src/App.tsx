import React from "react";
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

  // Load database from Express API
  const fetchDb = async () => {
    try {
      const res = await fetch("/api/db");
      if (res.ok) {
        const data = await res.json();
        setDb(data);
      }
    } catch (e) {
      console.error("Database fetch error: ", e);
    } finally {
      setLoading(false);
    }
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

  // --- CRUD API BINDING PIPES ---

  // Products
  const handleAddProduct = async (prod: any) => {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...prod, user: currentUser?.name || "System" })
    });
    const data = await res.json();
    await fetchDb();
    return data;
  };

  const handleEditProduct = async (id: string, prod: any) => {
    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...prod, user: currentUser?.name || "System" })
    });
    const data = await res.json();
    await fetchDb();
    return data;
  };

  const handleRawDeleteProduct = async (id: string) => {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    const data = await res.json();
    await fetchDb();
    return data;
  };

  // Categories
  const handleAddCategory = async (cat: any) => {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cat)
    });
    const data = await res.json();
    await fetchDb();
    return data;
  };

  const handleEditCategory = async (id: string, cat: any) => {
    const res = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cat)
    });
    const data = await res.json();
    await fetchDb();
    return data;
  };

  const handleDeleteCategory = async (id: string) => {
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    const data = await res.json();
    await fetchDb();
    return data;
  };

  // Brands
  const handleAddBrand = async (brand: any) => {
    const res = await fetch("/api/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(brand)
    });
    const data = await res.json();
    await fetchDb();
    return data;
  };

  const handleEditBrand = async (id: string, brand: any) => {
    const res = await fetch(`/api/brands/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(brand)
    });
    const data = await res.json();
    await fetchDb();
    return data;
  };

  const handleDeleteBrand = async (id: string) => {
    const res = await fetch(`/api/brands/${id}`, { method: "DELETE" });
    const data = await res.json();
    await fetchDb();
    return data;
  };

  // Inventory movement logic
  const handlePostMovement = async (movement: any) => {
    const res = await fetch("/api/inventory/movement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(movement)
    });
    const data = await res.json();
    await fetchDb();
    return data;
  };

  // Sales Point of Sale Invoice commits
  const handlePostSale = async (sourceSale: any) => {
    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sourceSale)
    });
    const data = await res.json();
    await fetchDb();
    return data;
  };

  // Sourcing Procurement purchase orders
  const handlePostPurchase = async (sourcePO: any) => {
    const res = await fetch("/api/purchases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sourcePO)
    });
    const data = await res.json();
    await fetchDb();
    return data;
  };

  const handleUpdatePOStatus = async (id: string, status: string, paymentStatus: string) => {
    const res = await fetch(`/api/purchases/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, paymentStatus })
    });
    const data = await res.json();
    await fetchDb();
    return data;
  };

  // Customers (CRUDS)
  const handleAddCustomer = async (cust: any) => {
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cust)
    });
    const data = await res.json();
    await fetchDb();
    return data;
  };

  const handleEditCustomer = async (id: string, cust: any) => {
    const res = await fetch(`/api/customers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cust)
    });
    const data = await res.json();
    await fetchDb();
    return data;
  };

  const handleDeleteCustomer = async (id: string) => {
    const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
    const data = await res.json();
    await fetchDb();
    return data;
  };

  // Suppliers (CRUDS)
  const handleAddSupplier = async (sup: any) => {
    const res = await fetch("/api/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sup)
    });
    const data = await res.json();
    await fetchDb();
    return data;
;  };

  const handleEditSupplier = async (id: string, sup: any) => {
    const res = await fetch(`/api/suppliers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sup)
    });
    const data = await res.json();
    await fetchDb();
    return data;
  };

  const handleDeleteSupplier = async (id: string) => {
    const res = await fetch(`/api/suppliers/${id}`, { method: "DELETE" });
    const data = await res.json();
    await fetchDb();
    return data;
  };

  // Global configurations & notifications
  const handleUpdateSettings = async (settingsPayload: CompanySettings) => {
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settingsPayload)
    });
    const data = await res.json();
    await fetchDb();
    return data;
  };

  const handleMarkAllAsRead = async () => {
    const res = await fetch("/api/notifications/read", { method: "POST" });
    const data = await res.json();
    await fetchDb();
    return data;
  };

  const handleResetDatabase = async () => {
    const res = await fetch("/api/db/reset", { method: "POST" });
    const data = await res.json();
    await fetchDb();
    return data;
  };

  // Loading Screen Layout
  if (loading || !db) {
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
