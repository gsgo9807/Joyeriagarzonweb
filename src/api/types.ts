export interface ApiCategory {
  category_id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ApiProduct {
  product_id: string;
  category_id?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  compare_at_price?: number | null;
  sku?: string | null;
  stock: number;
  image_url?: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ApiProductImage {
  product_image_id: string;
  product_id: string;
  image_url: string;
  alt_text?: string | null;
  sort_order?: number;
  created_at?: string;
}

export interface CategoryPayload {
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
}

export interface ProductPayload {
  category_id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  compare_at_price?: number | null;
  sku: string;
  stock: number;
  image_url?: string | null;
  is_featured?: boolean;
  is_active?: boolean;
}

export interface ProductImagePayload {
  product_id: string;
  image_url: string;
  alt_text?: string | null;
  sort_order?: number;
}
