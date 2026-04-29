import {
  Trash2,
  Bird
} from "lucide-react";

type Props = {
  title: string;
  detections: any[];
  detectionsLoading: boolean;
  getBoth: (
    eVal: string,
    sVal: string
  ) => string;
  e: any;
  s: any;
  handleDelete: (
    id: string
  ) => void;
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
  return (
    <div className="bg-white rounded-3xl border border-border/50 overflow-hidden">

      {/* SECTION TITLE */}
      <div className="p-6 border-b border-border/50">
        <h2 className="text-2xl font-bold">
          {title}
        </h2>
      </div>

      {/* LOADING */}
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
          {detections.map(
            (item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-6 border-b border-border/30 last:border-b-0"
              >
                <div className="flex items-center gap-4">

                  {/* ICON */}
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Bird className="text-primary" />
                  </div>

                  {/* DETAILS */}
                  <div>
                    <h3 className="font-bold text-lg">
                      {item.englishName}
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      {item.sinhalaName}
                    </p>

                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">

                      {/* DATE */}
                      <span>
                        {new Date(
                          item.createdAt
                        ).toLocaleString()}
                      </span>

                      {/* TYPE */}
                      <span className="capitalize">
                        {item.sourceType}
                      </span>

                      {/* CONFIDENCE */}
                      <span>
                        {item.confidence <= 1
                          ? Math.round(
                              item.confidence * 100
                            )
                          : Math.round(
                              item.confidence
                            )}
                        %
                      </span>
                    </div>
                  </div>
                </div>

                {/* DELETE BUTTON */}
                <button
                  onClick={() =>
                    handleDelete(
                      item.id
                    )
                  }
                  className="text-red-500 hover:text-red-700 transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}