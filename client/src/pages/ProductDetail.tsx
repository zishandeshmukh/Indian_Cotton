import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useLocation } from "wouter";
import { formatCurrency } from "@/lib/utils";
import { Product, MediaFile, UploadedFile, ProductWithFiles } from "@shared/schema";
import { Loader2, ShoppingCart, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";

export default function ProductDetail({ id }: { id: number }) {
  const { addToCart } = useCart();
  const [, setLocation] = useLocation();
  const [quantity, setQuantity] = useState(1);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'details'>('description');
  
  // Fetch product details with uploaded files
  const { data: product, isLoading } = useQuery<ProductWithFiles>({
    queryKey: [`/api/products/${id}/details`],
    networkMode: 'always',
  });
  
  // Get all media files (uploaded files + legacy media files from product.mediaFiles)
  const allMedia = product ? [
    ...(product.uploadedFiles || []).map(file => ({
      id: file.id.toString(),
      url: file.url,
      type: file.type as 'image' | 'video',
      title: file.originalName,
    })),
    ...(product.mediaFiles as MediaFile[] || [])
  ] : [];
  
  // Default to product image if no media files available
  useEffect(() => {
    if (product && allMedia.length === 0 && product.imageUrl) {
      // If no media files but main image exists, create a virtual media file
      allMedia.push({
        id: 'main-image',
        url: product.imageUrl,
        type: 'image',
        title: product.name,
        isPrimary: true
      });
    }
  }, [product]);
  
  // Handle play/pause for videos
  const togglePlay = () => {
    const videoElement = document.getElementById('product-video') as HTMLVideoElement;
    if (videoElement) {
      if (isPlaying) {
        videoElement.pause();
      } else {
        videoElement.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // Handle video events
  useEffect(() => {
    const videoElement = document.getElementById('product-video') as HTMLVideoElement;
    if (videoElement) {
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleEnded = () => setIsPlaying(false);
      
      videoElement.addEventListener('play', handlePlay);
      videoElement.addEventListener('pause', handlePause);
      videoElement.addEventListener('ended', handleEnded);
      
      return () => {
        videoElement.removeEventListener('play', handlePlay);
        videoElement.removeEventListener('pause', handlePause);
        videoElement.removeEventListener('ended', handleEnded);
      };
    }
  }, [currentMediaIndex, allMedia]);
  
  // Navigate to next/previous media
  const goToNextMedia = () => {
    setCurrentMediaIndex((prev) => (prev + 1) % allMedia.length);
    setIsPlaying(false);
  };
  
  const goToPrevMedia = () => {
    setCurrentMediaIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
    setIsPlaying(false);
  };
  
  // Update quantity
  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  // Add to cart with selected quantity
  const handleAddToCart = () => {
    if (product) {
      addToCart(product.id, quantity);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => setLocation("/")}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }
  
  const currentMedia = allMedia.length > 0 ? allMedia[currentMediaIndex] : null;
  const isCurrentVideo = currentMedia?.type === 'video';
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="flex text-sm">
          <Button variant="link" className="text-gray-600 hover:text-primary" onClick={() => setLocation("/")}>
            Home
          </Button>
          <span className="mx-2 text-gray-400">/</span>
          <Button 
            variant="link" 
            className="text-gray-600 hover:text-primary"
            onClick={() => setLocation(`/?category=${product.category}`)}
          >
            {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
          </Button>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-800 font-medium">{product.name}</span>
        </nav>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Product Images/Gallery */}
        <div className="space-y-4">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden h-[400px] flex items-center justify-center">
            {currentMedia ? (
              <>
                {isCurrentVideo ? (
                  <div className="relative w-full h-full">
                    <video
                      id="product-video"
                      src={currentMedia.url}
                      className="w-full h-full object-contain"
                      controls={false}
                    />
                    <button
                      onClick={togglePlay}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-4 hover:bg-black/70"
                    >
                      {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </button>
                  </div>
                ) : (
                  <img
                    src={currentMedia.url}
                    alt={currentMedia.title || product.name}
                    className="w-full h-full object-contain"
                  />
                )}
                
                {/* Navigation arrows (only show if multiple media) */}
                {allMedia.length > 1 && (
                  <>
                    <button
                      onClick={goToPrevMedia}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 text-gray-800 rounded-full p-2 hover:bg-white"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={goToNextMedia}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 text-gray-800 rounded-full p-2 hover:bg-white"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </>
            ) : (
              // Fallback if no media available
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            )}
          </div>
          
          {/* Thumbnail Gallery */}
          {allMedia.length > 1 && (
            <div className="flex overflow-x-auto space-x-2 pb-2">
              {allMedia.map((media, index) => (
                <button
                  key={media.id}
                  onClick={() => setCurrentMediaIndex(index)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded border-2 ${
                    index === currentMediaIndex ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  {media.type === 'video' ? (
                    <div className="relative w-full h-full bg-gray-100">
                      <img
                        src={media.url.replace(/\.[^/.]+$/, ".jpg") || '/video-placeholder.jpg'}
                        alt={media.title || `Video ${index + 1}`}
                        className="w-full h-full object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/video-placeholder.jpg';
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play size={16} className="text-white" />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={media.url}
                      alt={media.title || `Image ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-800">{product.name}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Category: {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900">{formatCurrency(product.price)}</span>
            {product.isFeatured && (
              <span className="bg-accent-500 text-white text-xs px-2 py-1 rounded">Bestseller</span>
            )}
          </div>
          
          {/* Stock Status */}
          <div>
            {product.stock > 0 ? (
              <div className="flex items-center text-green-600">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                <span>{product.stock > 10 ? 'In Stock' : `Only ${product.stock} left`}</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                <span>Out of Stock</span>
              </div>
            )}
          </div>
          
          {/* SKU */}
          <div className="text-sm text-gray-500">
            SKU: {product.sku}
          </div>
          
          {/* Quantity Selector */}
          {product.stock > 0 && (
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="px-2 py-1 h-8"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="mx-3 text-gray-800 w-6 text-center">{quantity}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="px-2 py-1 h-8"
                  onClick={incrementQuantity}
                  disabled={quantity >= product.stock}
                >
                  +
                </Button>
              </div>
            </div>
          )}
          
          {/* Add to Cart Button */}
          <div className="pt-4">
            <Button
              className="w-full md:w-auto flex items-center justify-center"
              size="lg"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>
          
          {/* Product Description Tabs */}
          <div className="pt-8">
            <div className="flex border-b border-gray-200">
              <button
                className={`py-2 px-4 font-medium text-sm ${
                  activeTab === 'description'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button
                className={`py-2 px-4 font-medium text-sm ${
                  activeTab === 'details'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('details')}
              >
                Product Details
              </button>
            </div>
            
            <div className="py-4">
              {activeTab === 'description' ? (
                <div className="prose max-w-none text-gray-600">
                  <p>{product.description}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Category:</span>
                      <p className="text-gray-600">{product.category}</p>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">SKU:</span>
                      <p className="text-gray-600">{product.sku}</p>
                    </div>
                    {product.stock > 0 && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Availability:</span>
                        <p className="text-gray-600">{product.stock} in stock</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm pt-2">
                    <span className="font-medium text-gray-700">Care Instructions:</span>
                    <p className="text-gray-600 mt-1">
                      Gently wash by hand in cold water. Do not bleach. Dry in shade. Iron on low heat if needed.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}