import { MapPin, Heart } from "lucide-react";

export interface UpcomingTrip {
  id: string;
  destination: string;
  date: string;
  image: string;
}

export function UpcomingTripsWidget({ trips }: { trips: UpcomingTrip[] }) {
  return (
    <div className="rounded-2xl bg-white border border-border shadow-soft p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-bold text-charcoal">Upcoming Trips</h3>
        <button className="text-xs text-primary font-bold hover:underline">View All</button>
      </div>

      <div className="space-y-3">
        {trips.slice(0, 3).map((trip) => (
          <div key={trip.id} className="flex gap-3 p-3 rounded-xl hover:bg-muted transition-colors cursor-pointer">
            <div className="relative h-12 w-12 rounded-lg overflow-hidden shrink-0 bg-muted">
              <img
                src={trip.image}
                alt={trip.destination}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-charcoal line-clamp-1">
                {trip.destination}
              </h4>
              <p className="text-xs text-muted-foreground">
                {new Date(trip.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <button className="text-muted-foreground hover:text-primary transition-colors shrink-0">
              <Heart className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
