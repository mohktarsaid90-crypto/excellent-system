import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Grid3X3, List, Package, Loader2, Pencil, Trash2, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProducts, CreateProductData, UpdateProductData } from '@/hooks/useProducts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';

const Products = () => {
  const { t, language, isRTL } = useLanguage();
  const { products, isLoading, createProduct, updateProduct, deleteProduct } = useProducts();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const [formData, setFormData] = useState<CreateProductData>({
    sku: '',
    name_en: '',
    name_ar: '',
    category: '',
    unit_price: 105,
    carton_price: 0,
    pieces_per_carton: 1,
    stock_quantity: 0,
    min_stock_level: 10,
    vat_rate: 15,
  });

  const filteredProducts = products.filter(product =>
    product.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.name_ar.includes(searchQuery) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateSubmit = async () => {
    await createProduct.mutateAsync(formData);
    setIsCreateDialogOpen(false);
    setFormData({ sku: '', name_en: '', name_ar: '', category: '', unit_price: 105, carton_price: 0, pieces_per_carton: 1, stock_quantity: 0, min_stock_level: 10, vat_rate: 15 });
  };

  const handleEditSubmit = async () => {
    if (!selectedProduct) return;
    const updateData: UpdateProductData = {
      sku: formData.sku,
      name_en: formData.name_en,
      name_ar: formData.name_ar,
      category: formData.category,
      unit_price: formData.unit_price,
      cost_price: formData.cost_price,
      stock_quantity: formData.stock_quantity,
      min_stock_level: formData.min_stock_level,
      vat_rate: formData.vat_rate,
    };
    await updateProduct.mutateAsync({ id: selectedProduct.id, data: updateData });
    setIsEditDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    await deleteProduct.mutateAsync(selectedProduct.id);
    setIsDeleteDialogOpen(false);
    setSelectedProduct(null);
  };

  const openEditDialog = (product: any) => {
    setSelectedProduct(product);
    setFormData({
      sku: product.sku,
      name_en: product.name_en,
      name_ar: product.name_ar,
      category: product.category || '',
      unit_price: product.unit_price,
      carton_price: product.carton_price || 0,
      pieces_per_carton: product.pieces_per_carton || 1,
      stock_quantity: product.stock_quantity || 0,
      min_stock_level: product.min_stock_level || 10,
      vat_rate: product.vat_rate || 15,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (product: any) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const getProductName = (product: any) => language === 'en' ? product.name_en : product.name_ar;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
              {t('products')}
            </h1>
            <p className="text-muted-foreground">
              {language === 'en'
                ? 'Manage your product catalog and pricing'
                : 'إدارة كتالوج المنتجات والأسعار'
              }
            </p>
          </div>
          <Button className="gap-2 bg-primary hover:bg-primary/90" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            {language === 'en' ? 'Add Product' : 'إضافة منتج'}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className={cn("absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground", isRTL ? 'right-3' : 'left-3')} />
              <Input
                placeholder={t('search')}
                className={cn("bg-card", isRTL ? 'pr-10' : 'pl-10')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              {t('filter')}
            </Button>
          </div>
          <div className="flex gap-1 bg-muted p-1 rounded-lg">
            <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewMode('grid')}>
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewMode('list')}>
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {language === 'en' ? 'No products found' : 'لا يوجد منتجات'}
            </p>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && filteredProducts.length > 0 && viewMode === 'grid' && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="group rounded-xl bg-card p-4 shadow-sm card-hover">
                <div className="relative aspect-square rounded-lg bg-muted mb-4 flex items-center justify-center overflow-hidden">
                  <Package className="h-16 w-16 text-muted-foreground/50" />
                  {!product.is_active && (
                    <Badge className="absolute top-2 right-2 bg-destructive">
                      {t('inactive')}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">{product.category || '-'}</p>
                  <h3 className="font-medium text-foreground line-clamp-2">{getProductName(product)}</h3>
                  <p className="text-xs text-muted-foreground">{t('sku')}: {product.sku}</p>

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">
                      {product.unit_price.toFixed(2)} {t('sar')}
                    </span>
                    <Badge variant="outline" className={cn(
                      "text-xs",
                      product.stock_quantity > product.min_stock_level ? 'bg-success/10 text-success border-success/20' :
                        product.stock_quantity > 0 ? 'bg-warning/10 text-warning border-warning/20' :
                          'bg-destructive/10 text-destructive border-destructive/20'
                    )}>
                      {product.stock_quantity > 0 ? `${product.stock_quantity} ${t('units')}` : (language === 'en' ? 'Out of stock' : 'نفد المخزون')}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditDialog(product)}>
                    {t('edit')}
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openDeleteDialog(product)}>
                    {t('delete')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products Table */}
        {!isLoading && filteredProducts.length > 0 && viewMode === 'list' && (
          <div className="rounded-xl bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                      {t('productName')}
                    </th>
                    <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                      {t('sku')}
                    </th>
                    <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                      {t('category')}
                    </th>
                    <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                      {t('price')}
                    </th>
                    <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                      {t('quantity')}
                    </th>
                    <th className={cn("px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                      {t('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Package className="h-5 w-5 text-primary" />
                          </div>
                          <span className="font-medium text-foreground">{getProductName(product)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{product.sku}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{product.category || '-'}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-foreground">{product.unit_price.toFixed(2)} {t('sar')}</td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{product.stock_quantity} {t('units')}</td>
                      <td className="px-6 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="bg-popover z-50">
                            <DropdownMenuItem onClick={() => openEditDialog(product)}>
                              <Pencil className="h-4 w-4 me-2" />
                              {t('edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openDeleteDialog(product)} className="text-destructive">
                              <Trash2 className="h-4 w-4 me-2" />
                              {t('delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{language === 'en' ? 'Add Product' : 'إضافة منتج'}</DialogTitle>
            <DialogDescription>
              {language === 'en' ? 'Create a new product in the catalog' : 'إنشاء منتج جديد في الكتالوج'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid gap-2">
              <Label>{t('sku')}</Label>
              <Input value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{language === 'en' ? 'Name (English)' : 'الاسم (إنجليزي)'}</Label>
                <Input value={formData.name_en} onChange={(e) => setFormData({ ...formData, name_en: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>{language === 'en' ? 'Name (Arabic)' : 'الاسم (عربي)'}</Label>
                <Input value={formData.name_ar} onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })} dir="rtl" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>{t('category')}</Label>
              <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{language === 'en' ? 'Unit Price' : 'سعر الوحدة'}</Label>
                <Input type="number" value={formData.unit_price} onChange={(e) => setFormData({ ...formData, unit_price: Number(e.target.value) })} />
              </div>
              <div className="grid gap-2">
                <Label>{language === 'en' ? 'Carton Price' : 'سعر الكرتون'}</Label>
                <Input type="number" value={formData.carton_price} onChange={(e) => setFormData({ ...formData, carton_price: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>{language === 'en' ? 'Pieces per Carton' : 'عدد القطع في الكرتون'}</Label>
              <Input type="number" value={formData.pieces_per_carton} onChange={(e) => setFormData({ ...formData, pieces_per_carton: Number(e.target.value) })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t('quantity')}</Label>
                <Input type="number" value={formData.stock_quantity} onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })} />
              </div>
              <div className="grid gap-2">
                <Label>{language === 'en' ? 'Min Stock Level' : 'الحد الأدنى'}</Label>
                <Input type="number" value={formData.min_stock_level} onChange={(e) => setFormData({ ...formData, min_stock_level: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>{t('vat')} (%)</Label>
              <Input type="number" value={formData.vat_rate} onChange={(e) => setFormData({ ...formData, vat_rate: Number(e.target.value) })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>{t('cancel')}</Button>
            <Button onClick={handleCreateSubmit} disabled={createProduct.isPending}>
              {createProduct.isPending && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
              {t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{language === 'en' ? 'Edit Product' : 'تعديل المنتج'}</DialogTitle>
            <DialogDescription>
              {language === 'en' ? 'Update product information' : 'تحديث معلومات المنتج'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid gap-2">
              <Label>{t('sku')}</Label>
              <Input value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{language === 'en' ? 'Name (English)' : 'الاسم (إنجليزي)'}</Label>
                <Input value={formData.name_en} onChange={(e) => setFormData({ ...formData, name_en: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>{language === 'en' ? 'Name (Arabic)' : 'الاسم (عربي)'}</Label>
                <Input value={formData.name_ar} onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })} dir="rtl" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>{t('category')}</Label>
              <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{language === 'en' ? 'Unit Price' : 'سعر الوحدة'}</Label>
                <Input type="number" value={formData.unit_price} onChange={(e) => setFormData({ ...formData, unit_price: Number(e.target.value) })} />
              </div>
              <div className="grid gap-2">
                <Label>{language === 'en' ? 'Cost Price' : 'سعر التكلفة'}</Label>
                <Input type="number" value={formData.cost_price} onChange={(e) => setFormData({ ...formData, cost_price: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t('quantity')}</Label>
                <Input type="number" value={formData.stock_quantity} onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })} />
              </div>
              <div className="grid gap-2">
                <Label>{language === 'en' ? 'Min Stock Level' : 'الحد الأدنى'}</Label>
                <Input type="number" value={formData.min_stock_level} onChange={(e) => setFormData({ ...formData, min_stock_level: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>{t('vat')} (%)</Label>
              <Input type="number" value={formData.vat_rate} onChange={(e) => setFormData({ ...formData, vat_rate: Number(e.target.value) })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>{t('cancel')}</Button>
            <Button onClick={handleEditSubmit} disabled={updateProduct.isPending}>
              {updateProduct.isPending && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
              {t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent dir={isRTL ? 'rtl' : 'ltr'}>
          <AlertDialogHeader>
            <AlertDialogTitle>{language === 'en' ? 'Are you sure?' : 'هل أنت متأكد؟'}</AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'en'
                ? `This will permanently delete ${selectedProduct?.name_en}. This action cannot be undone.`
                : `سيتم حذف ${selectedProduct?.name_ar} نهائياً. لا يمكن التراجع عن هذا الإجراء.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default Products;
