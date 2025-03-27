import { useQuery } from "@tanstack/react-query";
import { Product, Category } from "@shared/schema";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    revenue: 0,
    orders: 0,
    customers: 0,
    productsByCategory: [] as { name: string; count: number }[],
  });
  
  // Fetch products
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });
  
  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });
  
  // Calculate stats
  useEffect(() => {
    if (products.length > 0 && categories.length > 0) {
      // Total products
      const totalProducts = products.length;
      
      // Simulated revenue (for demo)
      const revenue = totalProducts * 2500;
      
      // Simulated orders (for demo)
      const orders = Math.floor(totalProducts * 0.3);
      
      // Simulated customers (for demo)
      const customers = Math.floor(orders * 0.75);
      
      // Products by category
      const productsByCategory = categories.map((category: Category) => {
        const count = products.filter((product: Product) => 
          product.category === category.name
        ).length;
        
        return {
          name: category.name,
          count
        };
      });
      
      setStats({
        totalProducts,
        revenue,
        orders,
        customers,
        productsByCategory,
      });
    }
  }, [products, categories]);
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary-100 text-primary">
                <i className="fas fa-box text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Products</p>
                <p className="text-2xl font-semibold">{stats.totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <i className="fas fa-rupee-sign text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Revenue</p>
                <p className="text-2xl font-semibold">{formatCurrency(stats.revenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <i className="fas fa-shopping-cart text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Orders</p>
                <p className="text-2xl font-semibold">{stats.orders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <i className="fas fa-users text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Customers</p>
                <p className="text-2xl font-semibold">{stats.customers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Orders */}
      <Card>
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-800">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Sample orders (for demo) */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#ORD-5782</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Priya Sharma</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">3 items</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹1,897</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Completed
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date().toISOString().split('T')[0]}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#ORD-5781</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rahul Mehta</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">1 item</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹799</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Processing
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(Date.now() - 86400000).toISOString().split('T')[0]}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#ORD-5780</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Aisha Patel</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2 items</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹1,298</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Completed
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(Date.now() - 172800000).toISOString().split('T')[0]}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
