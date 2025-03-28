import {
  Product, InsertProduct,
  CartItem, InsertCartItem,
  Category, InsertCategory,
  Admin, InsertAdmin,
  User, InsertUser,
  Order, InsertOrder,
  OrderItem, InsertOrderItem,
  UploadedFile, InsertUploadedFile,
  Notification, InsertNotification,
  CartItemWithProduct,
  OrderWithItems,
  ProductWithFiles
} from "@shared/schema";
import { IStorage } from "./storage";
import { db } from "./db";
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export class PgStorage implements IStorage {
  // Product operations
  async getProducts(): Promise<Product[]> {
    const result = await db.query('SELECT * FROM products');
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      imageUrl: row.image_url,
      mediaFiles: row.media_files || [],
      category: row.category,
      stock: row.stock,
      isFeatured: row.is_featured,
      isActive: row.is_active,
      sku: row.sku
    }));
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const result = await db.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) return undefined;
    
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      imageUrl: row.image_url,
      mediaFiles: row.media_files || [],
      category: row.category,
      stock: row.stock,
      isFeatured: row.is_featured,
      isActive: row.is_active,
      sku: row.sku
    };
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    const result = await db.query('SELECT * FROM products WHERE category = $1', [category]);
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      imageUrl: row.image_url,
      mediaFiles: row.media_files || [],
      category: row.category,
      stock: row.stock,
      isFeatured: row.is_featured,
      isActive: row.is_active,
      sku: row.sku
    }));
  }

  async searchProducts(query: string): Promise<Product[]> {
    const searchQuery = `%${query.toLowerCase()}%`;
    const result = await db.query(
      'SELECT * FROM products WHERE LOWER(name) LIKE $1 OR LOWER(description) LIKE $1',
      [searchQuery]
    );
    
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      imageUrl: row.image_url,
      mediaFiles: row.media_files || [],
      category: row.category,
      stock: row.stock,
      isFeatured: row.is_featured,
      isActive: row.is_active,
      sku: row.sku
    }));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    // Ensure all required fields have values
    const productToInsert = {
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      mediaFiles: product.mediaFiles || [],
      category: product.category,
      stock: product.stock || 0,
      isFeatured: product.isFeatured !== undefined ? product.isFeatured : false,
      isActive: product.isActive !== undefined ? product.isActive : true,
      sku: product.sku
    };
    
    const result = await db.query(
      `INSERT INTO products 
       (name, description, price, image_url, media_files, category, stock, is_featured, is_active, sku)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        productToInsert.name,
        productToInsert.description,
        productToInsert.price,
        productToInsert.imageUrl,
        JSON.stringify(productToInsert.mediaFiles),
        productToInsert.category,
        productToInsert.stock,
        productToInsert.isFeatured,
        productToInsert.isActive,
        productToInsert.sku
      ]
    );
    
    // Update category product count
    await db.query(
      'UPDATE categories SET product_count = COALESCE(product_count, 0) + 1 WHERE name = $1',
      [productToInsert.category]
    );
    
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      imageUrl: row.image_url,
      mediaFiles: row.media_files || [],
      category: row.category,
      stock: row.stock,
      isFeatured: row.is_featured,
      isActive: row.is_active,
      sku: row.sku
    };
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    // Get existing product to check if category changed
    const existingResult = await db.query('SELECT * FROM products WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) return undefined;
    
    const existingProduct = existingResult.rows[0];
    const oldCategory = existingProduct.category;
    const newCategory = product.category || oldCategory;
    
    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (product.name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      values.push(product.name);
      paramIndex++;
    }
    
    if (product.description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      values.push(product.description);
      paramIndex++;
    }
    
    if (product.price !== undefined) {
      updates.push(`price = $${paramIndex}`);
      values.push(product.price);
      paramIndex++;
    }
    
    if (product.imageUrl !== undefined) {
      updates.push(`image_url = $${paramIndex}`);
      values.push(product.imageUrl);
      paramIndex++;
    }
    
    if (product.category !== undefined) {
      updates.push(`category = $${paramIndex}`);
      values.push(product.category);
      paramIndex++;
    }
    
    if (product.stock !== undefined) {
      updates.push(`stock = $${paramIndex}`);
      values.push(product.stock);
      paramIndex++;
    }
    
    if (product.isFeatured !== undefined) {
      updates.push(`is_featured = $${paramIndex}`);
      values.push(product.isFeatured);
      paramIndex++;
    }
    
    if (product.isActive !== undefined) {
      updates.push(`is_active = $${paramIndex}`);
      values.push(product.isActive);
      paramIndex++;
    }
    
    if (product.sku !== undefined) {
      updates.push(`sku = $${paramIndex}`);
      values.push(product.sku);
      paramIndex++;
    }
    
    if (product.mediaFiles !== undefined) {
      updates.push(`media_files = $${paramIndex}`);
      values.push(JSON.stringify(product.mediaFiles));
      paramIndex++;
    }
    
    // If no updates, return existing product
    if (updates.length === 0) {
      return {
        id: existingProduct.id,
        name: existingProduct.name,
        description: existingProduct.description,
        price: existingProduct.price,
        imageUrl: existingProduct.image_url,
        mediaFiles: existingProduct.media_files || [],
        category: existingProduct.category,
        stock: existingProduct.stock,
        isFeatured: existingProduct.is_featured,
        isActive: existingProduct.is_active,
        sku: existingProduct.sku
      };
    }
    
    // Add id to values array
    values.push(id);
    
    // Execute update
    const result = await db.query(
      `UPDATE products SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    
    // If category changed, update category counts
    if (newCategory !== oldCategory) {
      // Decrease count for old category
      await db.query(
        'UPDATE categories SET product_count = product_count - 1 WHERE name = $1',
        [oldCategory]
      );
      
      // Increase count for new category
      await db.query(
        'UPDATE categories SET product_count = product_count + 1 WHERE name = $1',
        [newCategory]
      );
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      imageUrl: row.image_url,
      mediaFiles: row.media_files || [],
      category: row.category,
      stock: row.stock,
      isFeatured: row.is_featured,
      isActive: row.is_active,
      sku: row.sku
    };
  }

  async deleteProduct(id: number): Promise<boolean> {
    // Get product category before deleting
    const productResult = await db.query('SELECT category FROM products WHERE id = $1', [id]);
    if (productResult.rows.length === 0) return false;
    
    const category = productResult.rows[0].category;
    
    // Delete the product
    const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return false;
    
    // Update category product count
    await db.query(
      'UPDATE categories SET product_count = product_count - 1 WHERE name = $1',
      [category]
    );
    
    return true;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    const result = await db.query('SELECT * FROM categories');
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      productCount: row.product_count
    }));
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const result = await db.query('SELECT * FROM categories WHERE id = $1', [id]);
    if (result.rows.length === 0) return undefined;
    
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      productCount: row.product_count
    };
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
      [category.name, category.description]
    );
    
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      productCount: row.product_count
    };
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (category.name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      values.push(category.name);
      paramIndex++;
    }
    
    if (category.description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      values.push(category.description);
      paramIndex++;
    }
    
    // If no updates, get existing category
    if (updates.length === 0) {
      return this.getCategoryById(id);
    }
    
    // Add id to values array
    values.push(id);
    
    // Execute update
    const result = await db.query(
      `UPDATE categories SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) return undefined;
    
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      productCount: row.product_count
    };
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  }

  // Cart operations
  async getCartItems(cartId: string): Promise<CartItemWithProduct[]> {
    const result = await db.query(`
      SELECT ci.*, p.* 
      FROM cart_items ci 
      JOIN products p ON ci.product_id = p.id 
      WHERE ci.cart_id = $1
    `, [cartId]);
    
    return result.rows.map(row => ({
      id: row.id,
      cartId: row.cart_id,
      productId: row.product_id,
      quantity: row.quantity,
      product: {
        id: row.product_id,
        name: row.name,
        description: row.description,
        price: row.price,
        imageUrl: row.image_url,
        mediaFiles: row.media_files || [],
        category: row.category,
        stock: row.stock,
        isFeatured: row.is_featured,
        isActive: row.is_active,
        sku: row.sku
      }
    }));
  }

  async getCartItem(cartId: string, productId: number): Promise<CartItem | undefined> {
    const result = await db.query(
      'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cartId, productId]
    );
    
    if (result.rows.length === 0) return undefined;
    
    const row = result.rows[0];
    return {
      id: row.id,
      cartId: row.cart_id,
      productId: row.product_id,
      quantity: row.quantity
    };
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = await this.getCartItem(cartItem.cartId, cartItem.productId);
    
    if (existingItem) {
      // Update quantity if item already exists
      return this.updateCartItem(existingItem.id, existingItem.quantity + (cartItem.quantity || 1)) as Promise<CartItem>;
    }
    
    // Add new item to cart
    const result = await db.query(
      'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
      [cartItem.cartId, cartItem.productId, cartItem.quantity || 1]
    );
    
    const row = result.rows[0];
    return {
      id: row.id,
      cartId: row.cart_id,
      productId: row.product_id,
      quantity: row.quantity
    };
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      await this.removeFromCart(id);
      return undefined;
    }
    
    const result = await db.query(
      'UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *',
      [quantity, id]
    );
    
    if (result.rows.length === 0) return undefined;
    
    const row = result.rows[0];
    return {
      id: row.id,
      cartId: row.cart_id,
      productId: row.product_id,
      quantity: row.quantity
    };
  }

  async removeFromCart(id: number): Promise<boolean> {
    const result = await db.query('DELETE FROM cart_items WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  }

  async clearCart(cartId: string): Promise<boolean> {
    await db.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
    return true;
  }

  // Admin operations
  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const result = await db.query('SELECT * FROM admins WHERE username = $1', [username]);
    if (result.rows.length === 0) return undefined;
    
    const row = result.rows[0];
    return {
      id: row.id,
      username: row.username,
      password: row.password,
      email: row.email,
      role: row.role
    };
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const result = await db.query(
      'INSERT INTO admins (username, password, email, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [admin.username, admin.password, admin.email || null, admin.role || 'user']
    );
    
    const row = result.rows[0];
    return {
      id: row.id,
      username: row.username,
      password: row.password,
      email: row.email,
      role: row.role
    };
  }
  
  // Product with files
  async getProductWithFiles(id: number): Promise<ProductWithFiles | undefined> {
    const product = await this.getProductById(id);
    if (!product) return undefined;
    
    const files = await this.getFilesByProductId(id);
    
    return {
      ...product,
      uploadedFiles: files
    };
  }
  
  // User operations
  async getUserById(id: number): Promise<User | undefined> {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) return undefined;
    
    const row = result.rows[0];
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      password: row.password,
      firstName: row.first_name,
      lastName: row.last_name,
      phone: row.phone,
      address: row.address,
      city: row.city,
      state: row.state,
      zipCode: row.zip_code,
      country: row.country,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) return undefined;
    
    const row = result.rows[0];
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      password: row.password,
      firstName: row.first_name,
      lastName: row.last_name,
      phone: row.phone,
      address: row.address,
      city: row.city,
      state: row.state,
      zipCode: row.zip_code,
      country: row.country,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return undefined;
    
    const row = result.rows[0];
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      password: row.password,
      firstName: row.first_name,
      lastName: row.last_name,
      phone: row.phone,
      address: row.address,
      city: row.city,
      state: row.state,
      zipCode: row.zip_code,
      country: row.country,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const result = await db.query(
      `INSERT INTO users (
        username, email, password, first_name, last_name, 
        phone, address, city, state, zip_code, country
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        user.username,
        user.email,
        user.password,
        user.firstName || null,
        user.lastName || null,
        user.phone || null,
        user.address || null,
        user.city || null,
        user.state || null,
        user.zipCode || null,
        user.country || 'India'
      ]
    );
    
    const row = result.rows[0];
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      password: row.password,
      firstName: row.first_name,
      lastName: row.last_name,
      phone: row.phone,
      address: row.address,
      city: row.city,
      state: row.state,
      zipCode: row.zip_code,
      country: row.country,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
  
  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (user.username !== undefined) {
      updates.push(`username = $${paramIndex}`);
      values.push(user.username);
      paramIndex++;
    }
    
    if (user.email !== undefined) {
      updates.push(`email = $${paramIndex}`);
      values.push(user.email);
      paramIndex++;
    }
    
    if (user.password !== undefined) {
      updates.push(`password = $${paramIndex}`);
      values.push(user.password);
      paramIndex++;
    }
    
    if (user.firstName !== undefined) {
      updates.push(`first_name = $${paramIndex}`);
      values.push(user.firstName);
      paramIndex++;
    }
    
    if (user.lastName !== undefined) {
      updates.push(`last_name = $${paramIndex}`);
      values.push(user.lastName);
      paramIndex++;
    }
    
    if (user.phone !== undefined) {
      updates.push(`phone = $${paramIndex}`);
      values.push(user.phone);
      paramIndex++;
    }
    
    if (user.address !== undefined) {
      updates.push(`address = $${paramIndex}`);
      values.push(user.address);
      paramIndex++;
    }
    
    if (user.city !== undefined) {
      updates.push(`city = $${paramIndex}`);
      values.push(user.city);
      paramIndex++;
    }
    
    if (user.state !== undefined) {
      updates.push(`state = $${paramIndex}`);
      values.push(user.state);
      paramIndex++;
    }
    
    if (user.zipCode !== undefined) {
      updates.push(`zip_code = $${paramIndex}`);
      values.push(user.zipCode);
      paramIndex++;
    }
    
    if (user.country !== undefined) {
      updates.push(`country = $${paramIndex}`);
      values.push(user.country);
      paramIndex++;
    }
    
    // Also update the updated_at timestamp
    updates.push(`updated_at = NOW()`);
    
    // If no updates, return existing user
    if (updates.length === 0) {
      return this.getUserById(id);
    }
    
    // Add id to values array
    values.push(id);
    
    // Execute update
    const result = await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) return undefined;
    
    const row = result.rows[0];
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      password: row.password,
      firstName: row.first_name,
      lastName: row.last_name,
      phone: row.phone,
      address: row.address,
      city: row.city,
      state: row.state,
      zipCode: row.zip_code,
      country: row.country,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
  
  // Order operations
  async getOrders(userId?: number): Promise<Order[]> {
    let query = 'SELECT * FROM orders';
    const params: any[] = [];
    
    if (userId) {
      query += ' WHERE user_id = $1';
      params.push(userId);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await db.query(query, params);
    
    return result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      totalAmount: row.total_amount,
      status: row.status,
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status,
      shippingAddress: row.shipping_address,
      shippingCity: row.shipping_city,
      shippingState: row.shipping_state,
      shippingZipCode: row.shipping_zip_code,
      shippingCountry: row.shipping_country,
      trackingNumber: row.tracking_number,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }
  
  async getOrderById(id: number): Promise<Order | undefined> {
    const result = await db.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (result.rows.length === 0) return undefined;
    
    const row = result.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      totalAmount: row.total_amount,
      status: row.status,
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status,
      shippingAddress: row.shipping_address,
      shippingCity: row.shipping_city,
      shippingState: row.shipping_state,
      shippingZipCode: row.shipping_zip_code,
      shippingCountry: row.shipping_country,
      trackingNumber: row.tracking_number,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
  
  async getOrderWithItems(id: number): Promise<OrderWithItems | undefined> {
    const order = await this.getOrderById(id);
    if (!order) return undefined;
    
    const user = await this.getUserById(order.userId);
    if (!user) return undefined;
    
    const result = await db.query(`
      SELECT oi.*, p.*
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [id]);
    
    const orderItems = result.rows.map(row => ({
      id: row.id,
      orderId: row.order_id,
      productId: row.product_id,
      quantity: row.quantity,
      price: row.price,
      createdAt: row.created_at,
      product: {
        id: row.product_id,
        name: row.name,
        description: row.description,
        price: row.price,
        imageUrl: row.image_url,
        mediaFiles: row.media_files || [],
        category: row.category,
        stock: row.stock,
        isFeatured: row.is_featured,
        isActive: row.is_active,
        sku: row.sku
      }
    }));
    
    return {
      ...order,
      orderItems,
      user
    };
  }
  
  async createOrder(order: InsertOrder): Promise<Order> {
    const result = await db.query(
      `INSERT INTO orders (
        user_id, total_amount, status, payment_method, payment_status,
        shipping_address, shipping_city, shipping_state, shipping_zip_code, 
        shipping_country, tracking_number, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        order.userId,
        order.totalAmount,
        order.status || 'pending',
        order.paymentMethod || null,
        order.paymentStatus || 'pending',
        order.shippingAddress || null,
        order.shippingCity || null,
        order.shippingState || null,
        order.shippingZipCode || null,
        order.shippingCountry || 'India',
        order.trackingNumber || null,
        order.notes || null
      ]
    );
    
    const row = result.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      totalAmount: row.total_amount,
      status: row.status,
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status,
      shippingAddress: row.shipping_address,
      shippingCity: row.shipping_city,
      shippingState: row.shipping_state,
      shippingZipCode: row.shipping_zip_code,
      shippingCountry: row.shipping_country,
      trackingNumber: row.tracking_number,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const result = await db.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    if (result.rows.length === 0) return undefined;
    
    const row = result.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      totalAmount: row.total_amount,
      status: row.status,
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status,
      shippingAddress: row.shipping_address,
      shippingCity: row.shipping_city,
      shippingState: row.shipping_state,
      shippingZipCode: row.shipping_zip_code,
      shippingCountry: row.shipping_country,
      trackingNumber: row.tracking_number,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
  
  // Order Item operations
  async addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const result = await db.query(
      'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4) RETURNING *',
      [orderItem.orderId, orderItem.productId, orderItem.quantity, orderItem.price]
    );
    
    const row = result.rows[0];
    return {
      id: row.id,
      orderId: row.order_id,
      productId: row.product_id,
      quantity: row.quantity,
      price: row.price,
      createdAt: row.created_at
    };
  }
  
  // File operations
  async uploadFile(file: InsertUploadedFile): Promise<UploadedFile> {
    const result = await db.query(
      `INSERT INTO uploaded_files (
        filename, original_name, mime_type, size, path, url, product_id, type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        file.filename,
        file.originalName,
        file.mimeType,
        file.size,
        file.path,
        file.url,
        file.productId || null,
        file.type || 'image'
      ]
    );
    
    const row = result.rows[0];
    return {
      id: row.id,
      filename: row.filename,
      originalName: row.original_name,
      mimeType: row.mime_type,
      size: row.size,
      path: row.path,
      url: row.url,
      productId: row.product_id,
      type: row.type,
      createdAt: row.created_at
    };
  }
  
  async getFilesByProductId(productId: number): Promise<UploadedFile[]> {
    const result = await db.query(
      'SELECT * FROM uploaded_files WHERE product_id = $1 ORDER BY created_at ASC',
      [productId]
    );
    
    return result.rows.map(row => ({
      id: row.id,
      filename: row.filename,
      originalName: row.original_name,
      mimeType: row.mime_type,
      size: row.size,
      path: row.path,
      url: row.url,
      productId: row.product_id,
      type: row.type,
      createdAt: row.created_at
    }));
  }
  
  async deleteFile(id: number): Promise<boolean> {
    // Get file info before deleting
    const fileResult = await db.query('SELECT * FROM uploaded_files WHERE id = $1', [id]);
    if (fileResult.rows.length === 0) return false;
    
    const file = fileResult.rows[0];
    
    // Delete from database
    const result = await db.query('DELETE FROM uploaded_files WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return false;
    
    // Delete file from filesystem if it exists
    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      // Continue even if file deletion fails
    }
    
    return true;
  }
  
  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const result = await db.query(
      `INSERT INTO notifications 
       (user_id, type, title, message, is_read, related_entity_id, email_sent, sms_sent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        notification.userId,
        notification.type,
        notification.title,
        notification.message,
        notification.isRead || false,
        notification.relatedEntityId || null,
        notification.emailSent || false,
        notification.smsSent || false
      ]
    );
    
    const row = result.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      type: row.type,
      title: row.title,
      message: row.message,
      isRead: row.is_read,
      relatedEntityId: row.related_entity_id,
      emailSent: row.email_sent,
      smsSent: row.sms_sent,
      createdAt: row.created_at
    };
  }
  
  async getUserNotifications(userId: number): Promise<Notification[]> {
    const result = await db.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    
    return result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      type: row.type,
      title: row.title,
      message: row.message,
      isRead: row.is_read,
      relatedEntityId: row.related_entity_id,
      emailSent: row.email_sent,
      smsSent: row.sms_sent,
      createdAt: row.created_at
    }));
  }
  
  async getNotification(id: number): Promise<Notification | undefined> {
    const result = await db.query('SELECT * FROM notifications WHERE id = $1', [id]);
    if (result.rows.length === 0) return undefined;
    
    const row = result.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      type: row.type,
      title: row.title,
      message: row.message,
      isRead: row.is_read,
      relatedEntityId: row.related_entity_id,
      emailSent: row.email_sent,
      smsSent: row.sms_sent,
      createdAt: row.created_at
    };
  }
  
  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const result = await db.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) return undefined;
    
    const row = result.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      type: row.type,
      title: row.title,
      message: row.message,
      isRead: row.is_read,
      relatedEntityId: row.related_entity_id,
      emailSent: row.email_sent,
      smsSent: row.sms_sent,
      createdAt: row.created_at
    };
  }
  
  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    await db.query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1',
      [userId]
    );
    return true;
  }
  
  async deleteNotification(id: number): Promise<boolean> {
    const result = await db.query('DELETE FROM notifications WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  }
}