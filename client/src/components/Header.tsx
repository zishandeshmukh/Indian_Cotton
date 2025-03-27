import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function Header() {
  const { cartItems, toggleCart } = useCart();
  const { isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <span className="text-primary font-serif font-bold text-xl cursor-pointer">Fabric Haven</span>
              </Link>
            </div>
          </div>
          
          {/* Navigation - Desktop */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/">
              <a className="font-medium hover:text-primary">Home</a>
            </Link>
            <Link href="/">
              <a className="font-medium hover:text-primary">Shop</a>
            </Link>
            <Link href="/">
              <a className="font-medium hover:text-primary">Categories</a>
            </Link>
            <Link href="/">
              <a className="font-medium hover:text-primary">About</a>
            </Link>
            <Link href="/">
              <a className="font-medium hover:text-primary">Contact</a>
            </Link>
          </nav>
          
          {/* User Actions */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <button 
                onClick={toggleCart} 
                className="text-gray-600 hover:text-primary"
                aria-label="Shopping cart"
              >
                <i className="fas fa-shopping-cart text-xl"></i>
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
            
            <div className="hidden md:block">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link href="/admin">
                    <Button variant="outline" size="sm">Admin Panel</Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Link href="/login">
                  <Button>Login</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu button */}
      <div className="md:hidden flex justify-between px-4 py-2 border-t">
        <button 
          className="text-gray-500"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <i className="fas fa-bars text-xl"></i>
        </button>
        
        {isAuthenticated ? (
          <button 
            className="text-gray-500"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            <i className="fas fa-sign-out-alt text-xl"></i>
          </button>
        ) : (
          <Link href="/login">
            <button className="text-gray-500">
              <i className="fas fa-user text-xl"></i>
            </button>
          </Link>
        )}
      </div>
      
      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-2">
          <nav className="flex flex-col px-4 space-y-2">
            <Link href="/">
              <a className="py-2 font-medium hover:text-primary">Home</a>
            </Link>
            <Link href="/">
              <a className="py-2 font-medium hover:text-primary">Shop</a>
            </Link>
            <Link href="/">
              <a className="py-2 font-medium hover:text-primary">Categories</a>
            </Link>
            <Link href="/">
              <a className="py-2 font-medium hover:text-primary">About</a>
            </Link>
            <Link href="/">
              <a className="py-2 font-medium hover:text-primary">Contact</a>
            </Link>
            {isAuthenticated && (
              <Link href="/admin">
                <a className="py-2 font-medium hover:text-primary">Admin Panel</a>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
