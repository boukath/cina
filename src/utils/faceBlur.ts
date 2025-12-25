import { supabase } from '@/integrations/supabase/client';

/**
 * Converts a File to base64 string
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Converts base64 data URL to a File object
 */
function base64ToFile(base64: string, filename: string, mimeType: string): File {
  const arr = base64.split(',');
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mimeType });
}

/**
 * Blurs faces in an image using AI via edge function
 */
export async function blurFacesInImage(file: File): Promise<File> {
  try {
    console.log('Starting face blur process...');
    
    // Convert file to base64
    const base64Image = await fileToBase64(file);
    
    // Call edge function to process the image
    const { data, error } = await supabase.functions.invoke('blur-faces', {
      body: { 
        image: base64Image,
        filename: file.name
      }
    });
    
    if (error) {
      console.error('Edge function error:', error);
      return file; // Return original on error
    }
    
    if (data?.processedImage) {
      console.log('Face blur completed successfully');
      return base64ToFile(
        data.processedImage, 
        file.name, 
        file.type || 'image/jpeg'
      );
    }
    
    console.log('No faces detected or processing skipped');
    return file;
  } catch (error) {
    console.error('Error in blurFacesInImage:', error);
    return file; // Return original on error
  }
}
