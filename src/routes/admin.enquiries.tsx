import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Download, Loader2, Search, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ENQUIRY_STATUSES, deleteFirestoreEnquiry, getFirestoreEnquiries, updateFirestoreEnquiryStatus } from "@/lib/firebase-data";

export const Route = createFileRoute("/admin/enquiries")({ component: EnquiriesPage });

function EnquiriesPage() {
  const queryClient = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-enquiries"],
    queryFn: () => getFirestoreEnquiries(),
    retry: false,
  });

  const [status, setStatus] = useState<string>("all");
  const [q, setQ] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return data.filter(
      (e) =>
        (status === "all" || e.status === status) &&
        (!q ||
          [e.customer_name, e.email, e.destination, e.phone].some((v) =>
            v?.toLowerCase().includes(q.toLowerCase()),
          )),
    );
  }, [data, status, q]);

  const exportExcel = () => {
    const rows = filtered.map((e) => ({
      Name: e.customer_name,
      Email: e.email,
      Phone: e.phone,
      Destination: e.destination,
      Travelers: e.travelers ?? "",
      "Travel Date": e.travel_date ?? "",
      Status: e.status,
      Message: e.message ?? "",
      "Created At": new Date(e.created_at).toLocaleString(),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Enquiries");
    XLSX.writeFile(wb, `earnfree-enquiries-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const changeStatus = async (id: string, nextStatus: string) => {
    setSavingId(id);
    try {
      await updateFirestoreEnquiryStatus(id, nextStatus as Parameters<typeof updateFirestoreEnquiryStatus>[1]);
      await queryClient.invalidateQueries({ queryKey: ["admin-enquiries"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    } finally {
      setSavingId(null);
    }
  };

  const deleteEnquiry = async (id: string, customerName: string) => {
    const confirmed = window.confirm(`Delete enquiry from ${customerName}? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await deleteFirestoreEnquiry(id);
      await queryClient.invalidateQueries({ queryKey: ["admin-enquiries"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-charcoal">Enquiries</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All leads across staff and admin review queue.
          </p>
        </div>
        <Button
          onClick={exportExcel}
          className="bg-gradient-to-r from-gold to-orange-500 text-charcoal font-semibold"
        >
          <Download className="h-4 w-4 mr-2" /> Export Excel
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name, email, destination…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="solved">Solved</SelectItem>
            <SelectItem value="bypassed">Bypassed</SelectItem>
            <SelectItem value="admin_review">Admin reviewed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl bg-card border border-border shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Customer</th>
                  <th className="text-left px-4 py-3">Destination</th>
                  <th className="text-left px-4 py-3">Contact</th>
                  <th className="text-left px-4 py-3">Message</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Update</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 w-40 rounded bg-secondary" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-32 rounded bg-secondary" /></td>
                    <td className="px-4 py-3"><div className="h-3 w-28 rounded bg-secondary" /></td>
                    <td className="px-4 py-3"><div className="h-3 w-16 rounded bg-secondary" /></td>
                    <td className="px-4 py-3"><div className="h-3 w-20 rounded bg-secondary" /></td>
                    <td className="px-4 py-3"><div className="h-3 w-24 rounded bg-secondary" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Customer</th>
                  <th className="text-left px-4 py-3">Destination</th>
                  <th className="text-left px-4 py-3">Contact</th>
                  <th className="text-left px-4 py-3">Message</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Update</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-secondary/40">
                    <td className="px-4 py-3 font-medium text-charcoal">{e.customer_name || e.email || "Unknown customer"}</td>
                    <td className="px-4 py-3">{e.destination}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      <div>{e.email}</div>
                      <div>{e.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[320px]">
                      <div className="line-clamp-2 break-words">
                        {e.message || "No message provided"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={e.status} />
                    </td>
                    <td className="px-4 py-3 min-w-[180px]">
                      <Select
                        value={e.status}
                        onValueChange={(next) => changeStatus(e.id, next)}
                        disabled={savingId === e.id}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Update status" />
                        </SelectTrigger>
                        <SelectContent>
                          {ENQUIRY_STATUSES.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(e.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteEnquiry(e.id, e.customer_name || e.email || e.phone || "this enquiry")}
                        disabled={deletingId === e.id}
                        aria-label={`Delete enquiry for ${e.customer_name || e.email || e.phone || "customer"}`}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        {deletingId === e.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                      No enquiries match.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
