import { MapPin, TrendingUp } from "lucide-react";

export interface TopDestination {
  id: string;
  name: string;
  bookings: number;
  trend: number;
  image: string;
}

export function TopDestinationsWidget({ destinations }: { destinations: TopDestination[] }) {
  return (
    <div className="rounded-2xl bg-white border border-border shadow-soft p-6">
      <h3 className="font-display font-bold text-charcoal mb-6">Top Destinations</h3>

      <div className="space-y-4">
        {destinations.slice(0, 3).map((dest, idx) => (
          <div key={dest.id} className="flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-lg overflow-hidden shrink-0 bg-muted">
              <img
                src={dest.image}
                alt={dest.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-charcoal text-sm">{dest.name}</h4>
              <p className="text-xs text-muted-foreground">{dest.bookings} Bookings</p>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                <TrendingUp className="h-3 w-3" />
                {dest.trend}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
