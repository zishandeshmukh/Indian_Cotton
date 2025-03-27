import { 
  Product, InsertProduct, 
  CartItem, InsertCartItem, 
  Category, InsertCategory,
  Admin, InsertAdmin,
  CartItemWithProduct
} from "@shared/schema";

export interface IStorage {
  // Product operations
  getProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Cart operations
  getCartItems(cartId: string): Promise<CartItemWithProduct[]>;
  getCartItem(cartId: string, productId: number): Promise<CartItem | undefined>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<boolean>;
  clearCart(cartId: string): Promise<boolean>;
  
  // Admin operations
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
}

export class MemStorage implements IStorage {
  private products: Map<number, Product>;
  private categories: Map<number, Category>;
  private cartItems: Map<number, CartItem>;
  private admins: Map<number, Admin>;
  private currentProductId: number;
  private currentCategoryId: number;
  private currentCartItemId: number;
  private currentAdminId: number;

  constructor() {
    this.products = new Map();
    this.categories = new Map();
    this.cartItems = new Map();
    this.admins = new Map();
    this.currentProductId = 1;
    this.currentCategoryId = 1;
    this.currentCartItemId = 1;
    this.currentAdminId = 1;
    
    // Initialize with default categories
    const defaultCategories: InsertCategory[] = [
      { name: 'frock', description: 'Casual and formal dress materials for children and women', productCount: 0 },
      { name: 'lehenga', description: 'Traditional Indian clothing for women, often worn during weddings and festivals', productCount: 0 },
      { name: 'kurta', description: 'Traditional Indian clothing materials for men and women', productCount: 0 },
      { name: 'net', description: 'Transparent, delicate fabrics used for overlays and decorative purposes', productCount: 0 },
      { name: 'cutpiece', description: 'Pre-cut fabric pieces ready for specific garment patterns', productCount: 0 }
    ];
    
    // Add default categories
    defaultCategories.forEach(category => {
      this.createCategory(category);
    });
    
    // Initialize with default admin
    this.createAdmin({
      username: 'admin',
      password: 'admin123',  // In a real app, this would be hashed
      email: 'deshmukhzishan06@gmail.com',
      role: 'admin'
    });
    
    // Initialize with sample products
    const sampleProducts: InsertProduct[] = [
      {
        name: 'Royal Silk Lehenga Fabric',
        description: 'Premium silk fabric for lehenga, perfect for weddings and special occasions.',
        price: 49900, // 499.00
        imageUrl: 'https://images.unsplash.com/photo-1596942517067-59ecf323f71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        category: 'lehenga',
        stock: 23,
        isFeatured: true,
        isActive: true,
        sku: 'FB-LS-001'
      },
      {
        name: 'Premium Cotton Frock Fabric',
        description: 'Soft cotton fabric ideal for children\'s frocks and casual wear.',
        price: 34900, // 349.00
        imageUrl: 'https://images.unsplash.com/photo-1604917621956-10dfa7cce2e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        category: 'frock',
        stock: 45,
        isFeatured: false,
        isActive: true,
        sku: 'FB-FR-002'
      },
      {
        name: 'Handloom Kurta Fabric',
        description: 'Traditional handloom fabric perfect for ethnic kurtas.',
        price: 59900, // 599.00
        imageUrl: 'https://images.unsplash.com/photo-1589891685388-c9038979ed0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        category: 'kurta',
        stock: 12,
        isFeatured: false,
        isActive: true,
        sku: 'FB-KR-003'
      },
      {
        name: 'Embroidered Net Fabric',
        description: 'Delicate net fabric with beautiful embroidery for overlays and decorative purposes.',
        price: 79900, // 799.00
        imageUrl: 'https://images.unsplash.com/photo-1595515106883-5fedd5a53110?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        category: 'net',
        stock: 35,
        isFeatured: false,
        isActive: true,
        sku: 'FB-NT-004'
      },
      {
        name: 'Designer Cut Piece',
        description: 'Pre-cut fabric piece ready for specific garment patterns.',
        price: 29900, // 299.00
        imageUrl: 'https://images.unsplash.com/photo-1558304970-abd589baebe5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        category: 'cutpiece',
        stock: 20,
        isFeatured: false,
        isActive: true,
        sku: 'FB-CP-005'
      },
      {
        name: 'Bridal Lehenga Fabric',
        description: 'Luxury fabric for bridal lehengas with intricate embellishments.',
        price: 129900, // 1299.00
        imageUrl: 'https://images.unsplash.com/photo-1606603696914-2c60681ef707?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        category: 'lehenga',
        stock: 8,
        isFeatured: true,
        isActive: true,
        sku: 'FB-LS-006'
      },
      {
        name: 'Linen Kurta Fabric',
        description: 'Breathable linen fabric perfect for summer kurtas.',
        price: 49900, // 499.00
        imageUrl: 'https://images.unsplash.com/photo-1549349807-34dfcbe3ed16?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        category: 'kurta',
        stock: 30,
        isFeatured: false,
        isActive: true,
        sku: 'FB-KR-007'
      },
      {
        name: 'Designer Frock Material',
        description: 'Premium material for designer frocks with unique patterns.',
        price: 39900, // 399.00
        imageUrl: 'https://images.unsplash.com/photo-1574201635302-388dd92a4c3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        category: 'frock',
        stock: 18,
        isFeatured: false,
        isActive: true,
        sku: 'FB-FR-008'
      }
    ];
    
    // Add sample products
    sampleProducts.forEach(product => {
      this.createProduct(product);
    });
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.category === category);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(product => 
      product.name.toLowerCase().includes(lowerQuery) || 
      product.description.toLowerCase().includes(lowerQuery)
    );
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const newProduct = { ...product, id };
    this.products.set(id, newProduct);
    
    // Update category product count
    const category = Array.from(this.categories.values())
      .find(c => c.name === product.category);
    
    if (category) {
      this.categories.set(category.id, {
        ...category,
        productCount: category.productCount + 1
      });
    }
    
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return undefined;
    
    // If category changed, update category counts
    if (product.category && product.category !== existingProduct.category) {
      // Decrease count for old category
      const oldCategory = Array.from(this.categories.values())
        .find(c => c.name === existingProduct.category);
      
      if (oldCategory) {
        this.categories.set(oldCategory.id, {
          ...oldCategory,
          productCount: Math.max(0, oldCategory.productCount - 1)
        });
      }
      
      // Increase count for new category
      const newCategory = Array.from(this.categories.values())
        .find(c => c.name === product.category);
      
      if (newCategory) {
        this.categories.set(newCategory.id, {
          ...newCategory,
          productCount: newCategory.productCount + 1
        });
      }
    }
    
    const updatedProduct = { ...existingProduct, ...product };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const product = this.products.get(id);
    if (!product) return false;
    
    // Update category product count
    const category = Array.from(this.categories.values())
      .find(c => c.name === product.category);
    
    if (category) {
      this.categories.set(category.id, {
        ...category,
        productCount: Math.max(0, category.productCount - 1)
      });
    }
    
    return this.products.delete(id);
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const newCategory = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const existingCategory = this.categories.get(id);
    if (!existingCategory) return undefined;
    
    const updatedCategory = { ...existingCategory, ...category };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Cart operations
  async getCartItems(cartId: string): Promise<CartItemWithProduct[]> {
    const items = Array.from(this.cartItems.values())
      .filter(item => item.cartId === cartId);
    
    return Promise.all(items.map(async item => {
      const product = await this.getProductById(item.productId);
      return {
        ...item,
        product: product!
      };
    }));
  }

  async getCartItem(cartId: string, productId: number): Promise<CartItem | undefined> {
    return Array.from(this.cartItems.values())
      .find(item => item.cartId === cartId && item.productId === productId);
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if the item already exists in the cart
    const existingItem = await this.getCartItem(cartItem.cartId, cartItem.productId);
    
    if (existingItem) {
      // Update quantity if item already exists
      return this.updateCartItem(existingItem.id, existingItem.quantity + cartItem.quantity) as Promise<CartItem>;
    }
    
    // Add new item to cart
    const id = this.currentCartItemId++;
    const newCartItem = { ...cartItem, id };
    this.cartItems.set(id, newCartItem);
    return newCartItem;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const existingItem = this.cartItems.get(id);
    if (!existingItem) return undefined;
    
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      this.cartItems.delete(id);
      return undefined;
    }
    
    const updatedItem = { ...existingItem, quantity };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }

  async removeFromCart(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(cartId: string): Promise<boolean> {
    const itemsToRemove = Array.from(this.cartItems.values())
      .filter(item => item.cartId === cartId);
    
    itemsToRemove.forEach(item => {
      this.cartItems.delete(item.id);
    });
    
    return true;
  }

  // Admin operations
  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    return Array.from(this.admins.values())
      .find(admin => admin.username === username);
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const id = this.currentAdminId++;
    const newAdmin = { ...admin, id };
    this.admins.set(id, newAdmin);
    return newAdmin;
  }
}

import { PgStorage } from './pgStorage';

// Use PostgreSQL storage as the default storage provider
export const storage = new PgStorage();
