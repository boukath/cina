import { useState, useEffect } from "react";
import { format, addDays, startOfToday, isBefore } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, X, Check, CalendarOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const DEFAULT_TIME_SLOTS = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
  "20:00", "21:00", "22:00", "23:00", "00:00", "01:00", "02:00",
  "03:00", "04:00", "05:00"
];

interface BlockedSlot {
  id: string;
  slot_date: string;
  slot_time: string;
  is_available: boolean;
}

const AvailabilityManager = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfToday());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const today = startOfToday();
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  useEffect(() => {
    fetchBlockedSlots();
  }, [currentWeekStart]);

  const fetchBlockedSlots = async () => {
    const startDate = format(currentWeekStart, "yyyy-MM-dd");
    const endDate = format(addDays(currentWeekStart, 6), "yyyy-MM-dd");

    const { data, error } = await supabase
      .from("time_slots")
      .select("*")
      .gte("slot_date", startDate)
      .lte("slot_date", endDate)
      .eq("is_available", false);

    if (!error && data) {
      setBlockedSlots(data);
    }
  };

  const isSlotBlocked = (date: Date, time: string) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return blockedSlots.some(
      (s) => s.slot_date === dateStr && s.slot_time.slice(0, 5) === time
    );
  };

  const isDateFullyBlocked = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const blockedForDate = blockedSlots.filter((s) => s.slot_date === dateStr);
    return blockedForDate.length >= DEFAULT_TIME_SLOTS.length;
  };

  const toggleSlot = async (date: Date, time: string) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const isBlocked = isSlotBlocked(date, time);

    setIsLoading(true);
    try {
      if (isBlocked) {
        // Remove block
        const { error } = await supabase
          .from("time_slots")
          .delete()
          .eq("slot_date", dateStr)
          .eq("slot_time", time + ":00");

        if (error) throw error;

        setBlockedSlots((prev) =>
          prev.filter((s) => !(s.slot_date === dateStr && s.slot_time.slice(0, 5) === time))
        );
        toast({ title: "Créneau débloqué", description: `${time} le ${format(date, "d MMM", { locale: fr })}` });
      } else {
        // Add block
        const { data, error } = await supabase
          .from("time_slots")
          .insert({
            slot_date: dateStr,
            slot_time: time + ":00",
            is_available: false,
          })
          .select()
          .single();

        if (error) throw error;

        if (data) {
          setBlockedSlots((prev) => [...prev, data]);
        }
        toast({ title: "Créneau bloqué", description: `${time} le ${format(date, "d MMM", { locale: fr })}` });
      }
    } catch (error) {
      console.error("Error toggling slot:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le créneau",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const blockEntireDay = async (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    setIsLoading(true);

    try {
      // First remove existing blocks for this day
      await supabase
        .from("time_slots")
        .delete()
        .eq("slot_date", dateStr);

      // Then add blocks for all slots
      const slotsToInsert = DEFAULT_TIME_SLOTS.map((time) => ({
        slot_date: dateStr,
        slot_time: time + ":00",
        is_available: false,
      }));

      const { data, error } = await supabase
        .from("time_slots")
        .insert(slotsToInsert)
        .select();

      if (error) throw error;

      // Update local state
      setBlockedSlots((prev) => {
        const filtered = prev.filter((s) => s.slot_date !== dateStr);
        return [...filtered, ...(data || [])];
      });

      toast({
        title: "Journée bloquée",
        description: format(date, "EEEE d MMMM", { locale: fr }),
      });
    } catch (error) {
      console.error("Error blocking day:", error);
      toast({
        title: "Erreur",
        description: "Impossible de bloquer la journée",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const unblockEntireDay = async (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("time_slots")
        .delete()
        .eq("slot_date", dateStr);

      if (error) throw error;

      setBlockedSlots((prev) => prev.filter((s) => s.slot_date !== dateStr));

      toast({
        title: "Journée débloquée",
        description: format(date, "EEEE d MMMM", { locale: fr }),
      });
    } catch (error) {
      console.error("Error unblocking day:", error);
      toast({
        title: "Erreur",
        description: "Impossible de débloquer la journée",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
          <CalendarOff className="w-5 h-5 text-primary" />
          Gérer vos disponibilités
        </h3>
        <p className="text-sm text-muted-foreground">
          Cliquez sur un créneau pour le bloquer/débloquer. Les créneaux bloqués 
          ne seront pas disponibles pour les clients.
        </p>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
          disabled={isBefore(addDays(currentWeekStart, -1), today)}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <span className="font-semibold text-foreground">
          {format(currentWeekStart, "d MMM", { locale: fr })} - {format(addDays(currentWeekStart, 6), "d MMM yyyy", { locale: fr })}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left text-sm text-muted-foreground">Heure</th>
              {weekDays.map((day) => {
                const isPast = isBefore(day, today);
                const isFullyBlocked = isDateFullyBlocked(day);
                return (
                  <th key={day.toISOString()} className="p-2 text-center min-w-[80px]">
                    <div className={cn("text-xs uppercase", isPast && "opacity-50")}>
                      {format(day, "EEE", { locale: fr })}
                    </div>
                    <div className={cn("text-lg font-bold", isPast && "opacity-50")}>
                      {format(day, "d")}
                    </div>
                    {!isPast && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-1 text-xs h-6 px-2"
                        onClick={() => isFullyBlocked ? unblockEntireDay(day) : blockEntireDay(day)}
                        disabled={isLoading}
                      >
                        {isFullyBlocked ? "Débloquer" : "Bloquer tout"}
                      </Button>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {DEFAULT_TIME_SLOTS.map((time) => (
              <tr key={time} className="border-t border-border/30">
                <td className="p-2 text-sm font-medium text-muted-foreground">
                  {time}
                </td>
                {weekDays.map((day) => {
                  const isPast = isBefore(day, today);
                  const isBlocked = isSlotBlocked(day, time);

                  return (
                    <td key={day.toISOString()} className="p-1 text-center">
                      <button
                        disabled={isPast || isLoading}
                        onClick={() => toggleSlot(day, time)}
                        className={cn(
                          "w-full h-10 rounded-lg transition-all flex items-center justify-center",
                          isPast && "opacity-30 cursor-not-allowed",
                          isBlocked
                            ? "bg-red-100 text-red-600 hover:bg-red-200"
                            : "bg-green-50 text-green-600 hover:bg-green-100"
                        )}
                      >
                        {isBlocked ? (
                          <X className="w-4 h-4" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-green-50 flex items-center justify-center">
            <Check className="w-3 h-3 text-green-600" />
          </div>
          <span className="text-muted-foreground">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-red-100 flex items-center justify-center">
            <X className="w-3 h-3 text-red-600" />
          </div>
          <span className="text-muted-foreground">Bloqué</span>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityManager;
