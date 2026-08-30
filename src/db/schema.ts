import { pgTable, text, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";

export const files = pgTable("files", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'document' | 'spreadsheet' | 'presentation' | 'pdf' | 'image' | 'invoice' | 'encrypted'
  content: text("content"), // text or JSON string or base64
  data: jsonb("data"), // structured object for sheets, slides, invoice items
  isFavorite: boolean("is_favorite").default(false).notNull(),
  isEncrypted: boolean("is_encrypted").default(false).notNull(),
  size: integer("size").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const templates = pgTable("templates", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(), // 'school' | 'business' | 'reports' | 'letters' | 'certificates' | 'presentation' | 'spreadsheet' | 'bills'
  type: text("type").notNull(), // 'document' | 'spreadsheet' | 'presentation' | 'invoice'
  content: text("content"),
  data: jsonb("data"),
  isCustom: boolean("is_custom").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userSettings = pgTable("user_settings", {
  id: text("id").primaryKey().default("default"),
  openRouterApiKey: text("openrouter_api_key"),
  selectedModel: text("selected_model").default("z-ai/glm-5.2:free"),
  theme: text("theme").default("dark"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
