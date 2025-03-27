import { useCart } from "@/context/CartContext";
import { useEffect } from "react";

export default function Notification() {
  const { notification, clearNotification } = useCart();
  
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        clearNotification();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [notification, clearNotification]);
  
  if (!notification) return null;
  
  return (
    <div className={`fixed top-16 right-4 bg-green-500 text-white p-3 rounded shadow transition-opacity duration-300 z-50 ${notification ? 'opacity-100' : 'opacity-0'}`}>
      <p className="flex items-center">
        <i className="fas fa-check-circle mr-2"></i>
        {notification}
      </p>
    </div>
  );
}
