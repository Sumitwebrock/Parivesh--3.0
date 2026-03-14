import { useMemo } from "react";
import { Loader2, Sparkles } from "lucide-react";

type DocumentInsight = {
  documentName: string;
  insights: string[];
};

type AIComplianceReport = {
  title?: string;
  generatedAt?: string;
  source?: string;
  advisoryOnly?: boolean;
  documentIssues?: string[];
  dataIssues?: string[];
  environmentalObservations?: string[];
  recommendedActions?: string[];
  verificationFocusAreas?: string[];
  documentInsights?: DocumentInsight[];
};

type Props = {
  reportRaw: string;
  loading?: boolean;
  title?: string;
  emptyHint?: string;
};

function safeParseReport(reportRaw: string): AIComplianceReport | null {
  if (!String(reportRaw || "").trim()) return null;
  try {
    const parsed = JSON.parse(reportRaw) as AIComplianceReport;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function ListSection({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="text-sm font-semibold text-gray-800">{title}</p>
      <ul className="text-sm text-gray-700 mt-1 space-y-1 list-disc pl-5">
        {items.map((item, index) => (
          <li key={`${title}-${index}-${item}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function AIComplianceReportPanel({
  reportRaw,
  loading = false,
  title = "AI Compliance Report",
  emptyHint = "AI pre-check is being prepared. Please refresh shortly.",
}: Props) {
  const report = useMemo(() => safeParseReport(reportRaw), [reportRaw]);

  return (
    <section className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-700" />
          <h3 className="text-sm font-semibold text-indigo-900">{title}</h3>
        </div>
        {report?.generatedAt ? (
          <p className="text-[11px] text-indigo-700">Generated: {new Date(report.generatedAt).toLocaleString()}</p>
        ) : null}
      </div>

      {!report ? (
        <div className="rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm text-indigo-900 flex items-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          <span>{emptyHint}</span>
        </div>
      ) : (
        <div className="space-y-3 rounded-lg border border-indigo-200 bg-white p-3">
          <ListSection title="Document Issues" items={report.documentIssues} />
          <ListSection title="Data Issues" items={report.dataIssues} />
          <ListSection title="Environmental Observations" items={report.environmentalObservations} />
          <ListSection title="Suggested Verification Focus" items={report.verificationFocusAreas} />
          <ListSection title="Recommended Actions" items={report.recommendedActions} />

          {Array.isArray(report.documentInsights) && report.documentInsights.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-800">Document Insight Summary</p>
              <div className="mt-2 space-y-2">
                {report.documentInsights.slice(0, 4).map((doc) => (
                  <div key={`${doc.documentName}-${doc.insights.join("|")}`} className="rounded border border-gray-200 p-2">
                    <p className="text-xs font-semibold text-gray-700">{doc.documentName}</p>
                    <ul className="mt-1 text-xs text-gray-700 list-disc pl-4 space-y-1">
                      {doc.insights.slice(0, 3).map((item, index) => (
                        <li key={`${doc.documentName}-${index}-${item}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.advisoryOnly !== false && (
            <p className="text-[11px] text-gray-500">Advisory only: AI output supports review and does not alter status/workflow decisions.</p>
          )}
        </div>
      )}
    </section>
  );
}
