import { useCallback, useEffect, useState } from 'react';
import { fetchCategories, fetchProductImages, fetchProducts } from '../api/catalog';
import { getApiErrorMessage } from '../api/client';
import { mapCategories, mapProducts, StoreCategory } from '../api/mappers';
import { Product } from '../types';

export function useCatalog(includeInactiveOnLoad = false) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async (includeInactive = includeInactiveOnLoad) => {
    setLoading(true);
    setError(null);
    try {
      const [apiCategories, apiProducts, apiImages] = await Promise.all([
        fetchCategories(),
        fetchProducts(includeInactive ? undefined : { active: true }),
        fetchProductImages(),
      ]);
      setCategories(mapCategories(apiCategories, apiProducts));
      setProducts(mapProducts(apiProducts, apiCategories, apiImages));
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo cargar el catálogo.'));
      setCategories([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [includeInactiveOnLoad]);

  useEffect(() => {
    void reload(includeInactiveOnLoad);
  }, [reload, includeInactiveOnLoad]);

  return {
    products,
    setProducts,
    categories,
    setCategories,
    loading,
    error,
    reload,
  };
}
