import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { useLocation } from "wouter";

export default function Home() {
  const { addToCart } = useCart();
  const [, setLocation] = useLocation();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // Get URL parameters
  const params = new URLSearchParams(window.location.search);
  const categoryParam = params.get('category');
  
  // Get products
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['/api/products'],
  });
  
  // Get categories
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['/api/categories'],
  });
  
  // Set selected category from URL parameter
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);
  
  // Filter products based on category and search term
  const filteredProducts = products.filter((product: Product) => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  // Handle category filter click
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setLocation(category === 'all' ? '/' : `/?category=${category}`);
  };
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="w-full bg-gradient-to-r from-primary to-purple-600 rounded-lg overflow-hidden shadow-lg mb-8">
        <div className="md:flex">
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
              Premium Fabrics For Your Creations
            </h1>
            <p className="text-primary-100 mb-6">
              Discover our handpicked collection of high-quality fabrics for all your design needs.
            </p>
            <div>
              <Button
                variant="default"
                className="bg-white text-primary hover:bg-primary-50"
                onClick={() => window.scrollTo({ top: document.getElementById('products')?.offsetTop || 0, behavior: 'smooth' })}
              >
                Shop Collection
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <img 
              src="https://images.unsplash.com/photo-1586495777744-4413f21062fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              alt="Premium fabrics collection" 
              className="w-full h-64 md:h-full object-cover"
            />
          </div>
        </div>
      </div>
      
      {/* Categories/Search Bar Section */}
      <div className="mb-8" id="products">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-2xl font-serif font-bold text-gray-800">Our Fabric Collection</h2>
          <div className="mt-4 md:mt-0 relative">
            <input 
              type="text" 
              placeholder="Search fabrics..." 
              className="border border-gray-300 rounded-md px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
          </div>
        </div>
        
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            className={`rounded-full ${selectedCategory === "all" ? "" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
            onClick={() => handleCategoryClick("all")}
          >
            All Fabrics
          </Button>
          
          {!isLoadingCategories && categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.name ? "default" : "outline"}
              size="sm"
              className={`rounded-full ${selectedCategory === category.name ? "" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
              onClick={() => handleCategoryClick(category.name)}
            >
              {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoadingProducts ? (
          // Loading skeleton
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="w-full h-48 bg-gray-300"></div>
              <div className="p-4">
                <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                  <div className="h-8 bg-gray-300 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ))
        ) : filteredProducts.length > 0 ? (
          // Product cards
          filteredProducts.map((product: Product) => (
            <div 
              key={product.id} 
              className="product-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              data-category={product.category}
              data-name={product.name}
            >
              <div className="relative">
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-48 object-cover"
                />
                {product.isFeatured && (
                  <div className="absolute top-2 right-2 bg-accent-500 text-white text-xs px-2 py-1 rounded">
                    Bestseller
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-800">{product.name}</h3>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-gray-500">
                    {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="font-bold text-lg">{formatCurrency(product.price)}</span>
                  <Button
                    size="sm"
                    onClick={() => addToCart(product.id)}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          // No products found
          <div className="col-span-full text-center py-12">
            <i className="fas fa-search text-3xl text-gray-300 mb-3"></i>
            <h3 className="text-xl font-medium text-gray-700">No products found</h3>
            <p className="text-gray-500 mt-2">Try changing your search or filter criteria</p>
            {searchTerm && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setSearchTerm("")}
              >
                Clear Search
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
