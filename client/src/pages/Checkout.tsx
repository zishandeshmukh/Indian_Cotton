import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { StripeCheckoutForm } from '@/components/StripeCheckout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { apiRequest } from '@/lib/queryClient';
import { formatCurrency } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

// Make sure environment variable is available
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing Stripe Public Key (VITE_STRIPE_PUBLIC_KEY)');
}

// Initialize Stripe with publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function Checkout() {
  const { cartItems, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [orderComplete, setOrderComplete] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    paymentMethod: 'card'
  });

  // Calculate total amount from cart items
  const totalAmount = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  useEffect(() => {
    // Redirect if cart is empty
    if (cartItems.length === 0 && !orderComplete) {
      toast({
        title: 'Your cart is empty',
        description: 'Please add items to your cart before proceeding to checkout.',
        variant: 'destructive',
      });
      setLocation('/');
      return;
    }

    // Redirect if not logged in
    if (!isAuthenticated) {
      toast({
        title: 'Please log in',
        description: 'You need to be logged in to proceed with checkout.',
        variant: 'destructive',
      });
      setLocation('/auth');
      return;
    }

    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        setIsLoading(true);
        const res = await apiRequest('POST', '/api/payment-intent', {
          amount: totalAmount,
        });
        const { clientSecret } = await res.json();
        setClientSecret(clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        toast({
          title: 'Payment setup failed',
          description: 'Unable to initialize payment. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (totalAmount > 0 && isAuthenticated) {
      createPaymentIntent();
    }
  }, [cartItems, isAuthenticated, setLocation, totalAmount, toast, orderComplete]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentMethodChange = (value: string) => {
    setFormData((prev) => ({ ...prev, paymentMethod: value }));
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to complete your purchase.',
        variant: 'destructive',
      });
      setLocation('/auth');
      return;
    }

    // For cash on delivery option, skip Stripe and create order directly
    if (formData.paymentMethod === 'cash') {
      try {
        setIsLoading(true);
        const res = await apiRequest('POST', '/api/orders', {
          ...formData,
        });
        
        if (res.ok) {
          setOrderComplete(true);
          clearCart();
          toast({
            title: 'Order placed successfully',
            description: 'Your order has been placed and will be processed soon.',
          });
          setLocation('/orders');
        } else {
          const error = await res.json();
          throw new Error(error.message || 'Failed to place order');
        }
      } catch (error: any) {
        toast({
          title: 'Order failed',
          description: error.message || 'Failed to place your order. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      setIsLoading(true);
      // Create order and link to successful payment
      const res = await apiRequest('POST', '/api/orders', {
        ...formData,
        paymentIntentId,
      });
      
      if (res.ok) {
        setOrderComplete(true);
        clearCart();
        toast({
          title: 'Order placed successfully',
          description: 'Your payment was successful and your order has been placed.',
        });
        // Redirect to orders page after successful checkout
        setLocation('/orders');
      } else {
        const error = await res.json();
        throw new Error(error.message || 'Failed to place order');
      }
    } catch (error: any) {
      toast({
        title: 'Order processing failed',
        description: error.message || 'Your payment was processed but we couldn\'t complete your order. Please contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !clientSecret) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Shipping Information */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping Information</CardTitle>
            <CardDescription>
              Enter your shipping details to complete your order
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address" 
                name="address" 
                value={formData.address} 
                onChange={handleInputChange} 
                placeholder="Street address"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input 
                  id="city" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleInputChange} 
                  placeholder="City"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input 
                  id="state" 
                  name="state" 
                  value={formData.state} 
                  onChange={handleInputChange} 
                  placeholder="State"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input 
                  id="zipCode" 
                  name="zipCode" 
                  value={formData.zipCode} 
                  onChange={handleInputChange} 
                  placeholder="ZIP Code"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input 
                  id="country" 
                  name="country" 
                  value={formData.country} 
                  onChange={handleInputChange} 
                  placeholder="Country"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2 pt-4">
              <Label>Payment Method</Label>
              <RadioGroup 
                value={formData.paymentMethod} 
                onValueChange={handlePaymentMethodChange} 
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card">Credit/Debit Card</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash">Cash on Delivery</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
        
        {/* Order Summary & Payment */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>
              Review your order before payment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">
                    {formatCurrency(item.product.price * item.quantity)}
                  </p>
                </div>
              ))}
              
              <div className="flex justify-between pt-4 font-bold">
                <p>Total</p>
                <p>{formatCurrency(totalAmount)}</p>
              </div>
            </div>
            
            {/* Payment method based content */}
            {formData.paymentMethod === 'card' ? (
              <div className="pt-4">
                {clientSecret ? (
                  <Elements 
                    stripe={stripePromise} 
                    options={{ clientSecret, appearance: { theme: 'stripe' } }}
                  >
                    <StripeCheckoutForm onSuccess={handlePaymentSuccess} />
                  </Elements>
                ) : (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                )}
              </div>
            ) : (
              <Button 
                className="w-full mt-6" 
                onClick={handleCheckout}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Place Order (Cash on Delivery)'
                )}
              </Button>
            )}
          </CardContent>
          <CardFooter className="flex justify-between text-sm text-muted-foreground">
            <p>Secure payment processing</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}