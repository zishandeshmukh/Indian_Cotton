import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

export default function PaymentModal() {
  const { cartItems, closePaymentModal, clearCart } = useCart();
  const [isPaying, setIsPaying] = useState(false);
  
  // Calculate total amount
  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity, 
    0
  );
  
  // Calculate with GST and shipping (fixed for demo)
  const gst = Math.round(total * 0.18); // 18% GST
  const shipping = 5000; // ₹50.00 shipping
  const grandTotal = total + gst + shipping;
  
  const handleCompletedPayment = () => {
    setIsPaying(true);
    
    // Simulate payment processing
    setTimeout(() => {
      clearCart();
      closePaymentModal();
      setIsPaying(false);
    }, 1500);
  };
  
  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Complete Your Payment</h3>
                
                <div className="mt-2 flex flex-col items-center justify-center">
                  <p className="text-sm text-gray-500 mb-4">Scan the QR code below to pay via UPI</p>
                  
                  <div className="w-48 h-48 bg-gray-100 border border-gray-300 rounded mb-4 flex items-center justify-center">
                    {/* QR Code - Using a placeholder SVG for UPI QR code */}
                    <svg
                      width="160"
                      height="160"
                      viewBox="0 0 200 200"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect width="200" height="200" fill="white" />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M30 30H50V50H30V30ZM60 30H70V40H60V30ZM80 30H90V40H80V30ZM110 30H100V40H110V30ZM120 30H130V40H120V30ZM170 30H150V50H170V30ZM40 40H50V50H40V40ZM150 40H160V50H150V40ZM30 60H40V70H30V60ZM60 60H90V70H60V60ZM120 60H100V80H120V60ZM130 60H140V70H130V60ZM170 60H160V70H170V60ZM30 80H50V90H30V80ZM70 80H60V90H70V80ZM90 80H80V90H90V80ZM110 80H100V90H110V80ZM130 80H120V90H130V80ZM140 80H150V90H140V80ZM170 80H160V90H170V80ZM40 90H50V100H40V90ZM70 90H90V100H70V90ZM160 90H170V100H160V90ZM30 110H70V120H30V110ZM90 110H80V120H90V110ZM100 110H170V120H100V110ZM30 130H40V140H30V130ZM60 130H50V140H60V130ZM70 130H80V140H70V130ZM90 130H100V140H90V130ZM120 130H110V140H120V130ZM130 130H140V150H130V130ZM150 130H160V140H150V130ZM170 130H180V140H170V130ZM40 140H50V150H40V140ZM60 140H80V150H60V140ZM110 140H120V150H110V140ZM150 140H160V150H150V140ZM170 140H180V150H170V140ZM30 150H40V160H30V150ZM100 150H90V160H100V150ZM110 150H120V160H110V150ZM150 150H160V160H150V150ZM170 150H180V160H170V150ZM60 160H30V170H60V160ZM80 160H70V170H80V160ZM100 160H90V170H100V160ZM130 160H110V170H130V160ZM150 160H140V170H150V160ZM170 160H160V170H170V160ZM110 170H150V180H110V170Z"
                        fill="black"
                      />
                    </svg>
                  </div>
                  
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Amount: {formatCurrency(grandTotal)}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">
                    including GST ({formatCurrency(gst)}) and shipping ({formatCurrency(shipping)})
                  </p>
                  
                  <div className="flex items-center justify-center space-x-4 my-4">
                    <svg viewBox="0 0 40 16" fill="none" className="h-4">
                      <path d="M8.3 16H0V0h8.3v16z" fill="#8C4E9E"/>
                      <path d="M13.8 0H9.6L4.5 16h4.2l5.1-16z" fill="#1F5DE2"/>
                      <path d="M39.3 0c-2.6 0-4.9 1.5-5.8 3.8L28 16h4.2l.9-2.4h5.1l.5 2.4h3.7L39.3 0zm-1.8 10.4h-3.3l2.6-6.3 1.3 6.3h-.6z" fill="#8C4E9E"/>
                      <path d="M24.2 3c-.2-1.8-1.7-3-3.6-3h-6.4L10 16h4.2l1.4-4.4h1.5c.5 0 .8.2.7.7l-.6 3.7h4.2l.7-4.4c.2-1.3-.7-1.9-1.4-2.1.9-.5 1.7-1.5 1.8-2.8V6c0-.9-.1-2-.3-3zm-4.2 2.7h-3l.6-2h3c.3 0 .7.2.7.7v.3c0 .7-.6 1-1.3 1z" fill="#1F5DE2"/>
                    </svg>
                    <i className="fas fa-wallet text-gray-600 text-lg"></i>
                    <i className="fab fa-google-pay text-gray-600 text-lg"></i>
                    <i className="fas fa-money-bill-wave text-gray-600 text-lg"></i>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 mt-2 w-full">
                    <p className="text-xs text-gray-500 text-center">After payment, your order will be processed immediately.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <Button
              variant="success"
              className="w-full sm:w-auto"
              onClick={handleCompletedPayment}
              disabled={isPaying}
            >
              {isPaying ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Processing...
                </>
              ) : (
                "I've Completed Payment"
              )}
            </Button>
            
            <Button
              variant="outline"
              className="mt-3 w-full sm:mt-0 sm:ml-3 sm:w-auto"
              onClick={closePaymentModal}
              disabled={isPaying}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
