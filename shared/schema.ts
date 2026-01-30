import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Tabla de leads/clientes
export const leads = pgTable("leads", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull(),
  client_name: text("client_name").notNull(),
  client_phone: text("client_phone").notNull(),
  comment: text("comment"),
  property_id: varchar("property_id").notNull(),
  seller_id: varchar("seller_id"),
  status: text("status").default("active"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  request_id: varchar("request_id"),
});

// Tabla de fases de leads
export const lead_phase = pgTable("lead_phase", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  lead_id: varchar("lead_id")
    .notNull()
    .references(() => leads.id),
  lead_status: text("lead_status").notNull(),
  phase_data: jsonb("phase_data"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Tabla de historial de leads
export const lead_history = pgTable("lead_history", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  lead_phase_id: varchar("lead_phase_id")
    .notNull()
    .references(() => lead_phase.id),
  history_data: jsonb("history_data").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// Tabla de propiedades favoritas del usuario
export const user_favorites = pgTable(
  "user_favorites",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    user_id: varchar("user_id").notNull(),
    property_id: varchar("property_id").notNull(),
    created_at: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    unique: sql`unique(${table.user_id}, ${table.property_id})`,
  }),
);

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type Lead = typeof leads.$inferSelect;
export type LeadPhase = typeof lead_phase.$inferSelect;
export type LeadHistory = typeof lead_history.$inferSelect;
export type UserFavorite = typeof user_favorites.$inferSelect;
