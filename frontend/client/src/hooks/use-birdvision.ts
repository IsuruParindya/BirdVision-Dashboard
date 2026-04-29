import {
  useQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";

import {
  predictImage,
  predictVideo,
  getRecentDetections,
  getDashboardStats,
  getSystemPerformance
} from "@/api";

/* =========================
   DETECTIONS
========================= */

export function useDetections() {
  return useQuery({
    queryKey: ["recent-detections"],

    queryFn: async () => {
      const data =
        await getRecentDetections();

      return data.map(
        (item: any) => ({
          id: item.id,

          englishName:
            item.english_name,

          sinhalaName:
            item.sinhala_name,

          confidence:
            item.confidence,

          imageUrl:
            item.image_url,

          createdAt:
            item.created_at,

          sourceType:
            item.source_type
        })
      );
    },

    refetchInterval: 3000,
    refetchOnWindowFocus: true,
    staleTime: 0
  });
}

/* =========================
   DASHBOARD STATS
========================= */

export function useStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],

    queryFn: async () => {
      return await getDashboardStats();
    },

    refetchInterval: 3000,
    refetchOnWindowFocus: true,
    staleTime: 0
  });
}

/* =========================
   ANALYTICS
========================= */

export function useAnalytics() {
  return useQuery({
    queryKey: ["system-performance"],

    queryFn: async () => {
      return await getSystemPerformance();
    },

    refetchInterval: 3000,
    refetchOnWindowFocus: true,
    staleTime: 0
  });
}

/* =========================
   UPLOAD MEDIA
========================= */

export function useUploadMedia() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: async (
      file: File
    ) => {
      if (
        file.type.startsWith(
          "video"
        )
      ) {
        return await predictVideo(
          file
        );
      }

      return await predictImage(
        file
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "recent-detections"
        ]
      });

      queryClient.invalidateQueries({
        queryKey: [
          "dashboard-stats"
        ]
      });

      queryClient.invalidateQueries({
        queryKey: [
          "system-performance"
        ]
      });
    }
  });
}