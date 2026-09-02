/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(undefined);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          // Clean up any items that lost their ID
          const sanitized = parsed.filter((item) => item && (item.id || item._id));
          setCart(sanitized);
        }
      } catch (e) {
        console.error("Error parsing cart from localStorage:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

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

      if (existingItem) {
        return prevCart.map((cartItem) =>
          String(cartItem._id || cartItem.id) === String(itemId)
            ? { ...cartItem, quantity: cartItem.quantity + quantityToAdd }
            : cartItem
        );
      }

      return [...prevCart, { ...item, id: itemId, _id: itemId, quantity: quantityToAdd }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => String(item._id || item.id) !== String(id)));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  const updateQuantity = (id, quantity) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        String(item._id || item.id) === String(id)
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
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