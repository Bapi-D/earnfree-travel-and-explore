export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    solved: "bg-emerald-100 text-emerald-700",
    completed: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    bypassed: "bg-blue-100 text-blue-700",
    admin_review: "bg-primary/10 text-primary",
    in_progress: "bg-indigo-100 text-indigo-700",
    cancelled: "bg-red-100 text-red-700",
  };
  const labels: Record<string, string> = {
    solved: "Solved",
    completed: "Completed",
    pending: "Pending",
    bypassed: "Bypass",
    admin_review: "Admin reviewed",
    in_progress: "In Progress",
    cancelled: "Cancelled",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${map[status] ?? "bg-muted text-muted-foreground"}`}
    >
      {labels[status] ?? status.replace("_", " ")}
    </span>
  );
}
