import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertCategorySchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";

// Extend the schema with validation rules
const categoryFormSchema = insertCategorySchema.extend({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  description: z.string().optional().nullable(),
  productCount: z.number().default(0)
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CategoryFormProps {
  id?: number;
}

export default function CategoryForm({ id }: CategoryFormProps) {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isEditing = !!id;
  
  // Fetch category if editing
  const { data: category, isLoading: isLoadingCategory } = useQuery({
    queryKey: [`/api/categories/${id}`],
    enabled: isEditing,
  });
  
  // Create form
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
      productCount: 0
    }
  });
  
  // Set form values when category data is loaded
  useEffect(() => {
    if (isEditing && category) {
      form.reset({
        ...category
      });
    }
  }, [form, category, isEditing]);
  
  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: (data: CategoryFormValues) => apiRequest('POST', '/api/categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: "Category Created",
        description: "The category has been created successfully.",
      });
      navigate("/admin/categories");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create category. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: (data: CategoryFormValues) => apiRequest('PUT', `/api/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      queryClient.invalidateQueries({ queryKey: [`/api/categories/${id}`] });
      toast({
        title: "Category Updated",
        description: "The category has been updated successfully.",
      });
      navigate("/admin/categories");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update category. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Handle form submission
  const onSubmit = (data: CategoryFormValues) => {
    if (isEditing) {
      updateCategoryMutation.mutate(data);
    } else {
      createCategoryMutation.mutate(data);
    }
  };
  
  if (isEditing && isLoadingCategory) {
    return (
      <div className="p-8 text-center">
        <i className="fas fa-spinner fa-spin text-xl text-primary mr-2"></i>
        <span>Loading category...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          {isEditing ? "Edit Category" : "Add New Category"}
        </h2>
        <Button variant="outline" onClick={() => navigate("/admin/categories")}>
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Categories
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Category Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter category name" {...field} />
                    </FormControl>
                    <FormDescription>
                      This will be used for filtering products
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter category description" 
                        className="min-h-[100px]"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a brief description of this category
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {isEditing && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <Label className="text-sm text-gray-500">Product Count</Label>
                  <p className="text-lg font-medium mt-1">{form.watch("productCount")}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Number of products in this category
                  </p>
                </div>
              )}
              
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin/categories")}
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
                    isEditing ? "Update Category" : "Create Category"
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
