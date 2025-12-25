import { useState, useEffect } from "react";
import { format, addDays, isBefore, startOfToday } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  onDateSelect: (date: Date) => void;
  onTimeSelect: (time: string) => void;
}

interface BlockedSlot {
  slot_date: string;
  slot_time: string;
  is_available: boolean;
}

const DateTimePicker = ({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
}: DateTimePickerProps) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfToday());
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const today = startOfToday();
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  // Fetch blocked dates for the current week
  useEffect(() => {
    fetchBlockedDates();
  }, [currentWeekStart]);

  const fetchBlockedDates = async () => {
    setIsLoading(true);
    try {
      const startDate = format(currentWeekStart, "yyyy-MM-dd");
      const endDate = format(addDays(currentWeekStart, 6), "yyyy-MM-dd");

      // Get blocked slots for the week
      const { data: slots } = await supabase
        .from("time_slots")
        .select("slot_date, slot_time, is_available")
        .gte("slot_date", startDate)
        .lte("slot_date", endDate)
        .eq("is_available", false);

      // Group by date and check if all slots are blocked for a day
      const blockedByDate = new Map<string, number>();
      slots?.forEach((slot: BlockedSlot) => {
        const count = blockedByDate.get(slot.slot_date) || 0;
        blockedByDate.set(slot.slot_date, count + 1);
      });

      // Consider a date fully blocked if it has 9 or more blocked slots (full day)
      const fullyBlocked = new Set<string>();
      blockedByDate.forEach((count, date) => {
        if (count >= 9) {
          fullyBlocked.add(date);
        }
      });

      setBlockedDates(fullyBlocked);
    } catch (error) {
      console.error("Error fetching blocked dates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const goToPreviousWeek = () => {
    const newStart = addDays(currentWeekStart, -7);
    if (!isBefore(newStart, today)) {
      setCurrentWeekStart(newStart);
    }
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  const isDateSelectable = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return !isBefore(date, today) && !blockedDates.has(dateStr);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onTimeSelect(e.target.value);
  };

  return (
    <div className="space-y-6">
      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={goToPreviousWeek}
          disabled={isBefore(addDays(currentWeekStart, -1), today)}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <span className="font-semibold text-foreground">
          {format(currentWeekStart, "MMMM yyyy", { locale: fr })}
        </span>
        <Button type="button" variant="ghost" size="icon" onClick={goToNextWeek}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const isSelected = selectedDate && format(selectedDate, "yyyy-MM-dd") === dateStr;
          const isPast = isBefore(day, today);
          const isBlocked = blockedDates.has(dateStr);
          const canSelect = !isPast && !isBlocked;

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={!canSelect}
              onClick={() => canSelect && onDateSelect(day)}
              className={cn(
                "flex flex-col items-center p-2 rounded-xl transition-all",
                (!canSelect) && "opacity-40 cursor-not-allowed",
                isBlocked && "bg-red-100 dark:bg-red-900/30",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-md"
                  : canSelect && "hover:bg-secondary/70 bg-secondary/30"
              )}
            >
              <span className="text-xs uppercase">
                {format(day, "EEE", { locale: fr })}
              </span>
              <span className="text-lg font-bold">{format(day, "d")}</span>
              {isBlocked && (
                <span className="text-[10px] text-red-600 dark:text-red-400">Fermé</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Time Input */}
      {selectedDate && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Choisissez votre heure préférée pour le {format(selectedDate, "d MMMM", { locale: fr })}</span>
          </div>
          
          <div className="bg-secondary/30 rounded-xl p-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Heure souhaitée *
            </label>
            <Input
              type="time"
              value={selectedTime || ""}
              onChange={handleTimeChange}
              className="h-12 rounded-xl text-lg"
              min="09:00"
              max="19:00"
              required
            />
            <p className="text-xs text-muted-foreground mt-2">
              Heures suggérées : 09:00 - 19:00. L'admin confirmera ou proposera une alternative.
            </p>
          </div>
        </div>
      )}

      {!selectedDate && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Sélectionnez une date pour choisir votre heure
        </p>
      )}
    </div>
  );
};

export default DateTimePicker;
