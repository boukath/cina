import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Clock, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Booking {
  id: string;
  name: string;
  event_date: string;
  event_time: string | null;
  service: string;
}

interface BookingEditDialogProps {
  booking: Booking;
  onSuccess: () => void;
}

export function BookingEditDialog({ booking, onSuccess }: BookingEditDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(booking.event_date)
  );
  const [selectedTime, setSelectedTime] = useState(
    booking.event_time?.slice(0, 5) || "10:00"
  );

  const handleSave = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une date et une heure",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({
          event_date: format(selectedDate, "yyyy-MM-dd"),
          event_time: selectedTime + ":00",
        })
        .eq("id", booking.id);

      if (error) throw error;

      toast({
        title: "Réservation modifiée",
        description: `Nouveau rendez-vous le ${format(selectedDate, "d MMMM", { locale: fr })} à ${selectedTime}`,
      });
      setIsOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Error updating booking:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier la réservation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmWithChanges = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une date et une heure",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({
          event_date: format(selectedDate, "yyyy-MM-dd"),
          event_time: selectedTime + ":00",
          status: "confirmed",
        })
        .eq("id", booking.id);

      if (error) throw error;

      toast({
        title: "Réservation confirmée",
        description: `Rendez-vous confirmé le ${format(selectedDate, "d MMMM", { locale: fr })} à ${selectedTime}`,
      });
      setIsOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Error confirming booking:", error);
      toast({
        title: "Erreur",
        description: "Impossible de confirmer la réservation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="text-primary border-primary/20 hover:bg-primary/10"
        >
          <Edit2 className="w-4 h-4 mr-1" />
          Modifier
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier le rendez-vous</DialogTitle>
          <DialogDescription>
            Modifiez la date et l'heure pour {booking.name} ({booking.service})
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Current Request */}
          <div className="bg-secondary/30 rounded-lg p-3">
            <p className="text-sm text-muted-foreground mb-1">Demande initiale :</p>
            <p className="font-medium text-foreground">
              {format(new Date(booking.event_date), "d MMMM yyyy", { locale: fr })} à{" "}
              {booking.event_time?.slice(0, 5) || "Non spécifié"}
            </p>
          </div>

          {/* Date Picker */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Calendar className="w-4 h-4" />
              Nouvelle date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-12 rounded-xl",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  {selectedDate ? (
                    format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })
                  ) : (
                    <span>Sélectionner une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Picker */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Clock className="w-4 h-4" />
              Nouvelle heure
            </label>
            <Input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={isLoading}
          >
            Enregistrer
          </Button>
          <Button
            onClick={handleConfirmWithChanges}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading ? "..." : "Confirmer avec ces horaires"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
