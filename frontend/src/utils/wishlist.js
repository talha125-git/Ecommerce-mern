import axios from "axios";

/**
 * Get current stored user email if logged in.
 */
export function getStoredUserEmail() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user?.email ? user.email.toLowerCase().trim() : "";
  } catch {
    return "";
  }
}

/**
 * Shared localStorage key used for wishlist across all pages and user dashboard.
 */
export function getWishlistKey(emailOverride) {
  const email = emailOverride !== undefined ? emailOverride : getStoredUserEmail();
  return email ? `user_wishlist_${email.toLowerCase()}` : "user_wishlist_guest";
}

/**
 * Read wishlist items from localStorage cache.
 */
export function readWishlist(emailOverride) {
  try {
    const raw = localStorage.getItem(getWishlistKey(emailOverride));
    const items = JSON.parse(raw || "[]");
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

/**
 * Write wishlist items to localStorage cache and dispatch update event.
 */
export function writeWishlist(items, emailOverride) {
  try {
    const key = getWishlistKey(emailOverride);
    localStorage.setItem(key, JSON.stringify(items));
    // Dispatch custom event for real-time reactivity in current window
    window.dispatchEvent(new Event("wishlist-updated"));
  } catch (err) {
    console.warn("Could not write wishlist to localStorage:", err);
  }
}

/**
 * Persist wishlist items to MongoDB backend.
 */
export async function syncWishlistToAPI(items, emailOverride) {
  try {
    const email = emailOverride !== undefined ? emailOverride : getStoredUserEmail();
    if (!email) return;
    const API_URL = import.meta.env.VITE_API_URL || "";
    await axios.put(`${API_URL}/api/wishlist/${encodeURIComponent(email)}`, { wishlist: items });
  } catch (err) {
    console.warn("Could not sync wishlist to API:", err);
  }
}

/**
 * Check if a product is in the wishlist.
 */
export function isProductInWishlist(productId, emailOverride) {
  if (!productId) return false;
  const list = readWishlist(emailOverride);
  return list.some((item) => String(item._id || item.id) === String(productId));
}

/**
 * Toggle product in wishlist (adds if absent, removes if present).
 * Returns { inWishlist: boolean, wishlist: Array }
 */
export function toggleWishlistItem(product, emailOverride) {
  if (!product) return { inWishlist: false, wishlist: [] };
  const productId = product._id || product.id;
  const current = readWishlist(emailOverride);
  const exists = current.some((item) => String(item._id || item.id) === String(productId));

  let updated;
  let inWishlist;

  if (exists) {
    updated = current.filter((item) => String(item._id || item.id) !== String(productId));
    inWishlist = false;
  } else {
    const normalizedItem = {
      id: productId,
      _id: productId,
      name: product.name || "Product",
      price: Number(product.price) || 0,
      image: product.image || (Array.isArray(product.images) && product.images[0]) || "",
    };
    if (product.originalPrice) normalizedItem.originalPrice = Number(product.originalPrice);
    if (product.category) normalizedItem.category = product.category;
    if (product.stock !== undefined) normalizedItem.stock = product.stock;

    updated = [...current, normalizedItem];
    inWishlist = true;
  }

  writeWishlist(updated, emailOverride);
  syncWishlistToAPI(updated, emailOverride);

  return { inWishlist, wishlist: updated };
}
