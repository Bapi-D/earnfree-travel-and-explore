import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  subject: string;
  timestamp: string;
  avatar?: string;
}

export function RecentActivityWidget({ activities }: { activities: ActivityItem[] }) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="rounded-2xl bg-white border border-border shadow-soft p-6">
      <h3 className="font-display font-bold text-charcoal mb-6">Recent Activity</h3>

      <div className="space-y-3">
        {activities.slice(0, 5).map((activity) => (
          <div key={activity.id} className="flex gap-3 pb-3 border-b border-border last:border-0">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {getInitials(activity.user)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-charcoal">
                <span className="font-bold">{activity.user}</span>
                <span className="text-muted-foreground"> {activity.action} </span>
                <span className="font-bold text-primary">{activity.subject}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(activity.timestamp).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
