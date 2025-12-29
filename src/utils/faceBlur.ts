import { supabase } from '@/integrations/supabase/client';

interface FaceBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

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
 * Loads an image from a File object
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Applies blur to specified regions of an image
 */
function applyBlurToRegions(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  faces: FaceBox[]
): void {
  const { width, height } = canvas;
  
  for (const face of faces) {
    // Convert percentage coordinates to pixels
    const x = Math.floor((face.x / 100) * width);
    const y = Math.floor((face.y / 100) * height);
    const w = Math.floor((face.width / 100) * width);
    const h = Math.floor((face.height / 100) * height);
    
    // Ensure we're within bounds
    const safeX = Math.max(0, x);
    const safeY = Math.max(0, y);
    const safeW = Math.min(w, width - safeX);
    const safeH = Math.min(h, height - safeY);
    
    if (safeW <= 0 || safeH <= 0) continue;
    
    // Get the face region
    const imageData = ctx.getImageData(safeX, safeY, safeW, safeH);
    const data = imageData.data;
    
    // Apply a strong pixelation blur effect
    const pixelSize = Math.max(10, Math.floor(Math.min(safeW, safeH) / 8));
    
    for (let py = 0; py < safeH; py += pixelSize) {
      for (let px = 0; px < safeW; px += pixelSize) {
        // Calculate average color for this block
        let r = 0, g = 0, b = 0, count = 0;
        
        for (let dy = 0; dy < pixelSize && py + dy < safeH; dy++) {
          for (let dx = 0; dx < pixelSize && px + dx < safeW; dx++) {
            const i = ((py + dy) * safeW + (px + dx)) * 4;
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
          }
        }
        
        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);
        
        // Apply average color to all pixels in block
        for (let dy = 0; dy < pixelSize && py + dy < safeH; dy++) {
          for (let dx = 0; dx < pixelSize && px + dx < safeW; dx++) {
            const i = ((py + dy) * safeW + (px + dx)) * 4;
            data[i] = r;
            data[i + 1] = g;
            data[i + 2] = b;
          }
        }
      }
    }
    
    ctx.putImageData(imageData, safeX, safeY);
  }
}

/**
 * Converts canvas to File object
 */
function canvasToFile(canvas: HTMLCanvasElement, filename: string, originalMimeType: string): Promise<File> {
  return new Promise((resolve, reject) => {
    // Always use JPEG for output (better compatibility and smaller size)
    const outputMimeType = 'image/jpeg';
    const outputFilename = filename.replace(/\.[^/.]+$/, '.jpg');
    
    canvas.toBlob((blob) => {
      if (blob && blob.size > 0) {
        console.log(`Created blob: ${blob.size} bytes, type: ${blob.type}`);
        resolve(new File([blob], outputFilename, { type: outputMimeType }));
      } else {
        console.error('Failed to create blob or blob is empty');
        reject(new Error('Failed to convert canvas to blob'));
      }
    }, outputMimeType, 0.92);
  });
}

/**
 * Blurs faces in an image using AI detection via edge function
 */
export async function blurFacesInImage(file: File): Promise<File> {
  try {
    console.log('Starting face blur process...');
    
    // Convert file to base64
    const base64Image = await fileToBase64(file);
    
    // Call edge function to detect faces
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
    
    const faces: FaceBox[] = data?.faces || [];
    
    if (faces.length === 0) {
      console.log('No faces detected');
      return file;
    }
    
    console.log(`Detected ${faces.length} face(s), applying blur...`);
    
    // Load the image
    const img = await loadImage(file);
    console.log(`Image loaded: ${img.width}x${img.height}`);
    
    // Create canvas and draw image
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.error('Failed to get canvas context');
      return file;
    }
    
    // Draw the original image first
    ctx.drawImage(img, 0, 0, img.width, img.height);
    
    // Apply blur to detected face regions
    applyBlurToRegions(canvas, ctx, faces);
    
    // Clean up the object URL
    URL.revokeObjectURL(img.src);
    
    // Convert back to file
    const blurredFile = await canvasToFile(canvas, file.name, file.type || 'image/jpeg');
    
    console.log(`Face blur completed. Original: ${file.size} bytes, Blurred: ${blurredFile.size} bytes`);
    return blurredFile;
    
  } catch (error) {
    console.error('Error in blurFacesInImage:', error);
    return file; // Return original on error
  }
}