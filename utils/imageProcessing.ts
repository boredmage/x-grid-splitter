import { Point, Dimensions, SliceMode } from '../types';

/**
 * Loads an image from a source string (URL or Base64)
 */
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};

/**
 * Generates the 4 slices based on the user's positioning, target dimensions, and mode
 */
export const generateSlices = async (
  imageSrc: string,
  offset: Point,
  scale: number,
  outputDimensions: Dimensions,
  mode: SliceMode
): Promise<string[]> => {
  const img = await loadImage(imageSrc);
  
  const { width: totalWidth, height: totalHeight } = outputDimensions;
  
  // 1. Create a master canvas
  const masterCanvas = document.createElement('canvas');
  masterCanvas.width = totalWidth;
  masterCanvas.height = totalHeight;
  const ctx = masterCanvas.getContext('2d');

  if (!ctx) throw new Error('Could not get canvas context');

  // Fill background with black
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, totalWidth, totalHeight);

  // Draw the user's image with their applied pan/zoom
  ctx.drawImage(
    img, 
    offset.x, 
    offset.y, 
    img.width * scale, 
    img.height * scale
  );

  // 2. Slice into 4 parts
  const slices: string[] = [];
  
  if (mode === 'grid') {
    // 2x2 Grid
    const sliceWidth = totalWidth / 2;
    const sliceHeight = totalHeight / 2;
    
    // Order: Top-Left, Top-Right, Bottom-Left, Bottom-Right
    const coordinates = [
      { x: 0, y: 0 },
      { x: sliceWidth, y: 0 },
      { x: 0, y: sliceHeight },
      { x: sliceWidth, y: sliceHeight }
    ];

    for (const coord of coordinates) {
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = sliceWidth;
      sliceCanvas.height = sliceHeight;
      const sCtx = sliceCanvas.getContext('2d');
      if (!sCtx) continue;
      sCtx.drawImage(masterCanvas, coord.x, coord.y, sliceWidth, sliceHeight, 0, 0, sliceWidth, sliceHeight);
      slices.push(sliceCanvas.toDataURL('image/png', 0.95));
    }
  } else {
    // Vertical Stack (4 horizontal strips)
    // Order: Top to Bottom
    const sliceWidth = totalWidth;
    const sliceHeight = totalHeight / 4;

    for (let i = 0; i < 4; i++) {
      const y = i * sliceHeight;
      
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = sliceWidth;
      sliceCanvas.height = sliceHeight;
      const sCtx = sliceCanvas.getContext('2d');
      if (!sCtx) continue;
      
      sCtx.drawImage(masterCanvas, 0, y, sliceWidth, sliceHeight, 0, 0, sliceWidth, sliceHeight);
      slices.push(sliceCanvas.toDataURL('image/png', 0.95));
    }
  }

  return slices;
};

/**
 * Trigger a download for a base64 string
 */
export const downloadImage = (base64: string, filename: string) => {
  const link = document.createElement('a');
  link.href = base64;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
