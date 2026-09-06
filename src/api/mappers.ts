import { Product } from '../types';
import { ApiCategory, ApiProduct, ApiProductImage } from './types';

export function resolveMediaUrl(path?: string | null): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return path.startsWith('/') ? path : `/${path}`;
}

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isRecentlyCreated(isoDate?: string): boolean {
  if (!isoDate) return false;
  const created = new Date(isoDate).getTime();
  if (Number.isNaN(created)) return false;
  const fortyFiveDays = 45 * 24 * 60 * 60 * 1000;
  return Date.now() - created < fortyFiveDays;
}

export interface StoreCategory {
  id: string;
  apiId: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl: string;
  count: number;
}

export function mapCategories(categories: ApiCategory[], products: ApiProduct[]): StoreCategory[] {
  return categories.map((category) => ({
    id: category.slug,
    apiId: category.category_id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    imageUrl: resolveMediaUrl(category.image_url),
    count: products.filter((product) => product.category_id === category.category_id).length,
  }));
}

export function mapProducts(
  products: ApiProduct[],
  categories: ApiCategory[],
  images: ApiProductImage[]
): Product[] {
  const categoryById = new Map(categories.map((category) => [category.category_id, category]));
  const imagesByProduct = new Map<string, ApiProductImage[]>();

  for (const image of images) {
    const list = imagesByProduct.get(image.product_id) || [];
    list.push(image);
    imagesByProduct.set(image.product_id, list);
  }

  return products.map((product) => {
    const category = product.category_id ? categoryById.get(product.category_id) : undefined;
    const gallery = (imagesByProduct.get(product.product_id) || [])
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .map((image) => resolveMediaUrl(image.image_url))
      .filter(Boolean);

    if (product.image_url) {
      const primary = resolveMediaUrl(product.image_url);
      if (primary && !gallery.includes(primary)) gallery.unshift(primary);
    }

    const price = typeof product.price === 'string' ? Number(product.price) : product.price;
    const compare =
      product.compare_at_price == null
        ? undefined
        : typeof product.compare_at_price === 'string'
          ? Number(product.compare_at_price)
          : product.compare_at_price;
    const stock = typeof product.stock === 'string' ? Number(product.stock) : product.stock;

    return {
      id: product.product_id,
      name: product.name,
      slug: product.slug,
      category: category?.slug || '',
      categoryId: product.category_id || undefined,
      price: Number.isFinite(price) ? price : 0,
      originalPrice: compare != null && Number.isFinite(compare) ? compare : undefined,
      description: product.description || '',
      longDescription: product.description || '',
      rating: 0,
      reviewCount: 0,
      isNew: isRecentlyCreated(product.created_at),
      isFeatured: Boolean(product.is_featured),
      isActive: product.is_active !== false,
      inStock: (stock || 0) > 0,
      stockCount: stock || 0,
      sku: product.sku || '',
      images: gallery,
      materials: [],
      metalTypes: [],
      specs: {
        metal: '',
        karatOrPurity: '',
        warranty: '',
        certificate: false,
      },
      reviews: [],
    };
  });
}
