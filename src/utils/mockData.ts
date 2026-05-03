import type { Product } from "../types";

/**
 * Dev-only mock product for camera mode preview.
 * This must NEVER be used in production. Guarded by VITE_DEV_MOCK.
 */
export const MOCK_PRODUCT: Product = {
  product_name: "Jungle Oats Original - 1KG",
  manufacturer_name: "Jungle",
  quantity: "1 kg",
  country_of_origin: "South Africa",
  category: "Breakfast Cereals",
  allergens: "gluten",
  image_url: "https://www.shoprite.co.za/medias/checkers300Wx300H-medias-10129974EA-en-shopriteGlobalProductCatalog-20251229022452.png?context=bWFzdGVyfGltYWdlc3w4NTE1MXxpbWFnZS9wbmd8aW1hZ2VzL2hhZi9oN2QvMTI1NDU1NDg0NTE4NzAucG5nfDhlZmVmMjliZTM1NDY3YzQ1MGEwM2VjYWY2MjU4YWY1MTViYzFkNzhiMDViNzRjOTdhMGEwOGNlOGU1Y2M2MDk",
  countryCode: "ZA",
  countryName: "South Africa",
  isValid: true,
  found: true,
  isFood: true,
  countryMismatch: false,
};

export const isDevMock = (): boolean =>
  import.meta.env.VITE_DEV_MOCK === "true";

export const isProd = (): boolean => !isDevMock();

/**
 * Runtime guard: throws if mock data is accessed in production.
 */
export function guardMock(): void {
  if (import.meta.env.PROD || !isDevMock()) {
    throw new Error(
      "MOCK_DATA_ACCESS_BLOCKED: Dev mock data was accessed outside of dev mode."
    );
  }
}

export function getMockProduct(): Product {
  guardMock();
  return MOCK_PRODUCT;
}
