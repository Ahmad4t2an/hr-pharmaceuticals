import React from "react";
import { 
  ClientProduct, 
  ClientCategory, 
  ClientBrand, 
  Supplier, 
  UserRole,
  CompanySettings
} from "../types";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Copy, 
  Download, 
  Upload, 
  FileJson, 
  Filter, 
  Image as ImageIcon, 
  AlertTriangle, 
  Check, 
  X,
  RefreshCw,
  FolderOpen
} from "lucide-react";

interface ProductsProps {
  products: ClientProduct[];
  categories: ClientCategory[];
  brands: ClientBrand[];
  suppliers: Supplier[];
  currentUserRole: UserRole;
  settings: CompanySettings;
  onAddProduct: (prod: Partial<ClientProduct>) => Promise<any>;
  onEditProduct: (id: string, prod: Partial<ClientProduct>) => Promise<any>;
  onDeleteProduct: (id: string) => Promise<any>;
}

export default function Products({
  products,
  categories,
  brands,
  suppliers,
  currentUserRole,
  settings,
  onAddProduct,
  onEditProduct,
  onDeleteProduct
}: ProductsProps) {
  
  // UI States
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterCategory, setFilterCategory] = React.useState("all");
  const [filterBrand, setFilterBrand] = React.useState("all");
  const [filterStatus, setFilterStatus] = React.useState("all");

  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<"add" | "edit" | "duplicate">("add");
  const [selectedProductId, setSelectedProductId] = React.useState<string | null>(null);

  // Edit / Add attributes
  const [name, setName] = React.useState("");
  const [sku, setSku] = React.useState("");
  const [barcode, setBarcode] = React.useState("");
  const [catId, setCatId] = React.useState("");
  const [brandId, setBrandId] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [purchasePrice, setPurchasePrice] = React.useState("0");
  const [sellingPrice, setSellingPrice] = React.useState("0");
  const [quantity, setQuantity] = React.useState("0");
  const [minimumStockLevel, setMinimumStockLevel] = React.useState("5");
  const [supplierId, setSupplierId] = React.useState("");
  const [imageUrlInput, setImageUrlInput] = React.useState("");
  const [imageGallery, setImageGallery] = React.useState<string[]>([]);
  
  // Real file uploading / drag-and-drop helpers
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const originalResult = uploadEvent.target?.result as string;
      if (!originalResult) return;

      const img = new Image();
      img.onload = () => {
        // Create dynamic HTML5 canvas
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Downscale to sweet-spot maximum 700px dimension
        const MAX_DIM = 700;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Fill white background in case source is a transparent PNG
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress output to 0.75 quality JPEG
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.75);
          setImageGallery((prev) => [...prev, compressedBase64]);
        } else {
          setImageGallery((prev) => [...prev, originalResult]);
        }
      };
      img.src = originalResult;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };
  
  // Detail preview gallery
  const [previewProduct, setPreviewProduct] = React.useState<ClientProduct | null>(null);
  const [activePreviewImageIndex, setActivePreviewImageIndex] = React.useState(0);

  const cSign = settings.currency === "PKR" ? "Rs. " : settings.currency === "GBP" ? "£" : settings.currency === "EUR" ? "€" : "$";

  // Import State
  const [importOpen, setImportOpen] = React.useState(false);
  const [importText, setImportText] = React.useState("");
  const [importFeedback, setImportFeedback] = React.useState("");

  // Role Security Flag Helper
  const isEmployee = currentUserRole === "Employee";
  const isManager = currentUserRole === "Manager" || currentUserRole === "Admin";
  const isAdmin = currentUserRole === "Admin";

  const resetForm = () => {
    setName("");
    setSku("");
    setBarcode("");
    setCatId(categories[0]?.id || "");
    setBrandId(brands[0]?.id || "");
    setDescription("");
    setPurchasePrice("0");
    setSellingPrice("0");
    setQuantity("0");
    setMinimumStockLevel("5");
    setSupplierId(suppliers[0]?.id || "");
    setImageUrlInput("");
    setImageGallery([]);
    setSelectedProductId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setModalMode("add");
    setModalOpen(true);
  };

  const handleOpenEdit = (p: ClientProduct) => {
    setSelectedProductId(p.id);
    setName(p.name);
    setSku(p.sku);
    setBarcode(p.barcode);
    setCatId(p.categoryId);
    setBrandId(p.brandId);
    setDescription(p.description);
    setPurchasePrice(String(p.purchasePrice));
    setSellingPrice(String(p.sellingPrice));
    setQuantity(String(p.quantity));
    setMinimumStockLevel(String(p.minimumStockLevel));
    setSupplierId(p.supplierId);
    setImageGallery(p.images || []);
    setImageUrlInput("");
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleOpenDuplicate = (p: ClientProduct) => {
    setSelectedProductId(p.id);
    setName(p.name + " - Copy");
    setSku(p.sku + "-COPY");
    setBarcode(p.barcode ? p.barcode + "9" : "");
    setCatId(p.categoryId);
    setBrandId(p.brandId);
    setDescription(p.description);
    setPurchasePrice(String(p.purchasePrice));
    setSellingPrice(String(p.sellingPrice));
    setQuantity(String(p.quantity));
    setMinimumStockLevel(String(p.minimumStockLevel));
    setSupplierId(p.supplierId);
    setImageGallery(p.images || []);
    setImageUrlInput("");
    setModalMode("duplicate");
    setModalOpen(true);
  };

  const handleAddImageUrl = () => {
    if (imageUrlInput.trim()) {
      setImageGallery([...imageGallery, imageUrlInput.trim()]);
      setImageUrlInput("");
    }
  };

  const handleRemoveImageUrl = (idx: number) => {
    setImageGallery(imageGallery.filter((_, i) => i !== idx));
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !sku) {
      alert("Name and SKU are required fields.");
      return;
    }

    const payload: Partial<ClientProduct> = {
      name,
      sku,
      barcode,
      categoryId: catId,
      brandId,
      description,
      purchasePrice: Number(purchasePrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      quantity: Number(quantity) || 0,
      minimumStockLevel: Number(minimumStockLevel) || 5,
      supplierId,
      images: imageGallery.length ? imageGallery : ["https://images.unsplash.com/photo-1591453089816-0fbb971b454c?w=400&auto=format&fit=crop&q=80"]
    };

    try {
      if (modalMode === "add" || modalMode === "duplicate") {
        await onAddProduct(payload);
      } else if (modalMode === "edit" && selectedProductId) {
        await onEditProduct(selectedProductId, payload);
      }
      setModalOpen(false);
      resetForm();
    } catch (err: any) {
      alert(err.message || "Failed to submit product.");
    }
  };

  // DUPLICATE inline immediate helper
  const handleDirectDuplicate = async (p: ClientProduct) => {
    const copied: Partial<ClientProduct> = {
      ...p,
      name: p.name + " (Copy)",
      sku: p.sku + "-COPY-" + Math.floor(Math.random() * 100),
      barcode: p.barcode ? p.barcode + "9" : "",
    };
    await onAddProduct(copied);
  };

  // EXPORT to CSV triggered natively
  const handleBulkExport = () => {
    let headers = "Name,SKU,Barcode,Category,PurchasePrice,SellingPrice,Quantity,MinimumStockLevel,SupplierStatus\n";
    const rows = products.map(p => {
      const catName = categories.find(c => c.id === p.categoryId)?.name || "Unknown";
      return `"${p.name}","${p.sku}","${p.barcode}","${catName}",${p.purchasePrice},${p.sellingPrice},${p.quantity},${p.minimumStockLevel},"${p.status}"`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Inventra_Products_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // IMPORT preset mock products handler
  const handleBulkImportPresets = async () => {
    
    // Quick template presets
    const importedPresets: Partial<ClientProduct>[] = [
      { name: "Panadol Forte 500mg Tablets", sku: "MED-PAN-500", barcode: "89012345678", categoryId: categories[0]?.id || "cat_med_1", brandId: "br_med_1", description: "Effective fast-acting analgesic and antipyretic formulary.", purchasePrice: 15, sellingPrice: 20, quantity: 150, minimumStockLevel: 20, supplierId: suppliers[0]?.id || "sup_med_1", images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80"] },
      { name: "Cac-1000 Plus Orange Effervescent", sku: "MED-CAC-1K", barcode: "89012345011", categoryId: categories[0]?.id || "cat_med_1", brandId: "br_med_1", description: "Double strength calcium supplement with orange zest.", purchasePrice: 250, sellingPrice: 310, quantity: 20, minimumStockLevel: 20, supplierId: suppliers[1]?.id || "sup_med_2", images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80"] },
      { name: "Ventolin Inhaler 100mcg", sku: "MED-VEN-INH", barcode: "89012345115", categoryId: categories[5]?.id || "cat_med_6", brandId: "br_med_1", description: "Inhalation aerosol for immediate bronchodilation relief.", purchasePrice: 190, sellingPrice: 240, quantity: 45, minimumStockLevel: 20, supplierId: suppliers[2]?.id || "sup_med_3", images: ["https://images.unsplash.com/photo-1599610928290-79872ee60f9e?w=400&auto=format&fit=crop&q=80"] }
    ];

    try {
      setImportFeedback("Syncing presets to live medicine catalog...");
      for (const p of importedPresets) {
        await onAddProduct(p);
      }
      setImportFeedback("Successfully imported 3 popular medicine items!");
      setTimeout(() => {
        setImportOpen(false);
        setImportFeedback("");
      }, 2000);
    } catch (e: any) {
      setImportFeedback("Import failed: " + e.message);
    }
  };

  // --- Filtering Matrix ---
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.barcode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || p.categoryId === filterCategory;
    const matchesBrand = filterBrand === "all" || p.brandId === filterBrand;
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesBrand && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Top action layout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-sans font-bold tracking-tight text-white flex items-center gap-2">
            Medicine Stock Catalog
            <span className="font-mono text-xs text-teal-400">({filteredProducts.length} items matched)</span>
          </h2>
          <p className="text-xs text-zinc-400">
            Define medicine SKU configurations, upload medicine photos, and synchronize bulk medical CSV records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDirectDuplicate ? handleDirectDuplicate : () => {}}
            className="hidden"
          >
          </button>
          <button
            onClick={handleBulkExport}
            className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-sans text-xs font-semibold px-3 py-2 rounded-xl border border-zinc-800 transition-colors"
            title="Download CSV medicine database copy"
          >
            <Download size={14} /> Bulk Export
          </button>
          <button
            onClick={() => setImportOpen(true)}
            className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-sans text-xs font-semibold px-3 py-2 rounded-xl border border-zinc-800 transition-colors"
          >
            <Upload size={14} /> Import Presets
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white font-sans text-xs font-semibold px-4.5 py-2 rounded-xl border border-teal-500/30 transition-all font-medium shadow-md shadow-teal-600/10"
          >
            <Plus size={15} /> Add Medicine
          </button>
        </div>
      </div>

      {/* FILTER SEARCH CRITERIA ROW */}
      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Search name, SKU, or barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-teal-500 text-white rounded-lg text-xs pl-9 pr-3 py-2 transition-colors"
          />
        </div>

        {/* Category filter */}
        <div className="relative">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-3 py-2 focus:border-teal-500 outline-none"
          >
            <option value="all">All Formulations</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Brand filter */}
        <div className="relative">
          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-3 py-2 focus:border-teal-500 outline-none"
          >
            <option value="all">All Pharma Brands</option>
            {brands.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-3 py-2 focus:border-teal-500 outline-none"
          >
            <option value="all">All Stocks (Status)</option>
            <option value="In Stock">In Stock Only</option>
            <option value="Low Stock">Low Stock Alerts</option>
            <option value="Out of Stock">Critically Depleted</option>
          </select>
        </div>
      </div>

      {/* COMPACT PRODUCT CATALOG CARD LIST & DETAIL PANEL LAYOUT */}
      <div className={`grid grid-cols-1 gap-6 items-start ${previewProduct ? "xl:grid-cols-3" : "xl:grid-cols-1"}`}>
        
        {/* Table view catalog */}
        <div className={`bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden ${previewProduct ? "xl:col-span-2" : "xl:col-span-1"}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-zinc-900/80 bg-zinc-950 text-zinc-400 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="p-3.5">Medicine Product Name</th>
                  <th className="p-3.5">SKU / Code</th>
                  <th className="p-3.5 text-right">Selling Pricing</th>
                  <th className="p-3.5 text-center">Available Units</th>
                  <th className="p-3.5 text-center">Status Indicators</th>
                  <th className="p-3.5 text-right min-w-[120px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/60">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-500">
                      <div className="flex flex-col items-center gap-1.5 font-mono text-xs">
                        <FolderOpen size={24} className="text-zinc-600 mb-1" />
                        No catalog products match current search parameter.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const brandLabel = brands.find(b => b.id === p.brandId)?.name || "Helix";
                    
                    return (
                      <tr 
                        key={p.id} 
                        className={`hover:bg-zinc-900/30 group transition-colors cursor-pointer ${previewProduct?.id === p.id ? "bg-zinc-900/40 border-l-2 border-indigo-500 pl-1" : ""}`}
                        onClick={() => {
                          setPreviewProduct(p);
                          setActivePreviewImageIndex(0);
                        }}
                      >
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex-shrink-0 overflow-hidden flex items-center justify-center">
                              {p.images && p.images[0] ? (
                                <img src={p.images[0]} alt={p.name} className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
                              ) : (
                                <ImageIcon size={14} className="text-zinc-600" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-white truncate leading-snug group-hover:text-indigo-400 transition-colors">
                                {p.name}
                              </p>
                              <span className="text-[10px] text-zinc-500 font-mono tracking-tight lowercase">
                                {brandLabel}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono text-zinc-400">
                          <p>{p.sku}</p>
                          <p className="text-[9px] text-zinc-600">{p.barcode || "No Barcode"}</p>
                        </td>
                        <td className="p-3.5 text-right font-mono font-medium text-white">
                          <p>${p.sellingPrice.toFixed(2)}</p>
                          <p className="text-[10px] text-zinc-500">Cost: ${p.purchasePrice}</p>
                        </td>
                        <td className={`p-3.5 text-center font-mono font-semibold ${p.quantity === 0 ? "text-rose-400" : p.quantity < p.minimumStockLevel ? "text-amber-400" : "text-zinc-300"}`}>
                          {p.quantity} Units
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono ${
                            p.status === "In Stock" 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" 
                              : p.status === "Low Stock"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/10"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/15"
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td 
                          className="p-3.5 text-right space-x-1"
                          onClick={(e) => e.stopPropagation()} // Guard row triggering detail click
                        >
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenDuplicate(p)}
                              className="p-1.5 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-900 rounded-md transition-colors"
                              title="Duplicate asset parameters"
                            >
                              <Copy size={13} />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-md transition-colors"
                            >
                              <Edit size={13} />
                            </button>
                            {isAdmin ? (
                              <button
                                onClick={() => onDeleteProduct(p.id)}
                                className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-950 rounded-md transition-colors"
                              >
                                <Trash2 size={13} />
                              </button>
                            ) : (
                              <span className="text-[10px] text-zinc-600 font-mono" title="Admin only delete">Secure</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic Detail Panel Gallery info */}
        {previewProduct && (
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-none">Product Image Gallery</span>
                <button 
                  onClick={() => setPreviewProduct(null)}
                  className="text-zinc-500 hover:text-zinc-300 text-[10px] font-mono bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 hover:bg-zinc-800 transition-colors"
                >
                  Clear Info
                </button>
              </div>

              {/* Primary enlarged display */}
              <div className="aspect-video w-full rounded-lg bg-zinc-900 border border-zinc-900 overflow-hidden relative flex items-center justify-center p-2">
                {previewProduct.images && previewProduct.images[activePreviewImageIndex] ? (
                  <img 
                    src={previewProduct.images[activePreviewImageIndex]} 
                    alt={previewProduct.name} 
                    className="max-w-full max-h-full object-contain" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <ImageIcon size={22} className="text-zinc-700" />
                )}
                {/* Status Float */}
                <span className="absolute top-2 right-2 bg-zinc-950/80 px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider text-zinc-300 backdrop-blur border border-zinc-800">
                  {previewProduct.status}
                </span>
              </div>

              {/* Multiple Images Thumbnail Rail */}
              {previewProduct.images && previewProduct.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto justify-start pb-1 scrollbar-thin">
                  {previewProduct.images.map((imgUrl, i) => (
                    <button
                      key={i}
                      onClick={() => setActivePreviewImageIndex(i)}
                      className={`w-12 h-12 rounded border-2 overflow-hidden flex-shrink-0 transition-all flex items-center justify-center ${activePreviewImageIndex === i ? "border-indigo-500 scale-95" : "border-zinc-900 hover:border-zinc-700"}`}
                    >
                      <img src={imgUrl} alt="Thumbnail preview" className="max-w-full max-h-full object-contain p-0.5 bg-zinc-950" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}

              {/* Specifications metrics list */}
              <div className="space-y-2 text-xs font-sans">
                <h4 className="font-semibold text-white text-sm leading-tight">{previewProduct.name}</h4>
                <p className="text-zinc-400 text-[11px] leading-relaxed italic">{previewProduct.description || "No description was drafted for this medicine item."}</p>
                
                <div className="grid grid-cols-2 gap-2 bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-900 text-[11px] font-mono text-zinc-400">
                  <p>SKU: <span className="text-white">{previewProduct.sku}</span></p>
                  <p>Barcode: <span className="text-white">{previewProduct.barcode || "None"}</span></p>
                  <p>Unit Stock: <span className="text-emerald-400 font-semibold">{previewProduct.quantity} Left</span></p>
                  <p>Trigger Limit: <span className="text-white">{previewProduct.minimumStockLevel} units</span></p>
                  <p>Buy Price: <span className="text-white">${previewProduct.purchasePrice}</span></p>
                  <p>Retail Value: <span className="text-indigo-400">${previewProduct.sellingPrice}</span></p>
                </div>
              </div>

              {/* Quick direct duplication action */}
              <button
                onClick={() => handleDirectDuplicate(previewProduct)}
                className="w-full bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-300 font-sans text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all text-center"
              >
                <Copy size={12} /> Inline Fast Duplicate
              </button>
            </div>
          </div>
        )}

      </div>

      {/* BULK IMPORT MOCKUP COMPONENT */}
      {importOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl p-5 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-900">
              <h3 className="font-sans font-bold text-white text-sm">Bulk Sourcing Medicine Importer</h3>
              <button onClick={() => setImportOpen(false)} className="text-zinc-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Inject medicine assets onto the database instantaneously. Select pre-formulated pharmaceutical catalogs or paste JSON streams to synchronize stocks.
            </p>

            {importFeedback && (
              <div className="p-3.5 bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs rounded-xl flex items-center gap-2">
                <RefreshCw size={13} className="animate-spin text-teal-400" />
                {importFeedback}
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={handleBulkImportPresets}
                className="w-full bg-teal-600 hover:bg-teal-500 text-white font-sans text-xs font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus size={14} /> Synchronize 3 Virtual Medicine Items
              </button>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setImportOpen(false)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 text-xs rounded-lg transition-all"
              >
                Dismiss Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL CUSTOM ADD / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl my-8">
            <div className="px-5 py-4 border-b border-zinc-900 bg-zinc-950/80 flex justify-between items-center">
              <h3 className="font-sans font-bold text-white tracking-tight">
                {modalMode === "add" ? "Register New Medicine Product" : modalMode === "duplicate" ? "Duplicate Medicine Configuration" : "Edit Medicine Specifications"}
              </h3>
              <button 
                onClick={() => setModalOpen(false)} 
                className="text-zinc-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="p-5 space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar font-sans text-xs">
              
              {/* Name & SKU row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase tracking-wider mb-1.5 font-semibold">Medicine Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Panadol Forte 500mg Tablets"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-teal-500 text-white rounded-lg px-3.5 py-2.5 transition-colors text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase tracking-wider mb-1.5 font-semibold">Unique SKU / Drug Code</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. MED-PAN-500"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-teal-500 text-white rounded-lg px-3.5 py-2.5 transition-colors tracking-wider font-mono text-xs"
                  />
                </div>
              </div>

              {/* Barcode & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase tracking-wider mb-1.5 font-semibold">UPC Barcode Number (Optional)</label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="e.g. 890123450001"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-teal-500 text-white rounded-lg px-3.5 py-2.5 transition-colors font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase tracking-wider mb-1.5 font-semibold">Pharmaceutical Supplier / Distributor</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg px-3.5 py-2.5 outline-none font-sans text-xs focus:border-teal-500 h-[38px]"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.contact})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category & Brand row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase tracking-wider mb-1.5 font-semibold">Formulation Category (e.g. Tablets, Syrup)</label>
                  <select
                    value={catId}
                    onChange={(e) => setCatId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-lg px-3.5 py-2.5 outline-none font-sans text-xs focus:border-teal-500 h-[38px]"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase tracking-wider mb-1.5 font-semibold">Pharmaceutical Brand / Manufacturer</label>
                  <select
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-lg px-3.5 py-2.5 outline-none font-sans text-xs focus:border-teal-500 h-[38px]"
                  >
                    {brands.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Finance Valuation: Purchase price, selling price, quantity, trigger limit */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-800">
                <div>
                  <label className="block text-[9px] text-zinc-400 uppercase mb-1 font-semibold">Buy Price ({cSign})</label>
                  <input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-820 text-white rounded px-2.5 py-1.5 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-zinc-400 uppercase mb-1 font-semibold">Retail Price ({cSign})</label>
                  <input
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-820 text-white rounded px-2.5 py-1.5 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-zinc-400 uppercase mb-1 font-semibold">Initial Stock Qty</label>
                  <input
                    type="number"
                    disabled={modalMode === "edit"} // Disabled on edit to prevent skipping ledger log rules
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-820 text-white rounded px-2.5 py-1.5 font-mono text-xs disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-zinc-400 uppercase mb-1 font-semibold">Alert level (Min)</label>
                  <input
                    type="number"
                    value={minimumStockLevel}
                    onChange={(e) => setMinimumStockLevel(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-820 text-white rounded px-2.5 py-1.5 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase tracking-wider mb-1.5 font-semibold">Composition & Therapeutic Indications</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Insert therapeutic indications, active ingredients, dosage, storage guidelines..."
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-teal-500 text-white rounded-lg p-3 text-xs"
                />
              </div>

              {/* IMAGE MANAGER & MULTIPLE GALLERY LIST */}
              <div className="space-y-3">
                <label className="block text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Medicine Multi-Image Gallery</label>
                
                {/* Real File Upload & Dropzone */}
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border border-dashed rounded-xl p-4.5 text-center cursor-pointer transition-all ${
                    isDragging 
                      ? "border-teal-500 bg-teal-500/5 text-teal-400" 
                      : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700 hover:bg-zinc-900/20 text-zinc-400"
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-1.5">
                    <Upload size={18} className={`${isDragging ? "text-teal-400" : "text-zinc-500"}`} />
                    <span className="font-sans text-xs font-medium">
                      Drag & drop medicine photo or <span className="text-teal-400 underline decoration-teal-400/50">browse files</span>
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">Supports PNG, JPG, WEBP (stored locally as Base64)</span>
                  </div>
                </div>

                {/* Optional public link input alternative */}
                <div className="space-y-1">
                  <div className="text-[9px] text-zinc-500 uppercase font-semibold">Or add photo by public web URL</div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="Paste public image https:// URL..."
                      className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-teal-500 text-white rounded-lg px-3 py-1.5 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs rounded-lg transition-colors font-sans"
                    >
                      Add URL
                    </button>
                  </div>
                </div>

                {/* Previews map */}
                <div className="flex gap-2 overflow-x-auto py-1">
                  {imageGallery.map((imgUrl, idx) => (
                    <div key={idx} className="w-12 h-12 rounded bg-zinc-900 border border-zinc-800 relative overflow-hidden group flex-shrink-0 flex items-center justify-center">
                      <img src={imgUrl} alt="Gallery entry preview" className="max-w-full max-h-full object-contain p-0.5" referrerPolicy="no-referrer" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImageUrl(idx)}
                        className="absolute inset-0 bg-red-600/80 items-center justify-center text-white hidden group-hover:flex"
                        title="Remove image from gallery"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  {imageGallery.length === 0 && (
                    <p className="text-[10px] text-zinc-500 font-mono py-1">No supplementary images registered. Default asset placeholder will be loaded.</p>
                  )}
                </div>
              </div>

              {/* Bottom save bar */}
              <div className="pt-4 border-t border-zinc-900 flex justify-between items-center text-xs">
                <span className="text-zinc-500 text-[11px] font-mono">Authorised as {currentUserRole}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 text-zinc-400 rounded-lg transition-all"
                  >
                    Cancel Action
                  </button>
                  <button
                    type="submit"
                    className="px-4.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-all font-semibold shadow-md shadow-teal-600/15"
                  >
                    {modalMode === "add" ? "Register New Medicine" : modalMode === "duplicate" ? "Submit Copied Specifications" : "Update Specifications"}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
