import {
  Product, InsertProduct,
  CartItem, InsertCartItem,
  Category, InsertCategory,
  Admin, InsertAdmin,
  CartItemWithProduct
} from "@shared/schema";
import { IStorage } from "./storage";
import { db } from "./db";

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
}