interface StatusBadgeProps {
  status: string;
  type?: "default" | "success" | "warning" | "error" | "info";
}

export function StatusBadge({ status, type = "default" }: StatusBadgeProps) {
  const colorClasses = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-orange-100 text-orange-700",
    error: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
  };

  const statusColorMap: Record<string, string> = {
    "Under Scrutiny": "info",
    "EDS Raised": "warning",
    Verified: "success",
    Referred: "info",
    "MoM Generated": "success",
    Scheduled: "info",
    Completed: "success",
    "MoM Finalized": "default",
    Active: "success",
    Draft: "default",
    Submitted: "info",
    Finalized: "success",
  };

  const colorType = statusColorMap[status] || type;

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${colorClasses[colorType]}`}
    >
      {status}
    </span>
  );
}
