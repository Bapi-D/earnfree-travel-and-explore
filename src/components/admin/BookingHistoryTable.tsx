import { StatusBadge } from "./StatusBadge";

export interface BookingRecord {
  id: string;
  bookingId: string;
  date: string;
  duration: string;
  amount: number;
  status: "completed" | "pending" | "cancelled" | "in_progress";
  location: string;
}

export function BookingHistoryTable({ bookings }: { bookings: BookingRecord[] }) {
  const statusMap: Record<string, string> = {
    completed: "Completed",
    pending: "Pending",
    cancelled: "Cancelled",
    in_progress: "In Progress",
  };

  return (
    <div className="rounded-2xl bg-white border border-border shadow-soft overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <h3 className="font-display font-bold text-lg text-charcoal">Booking History</h3>
        <button className="text-xs text-primary font-bold hover:underline">
          Sort by: Latest
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                DATE
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                DURATION
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                AMOUNT
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                STATUS
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bookings.slice(0, 5).map((booking) => (
              <tr key={booking.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 text-sm text-charcoal">
                  {new Date(booking.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  })}
                </td>
                <td className="px-6 py-4 text-sm text-charcoal">
                  <div className="w-12 text-center">
                    <span className="text-xs font-bold">
                      {booking.duration.split(" ")[0]}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-charcoal">
                  ₹{booking.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm">
                  <StatusBadge status={booking.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
