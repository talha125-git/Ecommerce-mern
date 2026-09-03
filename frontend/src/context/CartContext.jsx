/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(undefined);

const getStoredUserEmail = () => {
  try {
    const savedUserStr = localStorage.getItem("user");
    if (savedUserStr) {
      const parsed = JSON.parse(savedUserStr);
      return parsed?.email ? parsed.email.toLowerCase() : null;
    }
  } catch (e) {
    // Ignore error
  }
  return null;
};

const getInitialCart = () => {
  try {
    const email = getStoredUserEmail();
    let savedCart = null;
    if (email) {
      savedCart = localStorage.getItem(`user_cart_${email}`);
    }
    if (!savedCart) {
      savedCart = localStorage.getItem("cart");
    }
    if (savedCart) {
      const parsed = JSON.parse(savedCart);
      if (Array.isArray(parsed)) {
        return parsed.filter((item) => item && (item.id || item._id));
      }
    }
  } catch (e) {
    console.error("Error parsing cart from localStorage:", e);
  }
  return [];
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(getInitialCart);

  // Synchronize cart state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
      const email = getStoredUserEmail();
      if (email) {
        localStorage.setItem(`user_cart_${email}`, JSON.stringify(cart));
      }
    } catch (e) {
      console.error("Error saving cart to localStorage:", e);
    }
  }, [cart]);

  // Sync cart across browser tabs or session changes
  useEffect(() => {
    const handleStorageChange = () => {
      const freshCart = getInitialCart();
      setCart(freshCart);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const persistCart = (newCart) => {
    try {
      localStorage.setItem("cart", JSON.stringify(newCart));
      const email = getStoredUserEmail();
      if (email) {
        localStorage.setItem(`user_cart_${email}`, JSON.stringify(newCart));
      }
    } catch (e) {
      console.error("Error persisting cart:", e);
    }
  };

  const addToCart = (item) => {
    const itemId = item._id || item.id;
    if (!itemId) {
      console.warn("Item missing valid id or _id when adding to cart:", item);
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (cartItem) => String(cartItem._id || cartItem.id) === String(itemId)
      );

      const quantityToAdd = item.quantity || 1;

      let newCart;
      if (existingItem) {
        newCart = prevCart.map((cartItem) =>
          String(cartItem._id || cartItem.id) === String(itemId)
            ? { ...cartItem, quantity: cartItem.quantity + quantityToAdd }
            : cartItem
        );
      } else {
        newCart = [...prevCart, { ...item, id: itemId, _id: itemId, quantity: quantityToAdd }];
      }

      persistCart(newCart);
      return newCart;
    });
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter((item) => String(item._id || item.id) !== String(id));
      persistCart(newCart);
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
    const email = getStoredUserEmail();
    if (email) {
      localStorage.removeItem(`user_cart_${email}`);
    }
  };

  const updateQuantity = (id, quantity) => {
    setCart((prevCart) => {
      const newCart = prevCart.map((item) =>
        String(item._id || item.id) === String(id)
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      );
      persistCart(newCart);
      return newCart;
    });
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, updateQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};