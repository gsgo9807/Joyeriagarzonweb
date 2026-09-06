import React, { useEffect, useState } from 'react';
import {
  Package, Plus, Edit2, Trash2, ShieldCheck, ShoppingBag,
  TrendingUp, LogOut, ArrowLeft, Search, Sparkles, X, Image as ImageIcon, Layers
} from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../utils/formatters';
import { StoreCategory, slugify } from '../api/mappers';
import {
  createCategory,
  createProduct,
  createProductImage,
  deleteCategory,
  deleteProduct,
  deleteProductImage,
  fetchCategories,
  fetchProductImages,
  fetchProducts,
  updateCategory,
  updateProduct,
  updateProductImage,
} from '../api/catalog';
import { ApiError, getApiErrorMessage } from '../api/client';
import { ApiCategory, ApiProduct, ApiProductImage } from '../api/types';
import { toMoney, toStock, validateCategory, validateProduct, validateProductImage } from '../api/validation';

interface AdminPanelProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: StoreCategory[];
  onRefreshCatalog: () => Promise<void>;
  onLogout: () => void;
  onExit: () => void;
  currency: 'COP' | 'USD';
}

type AdminTab = 'products' | 'categories' | 'images' | 'orders' | 'metrics';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  products,
  categories,
  onRefreshCatalog,
  onLogout,
  onExit,
  currency,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [apiCategories, setApiCategories] = useState<ApiCategory[]>([]);
  const [apiProducts, setApiProducts] = useState<ApiProduct[]>([]);
  const [apiImages, setApiImages] = useState<ApiProductImage[]>([]);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    category_id: '',
    name: '',
    slug: '',
    sku: '',
    description: '',
    price: '',
    compare_at_price: '',
    stock: '',
    image_url: '',
    is_featured: false,
    is_active: true,
  });

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
  });

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [imageForm, setImageForm] = useState({
    product_id: '',
    image_url: '',
    alt_text: '',
    sort_order: '0',
  });
  const [imageFilterProductId, setImageFilterProductId] = useState('');

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAuthFailure = (err: unknown) => {
    if (err instanceof ApiError && err.status === 401) {
      onLogout();
    }
  };

  const refreshAdminData = async () => {
    const [nextCategories, nextProducts, nextImages] = await Promise.all([
      fetchCategories(),
      fetchProducts(),
      fetchProductImages(imageFilterProductId || undefined),
    ]);
    setApiCategories(nextCategories);
    setApiProducts(nextProducts);
    setApiImages(nextImages);
    await onRefreshCatalog();
  };

  useEffect(() => {
    void (async () => {
      try {
        await refreshAdminData();
      } catch (err) {
        setErrorMessage(getApiErrorMessage(err));
        handleAuthFailure(err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const nextImages = await fetchProductImages(imageFilterProductId || undefined);
        setApiImages(nextImages);
      } catch (err) {
        setErrorMessage(getApiErrorMessage(err));
        handleAuthFailure(err);
      }
    })();
  }, [imageFilterProductId]);

  const runMutation = async (action: () => Promise<void>, successMessage: string) => {
    setSaving(true);
    setErrorMessage(null);
    try {
      await action();
      await refreshAdminData();
      showToast(successMessage);
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err));
      handleAuthFailure(err);
    } finally {
      setSaving(false);
    }
  };

  const openCreateProduct = () => {
    setEditingProductId(null);
    setProductForm({
      category_id: apiCategories[0]?.category_id || '',
      name: '',
      slug: '',
      sku: '',
      description: '',
      price: '',
      compare_at_price: '',
      stock: '',
      image_url: '',
      is_featured: false,
      is_active: true,
    });
    setProductModalOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setProductForm({
      category_id: product.categoryId || '',
      name: product.name,
      slug: product.slug || slugify(product.name),
      sku: product.sku,
      description: product.description,
      price: String(product.price),
      compare_at_price: product.originalPrice != null ? String(product.originalPrice) : '',
      stock: String(product.stockCount),
      image_url: product.images[0] || '',
      is_featured: Boolean(product.isFeatured),
      is_active: product.isActive !== false,
    });
    setProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateProduct({
      ...productForm,
      categories: apiCategories,
    });
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const payload = {
      category_id: productForm.category_id,
      name: productForm.name.trim(),
      slug: productForm.slug.trim(),
      description: productForm.description.trim() || null,
      price: toMoney(productForm.price),
      compare_at_price: productForm.compare_at_price ? toMoney(productForm.compare_at_price) : null,
      sku: productForm.sku.trim(),
      stock: toStock(productForm.stock),
      image_url: productForm.image_url.trim() || null,
      is_featured: productForm.is_featured,
      is_active: productForm.is_active,
    };

    void runMutation(async () => {
      if (editingProductId) {
        await updateProduct(editingProductId, payload);
      } else {
        await createProduct(payload);
      }
      setProductModalOpen(false);
    }, editingProductId ? 'Producto actualizado.' : 'Producto creado.');
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (!window.confirm(`¿Eliminar la joya "${name}" del catálogo?`)) return;
    void runMutation(() => deleteProduct(id), `Joya "${name}" eliminada.`);
  };

  const handleToggleFeatured = (product: Product) => {
    void runMutation(async () => {
      await updateProduct(product.id, { is_featured: !product.isFeatured });
    }, 'Estado destacado actualizado.');
  };

  const openCreateCategory = () => {
    setEditingCategoryId(null);
    setCategoryForm({ name: '', slug: '', description: '', image_url: '' });
    setCategoryModalOpen(true);
  };

  const openEditCategory = (category: StoreCategory) => {
    setEditingCategoryId(category.apiId);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image_url: category.imageUrl || '',
    });
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateCategory(categoryForm);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    const payload = {
      name: categoryForm.name.trim(),
      slug: categoryForm.slug.trim(),
      description: categoryForm.description.trim() || null,
      image_url: categoryForm.image_url.trim() || null,
    };
    void runMutation(async () => {
      if (editingCategoryId) {
        await updateCategory(editingCategoryId, payload);
      } else {
        await createCategory(payload);
      }
      setCategoryModalOpen(false);
    }, editingCategoryId ? 'Categoría actualizada.' : 'Categoría creada.');
  };

  const handleDeleteCategory = (id: string, name: string) => {
    if (!window.confirm(`¿Eliminar la categoría "${name}"?`)) return;
    void runMutation(() => deleteCategory(id), `Categoría "${name}" eliminada.`);
  };

  const openCreateImage = () => {
    setEditingImageId(null);
    setImageForm({
      product_id: imageFilterProductId || apiProducts[0]?.product_id || '',
      image_url: '',
      alt_text: '',
      sort_order: '0',
    });
    setImageModalOpen(true);
  };

  const openEditImage = (image: ApiProductImage) => {
    setEditingImageId(image.product_image_id);
    setImageForm({
      product_id: image.product_id,
      image_url: image.image_url,
      alt_text: image.alt_text || '',
      sort_order: String(image.sort_order ?? 0),
    });
    setImageModalOpen(true);
  };

  const handleSaveImage = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateProductImage({
      ...imageForm,
      products: apiProducts,
    });
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    const payload = {
      product_id: imageForm.product_id,
      image_url: imageForm.image_url.trim(),
      alt_text: imageForm.alt_text.trim() || null,
      sort_order: toStock(imageForm.sort_order),
    };
    void runMutation(async () => {
      if (editingImageId) {
        await updateProductImage(editingImageId, payload);
      } else {
        await createProductImage(payload);
      }
      setImageModalOpen(false);
    }, editingImageId ? 'Imagen actualizada.' : 'Imagen agregada.');
  };

  const handleDeleteImage = (id: string) => {
    if (!window.confirm('¿Eliminar esta imagen?')) return;
    void runMutation(() => deleteProductImage(id), 'Imagen eliminada.');
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalInventoryValue = products.reduce((acc, product) => acc + product.price * product.stockCount, 0);
  const featuredCount = products.filter((product) => product.isFeatured).length;
  const inStockCount = products.filter((product) => product.inStock).length;

  const tabClass = (tab: AdminTab) =>
    `px-6 py-3 rounded-t-2xl font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
      activeTab === tab
        ? 'bg-[#F4F1EA] text-[#4A453E] border-t-2 border-[#4A453E]'
        : 'text-[#6B6459] hover:text-[#4A453E]'
    }`;

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#4A453E] font-sans pb-16">
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#4A453E] text-[#F9F7F2] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-bounce">
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          <span>{notification}</span>
        </div>
      )}

      <header className="bg-white border-b border-[#E6E2D9] sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#4A453E] text-[#F9F7F2] flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <span className="block font-serif text-lg font-medium text-[#4A453E]">
                Garzon Joyería • Administrator
              </span>
              <span className="block text-[11px] text-[#8C8479]">
                Gestión de inventario, categorías e imágenes
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onExit}
              className="px-4 py-2 rounded-full bg-[#EAE7E0] hover:bg-[#D9D5CD] text-[#4A453E] font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ver Tienda</span>
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-rose-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      <div className="bg-[#EAE7E0] border-b border-[#D9D5CD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-2 pt-3 overflow-x-auto">
          <button onClick={() => setActiveTab('products')} className={tabClass('products')}>
            <Package className="w-4 h-4 text-[#D4AF37]" />
            Catálogo ({products.length})
          </button>
          <button onClick={() => setActiveTab('categories')} className={tabClass('categories')}>
            <Layers className="w-4 h-4 text-[#D4AF37]" />
            Categorías ({categories.length})
          </button>
          <button onClick={() => setActiveTab('images')} className={tabClass('images')}>
            <ImageIcon className="w-4 h-4 text-[#D4AF37]" />
            Imágenes ({apiImages.length})
          </button>
          <button onClick={() => setActiveTab('orders')} className={tabClass('orders')}>
            <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
            Pedidos
          </button>
          <button onClick={() => setActiveTab('metrics')} className={tabClass('metrics')}>
            <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
            Métricas
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {errorMessage && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800">
            {errorMessage}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E6E2D9] shadow-2xs">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-[#8C8479] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre, SKU o categoría..."
                  className="w-full bg-[#F9F7F2] border border-[#E6E2D9] rounded-xl pl-10 pr-4 py-2 text-xs text-[#4A453E] placeholder-[#8C8479] focus:outline-none focus:border-[#4A453E]"
                />
              </div>
              <button
                onClick={openCreateProduct}
                disabled={!apiCategories.length}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#4A453E] hover:bg-[#36322D] text-[#F9F7F2] font-semibold text-xs uppercase tracking-wider rounded-full flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Nueva Joya</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-[#E6E2D9] shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#4A453E]">
                  <thead className="bg-[#EAE7E0] text-[#6B6459] font-semibold uppercase text-[10px] tracking-wider border-b border-[#D9D5CD]">
                    <tr>
                      <th className="py-3.5 px-4">Joya</th>
                      <th className="py-3.5 px-4">SKU</th>
                      <th className="py-3.5 px-4">Categoría</th>
                      <th className="py-3.5 px-4">Precio</th>
                      <th className="py-3.5 px-4">Stock</th>
                      <th className="py-3.5 px-4 text-center">Destacado</th>
                      <th className="py-3.5 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E2D9]">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-[#8C8479]">
                          {products.length === 0
                            ? 'No hay productos en el catálogo.'
                            : 'No hay resultados para esta búsqueda.'}
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-[#F9F7F2] transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {p.images[0] ? (
                                <img
                                  src={p.images[0]}
                                  alt={p.name}
                                  referrerPolicy="no-referrer"
                                  className="w-10 h-10 rounded-lg object-cover border border-[#E6E2D9]"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-[#EAE7E0] border border-[#E6E2D9]" />
                              )}
                              <span className="font-serif font-medium text-xs text-[#4A453E] block">{p.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-[#8C8479]">{p.sku}</td>
                          <td className="py-3 px-4 capitalize">{p.category}</td>
                          <td className="py-3 px-4 font-bold text-[#4A453E]">{formatCurrency(p.price, currency)}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              p.stockCount > 0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}>
                              {p.stockCount > 0 ? `${p.stockCount} unds` : 'Agotado'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleToggleFeatured(p)}
                              className={`p-1.5 rounded-full transition-colors ${
                                p.isFeatured ? 'text-[#D4AF37] bg-[#EAE7E0]' : 'text-[#8C8479] hover:text-[#4A453E]'
                              }`}
                              title="Alternar Destacado"
                            >
                              <Sparkles className="w-4 h-4 fill-current" />
                            </button>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditProduct(p)}
                                className="p-1.5 text-[#6B6459] hover:text-[#4A453E] hover:bg-[#EAE7E0] rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id, p.name)}
                                className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={openCreateCategory}
                className="px-6 py-2.5 bg-[#4A453E] hover:bg-[#36322D] text-[#F9F7F2] font-semibold text-xs uppercase tracking-wider rounded-full flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nueva categoría
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-[#E6E2D9] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#EAE7E0] text-[#6B6459] font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Nombre</th>
                    <th className="py-3.5 px-4">Slug</th>
                    <th className="py-3.5 px-4">Productos</th>
                    <th className="py-3.5 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E2D9]">
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-[#8C8479]">No hay categorías.</td>
                    </tr>
                  ) : (
                    categories.map((category) => (
                      <tr key={category.apiId}>
                        <td className="py-3 px-4 font-serif">{category.name}</td>
                        <td className="py-3 px-4 font-mono text-[#8C8479]">{category.slug}</td>
                        <td className="py-3 px-4">{category.count}</td>
                        <td className="py-3 px-4 text-right">
                          <button onClick={() => openEditCategory(category)} className="p-1.5 text-[#6B6459] hover:bg-[#EAE7E0] rounded-lg">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteCategory(category.apiId, category.name)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'images' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E6E2D9]">
              <select
                value={imageFilterProductId}
                onChange={(e) => setImageFilterProductId(e.target.value)}
                className="w-full sm:w-80 bg-[#F9F7F2] border border-[#E6E2D9] rounded-xl px-3.5 py-2 text-xs"
              >
                <option value="">Todos los productos</option>
                {apiProducts.map((product) => (
                  <option key={product.product_id} value={product.product_id}>
                    {product.name}
                  </option>
                ))}
              </select>
              <button
                onClick={openCreateImage}
                disabled={!apiProducts.length}
                className="px-6 py-2.5 bg-[#4A453E] text-[#F9F7F2] font-semibold text-xs uppercase tracking-wider rounded-full flex items-center gap-2 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Nueva imagen
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-[#E6E2D9] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#EAE7E0] text-[#6B6459] font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Imagen</th>
                    <th className="py-3.5 px-4">Producto</th>
                    <th className="py-3.5 px-4">Alt</th>
                    <th className="py-3.5 px-4">Orden</th>
                    <th className="py-3.5 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E2D9]">
                  {apiImages.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-[#8C8479]">No hay imágenes.</td>
                    </tr>
                  ) : (
                    apiImages.map((image) => {
                      const productName = apiProducts.find((product) => product.product_id === image.product_id)?.name || image.product_id;
                      return (
                        <tr key={image.product_image_id}>
                          <td className="py-3 px-4">
                            <img src={image.image_url} alt={image.alt_text || ''} className="w-10 h-10 rounded-lg object-cover border border-[#E6E2D9]" />
                          </td>
                          <td className="py-3 px-4">{productName}</td>
                          <td className="py-3 px-4 text-[#8C8479]">{image.alt_text || '—'}</td>
                          <td className="py-3 px-4">{image.sort_order ?? 0}</td>
                          <td className="py-3 px-4 text-right">
                            <button onClick={() => openEditImage(image)} className="p-1.5 text-[#6B6459] hover:bg-[#EAE7E0] rounded-lg">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteImage(image.product_image_id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white p-6 rounded-2xl border border-[#E6E2D9] shadow-2xs">
            <h3 className="font-serif text-lg font-medium text-[#4A453E] mb-4">Pedidos Recientes</h3>
            <p className="text-xs text-[#8C8479] text-center py-10">No hay pedidos en el sistema.</p>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E6E2D9] shadow-2xs space-y-1">
              <span className="text-[10px] font-semibold text-[#8C8479] uppercase tracking-wider">Valor de inventario</span>
              <p className="text-xl font-bold font-serif text-[#4A453E]">{formatCurrency(totalInventoryValue, currency)}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-[#E6E2D9] shadow-2xs space-y-1">
              <span className="text-[10px] font-semibold text-[#8C8479] uppercase tracking-wider">Joyas en Catálogo</span>
              <p className="text-xl font-bold font-serif text-[#4A453E]">{products.length} Referencias</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-[#E6E2D9] shadow-2xs space-y-1">
              <span className="text-[10px] font-semibold text-[#8C8479] uppercase tracking-wider">Con stock</span>
              <p className="text-xl font-bold font-serif text-[#4A453E]">{inStockCount}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-[#E6E2D9] shadow-2xs space-y-1">
              <span className="text-[10px] font-semibold text-[#8C8479] uppercase tracking-wider">Destacados</span>
              <p className="text-xl font-bold font-serif text-[#4A453E]">{featuredCount}</p>
            </div>
          </div>
        )}
      </div>

      {productModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F9F7F2] border border-[#E6E2D9] text-[#4A453E] rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E2D9]">
              <h3 className="font-serif text-lg font-medium text-[#4A453E]">
                {editingProductId ? 'Editar Joya' : 'Agregar Nueva Joya'}
              </h3>
              <button onClick={() => setProductModalOpen(false)} className="p-1.5 text-[#8C8479] hover:text-[#4A453E] rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#6B6459] mb-1">Nombre de la Joya *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({
                    ...productForm,
                    name: e.target.value,
                    slug: productForm.slug || slugify(e.target.value),
                  })}
                  className="w-full bg-white border border-[#E6E2D9] rounded-xl px-3.5 py-2"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#6B6459] mb-1">Categoría *</label>
                  <select
                    required
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                    className="w-full bg-white border border-[#E6E2D9] rounded-xl px-3.5 py-2"
                  >
                    <option value="">Selecciona una categoría</option>
                    {apiCategories.map((category) => (
                      <option key={category.category_id} value={category.category_id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#6B6459] mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full bg-white border border-[#E6E2D9] rounded-xl px-3.5 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-[#6B6459] mb-1">Slug *</label>
                <input
                  type="text"
                  required
                  value={productForm.slug}
                  onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                  className="w-full bg-white border border-[#E6E2D9] rounded-xl px-3.5 py-2"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#6B6459] mb-1">Precio *</label>
                  <input
                    type="text"
                    required
                    inputMode="decimal"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full bg-white border border-[#E6E2D9] rounded-xl px-3.5 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#6B6459] mb-1">Precio comparación</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={productForm.compare_at_price}
                    onChange={(e) => setProductForm({ ...productForm, compare_at_price: e.target.value })}
                    className="w-full bg-white border border-[#E6E2D9] rounded-xl px-3.5 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#6B6459] mb-1">Stock *</label>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full bg-white border border-[#E6E2D9] rounded-xl px-3.5 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-[#6B6459] mb-1">URL de imagen principal</label>
                <input
                  type="text"
                  value={productForm.image_url}
                  onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                  className="w-full bg-white border border-[#E6E2D9] rounded-xl px-3.5 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#6B6459] mb-1">Descripción</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-white border border-[#E6E2D9] rounded-xl px-3.5 py-2"
                />
              </div>
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={productForm.is_featured}
                    onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
                  />
                  Destacado en Inicio
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={productForm.is_active}
                    onChange={(e) => setProductForm({ ...productForm, is_active: e.target.checked })}
                  />
                  Activo
                </label>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setProductModalOpen(false)} className="px-5 py-2.5 rounded-full bg-[#EAE7E0] font-semibold">Cancelar</button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-full bg-[#4A453E] text-[#F9F7F2] font-semibold uppercase tracking-wider disabled:opacity-50">
                  {saving ? 'Guardando...' : 'Guardar Joya'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-[#F9F7F2] border border-[#E6E2D9] rounded-3xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E2D9]">
              <h3 className="font-serif text-lg">{editingCategoryId ? 'Editar categoría' : 'Nueva categoría'}</h3>
              <button onClick={() => setCategoryModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <input required placeholder="Nombre *" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value, slug: categoryForm.slug || slugify(e.target.value) })} className="w-full bg-white border border-[#E6E2D9] rounded-xl px-3.5 py-2" />
              <input required placeholder="Slug *" value={categoryForm.slug} onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })} className="w-full bg-white border border-[#E6E2D9] rounded-xl px-3.5 py-2" />
              <input placeholder="Descripción" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} className="w-full bg-white border border-[#E6E2D9] rounded-xl px-3.5 py-2" />
              <input placeholder="URL de imagen" value={categoryForm.image_url} onChange={(e) => setCategoryForm({ ...categoryForm, image_url: e.target.value })} className="w-full bg-white border border-[#E6E2D9] rounded-xl px-3.5 py-2" />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setCategoryModalOpen(false)} className="px-5 py-2.5 rounded-full bg-[#EAE7E0]">Cancelar</button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-full bg-[#4A453E] text-[#F9F7F2] disabled:opacity-50">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {imageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-[#F9F7F2] border border-[#E6E2D9] rounded-3xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E2D9]">
              <h3 className="font-serif text-lg">{editingImageId ? 'Editar imagen' : 'Nueva imagen'}</h3>
              <button onClick={() => setImageModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveImage} className="space-y-3 text-xs">
              <select required value={imageForm.product_id} onChange={(e) => setImageForm({ ...imageForm, product_id: e.target.value })} className="w-full bg-white border border-[#E6E2D9] rounded-xl px-3.5 py-2">
                <option value="">Selecciona un producto</option>
                {apiProducts.map((product) => (
                  <option key={product.product_id} value={product.product_id}>{product.name}</option>
                ))}
              </select>
              <input required placeholder="URL de imagen *" value={imageForm.image_url} onChange={(e) => setImageForm({ ...imageForm, image_url: e.target.value })} className="w-full bg-white border border-[#E6E2D9] rounded-xl px-3.5 py-2" />
              <input placeholder="Texto alternativo" value={imageForm.alt_text} onChange={(e) => setImageForm({ ...imageForm, alt_text: e.target.value })} className="w-full bg-white border border-[#E6E2D9] rounded-xl px-3.5 py-2" />
              <input placeholder="Orden" inputMode="numeric" value={imageForm.sort_order} onChange={(e) => setImageForm({ ...imageForm, sort_order: e.target.value })} className="w-full bg-white border border-[#E6E2D9] rounded-xl px-3.5 py-2" />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setImageModalOpen(false)} className="px-5 py-2.5 rounded-full bg-[#EAE7E0]">Cancelar</button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-full bg-[#4A453E] text-[#F9F7F2] disabled:opacity-50">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
