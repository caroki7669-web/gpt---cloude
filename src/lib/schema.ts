import { pgTable, serial, text, varchar, timestamp, boolean, integer, pgEnum } from "drizzle-orm/pg-core";

export const postStatusEnum = pgEnum("post_status", ["scheduled", "published", "failed"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const facebookPages = pgTable("facebook_pages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  pageId: varchar("page_id", { length: 64 }).notNull(),
  pageName: varchar("page_name", { length: 255 }).notNull(),
  // Long-lived Page Access Token. Stored encrypted at the application layer (see lib/crypto.ts).
  pageAccessToken: text("page_access_token").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  pageId: integer("page_id").notNull().references(() => facebookPages.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  status: postStatusEnum("status").default("scheduled").notNull(),
  scheduledFor: timestamp("scheduled_for").notNull(),
  publishedAt: timestamp("published_at"),
  facebookPostId: varchar("facebook_post_id", { length: 128 }),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
