import React from "react";
import { ClientCategory, ClientBrand, UserRole } from "../types";
import { Plus, Edit, Trash2, X, FolderTree, Award, RefreshCw, FolderPlus } from "lucide-react";

interface CategoriesAndBrandsProps {
  categories: ClientCategory[];
  brands: ClientBrand[];
  currentUserRole: UserRole;
  initialSubTab?: "categories" | "brands";
  onAddCategory: (cat: { name: string; description: string; image: string }) => Promise<any>;
  onEditCategory: (id: string, cat: { name: string; description: string; image: string }) => Promise<any>;
  onDeleteCategory: (id: string) => Promise<any>;
  onAddBrand: (brand: { name: string; logoUrl: string }) => Promise<any>;
  onEditBrand: (id: string, brand: { name: string; logoUrl: string }) => Promise<any>;
  onDeleteBrand: (id: string) => Promise<any>;
}

export default function CategoriesAndBrands({
  categories,
  brands,
  currentUserRole,
  initialSubTab = "categories",
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onAddBrand,
  onEditBrand,
  onDeleteBrand
}: CategoriesAndBrandsProps) {
  
  const [activeSubTab, setActiveSubTab] = React.useState<"categories" | "brands">(initialSubTab);

  React.useEffect(() => {
    setActiveSubTab(initialSubTab);
  }, [initialSubTab]);

  // Category view states
  const [catModalOpen, setCatModalOpen] = React.useState(false);
  const [catModalMode, setCatModalMode] = React.useState<"add" | "edit">("add");
  const [selectedCatId, setSelectedCatId] = React.useState<string | null>(null);
  const [catName, setCatName] = React.useState("");
  const [catDesc, setCatDesc] = React.useState("");
  const [catImg, setCatImg] = React.useState("");

  // Brand view states
  const [brandModalOpen, setBrandModalOpen] = React.useState(false);
  const [brandModalMode, setBrandModalMode] = React.useState<"add" | "edit">("add");
  const [selectedBrandId, setSelectedBrandId] = React.useState<string | null>(null);
  const [brandName, setBrandName] = React.useState("");
  const [brandColor, setBrandColor] = React.useState("#ef4444"); // use colors as mock brand logo badges

  const isEmployee = currentUserRole === "Employee";
  const isAdmin = currentUserRole === "Admin";

  const presetColors = ["#ef4444", "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#06b6d4", "#ec4899", "#84cc16"];

  // Handle Category submit
  const handleCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEmployee) return;

    if (!catName.trim()) {
      alert("Name is required");
      return;
    }

    const payload = {
      name: catName.trim(),
      description: catDesc.trim(),
      image: catImg.trim() || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&auto=format&fit=crop&q=60"
    };

    try {
      if (catModalMode === "add") {
        await onAddCategory(payload);
      } else if (catModalMode === "edit" && selectedCatId) {
        await onEditCategory(selectedCatId, payload);
      }
      setCatModalOpen(false);
      setCatName("");
      setCatDesc("");
      setCatImg("");
    } catch (err: any) {
      alert(err.message || "Failed to submit category.");
    }
  };

  // Handle Brand submit
  const handleBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEmployee) return;

    if (!brandName.trim()) {
      alert("Brand name is required");
      return;
    }

    const payload = {
      name: brandName.trim(),
      logoUrl: brandColor
    };

    try {
      if (brandModalMode === "add") {
        await onAddBrand(payload);
      } else if (brandModalMode === "edit" && selectedBrandId) {
        await onEditBrand(selectedBrandId, payload);
      }
      setBrandModalOpen(false);
      setBrandName("");
    } catch (err: any) {
      alert(err.message || "Failed to submit brand.");
    }
  };

  const handleOpenCatEdit = (c: ClientCategory) => {
    if (isEmployee) return;
    setSelectedCatId(c.id);
    setCatName(c.name);
    setCatDesc(c.description);
    setCatImg(c.image);
    setCatModalMode("edit");
    setCatModalOpen(true);
  };

  const handleOpenBrandEdit = (b: ClientBrand) => {
    if (isEmployee) return;
    setSelectedBrandId(b.id);
    setBrandName(b.name);
    setBrandColor(b.logoUrl || "#ef4444");
    setBrandModalMode("edit");
    setBrandModalOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-sans font-bold tracking-tight text-white flex items-center gap-2">
            Logistics Hierarchy Segments
          </h2>
          <p className="text-xs text-zinc-400 font-sans">
            Categorise SKU blocks and organize manufacturer nodes (brands) mapping out physical layouts.
          </p>
        </div>

        {/* Categories / Brands Switch Tabs */}
        <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveSubTab("categories")}
            className={`px-3 py-1.5 text-xs font-sans font-medium rounded-lg flex items-center gap-1.5 transition-all ${
              activeSubTab === "categories" 
                ? "bg-zinc-900 text-white shadow-sm font-semibold" 
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <FolderTree size={13} /> Categories Segment
          </button>
          <button
            onClick={() => setActiveSubTab("brands")}
            className={`px-3 py-1.5 text-xs font-sans font-medium rounded-lg flex items-center gap-1.5 transition-all ${
              activeSubTab === "brands" 
                ? "bg-zinc-900 text-white shadow-sm font-semibold" 
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Award size={13} /> Brand Manufacturers
          </button>
        </div>
      </div>

      {activeSubTab === "categories" ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-zinc-950 px-5 py-3 rounded-xl border border-zinc-800">
            <span className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-widest">{categories.length} Warehousing Segments</span>
            {!isEmployee && (
              <button
                onClick={() => {
                  setCatName("");
                  setCatDesc("");
                  setCatImg("");
                  setCatModalMode("add");
                  setCatModalOpen(true);
                }}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-indigo-500/30 transition-all shadow-md shadow-indigo-600/15"
              >
                <Plus size={13} /> Squeeze Category
              </button>
            )}
          </div>

          {/* Categories Grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((c) => (
              <div 
                key={c.id} 
                className="bg-zinc-950 rounded-xl border border-zinc-800 p-4 space-y-3 relative overflow-hidden group hover:border-zinc-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {c.image ? (
                        <img src={c.image} alt={c.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <FolderTree size={16} className="text-zinc-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-sans font-bold text-white text-sm leading-tight">{c.name}</h4>
                      <span className="text-[9px] font-mono text-zinc-500 lowercase">Id: {c.id}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans leading-relaxed min-h-[32px] line-clamp-2">
                    {c.description || "No descriptive specification document has been configured for this segment."}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-zinc-900 flex justify-end gap-1.5">
                  {!isEmployee ? (
                    <>
                      <button
                        onClick={() => handleOpenCatEdit(c)}
                        className="p-1 px-2 text-zinc-400 hover:text-white rounded text-[11px] font-mono border border-zinc-900 bg-zinc-900/60 transition-colors"
                      >
                        Adjust
                      </button>
                      {isAdmin ? (
                        <button
                          onClick={() => onDeleteCategory(c.id)}
                          className="p-1 px-2 text-zinc-500 hover:text-rose-400 rounded text-[11px] font-mono border border-zinc-900 bg-zinc-900/60 transition-colors"
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
      ) : (
        <div className="space-y-4 font-sans">
          <div className="flex justify-between items-center bg-zinc-950 px-5 py-3 rounded-xl border border-zinc-800">
            <span className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-widest">{brands.length} Active Manufacturers</span>
            {!isEmployee && (
              <button
                onClick={() => {
                  setBrandName("");
                  setBrandColor("#ef4444");
                  setBrandModalMode("add");
                  setBrandModalOpen(true);
                }}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-indigo-500/30 transition-all shadow-md shadow-indigo-600/15"
              >
                <Plus size={13} /> Squeeze Brand
              </button>
            )}
          </div>

          {/* Brands Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {brands.map((b) => (
              <div 
                key={b.id} 
                className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span 
                    className="w-4.5 h-4.5 rounded-full flex-shrink-0 border border-white/10" 
                    style={{ backgroundColor: b.logoUrl || "#8b5cf6" }} 
                  />
                  <div className="min-w-0">
                    <h5 className="font-bold text-white text-xs truncate leading-normal">{b.name}</h5>
                    <span className="text-[9px] font-mono text-zinc-500 leading-none">Code: {b.id.toUpperCase()}</span>
                  </div>
                </div>

                {!isEmployee && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenBrandEdit(b)}
                      className="p-1 text-zinc-400 hover:text-white rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700"
                      title="Adjust Name"
                    >
                      <Edit size={11} />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => onDeleteBrand(b.id)}
                        className="p-1 text-zinc-500 hover:text-rose-400 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-705"
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CATEGORY FULL MODAL */}
      {catModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md rounded-xl overflow-hidden shadow-2xl">
            <div className="px-4.5 py-3 border-b border-zinc-900 bg-zinc-950/80 flex justify-between items-center">
              <h3 className="font-sans font-bold text-white text-xs uppercase tracking-wider">
                {catModalMode === "add" ? "Squeeze New Category" : "Revise Category Specifications"}
              </h3>
              <button onClick={() => setCatModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCatSubmit} className="p-4.5 space-y-3 font-sans text-xs">
              <div>
                <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1 font-semibold">Category Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fiber Photons"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-white rounded px-3 py-2 text-xs transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1 font-semibold">Header Banner URL (Unsplash)</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com..."
                  value={catImg}
                  onChange={(e) => setCatImg(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-white rounded px-3 py-2 text-xs transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1 font-semibold">Brief Operational Scope Description</label>
                <textarea
                  rows={3}
                  placeholder="Draft segment operational boundaries, thermal tolerances..."
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-white rounded p-2 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-zinc-900 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 text-zinc-400 rounded"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-semibold"
                >
                  Commit Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BRAND MODAL */}
      {brandModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md rounded-xl overflow-hidden shadow-2xl">
            <div className="px-4.5 py-3 border-b border-zinc-900 bg-zinc-950/80 flex justify-between items-center">
              <h3 className="font-sans font-bold text-white text-xs uppercase tracking-wider">
                {brandModalMode === "add" ? "Squeeze Manufacturer Node" : "Revise Manufacturer Specifications"}
              </h3>
              <button onClick={() => setBrandModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleBrandSubmit} className="p-4.5 space-y-3 font-sans text-xs">
              <div>
                <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1 font-semibold">Brand / Manufacturer Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Pharma Co"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-white rounded px-3 py-2 text-xs transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1 font-semibold">Select Brand Badge Color</label>
                <div className="grid grid-cols-8 gap-2 pb-1.5">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setBrandColor(color)}
                      className={`w-7 h-7 rounded-lg border transform transition-all relative ${
                        brandColor === color ? "ring-2 ring-indigo-500 scale-105 border-white" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {brandColor === color && <span className="absolute inset-0 m-auto w-1 h-1 rounded-full bg-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-900 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setBrandModalOpen(false)}
                  className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 text-zinc-400 rounded"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-semibold"
                >
                  Commit Brand Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
