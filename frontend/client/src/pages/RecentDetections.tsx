import { Trash2, Bird } from "lucide-react";

type Props = {
  title: string;
  detections: any[];
  detectionsLoading: boolean;
  getBoth: (eVal: string, sVal: string) => string;
  e: any;
  s: any;
  handleDelete: (id: string) => void;
};

export default function RecentDetections({
  title,
  detections,
  detectionsLoading,
  getBoth,
  e,
  s,
  handleDelete
}: Props) {
  const getTimeAgo = (dateString: string) => {
    const diff =
      new Date().getTime() -
      new Date(dateString).getTime();

    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} minute${mins > 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days === 1) return "Yesterday";

    return `${days} days ago`;
  };

  return (
    <div className="bg-white rounded-3xl border border-border/50 overflow-hidden">

      <div className="p-6 border-b border-border/50">
        <h2 className="text-2xl font-bold">
          {title}
        </h2>
      </div>

      {detectionsLoading ? (
        <div className="p-6 text-muted-foreground">
          Loading...
        </div>
      ) : detections.length === 0 ? (
        <div className="p-6 text-muted-foreground">
          No detections found
        </div>
      ) : (
        <div>
          {detections.map((item: any) => {
            const confidence =
              item.confidence <= 1
                ? Math.round(item.confidence * 100)
                : Math.round(item.confidence);

            const isVideo =
              item.sourceType === "video";

            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-6 border-b border-border/30 last:border-b-0"
              >
                <div className="flex items-center gap-4">

                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Bird className="text-primary" />
                  </div>

                  <div>
                    <h3 className="font-bold text-lg">
                      {getBoth(
                        item.englishName,
                        item.sinhalaName
                      )}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">

                      <span>
                        {getTimeAgo(item.createdAt)}
                      </span>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          isVideo
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {item.sourceType.toUpperCase()}
                      </span>

                      <div className="flex items-center gap-2 min-w-[140px]">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{
                              width: `${confidence}%`
                            }}
                          />
                        </div>

                        <span className="text-sm font-medium">
                          {confidence}%
                        </span>
                      </div>

                    </div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    handleDelete(item.id)
                  }
                  className="text-red-500 hover:text-red-700 transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}