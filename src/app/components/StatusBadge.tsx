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
    purple: "bg-purple-100 text-purple-700",
    teal: "bg-teal-100 text-teal-700",
  };

  const statusColorMap: Record<string, keyof typeof colorClasses> = {
    Draft: "default",
    Submitted: "info",
    "Under Scrutiny": "warning",
    "UnderScrutiny": "warning",
    EDS: "error",
    "EDS Raised": "error",
    Referred: "purple",
    MoMGenerated: "teal",
    "MoM Generated": "teal",
    Finalized: "success",
    "MoM Finalized": "success",
    Verified: "success",
    Scheduled: "info",
    Completed: "success",
    Active: "success",
  };

  const colorType = statusColorMap[status] ?? type;

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${colorClasses[colorType] ?? colorClasses.default}`}
    >
      {status}
    </span>
  );
}
