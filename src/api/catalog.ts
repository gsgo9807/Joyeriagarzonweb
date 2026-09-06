import {
  ApiCategory,
  ApiProduct,
  ApiProductImage,
  CategoryPayload,
  ProductImagePayload,
  ProductPayload,
} from './types';
import { apiRequest, asArray, unwrapData } from './client';

export async function fetchCategories(): Promise<ApiCategory[]> {
  const payload = await apiRequest<unknown>('/api/categories');
  return asArray<ApiCategory>(unwrapData(payload));
}

export async function fetchCategoryById(id: string): Promise<ApiCategory> {
  const payload = await apiRequest<unknown>(`/api/categories/${id}`);
  return unwrapData<ApiCategory>(payload);
}

export async function createCategory(data: CategoryPayload): Promise<ApiCategory> {
  const payload = await apiRequest<unknown>('/api/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return unwrapData<ApiCategory>(payload);
}

export async function updateCategory(id: string, data: Partial<CategoryPayload>): Promise<ApiCategory> {
  const payload = await apiRequest<unknown>(`/api/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return unwrapData<ApiCategory>(payload);
}

export async function deleteCategory(id: string): Promise<void> {
  await apiRequest(`/api/categories/${id}`, { method: 'DELETE' });
}

export async function fetchProducts(params?: {
  categoryId?: string;
  featured?: boolean;
  active?: boolean;
}): Promise<ApiProduct[]> {
  const query = new URLSearchParams();
  if (params?.categoryId) query.set('category_id', params.categoryId);
  if (params?.featured != null) query.set('featured', String(params.featured));
  if (params?.active != null) query.set('active', String(params.active));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  const payload = await apiRequest<unknown>(`/api/products${suffix}`);
  return asArray<ApiProduct>(unwrapData(payload));
}

export async function fetchProductById(id: string): Promise<ApiProduct> {
  const payload = await apiRequest<unknown>(`/api/products/${id}`);
  return unwrapData<ApiProduct>(payload);
}

export async function createProduct(data: ProductPayload): Promise<ApiProduct> {
  const payload = await apiRequest<unknown>('/api/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return unwrapData<ApiProduct>(payload);
}

export async function updateProduct(id: string, data: Partial<ProductPayload>): Promise<ApiProduct> {
  const payload = await apiRequest<unknown>(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return unwrapData<ApiProduct>(payload);
}

export async function deleteProduct(id: string): Promise<void> {
  await apiRequest(`/api/products/${id}`, { method: 'DELETE' });
}

export async function fetchProductImages(productId?: string): Promise<ApiProductImage[]> {
  const suffix = productId ? `?product_id=${encodeURIComponent(productId)}` : '';
  const payload = await apiRequest<unknown>(`/api/product-images${suffix}`);
  return asArray<ApiProductImage>(unwrapData(payload));
}

export async function fetchProductImageById(id: string): Promise<ApiProductImage> {
  const payload = await apiRequest<unknown>(`/api/product-images/${id}`);
  return unwrapData<ApiProductImage>(payload);
}

export async function createProductImage(data: ProductImagePayload): Promise<ApiProductImage> {
  const payload = await apiRequest<unknown>('/api/product-images', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return unwrapData<ApiProductImage>(payload);
}

export async function updateProductImage(
  id: string,
  data: Partial<ProductImagePayload>
): Promise<ApiProductImage> {
  const payload = await apiRequest<unknown>(`/api/product-images/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return unwrapData<ApiProductImage>(payload);
}

export async function deleteProductImage(id: string): Promise<void> {
  await apiRequest(`/api/product-images/${id}`, { method: 'DELETE' });
}
