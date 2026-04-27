import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const detections = pgTable("detections", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  englishName: text("english_name").notNull(),
  sinhalaName: text("sinhala_name").notNull(),
  confidence: integer("confidence").notNull(),
  boundingBoxes: jsonb("bounding_boxes").$type<{x: number, y: number, width: number, height: number}[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDetectionSchema = createInsertSchema(detections).omit({ 
  id: true, 
  createdAt: true 
});

export type InsertDetection = z.infer<typeof insertDetectionSchema>;
export type Detection = typeof detections.$inferSelect;
