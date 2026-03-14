import { useEffect, useState } from "react";
import { X, Clock, Loader2, AlertCircle } from "lucide-react";

export type StatusHistoryEntry = {
  status: string;
  comment: string;
  created_by: string;
  created_at: string;
};

type Props = {
  applicationId: number;
  applicationRef: string;
  onClose: () => void;
  fetchHistory: (id: number) => Promise<StatusHistoryEntry[]>;
};

const statusColors: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-700",
  Submitted: "bg-blue-100 text-blue-700",
  "Under Scrutiny": "bg-yellow-100 text-yellow-800",
  EDS: "bg-red-100 text-red-700",
  Referred: "bg-purple-100 text-purple-700",
  MoMGenerated: "bg-teal-100 text-teal-700",
  Finalized: "bg-green-100 text-green-700",
};

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}

export function StatusHistoryModal({ applicationId, applicationRef, onClose, fetchHistory }: Props) {
  const [history, setHistory] = useState<StatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchHistory(applicationId)
      .then((rows) => { if (!cancelled) setHistory(rows); })
      .catch((e: unknown) => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load history."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [applicationId, fetchHistory]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h3 className="font-semibold text-lg">Status History</h3>
            <p className="text-xs text-gray-500 mt-0.5 font-mono">{applicationRef}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading && (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
          {!loading && !error && history.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-8">No history recorded yet.</p>
          )}
          {!loading && !error && history.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase bg-gray-50">
                    <th className="px-3 py-2 rounded-tl-lg">#</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Changed By</th>
                    <th className="px-3 py-2">Date & Time</th>
                    <th className="px-3 py-2 rounded-tr-lg">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((h, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-3 py-2.5 text-gray-400">{i + 1}</td>
                      <td className="px-3 py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[h.status] ?? "bg-gray-100 text-gray-700"}`}>
                          {h.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-700 font-mono text-xs">{h.created_by || "—"}</td>
                      <td className="px-3 py-2.5 text-gray-500 text-xs whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {fmt(h.created_at)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-600 text-xs max-w-xs">{h.comment || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="p-4 border-t">
          <button
            onClick={onClose}
            className="w-full border border-gray-300 rounded-lg py-2 text-sm font-medium hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
