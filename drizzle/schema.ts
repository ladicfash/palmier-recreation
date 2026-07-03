import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// TODO: Add your tables here

/**
 * Projects table - stores video editing projects
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  duration: int("duration").default(0),
  videoUrl: varchar("videoUrl", { length: 512 }),
  videoKey: varchar("videoKey", { length: 512 }),
  thumbnail: varchar("thumbnail", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Clips table - stores individual clips/segments within a project
 */
export const clips = mysqlTable("clips", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  startTime: int("startTime").notNull(),
  endTime: int("endTime").notNull(),
  type: mysqlEnum("type", ["video", "audio", "text"]).notNull(),
  opacity: int("opacity").default(100),
  speed: int("speed").default(100),
  textContent: text("textContent"),
  textColor: varchar("textColor", { length: 7 }).default("#ffffff"),
  textSize: int("textSize").default(16),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Clip = typeof clips.$inferSelect;
export type InsertClip = typeof clips.$inferInsert;

/**
 * Captions table - stores auto-generated captions
 */
export const captions = mysqlTable("captions", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull().references(() => projects.id, { onDelete: "cascade" }),
  startTime: int("startTime").notNull(),
  endTime: int("endTime").notNull(),
  text: text("text").notNull(),
  language: varchar("language", { length: 10 }).default("en"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Caption = typeof captions.$inferSelect;
export type InsertCaption = typeof captions.$inferInsert;

/**
 * Scene detections table - stores AI-detected scenes
 */
export const sceneDetections = mysqlTable("sceneDetections", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull().references(() => projects.id, { onDelete: "cascade" }),
  timestamp: int("timestamp").notNull(),
  confidence: int("confidence").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SceneDetection = typeof sceneDetections.$inferSelect;
export type InsertSceneDetection = typeof sceneDetections.$inferInsert;
