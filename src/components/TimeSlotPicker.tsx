import { useState, useEffect } from "react";
import { format, addDays, isBefore, startOfToday } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface TimeSlotPickerProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  onDateSelect: (date: Date) => void;
  onTimeSelect: (time: string) => void;
}

interface TimeSlot {
  id: string;
  slot_time: string;
  is_available: boolean;
}

const DEFAULT_TIME_SLOTS = [
  "09:00", "10:00", "11:00", "12:00",
  "14:00", "15:00", "16:00", "17:00", "18:00"
];

const TimeSlotPicker = ({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
}: TimeSlotPickerProps) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfToday());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const today = startOfToday();
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  useEffect(() => {
    if (selectedDate) {
      fetchTimeSlots(selectedDate);
    }
  }, [selectedDate]);

  const fetchTimeSlots = async (date: Date) => {
    setIsLoading(true);
    const dateStr = format(date, "yyyy-MM-dd");
    
    try {
      // Check existing bookings for this date
      const { data: bookings } = await supabase
        .from("bookings")
        .select("event_time")
        .eq("event_date", dateStr)
        .neq("status", "cancelled");

      const booked = new Set(
        bookings?.map((b) => b.event_time?.slice(0, 5)).filter(Boolean) || []
      );
      setBookedSlots(booked);

      // Get custom slots if any
      const { data: slots } = await supabase
        .from("time_slots")
        .select("*")
        .eq("slot_date", dateStr);

      if (slots && slots.length > 0) {
        setAvailableSlots(slots);
      } else {
        // Use default slots
        setAvailableSlots(
          DEFAULT_TIME_SLOTS.map((time) => ({
            id: time,
            slot_time: time,
            is_available: true,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
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
    return !isBefore(date, today);
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
          const isSelected = selectedDate && format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
          const isPast = isBefore(day, today);
          
          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={isPast}
              onClick={() => isDateSelectable(day) && onDateSelect(day)}
              className={cn(
                "flex flex-col items-center p-2 rounded-xl transition-all",
                isPast && "opacity-40 cursor-not-allowed",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "hover:bg-secondary/70 bg-secondary/30"
              )}
            >
              <span className="text-xs uppercase">
                {format(day, "EEE", { locale: fr })}
              </span>
              <span className="text-lg font-bold">{format(day, "d")}</span>
            </button>
          );
        })}
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Créneaux disponibles pour le {format(selectedDate, "d MMMM", { locale: fr })}</span>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {availableSlots.map((slot) => {
                const timeStr = slot.slot_time.slice(0, 5);
                const isBooked = bookedSlots.has(timeStr);
                const isSelected = selectedTime === timeStr;
                const isAvailable = slot.is_available && !isBooked;

                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => isAvailable && onTimeSelect(timeStr)}
                    className={cn(
                      "py-3 px-4 rounded-xl text-sm font-medium transition-all",
                      !isAvailable && "opacity-40 cursor-not-allowed line-through",
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-md"
                        : isAvailable
                        ? "bg-secondary/50 hover:bg-secondary text-foreground"
                        : "bg-muted/30 text-muted-foreground"
                    )}
                  >
                    {timeStr}
                  </button>
                );
              })}
            </div>
          )}
          
          {availableSlots.filter(s => s.is_available && !bookedSlots.has(s.slot_time.slice(0, 5))).length === 0 && !isLoading && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucun créneau disponible pour cette date
            </p>
          )}
        </div>
      )}

      {!selectedDate && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Sélectionnez une date pour voir les créneaux disponibles
        </p>
      )}
    </div>
  );
};

export default TimeSlotPicker;
