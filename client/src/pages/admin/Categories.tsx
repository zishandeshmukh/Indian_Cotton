import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Category } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Categories() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch categories
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['/api/categories'],
  });
  
  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: "Category Deleted",
        description: "The category has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Handle delete category
  const handleDeleteCategory = (id: number, productCount: number) => {
    if (productCount > 0) {
      toast({
        title: "Cannot Delete",
        description: `This category contains ${productCount} products. Remove or reassign the products first.`,
        variant: "destructive",
      });
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this category?")) {
      deleteCategoryMutation.mutate(id);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Categories</h2>
        <Link href="/admin/categories/new">
          <Button>
            <i className="fas fa-plus mr-2"></i>
            Add New Category
          </Button>
        </Link>
      </div>
      
      {/* Categories Grid */}
      {isLoading ? (
        <div className="p-8 text-center">
          <i className="fas fa-spinner fa-spin text-xl text-primary mr-2"></i>
          <span>Loading categories...</span>
        </div>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            No categories available. Add your first category to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category: Category) => (
            <Card key={category.id}>
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-800">
                  {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                </h3>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary/80"
                    onClick={() => navigate(`/admin/categories/${category.id}/edit`)}
                  >
                    <i className="fas fa-edit"></i>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-900"
                    onClick={() => handleDeleteCategory(category.id, category.productCount)}
                  >
                    <i className="fas fa-trash-alt"></i>
                  </Button>
                </div>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm text-gray-600 mb-4">
                  {category.description || 'No description available.'}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{category.productCount} Products</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
