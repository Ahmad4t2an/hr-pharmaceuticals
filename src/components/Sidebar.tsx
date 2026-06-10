import React from "react";
// @ts-ignore
import companyLogo from "../assets/logo.png";
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  Award, 
  History, 
  Coins, 
  ShoppingBag, 
  Users, 
  Truck, 
  BarChart3, 
  Cpu, 
  Bell, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  User as UserIcon, 
  Sun, 
  Moon,
  ShieldCheck
} from "lucide-react";
import { User, UserRole } from "../types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  onRoleChange: (role: UserRole) => void;
  users: User[];
  notificationsCount: number;
  openNotifications: () => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onLogout: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  currentUser,
  onRoleChange,
  users,
  notificationsCount,
  openNotifications,
  darkMode,
  setDarkMode,
  onLogout
}: SidebarProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = React.useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Package },
    { id: "categories", label: "Categories", icon: FolderTree },
    { id: "brands", label: "Brands", icon: Award },
    { id: "inventory", label: "Inventory History", icon: History },
    { id: "sales", label: "Sales & Invoicing", icon: Coins },
    { id: "purchases", label: "Purchases", icon: ShoppingBag },
    { id: "customers", label: "Customers", icon: Users },
    { id: "suppliers", label: "Suppliers", icon: Truck },
    { id: "reports", label: "Reports Module", icon: BarChart3 },
    { id: "assistant", label: "AI Co-Pilot", icon: Cpu },
    { id: "settings", label: "System Settings", icon: Settings },
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    const role = currentUser.role;
    if (role === "Admin") return true;
    if (role === "Manager") {
      // Manager should NOT see Sales-related tabs
      return item.id !== "sales" && item.id !== "reports";
    }
    if (role === "Employee") {
      // Employee should only see dashboard, products, categories, brands, & co-pilot
      return ["dashboard", "products", "categories", "brands", "assistant"].includes(item.id);
    }
    return true;
  });

  return (
    <>
      {/* Top Mobile Bar */}
      <header className="lg:hidden h-16 w-full border-b border-zinc-800 bg-[#0c0c0e]/90 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <img 
            src={companyLogo} 
            alt="HR Pharma Logo" 
            className="w-8 h-8 rounded-lg object-contain bg-white p-0.5 border border-zinc-800/40"
            referrerPolicy="no-referrer"
          />
          <span className="font-display font-semibold tracking-tight text-white text-sm">
            HR Pharma
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openNotifications}
            id="mobile-notif-btn"
            className="p-2 text-zinc-400 hover:text-white rounded-lg relative hover:bg-zinc-900 transition-colors"
          >
            <Bell size={20} />
            {notificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0c0c0e]" />
            )}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Main Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-[#1f1f23] lg:border-zinc-800/60 bg-[#0c0c0e] flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Upper Head / Logo Section */}
        <div>
          <div className="h-16 px-6 border-b border-zinc-900 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img 
                src={companyLogo} 
                alt="HR Pharma Logo" 
                className="w-10 h-10 rounded-lg object-contain bg-white p-0.5 border border-zinc-800/40"
                referrerPolicy="no-referrer"
              />
              <div>
                <h1 className="font-display font-semibold tracking-tight text-white text-sm leading-tight">
                  HR Pharma
                </h1>
                <p className="text-[9px] font-mono text-teal-400 uppercase tracking-widest leading-none mt-1">
                  Med Logistics
                </p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded-md hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors animate-pulse"
              title="Toggle color theme"
            >
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>

          {/* Nav Items */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-16rem)] lg:max-h-[calc(100vh-14rem)] custom-scrollbar">
            {filteredMenuItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-sans font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-zinc-800/80 text-white font-semibold border border-zinc-700/50 shadow-sm"
                      : "text-zinc-400 hover:bg-zinc-800/30 hover:text-white"
                  }`}
                >
                  <IconComp size={15} className={isActive ? "text-indigo-450 opacity-100" : "opacity-60"} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Account / Role Quick Swapper */}
        <div className="p-4 border-t border-zinc-900 bg-zinc-950/40 relative">
          {/* Quick Notifications shortcut for desktop */}
          <div className="absolute -top-12 right-4 hidden lg:block">
            <button
              onClick={openNotifications}
              id="desktop-notif-btn"
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-all relative"
            >
              <Bell size={18} />
              {notificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-[#0c0c0e] animate-pulse" />
              )}
            </button>
          </div>

          {/* Dropdown switch menu */}
          {roleMenuOpen && (
            <div className="absolute bottom-16 left-4 right-4 bg-zinc-900 border border-zinc-800 rounded-xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <p className="text-[10px] font-mono font-semibold text-zinc-500 px-3 py-1 uppercase tracking-wider">
                Simulate Role Security
              </p>
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    onRoleChange(u.role);
                    setRoleMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg text-left transition-colors ${
                    currentUser.role === u.role
                      ? "bg-zinc-800 font-medium text-white"
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                    {u.avatarUrl ? (
                      <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <UserIcon size={12} className="text-zinc-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-sans font-medium text-xs text-white">{u.name}</p>
                    <p className="text-[9px] text-zinc-500 font-mono flex items-center gap-0.5">
                      <ShieldCheck size={10} className="text-indigo-400" />
                      {u.role}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Compact visual Card footer */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex-1 flex items-center gap-2.5 text-left p-1.5 rounded-xl hover:bg-zinc-900 transition-colors group text-zinc-100"
            >
              <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden ring-2 ring-indigo-500/20">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <UserIcon size={16} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-sans font-semibold text-xs leading-none truncate group-hover:text-indigo-400 transition-colors">
                  {currentUser.name}
                </h4>
                <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-mono leading-none bg-indigo-500/10 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/10 uppercase">
                  <ShieldCheck size={9} />
                  {currentUser.role}
                </span>
              </div>
            </button>

            <button
              onClick={onLogout}
              className="p-1.5 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-zinc-900 transition-all"
              title="Logout session"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile background overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}
    </>
  );
}
