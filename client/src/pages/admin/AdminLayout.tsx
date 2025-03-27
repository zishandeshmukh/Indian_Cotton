import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useMobile } from "@/hooks/use-mobile";
import { useEffect } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { isAuthenticated, isAdmin, logout, username } = useAuth();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const isMobile = useMobile();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  
  // If not authenticated or not admin, redirect appropriately
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to access the admin panel",
        variant: "destructive",
      });
      navigate("/login");
    } else if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You need administrator privileges to access this area",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [isAuthenticated, isAdmin, navigate, toast]);
  
  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  
  // Get active menu item based on current path
  const getActiveMenuItem = (path: string) => {
    if (location === path) {
      return true;
    }
    if (path !== "/admin" && location.startsWith(path)) {
      return true;
    }
    return false;
  };
  
  if (!isAuthenticated || !isAdmin) {
    return null; // Don't render anything if not authenticated or not admin (will redirect)
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar Overlay for Mobile */}
        {isMobile && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20"
            onClick={toggleSidebar}
          ></div>
        )}
        
        {/* Sidebar */}
        <aside 
          className={`${
            isMobile 
              ? `fixed inset-y-0 left-0 z-30 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`
              : "relative"
          } w-64 bg-gray-800 text-white transition-transform duration-200 ease-in-out`}
        >
          <div className="p-6">
            <div className="flex items-center mb-8">
              <span className="text-white font-bold text-xl">Admin Dashboard</span>
            </div>
            
            <nav>
              <ul>
                <li className="mb-2">
                  <Link href="/admin">
                    <a className={`w-full text-left px-4 py-2 rounded flex items-center ${
                      getActiveMenuItem("/admin") && !getActiveMenuItem("/admin/products") && !getActiveMenuItem("/admin/categories")
                        ? "bg-primary text-white" 
                        : "text-gray-300 hover:bg-gray-700"
                    }`}>
                      <i className="fas fa-tachometer-alt mr-3"></i>
                      Dashboard
                    </a>
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="/admin/products">
                    <a className={`w-full text-left px-4 py-2 rounded flex items-center ${
                      getActiveMenuItem("/admin/products") 
                        ? "bg-primary text-white" 
                        : "text-gray-300 hover:bg-gray-700"
                    }`}>
                      <i className="fas fa-box mr-3"></i>
                      Products
                    </a>
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="/admin/categories">
                    <a className={`w-full text-left px-4 py-2 rounded flex items-center ${
                      getActiveMenuItem("/admin/categories") 
                        ? "bg-primary text-white" 
                        : "text-gray-300 hover:bg-gray-700"
                    }`}>
                      <i className="fas fa-tags mr-3"></i>
                      Categories
                    </a>
                  </Link>
                </li>
                <li className="mb-2">
                  <a 
                    className="w-full text-left px-4 py-2 rounded text-gray-300 hover:bg-gray-700 flex items-center cursor-not-allowed opacity-70"
                    title="This feature is not available in the current version"
                  >
                    <i className="fas fa-shopping-cart mr-3"></i>
                    Orders
                  </a>
                </li>
                <li className="mb-2">
                  <a 
                    className="w-full text-left px-4 py-2 rounded text-gray-300 hover:bg-gray-700 flex items-center cursor-not-allowed opacity-70"
                    title="This feature is not available in the current version"
                  >
                    <i className="fas fa-cog mr-3"></i>
                    Settings
                  </a>
                </li>
                <li className="mt-10">
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 rounded text-gray-300 hover:bg-gray-700 flex items-center"
                  >
                    <i className="fas fa-sign-out-alt mr-3"></i>
                    Logout
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </aside>
        
        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile Header */}
          {isMobile && (
            <div className="bg-white border-b p-4 flex justify-between items-center sticky top-0 z-10">
              <button 
                onClick={toggleSidebar}
                className="text-gray-600 hover:text-primary"
              >
                <i className="fas fa-bars text-xl"></i>
              </button>
              <span className="font-bold">Admin Panel</span>
              <div className="text-sm text-gray-600">
                {username && `Hello, ${username}`}
              </div>
            </div>
          )}
          
          {/* Desktop Header */}
          {!isMobile && (
            <div className="bg-white border-b p-4 flex justify-between items-center">
              <div className="font-bold text-lg">Admin Panel</div>
              <div className="text-sm text-gray-600">
                {username && `Hello, ${username}`}
              </div>
              <Link href="/">
                <Button variant="outline" size="sm">
                  <i className="fas fa-store mr-2"></i>
                  View Store
                </Button>
              </Link>
            </div>
          )}
          
          {/* Page Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
      
      <Toaster />
    </div>
  );
}
