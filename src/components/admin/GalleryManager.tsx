import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, Upload, Image, Star, StarOff, Loader2 } from 'lucide-react';
import { blurFacesInImage } from '@/utils/faceBlur';

interface GalleryImage {
  id: string;
  title: string | null;
  description: string | null;
  category: string;
  before_image_url: string | null;
  after_image_url: string | null;
  is_featured: boolean;
  display_order: number | null;
  created_at: string;
}

const categories = [
  { value: 'mariee', label: 'Mariée' },
  { value: 'invitee', label: 'Invitée' },
  { value: 'chignon', label: 'Chignon' },
  { value: 'maquillage', label: 'Maquillage' },
  { value: 'general', label: 'Général' },
];

export function GalleryManager() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processingFaces, setProcessingFaces] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'general',
    is_featured: false,
  });
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState<string | null>(null);
  const [afterPreview, setAfterPreview] = useState<string | null>(null);
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      toast.error('Erreur lors du chargement');
      console.error(error);
    } else {
      setImages(data || []);
    }
    setLoading(false);
  };

  const handleFileChange = (file: File | null, type: 'before' | 'after') => {
    if (!file) return;
    
    if (type === 'before') {
      setBeforeFile(file);
      setBeforePreview(URL.createObjectURL(file));
    } else {
      setAfterFile(file);
      setAfterPreview(URL.createObjectURL(file));
    }
  };

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('gallery')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!beforeFile && !afterFile) {
      toast.error('Veuillez ajouter au moins une image');
      return;
    }

    setUploading(true);
    setProcessingFaces(true);

    try {
      let beforeUrl = null;
      let afterUrl = null;

      // Process and blur faces in images
      toast.info('Traitement des visages en cours...');
      
      let processedBeforeFile = beforeFile;
      let processedAfterFile = afterFile;

      if (beforeFile) {
        processedBeforeFile = await blurFacesInImage(beforeFile);
      }

      if (afterFile) {
        processedAfterFile = await blurFacesInImage(afterFile);
      }

      setProcessingFaces(false);
      toast.info('Upload des images...');

      if (processedBeforeFile) {
        beforeUrl = await uploadFile(processedBeforeFile, 'before');
        if (!beforeUrl) throw new Error('Erreur upload image avant');
      }

      if (processedAfterFile) {
        afterUrl = await uploadFile(processedAfterFile, 'after');
        if (!afterUrl) throw new Error('Erreur upload image après');
      }

      const { error } = await supabase
        .from('gallery_images')
        .insert([{
          title: formData.title || null,
          category: formData.category,
          is_featured: formData.is_featured,
          before_image_url: beforeUrl,
          after_image_url: afterUrl,
          display_order: images.length,
        }]);

      if (error) throw error;

      toast.success('Image ajoutée avec visages floutés');
      fetchImages();
      closeDialog();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Erreur lors de l\'ajout');
    } finally {
      setUploading(false);
      setProcessingFaces(false);
    }
  };

  const toggleFeatured = async (id: string, currentValue: boolean) => {
    const { error } = await supabase
      .from('gallery_images')
      .update({ is_featured: !currentValue })
      .eq('id', id);

    if (error) {
      toast.error('Erreur lors de la mise à jour');
    } else {
      setImages(prev => prev.map(img => 
        img.id === id ? { ...img, is_featured: !currentValue } : img
      ));
      toast.success(currentValue ? 'Retiré des favoris' : 'Ajouté aux favoris');
    }
  };

  const deleteImage = async (image: GalleryImage) => {
    if (!confirm('Supprimer cette image ?')) return;

    try {
      // Delete from storage
      if (image.before_image_url) {
        const beforePath = image.before_image_url.split('/gallery/')[1];
        if (beforePath) await supabase.storage.from('gallery').remove([beforePath]);
      }
      if (image.after_image_url) {
        const afterPath = image.after_image_url.split('/gallery/')[1];
        if (afterPath) await supabase.storage.from('gallery').remove([afterPath]);
      }

      // Delete from database
      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', image.id);

      if (error) throw error;

      setImages(prev => prev.filter(img => img.id !== image.id));
      toast.success('Image supprimée');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setFormData({ title: '', category: 'general', is_featured: false });
    setBeforeFile(null);
    setAfterFile(null);
    setBeforePreview(null);
    setAfterPreview(null);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Galerie Photos
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => closeDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ajouter des photos</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Titre (optionnel)</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Mariage Sarah & Thomas"
                />
              </div>

              <div>
                <Label>Catégorie</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Before Image */}
                <div>
                  <Label>Photo Avant</Label>
                  <input
                    ref={beforeInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null, 'before')}
                  />
                  <div
                    onClick={() => beforeInputRef.current?.click()}
                    className="mt-2 border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary/50 transition-colors min-h-[150px] flex items-center justify-center"
                  >
                    {beforePreview ? (
                      <img src={beforePreview} alt="Before preview" className="max-h-[140px] rounded-lg object-cover" />
                    ) : (
                      <div className="text-muted-foreground">
                        <Upload className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Cliquer pour upload</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* After Image */}
                <div>
                  <Label>Photo Après</Label>
                  <input
                    ref={afterInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null, 'after')}
                  />
                  <div
                    onClick={() => afterInputRef.current?.click()}
                    className="mt-2 border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary/50 transition-colors min-h-[150px] flex items-center justify-center"
                  >
                    {afterPreview ? (
                      <img src={afterPreview} alt="After preview" className="max-h-[140px] rounded-lg object-cover" />
                    ) : (
                      <div className="text-muted-foreground">
                        <Upload className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Cliquer pour upload</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                />
                <Label htmlFor="featured">Mettre en avant</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={closeDialog} disabled={uploading}>
                  Annuler
                </Button>
                <Button type="submit" disabled={uploading}>
                  {processingFaces ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Floutage visages...
                    </>
                  ) : uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Upload...
                    </>
                  ) : (
                    'Ajouter'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {images.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune image dans la galerie</p>
            <p className="text-sm">Cliquez sur "Ajouter" pour commencer</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.id} className="group relative rounded-xl overflow-hidden border border-border bg-secondary/30">
                <div className="aspect-square relative">
                  {image.before_image_url && image.after_image_url ? (
                    <div className="grid grid-cols-2 h-full">
                      <img
                        src={image.before_image_url}
                        alt="Before"
                        className="w-full h-full object-cover"
                      />
                      <img
                        src={image.after_image_url}
                        alt="After"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <img
                      src={image.after_image_url || image.before_image_url || ''}
                      alt={image.title || 'Gallery'}
                      className="w-full h-full object-cover"
                    />
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => toggleFeatured(image.id, image.is_featured)}
                    >
                      {image.is_featured ? (
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      ) : (
                        <StarOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => deleteImage(image)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-2">
                  <p className="text-sm font-medium truncate">{image.title || 'Sans titre'}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground capitalize">
                      {categories.find(c => c.value === image.category)?.label || image.category}
                    </span>
                    {image.is_featured && (
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
