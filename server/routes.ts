import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertProductSchema, 
  insertCategorySchema, 
  insertCartItemSchema,
  insertUserSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  userLoginSchema,
  userRegisterSchema,
  checkoutSchema
} from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod-validation-error";
import { randomUUID } from "crypto";
import session from "express-session";
import MemoryStore from "memorystore";
import multer from "multer";
import path from "path";
import fs from "fs";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import Stripe from "stripe";

// Extend Express session with our custom properties
declare module 'express-session' {
  interface SessionData {
    isAuthenticated?: boolean;
    username?: string;
    userId?: number;
    isAdmin?: boolean;
    cartId?: string;
  }
}

// Set up scrypt for password hashing
const scryptAsync = promisify(scrypt);

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: storage_config,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept images and videos only
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images and videos are allowed"));
    }
  },
});

// Password hashing functions
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const SessionStore = MemoryStore(session);

  // Configure session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "fabric-haven-secret",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Middleware to check if user is authenticated and is admin
  const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.session && req.session.isAuthenticated) {
      const username = req.session.username as string;
      // Check if the user is the designated admin (with email deshmukhzishan06@gmail.com)
      storage.getAdminByUsername(username).then(admin => {
        if (admin && admin.email === 'deshmukhzishan06@gmail.com' && admin.role === 'admin') {
          return next();
        } else {
          return res.status(403).json({ message: "Access forbidden. Admin privileges required." });
        }
      }).catch(error => {
        return res.status(500).json({ message: "Error verifying admin status" });
      });
    } else {
      return res.status(401).json({ message: "Unauthorized" });
    }
  };

  // Generate cart ID if not exists
  app.use((req, res, next) => {
    if (!req.session.cartId) {
      req.session.cartId = randomUUID();
    }
    next();
  });

  // PRODUCT ENDPOINTS

  // Get all products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Get product by ID
  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const product = await storage.getProductById(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Get products by category
  app.get("/api/products/category/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const products = await storage.getProductsByCategory(category);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products by category" });
    }
  });

  // Search products
  app.get("/api/products/search/:query", async (req, res) => {
    try {
      const query = req.params.query;
      const products = await storage.searchProducts(query);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to search products" });
    }
  });

  // Create product (admin only)
  app.post("/api/products", isAuthenticated, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid product data",
          errors: error.errors,
        });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // Update product (admin only)
  app.put("/api/products/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, productData);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid product data",
          errors: error.errors,
        });
      }
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  // Delete product (admin only)
  app.delete("/api/products/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const success = await storage.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // CATEGORY ENDPOINTS

  // Get all categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Get category by ID
  app.get("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      const category = await storage.getCategoryById(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  // Create category (admin only)
  app.post("/api/categories", isAuthenticated, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid category data",
          errors: error.errors,
        });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Update category (admin only)
  app.put("/api/categories/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      const categoryData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, categoryData);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid category data",
          errors: error.errors,
        });
      }
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  // Delete category (admin only)
  app.delete("/api/categories/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      const success = await storage.deleteCategory(id);
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // CART ENDPOINTS

  // Get cart items
  app.get("/api/cart", async (req, res) => {
    try {
      const cartId = req.session.cartId;
      if (!cartId) {
        return res.status(400).json({ message: "Cart ID not found" });
      }

      const cartItems = await storage.getCartItems(cartId);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });

  // Add item to cart
  app.post("/api/cart", async (req, res) => {
    try {
      const cartId = req.session.cartId;
      if (!cartId) {
        return res.status(400).json({ message: "Cart ID not found" });
      }

      const cartItemData = insertCartItemSchema.parse({ ...req.body, cartId });
      const cartItem = await storage.addToCart(cartItemData);
      res.status(201).json(cartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid cart item data",
          errors: error.errors,
        });
      }
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });

  // Update cart item quantity
  app.put("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid cart item ID" });
      }

      const { quantity } = req.body;
      if (typeof quantity !== "number") {
        return res.status(400).json({ message: "Invalid quantity" });
      }

      const cartItem = await storage.updateCartItem(id, quantity);
      if (!cartItem && quantity > 0) {
        return res.status(404).json({ message: "Cart item not found" });
      }

      res.json(cartItem || { message: "Item removed from cart" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  // Remove item from cart
  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid cart item ID" });
      }

      const success = await storage.removeFromCart(id);
      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }

      res.json({ message: "Item removed from cart" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove item from cart" });
    }
  });

  // Clear cart
  app.delete("/api/cart", async (req, res) => {
    try {
      const cartId = req.session.cartId;
      if (!cartId) {
        return res.status(400).json({ message: "Cart ID not found" });
      }

      await storage.clearCart(cartId);
      res.json({ message: "Cart cleared successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Get product with all files (for product details page)
  app.get("/api/products/:id/details", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const product = await storage.getProductWithFiles(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product details" });
    }
  });

  // FILE UPLOAD ENDPOINTS

  // Upload file for a product (admin only)
  app.post("/api/upload/product/:id", isAuthenticated, upload.single("file"), async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const product = await storage.getProductById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Determine file type from mimetype
      let fileType = "image"; // Default to image
      if (req.file.mimetype.startsWith("video/")) {
        fileType = "video";
      }

      // Create file record
      const fileData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        url: `/uploads/${req.file.filename}`,
        productId: productId,
        type: fileType as "image" | "video"
      };

      const file = await storage.uploadFile(fileData);

      res.status(201).json(file);
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });
  
  // Upload multiple files for a product (admin only)
  app.post("/api/upload/product/:id/multiple", isAuthenticated, upload.array("files", 10), async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const product = await storage.getProductById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const uploadedFiles = [];

      // Process each uploaded file
      for (const file of files) {
        // Determine file type from mimetype
        let fileType = "image"; // Default to image
        if (file.mimetype.startsWith("video/")) {
          fileType = "video";
        }

        // Create file record
        const fileData = {
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          path: file.path,
          url: `/uploads/${file.filename}`,
          productId: productId,
          type: fileType as "image" | "video"
        };

        const uploadedFile = await storage.uploadFile(fileData);
        uploadedFiles.push(uploadedFile);
      }

      res.status(201).json(uploadedFiles);
    } catch (error) {
      console.error("Multiple file upload error:", error);
      res.status(500).json({ message: "Failed to upload files" });
    }
  });

  // Get files for a product
  app.get("/api/files/product/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const files = await storage.getFilesByProductId(productId);
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product files" });
    }
  });

  // Delete file (admin only)
  app.delete("/api/files/:id", isAuthenticated, async (req, res) => {
    try {
      const fileId = parseInt(req.params.id);
      if (isNaN(fileId)) {
        return res.status(400).json({ message: "Invalid file ID" });
      }

      const success = await storage.deleteFile(fileId);
      if (!success) {
        return res.status(404).json({ message: "File not found" });
      }

      res.json({ message: "File deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete file" });
    }
  });

  // Serve uploaded files
  app.use("/uploads", (req, res, next) => {
    const options = {
      root: uploadsDir,
      dotfiles: "deny" as "deny" | "allow" | "ignore",
      headers: {
        "x-timestamp": Date.now(),
        "x-sent": true,
      },
    };

    const fileName = req.path.replace(/^\/+/, "");
    res.sendFile(fileName, options, (err) => {
      if (err) {
        next(err);
      }
    });
  });

  // USER MANAGEMENT ENDPOINTS

  // Register a new user
  app.post("/api/users/register", async (req, res) => {
    try {
      const userData = userRegisterSchema.parse(req.body);
      
      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(409).json({ message: "Email already exists" });
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);
      
      // Create user
      const user = await storage.createUser({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
      });

      // Set session for automatic login
      req.session.isAuthenticated = true;
      req.session.username = user.username;
      req.session.userId = user.id;
      req.session.isAdmin = false;

      // Return user data without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid user data",
          errors: error.errors,
        });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // User login
  app.post("/api/users/login", async (req, res) => {
    try {
      const { username, password } = userLoginSchema.parse(req.body);
      
      // Try to find user by username
      let user = await storage.getUserByUsername(username);
      
      // If not found, try by email
      if (!user) {
        user = await storage.getUserByEmail(username);
      }
      
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Check password
      const passwordValid = await comparePasswords(password, user.password);
      if (!passwordValid) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Set session
      req.session.isAuthenticated = true;
      req.session.username = user.username;
      req.session.userId = user.id;
      req.session.isAdmin = false;
      
      // Also check if this is our special admin user
      const admin = await storage.getAdminByUsername(user.username);
      const isAdminUser = admin && admin.email === 'deshmukhzishan06@gmail.com' && admin.role === 'admin';
      if (isAdminUser) {
        req.session.isAdmin = true;
      }

      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;
      res.json({ 
        ...userWithoutPassword,
        isAdmin: isAdminUser
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid login data",
          errors: error.errors,
        });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Get current user
  app.get("/api/users/me", async (req, res) => {
    try {
      if (!req.session.isAuthenticated || !req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if this is our special admin user
      const admin = await storage.getAdminByUsername(user.username);
      const isAdminUser = admin && admin.email === 'deshmukhzishan06@gmail.com' && admin.role === 'admin';
      
      // Return user data without password
      const { password, ...userWithoutPassword } = user;
      res.json({
        ...userWithoutPassword,
        isAdmin: isAdminUser
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user data" });
    }
  });

  // Update user profile
  app.put("/api/users/me", async (req, res) => {
    try {
      if (!req.session.isAuthenticated || !req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userData = insertUserSchema.partial().parse(req.body);
      
      // Don't allow password updates through this endpoint for security
      if (userData.password) {
        delete userData.password;
      }
      
      const updatedUser = await storage.updateUser(req.session.userId, userData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user data without password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid user data",
          errors: error.errors,
        });
      }
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  // Change password
  app.post("/api/users/change-password", async (req, res) => {
    try {
      if (!req.session.isAuthenticated || !req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { currentPassword, newPassword, confirmPassword } = req.body;
      
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: "All password fields are required" });
      }
      
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "New passwords do not match" });
      }
      
      // Check current password
      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const passwordValid = await comparePasswords(currentPassword, user.password);
      if (!passwordValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      
      // Hash and update new password
      const hashedPassword = await hashPassword(newPassword);
      const updatedUser = await storage.updateUser(user.id, { password: hashedPassword });
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // ORDER ENDPOINTS

  // Create an order
  app.post("/api/orders", async (req, res) => {
    try {
      // Check if user is logged in
      if (!req.session.isAuthenticated || !req.session.userId) {
        return res.status(401).json({ message: "You must be logged in to place an order" });
      }
      
      // Validate checkout data
      const checkoutData = checkoutSchema.parse(req.body);
      
      // Get cart items
      const cartId = req.session.cartId;
      if (!cartId) {
        return res.status(400).json({ message: "Cart ID not found" });
      }
      
      const cartItems = await storage.getCartItems(cartId);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Your cart is empty" });
      }
      
      // Calculate total amount
      const totalAmount = cartItems.reduce((sum, item) => 
        sum + item.product.price * item.quantity, 0);
      
      // Create order
      const order = await storage.createOrder({
        userId: req.session.userId,
        totalAmount,
        paymentMethod: checkoutData.paymentMethod,
        shippingAddress: checkoutData.address,
        shippingCity: checkoutData.city,
        shippingState: checkoutData.state,
        shippingZipCode: checkoutData.zipCode,
        shippingCountry: checkoutData.country || "India",
      });
      
      // Create order items
      for (const item of cartItems) {
        await storage.addOrderItem({
          orderId: order.id,
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        });
      }
      
      // Clear cart
      await storage.clearCart(cartId);
      
      res.status(201).json({ order, message: "Order placed successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid checkout data",
          errors: error.errors,
        });
      }
      console.error("Order creation error:", error);
      res.status(500).json({ message: "Failed to place order" });
    }
  });

  // Get user orders
  app.get("/api/orders", async (req, res) => {
    try {
      // Check if user is logged in
      if (!req.session.isAuthenticated || !req.session.userId) {
        return res.status(401).json({ message: "You must be logged in to view orders" });
      }
      
      const orders = await storage.getOrders(req.session.userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Get order details
  app.get("/api/orders/:id", async (req, res) => {
    try {
      // Check if user is logged in
      if (!req.session.isAuthenticated || !req.session.userId) {
        return res.status(401).json({ message: "You must be logged in to view order details" });
      }
      
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      
      const order = await storage.getOrderWithItems(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Ensure user can only view their own orders, unless admin
      if (order.userId !== req.session.userId && !req.session.isAdmin) {
        return res.status(403).json({ message: "You are not authorized to view this order" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order details" });
    }
  });

  // Get all orders (admin only)
  app.get("/api/admin/orders", isAuthenticated, async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Update order status (admin only)
  app.put("/api/admin/orders/:id/status", isAuthenticated, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const order = await storage.updateOrderStatus(orderId, status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // ADMIN AUTH ENDPOINTS

  // Admin login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const admin = await storage.getAdminByUsername(username);
      if (!admin || admin.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set session
      req.session.isAuthenticated = true;
      req.session.username = admin.username;
      
      // Check if this is the admin user with special privileges
      const isAdminUser = admin.email === 'deshmukhzishan06@gmail.com' && admin.role === 'admin';

      res.json({ 
        message: "Login successful", 
        username: admin.username,
        isAdmin: isAdminUser 
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logout successful" });
    });
  });

  // Check authentication status
  app.get("/api/auth/status", async (req, res) => {
    if (req.session && req.session.isAuthenticated) {
      const username = req.session.username as string;
      const admin = await storage.getAdminByUsername(username);
      const isAdminUser = admin && admin.email === 'deshmukhzishan06@gmail.com' && admin.role === 'admin';
      
      return res.json({ 
        isAuthenticated: true, 
        username: req.session.username,
        isAdmin: isAdminUser
      });
    }
    res.json({ isAuthenticated: false, isAdmin: false });
  });

  return httpServer;
}
