import { z } from 'zod';
import { insertDetectionSchema, detections } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  detections: {
    list: {
      method: 'GET' as const,
      path: '/api/detections' as const,
      responses: {
        200: z.array(z.custom<typeof detections.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/detections' as const,
      input: insertDetectionSchema,
      responses: {
        201: z.custom<typeof detections.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  stats: {
    get: {
      method: 'GET' as const,
      path: '/api/stats' as const,
      responses: {
        200: z.object({
          totalDetections: z.number(),
          speciesIdentified: z.number(),
          averageConfidence: z.number(),
          mostDetectedBird: z.string()
        })
      }
    }
  },
  analytics: {
    get: {
      method: 'GET' as const,
      path: '/api/analytics' as const,
      responses: {
        200: z.object({
          accuracyData: z.array(z.object({
            date: z.string(),
            accuracy: z.number()
          })),
          speciesData: z.array(z.object({
            name: z.string(),
            count: z.number()
          }))
        })
      }
    }
  },
  upload: {
    media: {
      method: 'POST' as const,
      path: '/api/upload' as const,
      // Input is FormData, handled in the handler directly
      responses: {
        200: z.object({
          url: z.string(),
          detections: z.array(z.object({
            englishName: z.string(),
            sinhalaName: z.string(),
            confidence: z.number(),
            boundingBoxes: z.array(z.object({
              x: z.number(),
              y: z.number(),
              width: z.number(),
              height: z.number()
            }))
          }))
        }),
        400: errorSchemas.validation
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
