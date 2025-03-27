import { pgTable, text, serial, integer, boolean, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Create category enum
export const categoryEnum = pgEnum('category', [
  'frock',
  'lehenga',
  'kurta',
  'net',
  'cutpiece'
]);

// Media type enum for product media
export const mediaTypeEnum = pgEnum('media_type', [
  'image',
  'video'
]);

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // price in cents
  imageUrl: text("image_url").notNull(), // Main featured image URL
  mediaFiles: jsonb("media_files").default([]).notNull(), // Array of additional media files
  category: categoryEnum("category").notNull(),
  stock: integer("stock").notNull().default(0),
  isFeatured: boolean("is_featured").default(false),
  isActive: boolean("is_active").default(true),
  sku: text("sku").notNull(),
});

// Categories table for additional category information
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  productCount: integer("product_count").default(0),
});

// Cart items table
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  cartId: text("cart_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
});

// Admins table for authentication
export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  role: text("role").default("user"),
});

// Create Zod schemas for validation
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true });
export const insertAdminSchema = createInsertSchema(admins).omit({ id: true });

// Create types based on the schema
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;

// Define media file type
export type MediaFile = {
  id: string;
  url: string;
  type: 'image' | 'video';
  title?: string;
  isPrimary?: boolean;
};

// Additional types for application logic
export type CartItemWithProduct = CartItem & {
  product: Product;
};

export type CategoryWithCount = {
  id: number;
  name: string;
  description: string | null;
  productCount: number;
};
