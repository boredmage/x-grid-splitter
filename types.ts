export interface Point {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

// Aspect ratio presets
// Added 1:2 for the vertical stack use case (1200x2400 total for 4x 1200x600 slices)
export type AspectRatio = 'original' | '2:1' | '16:9' | '1:1' | '4:5' | '9:16' | '1:2';

export type SliceMode = 'grid' | 'stack';
