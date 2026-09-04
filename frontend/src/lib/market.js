// frontend/src/lib/market.js
import { apiRequest } from "./api";

export function getMarketData(token, componentType, brand) {
  const params = new URLSearchParams({ componentType });
  if (brand) params.set("brand", brand);
  return apiRequest(`/api/market?${params.toString()}`, { token });
}
