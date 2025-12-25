import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

interface FaceBox {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
}

interface DetectionResult {
  box: FaceBox;
  score: number;
  label: string;
}

let detector: any = null;

async function getDetector() {
  if (!detector) {
    console.log('Loading face detection model...');
    detector = await pipeline(
      'object-detection',
      'Xenova/detr-resnet-50',
      { device: 'webgpu' }
    );
  }
  return detector;
}

function applyGaussianBlur(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  blurRadius: number = 20
) {
  // Get the face region
  const imageData = ctx.getImageData(x, y, width, height);
  const data = imageData.data;
  
  // Apply a simple box blur multiple times for gaussian-like effect
  for (let pass = 0; pass < 3; pass++) {
    const tempData = new Uint8ClampedArray(data);
    const radius = Math.floor(blurRadius / 2);
    
    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        let r = 0, g = 0, b = 0, count = 0;
        
        for (let ky = -radius; ky <= radius; ky++) {
          for (let kx = -radius; kx <= radius; kx++) {
            const nx = px + kx;
            const ny = py + ky;
            
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const idx = (ny * width + nx) * 4;
              r += tempData[idx];
              g += tempData[idx + 1];
              b += tempData[idx + 2];
              count++;
            }
          }
        }
        
        const idx = (py * width + px) * 4;
        data[idx] = r / count;
        data[idx + 1] = g / count;
        data[idx + 2] = b / count;
      }
    }
  }
  
  ctx.putImageData(imageData, x, y);
}

export async function blurFacesInImage(file: File): Promise<File> {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('Starting face blur process...');
      
      // Load image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      const imageUrl = URL.createObjectURL(file);
      
      img.onload = async () => {
        try {
          // Create canvas
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            URL.revokeObjectURL(imageUrl);
            resolve(file); // Return original if canvas fails
            return;
          }
          
          // Draw original image
          ctx.drawImage(img, 0, 0);
          
          // Get detector
          const faceDetector = await getDetector();
          
          // Detect objects (including people/faces)
          const results: DetectionResult[] = await faceDetector(imageUrl, {
            threshold: 0.5,
          });
          
          console.log('Detection results:', results);
          
          // Filter for person detections
          const personDetections = results.filter(
            (r: DetectionResult) => r.label.toLowerCase() === 'person' && r.score > 0.5
          );
          
          console.log(`Found ${personDetections.length} people`);
          
          // For each person, blur the upper portion (face area)
          for (const detection of personDetections) {
            const { xmin, ymin, xmax, ymax } = detection.box;
            
            // Calculate face region (upper third of person bounding box)
            const personHeight = ymax - ymin;
            const faceHeight = personHeight * 0.4; // Upper 40% for face
            
            const faceX = Math.max(0, Math.floor(xmin));
            const faceY = Math.max(0, Math.floor(ymin));
            const faceWidth = Math.min(canvas.width - faceX, Math.ceil(xmax - xmin));
            const faceHeightClamped = Math.min(canvas.height - faceY, Math.ceil(faceHeight));
            
            if (faceWidth > 0 && faceHeightClamped > 0) {
              console.log(`Blurring face region: ${faceX}, ${faceY}, ${faceWidth}, ${faceHeightClamped}`);
              applyGaussianBlur(ctx, faceX, faceY, faceWidth, faceHeightClamped, 25);
            }
          }
          
          // Convert canvas to blob
          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(imageUrl);
              if (blob) {
                const blurredFile = new File([blob], file.name, {
                  type: file.type || 'image/jpeg',
                });
                console.log('Face blur completed');
                resolve(blurredFile);
              } else {
                resolve(file);
              }
            },
            file.type || 'image/jpeg',
            0.95
          );
        } catch (error) {
          console.error('Error during face detection:', error);
          URL.revokeObjectURL(imageUrl);
          resolve(file); // Return original on error
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        resolve(file);
      };
      
      img.src = imageUrl;
    } catch (error) {
      console.error('Error in blurFacesInImage:', error);
      resolve(file); // Return original on error
    }
  });
}
