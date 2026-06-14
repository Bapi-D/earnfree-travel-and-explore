import { Star, MapPin } from "lucide-react";

export interface DashboardPackageCardProps {
  id: string;
  title: string;
  location: string;
  image: string;
  price: number;
  rating: number;
  duration: string;
}

export function DashboardPackageCard({
  id,
  title,
  location,
  image,
  price,
  rating,
  duration,
}: DashboardPackageCardProps) {
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-border shadow-soft hover:shadow-elevated transition-all">
      <div className="relative h-40 bg-muted overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-lg flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-gold text-gold" />
          <span className="text-xs font-bold text-charcoal">{rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="p-4">
        <h4 className="font-display font-bold text-sm text-charcoal line-clamp-1">
          {title}
        </h4>

        <div className="flex items-center gap-1.5 mt-2 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span className="text-xs">{location}</span>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest">
              {duration}
            </div>
            <div className="text-sm font-display font-bold text-charcoal">
              ₹{price.toLocaleString()}
            </div>
          </div>
          <button className="px-3 py-1.5 bg-linear-to-r from-primary to-[oklch(0.62_0.21_30)] text-white text-xs font-bold rounded-lg hover:shadow-elegant transition-all">
            View
          </button>
        </div>
      </div>
    </div>
  );
}
