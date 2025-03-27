import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CartItemWithProduct } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CartContextType {
  cartItems: CartItemWithProduct[];
  isLoading: boolean;
  isOpen: boolean;
  showPaymentModal: boolean;
  notification: string | null;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (productId: number, quantity?: number) => void;
  updateCartItemQuantity: (id: number, quantity: number) => void;
  removeCartItem: (id: number) => void;
  clearCart: () => void;
  checkout: () => void;
  closePaymentModal: () => void;
  clearNotification: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  
  // Fetch cart items
  const { 
    data: cartItems = [], 
    isLoading,
    refetch: refetchCart
  } = useQuery({
    queryKey: ['/api/cart'],
    retry: 1,
  });
  
  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: (data: { productId: number, quantity: number }) => 
      apiRequest('POST', '/api/cart', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      setNotification("Product added to cart");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  });
  
  // Update cart item mutation
  const updateCartMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: number, quantity: number }) => 
      apiRequest('PUT', `/api/cart/${id}`, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update cart item",
        variant: "destructive",
      });
    }
  });
  
  // Remove from cart mutation
  const removeCartMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest('DELETE', `/api/cart/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    }
  });
  
  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: () => 
      apiRequest('DELETE', '/api/cart'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      setIsOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive",
      });
    }
  });
  
  // Cart operations
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen(!isOpen);
  
  const addToCart = (productId: number, quantity: number = 1) => {
    addToCartMutation.mutate({ productId, quantity });
  };
  
  const updateCartItemQuantity = (id: number, quantity: number) => {
    updateCartMutation.mutate({ id, quantity });
  };
  
  const removeCartItem = (id: number) => {
    removeCartMutation.mutate(id);
  };
  
  const clearCart = () => {
    clearCartMutation.mutate();
  };
  
  const checkout = () => {
    closeCart();
    setShowPaymentModal(true);
  };
  
  const closePaymentModal = () => {
    setShowPaymentModal(false);
  };
  
  const clearNotification = () => {
    setNotification(null);
  };
  
  // Refetch cart on mount to ensure we have the latest data
  useEffect(() => {
    refetchCart();
  }, [refetchCart]);
  
  const value = {
    cartItems,
    isLoading,
    isOpen,
    showPaymentModal,
    notification,
    openCart,
    closeCart,
    toggleCart,
    addToCart,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
    checkout,
    closePaymentModal,
    clearNotification,
  };
  
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
