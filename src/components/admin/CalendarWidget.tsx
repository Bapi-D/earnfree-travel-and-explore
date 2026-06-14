import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 3, 1)); // April 2025

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="rounded-2xl bg-white border border-border shadow-soft p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-bold text-charcoal">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
          <div
            key={day}
            className="text-xs font-bold text-muted-foreground text-center py-2 uppercase tracking-widest"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => {
          const isToday = day === 15; // April 15 is highlighted in reference
          const isSelected = [15, 16, 17, 18, 19, 20].includes(day || 0); // Week highlighted

          return (
            <div
              key={idx}
              className={`h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                day === null
                  ? ""
                  : isToday || isSelected
                    ? "bg-primary text-white font-bold"
                    : "text-charcoal hover:bg-muted"
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
