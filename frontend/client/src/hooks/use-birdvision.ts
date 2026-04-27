import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useDetections() {
  return useQuery({
    queryKey: [api.detections.list.path],
    queryFn: async () => {
      const res = await fetch(api.detections.list.path, { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch detections');
      const data = await res.json();
      return parseWithLogging(api.detections.list.responses[200], data, "detections.list");
    },
  });
}

export function useStats() {
  return useQuery({
    queryKey: [api.stats.get.path],
    queryFn: async () => {
      const res = await fetch(api.stats.get.path, { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      return parseWithLogging(api.stats.get.responses[200], data, "stats.get");
    },
  });
}

export function useAnalytics() {
  return useQuery({
    queryKey: [api.analytics.get.path],
    queryFn: async () => {
      const res = await fetch(api.analytics.get.path, { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const data = await res.json();
      return parseWithLogging(api.analytics.get.responses[200], data, "analytics.get");
    },
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('media', file);
      
      const res = await fetch(api.upload.media.path, {
        method: api.upload.media.method,
        body: formData,
        credentials: "include",
      });
      
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      return parseWithLogging(api.upload.media.responses[200], data, "upload.media");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.detections.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.stats.get.path] });
    }
  });
}
