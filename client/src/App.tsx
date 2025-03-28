import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AuthPage from "@/pages/AuthPage";
import ProductDetail from "@/pages/ProductDetail";
import AdminLayout from "@/pages/admin/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import Products from "@/pages/admin/Products";
import Categories from "@/pages/admin/Categories";
import ProductForm from "@/pages/admin/ProductForm";
import CategoryForm from "@/pages/admin/CategoryForm";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";

function Router() {
  return (
    <Switch>
      {/* User routes */}
      <Route path="/" component={() => (
        <Layout>
          <Home />
        </Layout>
      )} />
      
      <Route path="/products/:id" component={(params) => {
        // Type assertion to access the id parameter
        const id = (params as any).id;
        return (
          <Layout>
            <ProductDetail id={parseInt(id)} />
          </Layout>
        );
      }} />
      
      {/* Auth routes */}
      <Route path="/auth" component={AuthPage} />
      
      {/* Admin routes */}
      <Route path="/admin" component={() => (
        <AdminLayout>
          <Dashboard />
        </AdminLayout>
      )} />
      <Route path="/admin/products" component={() => (
        <AdminLayout>
          <Products />
        </AdminLayout>
      )} />
      <Route path="/admin/products/new" component={() => (
        <AdminLayout>
          <ProductForm />
        </AdminLayout>
      )} />
      <Route path="/admin/products/:id/edit" component={(params) => {
        const id = (params as any).id;
        return (
          <AdminLayout>
            <ProductForm id={parseInt(id)} />
          </AdminLayout>
        );
      }} />
      <Route path="/admin/categories" component={() => (
        <AdminLayout>
          <Categories />
        </AdminLayout>
      )} />
      <Route path="/admin/categories/new" component={() => (
        <AdminLayout>
          <CategoryForm />
        </AdminLayout>
      )} />
      <Route path="/admin/categories/:id/edit" component={(params) => {
        const id = (params as any).id;
        return (
          <AdminLayout>
            <CategoryForm id={parseInt(id)} />
          </AdminLayout>
        );
      }} />
      
      {/* 404 Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Router />
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
