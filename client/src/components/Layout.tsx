import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import ShoppingCart from "./ShoppingCart";
import PaymentModal from "./PaymentModal";
import Notification from "./Notification";
import { useCart } from "@/context/CartContext";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { showPaymentModal } = useCart();
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <Header />
      <Notification />
      
      <main className="flex-grow">
        {children}
      </main>
      
      <Footer />
      <ShoppingCart />
      
      {showPaymentModal && <PaymentModal />}
    </div>
  );
}
