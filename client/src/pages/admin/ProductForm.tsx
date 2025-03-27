import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertProductSchema, MediaFile } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { X, Plus, UploadCloud } from "lucide-react";

// Define media file schema
const mediaFileSchema = z.object({
  id: z.string(),
  url: z.string().url("Please enter a valid URL"),
  type: z.enum(["image", "video"]),
  title: z.string().optional(),
  isPrimary: z.boolean().optional().default(false)
});

// Extend the schema with validation rules
const productFormSchema = insertProductSchema.extend({
  price: z.number().min(1, "Price must be at least ₹1"),
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  stock: z.number().min(0, "Stock cannot be negative"),
  sku: z.string().min(3, "SKU must be at least 3 characters"),
  mediaFiles: z.array(mediaFileSchema).optional().default([])
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  id?: number;
}

export default function ProductForm({ id }: ProductFormProps) {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isEditing = !!id;
  const [fileType, setFileType] = useState<"image" | "video">("image");
  
  // Fetch categories
  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ['/api/categories'],
  });
  
  // Fetch product if editing
  const { data: product, isLoading: isLoadingProduct } = useQuery<ProductFormValues>({
    queryKey: [`/api/products/${id}`],
    enabled: isEditing,
  });
  
  // Create form
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      mediaFiles: [],
      category: "lehenga",
      stock: 0,
      isFeatured: false,
      isActive: true,
      sku: ""
    }
  });
  
  // Set up field array for media files
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "mediaFiles"
  });
  
  // Set form values when product data is loaded
  useEffect(() => {
    if (isEditing && product) {
      form.reset({
        ...product,
        mediaFiles: product.mediaFiles || [],
        price: product.price
      });
    }
  }, [form, product, isEditing]);
  
  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: (data: ProductFormValues) => apiRequest('POST', '/api/products', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Product Created",
        description: "The product has been created successfully.",
      });
      navigate("/admin/products");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create product. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: (data: ProductFormValues) => apiRequest('PUT', `/api/products/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: [`/api/products/${id}`] });
      toast({
        title: "Product Updated",
        description: "The product has been updated successfully.",
      });
      navigate("/admin/products");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update product. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Function to add a new media file
  const handleAddMediaFile = () => {
    const url = prompt("Enter the URL for the media file:");
    if (!url) return;
    
    append({
      id: Math.random().toString(36).substring(2, 9),
      url,
      type: fileType,
      title: "",
      isPrimary: fields.length === 0 // Make the first file primary by default
    });
  };
  
  // Function to set a file as primary
  const handleSetPrimary = (index: number) => {
    const updatedFiles = fields.map((file, i) => ({
      ...file,
      isPrimary: i === index
    }));
    
    form.setValue("mediaFiles", updatedFiles as any);
  };
  
  // Handle form submission
  const onSubmit = (data: ProductFormValues) => {
    if (isEditing) {
      updateProductMutation.mutate(data);
    } else {
      createProductMutation.mutate(data);
    }
  };
  
  if (isEditing && isLoadingProduct) {
    return (
      <div className="p-8 text-center">
        <i className="fas fa-spinner fa-spin text-xl text-primary mr-2"></i>
        <span>Loading product...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          {isEditing ? "Edit Product" : "Add New Product"}
        </h2>
        <Button variant="outline" onClick={() => navigate("/admin/products")}>
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Products
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. FB-LS-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter product description" 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Image URL (Legacy)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter image URL" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a valid URL for the main product image (legacy support)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Media Files Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Product Media Files</h3>
                  <div className="flex space-x-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="image-type" 
                          name="file-type" 
                          checked={fileType === "image"} 
                          onChange={() => setFileType("image")}
                        />
                        <label htmlFor="image-type">Image</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="video-type" 
                          name="file-type" 
                          checked={fileType === "video"} 
                          onChange={() => setFileType("video")}
                        />
                        <label htmlFor="video-type">Video</label>
                      </div>
                    </div>
                    <Button 
                      type="button" 
                      onClick={handleAddMediaFile} 
                      size="sm"
                      className="flex items-center space-x-1"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add {fileType}</span>
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {fields.map((file, index) => (
                    <div key={file.id} className="relative border rounded-md overflow-hidden bg-gray-50">
                      <div className="absolute top-2 right-2 z-10 flex space-x-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="h-6 w-6"
                          onClick={() => remove(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="p-3">
                        {file.type === "image" ? (
                          <img 
                            src={file.url} 
                            alt={file.title || "Product image"} 
                            className="w-full h-32 object-cover mb-2 rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                            }}
                          />
                        ) : (
                          <div className="w-full h-32 flex items-center justify-center bg-gray-100 mb-2 rounded">
                            <span className="text-gray-500">Video: {file.url.split('/').pop()}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center mb-2">
                          <input 
                            type="radio" 
                            id={`primary-${index}`} 
                            name="primary-media"
                            checked={file.isPrimary} 
                            onChange={() => handleSetPrimary(index)}
                            className="mr-2"
                          />
                          <label htmlFor={`primary-${index}`} className="text-sm">Primary</label>
                        </div>
                        
                        <input 
                          type="text" 
                          placeholder="Title (optional)"
                          value={file.title || ""}
                          onChange={(e) => {
                            const newValue = [...fields];
                            newValue[index].title = e.target.value;
                            form.setValue("mediaFiles", newValue as any);
                          }}
                          className="w-full text-sm p-1 border rounded"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                {fields.length === 0 && (
                  <div className="p-8 text-center border border-dashed rounded-md">
                    <div className="flex justify-center mb-2">
                      <UploadCloud className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No media files added yet. Click "Add image" or "Add video" to add product media.</p>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Featured Product</FormLabel>
                        <FormDescription>
                          Mark this product as featured to highlight it
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={Boolean(field.value)}
                          onCheckedChange={(checked: boolean) => field.onChange(checked)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <FormDescription>
                          Product will be visible to customers when active
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={Boolean(field.value)}
                          onCheckedChange={(checked: boolean) => field.onChange(checked)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin/products")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      {isEditing ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    isEditing ? "Update Product" : "Create Product"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
