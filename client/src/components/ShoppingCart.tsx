import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function ShoppingCart() {
  const {
    cartItems,
    isOpen,
    closeCart,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
    checkout
  } = useCart();
  
  const [total, setTotal] = useState(0);
  
  useEffect(() => {
    // Calculate cart total
    const newTotal = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    setTotal(newTotal);
  }, [cartItems]);
  
  return (
    <div className="fixed inset-0 overflow-hidden z-40" style={{ pointerEvents: isOpen ? 'auto' : 'none' }}>
      <div className="absolute inset-0 overflow-hidden">
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-gray-500 transition-opacity ${isOpen ? 'bg-opacity-75' : 'bg-opacity-0'}`}
          onClick={closeCart}
        ></div>
        
        {/* Sliding cart panel */}
        <div 
          className={`absolute inset-y-0 right-0 max-w-full flex transform transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ pointerEvents: 'auto' }}
        >
          <div className="relative w-screen max-w-md">
            <div className="h-full flex flex-col bg-white shadow-xl overflow-y-auto">
              <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Shopping Cart</h2>
                  <div className="ml-3 h-7 flex items-center">
                    <button
                      onClick={closeCart}
                      className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <span className="sr-only">Close panel</span>
                      <i className="fas fa-times text-xl"></i>
                    </button>
                  </div>
                </div>
                
                <div className="mt-8">
                  <div className="flow-root">
                    {cartItems.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        Your cart is empty
                      </div>
                    ) : (
                      <ul className="-my-6 divide-y divide-gray-200">
                        {cartItems.map((item) => (
                          <li key={item.id} className="flex items-center py-3 border-b">
                            <img 
                              src={item.product.imageUrl} 
                              alt={item.product.name} 
                              className="w-16 h-16 object-cover rounded"
                            />
                            
                            <div className="ml-4 flex-grow">
                              <h4 className="text-sm font-medium">{item.product.name}</h4>
                              <div className="flex items-center mt-1">
                                <span className="text-sm font-semibold">
                                  {formatCurrency(item.product.price)}
                                </span>
                                
                                <div className="flex items-center ml-4">
                                  <button 
                                    className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center"
                                    onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                                  >
                                    <i className="fas fa-minus text-xs"></i>
                                  </button>
                                  <span className="mx-2 text-sm">{item.quantity}</span>
                                  <button 
                                    className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center"
                                    onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                                  >
                                    <i className="fas fa-plus text-xs"></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                            
                            <button 
                              className="text-gray-400 hover:text-red-500 ml-2"
                              onClick={() => removeCartItem(item.id)}
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                  <p>Subtotal</p>
                  <p>{formatCurrency(total)}</p>
                </div>
                
                <p className="text-sm text-gray-500 mb-4">
                  Shipping and taxes calculated at checkout.
                </p>
                
                <div className="mt-6">
                  <Button 
                    disabled={cartItems.length === 0}
                    className="w-full" 
                    onClick={checkout}
                  >
                    Checkout
                  </Button>
                </div>
                
                <div className="mt-6 flex justify-center text-sm text-center text-gray-500">
                  <p>
                    or{" "}
                    <button 
                      className="text-primary font-medium hover:text-primary/80"
                      onClick={closeCart}
                    >
                      Continue Shopping
                      <span aria-hidden="true"> &rarr;</span>
                    </button>
                  </p>
                </div>
                
                {cartItems.length > 0 && (
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={clearCart}
                    >
                      Clear Cart
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
