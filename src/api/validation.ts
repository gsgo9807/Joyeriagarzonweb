import { ApiCategory, ApiProduct } from './types';

export function validateCategory(input: { name: string; slug: string }): string | null {
  if (!input.name.trim()) return 'El nombre de la categoría es obligatorio.';
  if (!input.slug.trim()) return 'El slug de la categoría es obligatorio.';
  return null;
}

export function validateProduct(input: {
  category_id: string;
  name: string;
  slug: string;
  sku: string;
  price: string;
  stock: string;
  categories: ApiCategory[];
}): string | null {
  if (!input.category_id.trim()) return 'Debes seleccionar una categoría.';
  if (!input.categories.some((category) => category.category_id === input.category_id)) {
    return 'La categoría seleccionada no existe.';
  }
  if (!input.name.trim()) return 'El nombre del producto es obligatorio.';
  if (!input.slug.trim()) return 'El slug del producto es obligatorio.';
  if (!input.sku.trim()) return 'El SKU es obligatorio.';
  if (!input.price.trim()) return 'El precio es obligatorio.';
  if (!input.stock.trim()) return 'El stock es obligatorio.';
  return null;
}

export function validateProductImage(input: {
  product_id: string;
  image_url: string;
  products: ApiProduct[];
}): string | null {
  if (!input.product_id.trim()) return 'Debes seleccionar un producto.';
  if (!input.products.some((product) => product.product_id === input.product_id)) {
    return 'El producto seleccionado no existe.';
  }
  if (!input.image_url.trim()) return 'La URL de la imagen es obligatoria.';
  return null;
}

export function toMoney(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function toStock(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
