import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, Banknote, User, CreditCard } from 'lucide-react';

interface Stylist {
  id: string;
  name: string;
}

interface Booking {
  id: string;
  name: string;
  service: string;
  event_date: string;
}

interface CompleteBookingDialogProps {
  booking: Booking;
  onSuccess: () => void;
  defaultPrice?: number;
}

export function CompleteBookingDialog({ booking, onSuccess, defaultPrice = 0 }: CompleteBookingDialogProps) {
  const [open, setOpen] = useState(false);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [selectedStylist, setSelectedStylist] = useState<string>('');
  const [paidAmount, setPaidAmount] = useState<string>(defaultPrice.toString());
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [invitedBy, setInvitedBy] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchStylists();
      fetchServicePrice();
    }
  }, [open]);

  const fetchStylists = async () => {
    const { data } = await supabase
      .from('stylists')
      .select('*')
      .eq('is_active', true);
    setStylists(data || []);
  };

  const fetchServicePrice = async () => {
    const { data } = await supabase
      .from('services')
      .select('price')
      .eq('name', booking.service)
      .maybeSingle();
    
    if (data?.price) {
      setPaidAmount(data.price.toString());
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'completed',
          stylist_id: selectedStylist || null,
          paid_amount: parseFloat(paidAmount) || 0,
          payment_method: paymentMethod,
          invited_by: invitedBy || null
        })
        .eq('id', booking.id);

      if (error) throw error;

      toast({
        title: 'Réservation terminée',
        description: `${booking.name} - ${paidAmount} DZD payé`
      });
      
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error('Error completing booking:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de terminer la réservation',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="default"
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          Terminer & Payer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Terminer la réservation</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Client Info */}
          <div className="p-3 bg-secondary/30 rounded-xl">
            <p className="font-semibold">{booking.name}</p>
            <p className="text-sm text-muted-foreground">{booking.service}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(booking.event_date).toLocaleDateString('fr-FR')}
            </p>
          </div>

          {/* Stylist Selection */}
          <div className="space-y-2">
            <Label htmlFor="stylist">Coiffeuse</Label>
            <Select value={selectedStylist} onValueChange={setSelectedStylist}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une coiffeuse" />
              </SelectTrigger>
              <SelectContent>
                {stylists.map((stylist) => (
                  <SelectItem key={stylist.id} value={stylist.id}>
                    {stylist.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="flex items-center gap-2">
              <Banknote className="w-4 h-4" />
              Montant payé (DZD)
            </Label>
            <Input
              id="amount"
              type="number"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              placeholder="Montant en DZD"
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Méthode de paiement
            </Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Espèces</SelectItem>
                <SelectItem value="card">Carte bancaire</SelectItem>
                <SelectItem value="transfer">Virement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Invited By (Parrainage) */}
          <div className="space-y-2">
            <Label htmlFor="invitedBy" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Invité par (parrainage)
            </Label>
            <Input
              id="invitedBy"
              value={invitedBy}
              onChange={(e) => setInvitedBy(e.target.value)}
              placeholder="Nom du parrain (optionnel)"
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleComplete}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? 'Enregistrement...' : 'Confirmer le paiement'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}