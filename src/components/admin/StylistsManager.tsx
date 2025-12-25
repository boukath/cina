import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Scissors, Phone, Mail, UserCheck, UserX } from 'lucide-react';

interface Stylist {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
}

export function StylistsManager() {
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStylist, setEditingStylist] = useState<Stylist | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchStylists();
  }, []);

  const fetchStylists = async () => {
    const { data, error } = await supabase
      .from('stylists')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching stylists:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les coiffeuses',
        variant: 'destructive'
      });
    } else {
      setStylists(data || []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setIsActive(true);
    setEditingStylist(null);
  };

  const openEditDialog = (stylist: Stylist) => {
    setEditingStylist(stylist);
    setName(stylist.name);
    setPhone(stylist.phone || '');
    setEmail(stylist.email || '');
    setIsActive(stylist.is_active);
    setDialogOpen(true);
  };

  const openNewDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le nom est obligatoire',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);

    try {
      if (editingStylist) {
        // Update existing
        const { error } = await supabase
          .from('stylists')
          .update({
            name: name.trim(),
            phone: phone.trim() || null,
            email: email.trim() || null,
            is_active: isActive
          })
          .eq('id', editingStylist.id);

        if (error) throw error;
        
        toast({
          title: 'Coiffeuse modifiée',
          description: `${name} a été mise à jour`
        });
      } else {
        // Create new
        const { error } = await supabase
          .from('stylists')
          .insert({
            name: name.trim(),
            phone: phone.trim() || null,
            email: email.trim() || null,
            is_active: isActive
          });

        if (error) throw error;
        
        toast({
          title: 'Coiffeuse ajoutée',
          description: `${name} a été ajoutée`
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchStylists();
    } catch (error) {
      console.error('Error saving stylist:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (stylist: Stylist) => {
    try {
      const { error } = await supabase
        .from('stylists')
        .update({ is_active: !stylist.is_active })
        .eq('id', stylist.id);

      if (error) throw error;

      toast({
        title: stylist.is_active ? 'Coiffeuse désactivée' : 'Coiffeuse activée',
        description: `${stylist.name} a été ${stylist.is_active ? 'désactivée' : 'activée'}`
      });

      fetchStylists();
    } catch (error) {
      console.error('Error toggling stylist:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le statut',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Gestion des Coiffeuses</h2>
          <p className="text-sm text-muted-foreground">
            Ajoutez et gérez les coiffeuses du salon
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingStylist ? 'Modifier la coiffeuse' : 'Nouvelle coiffeuse'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nom de la coiffeuse"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Téléphone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Numéro de téléphone"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Adresse email"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="active">Active</Label>
                <Switch
                  id="active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Enregistrement...' : editingStylist ? 'Modifier' : 'Ajouter'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stylists Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stylists.map((stylist) => (
          <Card 
            key={stylist.id} 
            className={`relative ${!stylist.is_active ? 'opacity-60' : ''}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  stylist.is_active ? 'bg-primary/10' : 'bg-muted'
                }`}>
                  <Scissors className={`w-6 h-6 ${
                    stylist.is_active ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{stylist.name}</h3>
                    {stylist.is_active ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <UserCheck className="w-3 h-3 mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        <UserX className="w-3 h-3 mr-1" />
                        Inactive
                      </span>
                    )}
                  </div>
                  {stylist.phone && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Phone className="w-3 h-3" />
                      {stylist.phone}
                    </p>
                  )}
                  {stylist.email && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {stylist.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => openEditDialog(stylist)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Modifier
                </Button>
                <Button
                  size="sm"
                  variant={stylist.is_active ? "outline" : "default"}
                  className={stylist.is_active ? "text-red-600 border-red-200 hover:bg-red-50" : ""}
                  onClick={() => toggleActive(stylist)}
                >
                  {stylist.is_active ? (
                    <>
                      <UserX className="w-4 h-4 mr-1" />
                      Désactiver
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4 mr-1" />
                      Activer
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {stylists.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Scissors className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucune coiffeuse ajoutée</p>
            <p className="text-sm">Cliquez sur "Ajouter" pour commencer</p>
          </div>
        )}
      </div>
    </div>
  );
}