import React, { useRef, useEffect, useState } from 'react';
import { ZoomIn, ZoomOut, Move, Check, RotateCcw, Ratio, Layout, Grid as GridIcon, AlignJustify } from 'lucide-react';
import { Point, Dimensions, AspectRatio, SliceMode } from '../types';

interface ImageEditorProps {
  imageSrc: string;
  onConfirm: (offset: Point, scale: number, dimensions: Dimensions, mode: SliceMode) => void;
  onCancel: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ imageSrc, onConfirm, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 });
  
  const [currentRatio, setCurrentRatio] = useState<AspectRatio>('original');
  const [sliceMode, setSliceMode] = useState<SliceMode>('stack'); // Default to stack per request
  const [canvasDims, setCanvasDims] = useState<Dimensions>({ width: 1200, height: 600 });
  
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Initial Image Load
  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      imgRef.current = img;
      
      // If stack mode, maybe prefer a taller aspect ratio by default? 
      // For now, sticking to original.
      setCanvasDims({ width: img.width, height: img.height });
      setScale(1);
      setOffset({ x: 0, y: 0 });
    };
  }, [imageSrc]);

  // Handle Aspect Ratio Change
  const handleRatioChange = (ratio: AspectRatio) => {
    setCurrentRatio(ratio);
    if (!imgRef.current) return;

    const imgW = imgRef.current.width;
    const imgH = imgRef.current.height; // Used for calculations
    
    let newW = imgW;
    let newH = imgH;

    switch (ratio) {
      case 'original':
        newW = imgW;
        newH = imgH;
        break;
      case '2:1':
        newW = imgW;
        newH = imgW / 2;
        break;
      case '16:9':
        newW = imgW;
        newH = imgW * (9 / 16);
        break;
      case '1:1':
        newW = Math.min(imgW, imgH);
        newH = newW;
        break;
      case '4:5':
        newW = imgW;
        newH = imgW * (5 / 4);
        break;
      case '9:16':
        newW = imgW;
        newH = imgW * (16 / 9);
        break;
      case '1:2':
        newW = imgW;
        newH = imgW * 2;
        break;
    }

    setCanvasDims({ width: newW, height: newH });
    
    // Recenter
    const scaleX = newW / imgW;
    const scaleY = newH / imgH;
    const newScale = Math.max(scaleX, scaleY); // Cover
    
    setScale(newScale);
    setOffset({
      x: (newW - imgW * newScale) / 2,
      y: (newH - imgH * newScale) / 2
    });
  };

  // Draw Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imgRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear background
    ctx.fillStyle = '#1e293b'; 
    ctx.fillRect(0, 0, canvasDims.width, canvasDims.height);

    // Draw Image
    ctx.drawImage(
      imgRef.current,
      offset.x,
      offset.y,
      imgRef.current.width * scale,
      imgRef.current.height * scale
    );

    // Overlay Lines
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = Math.max(2, canvasDims.width / 400); 
    ctx.setLineDash([15, 10]); 
    
    if (sliceMode === 'grid') {
        // 2x2 Grid (Crosshair)
        ctx.beginPath();
        ctx.moveTo(canvasDims.width / 2, 0);
        ctx.lineTo(canvasDims.width / 2, canvasDims.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, canvasDims.height / 2);
        ctx.lineTo(canvasDims.width, canvasDims.height / 2);
        ctx.stroke();
    } else {
        // Stack (3 horizontal lines)
        const sliceHeight = canvasDims.height / 4;
        for (let i = 1; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(0, sliceHeight * i);
            ctx.lineTo(canvasDims.width, sliceHeight * i);
            ctx.stroke();
        }
    }

    ctx.setLineDash([]);
  }, [scale, offset, imageSrc, canvasDims, sliceMode]);

  // Event Handlers
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setOffset({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (delta: number) => {
    setScale(prev => Math.max(0.1, prev + delta));
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto animate-in fade-in duration-500">
      
      {/* Controls Bar */}
      <div className="flex flex-col xl:flex-row items-center justify-between w-full mb-6 gap-4 px-4">
        
        {/* Left Side: Mode & Ratio */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
            
            {/* Mode Switcher */}
            <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
                <button
                    onClick={() => setSliceMode('stack')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        sliceMode === 'stack' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                >
                    <AlignJustify className="w-4 h-4" />
                    Stack
                </button>
                <button
                    onClick={() => setSliceMode('grid')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        sliceMode === 'grid' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                >
                    <GridIcon className="w-4 h-4" />
                    Grid (2x2)
                </button>
            </div>

            {/* Separator */}
            <div className="hidden sm:block w-px h-8 bg-slate-800"></div>

            {/* Ratio Selector */}
            <div className="flex items-center gap-2 overflow-x-auto max-w-[80vw] sm:max-w-md pb-2 sm:pb-0 scrollbar-hide">
            <Ratio className="w-5 h-5 text-indigo-400 shrink-0" />
            <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                {(['original', '2:1', '16:9', '1:1', '4:5', '1:2'] as AspectRatio[]).map((r) => (
                <button
                    key={r}
                    onClick={() => handleRatioChange(r)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                    currentRatio === r 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                >
                    {r === 'original' ? 'Auto' : r}
                </button>
                ))}
            </div>
            </div>
        </div>

        {/* Right Side: Zoom */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-lg border border-slate-800 shrink-0">
          <button onClick={() => handleZoom(-0.05)} className="p-2 hover:bg-slate-700 rounded-md text-slate-300">
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-xs font-mono text-slate-500 w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button onClick={() => handleZoom(0.05)} className="p-2 hover:bg-slate-700 rounded-md text-slate-300">
            <ZoomIn className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-slate-700 mx-1"></div>
          <button 
            onClick={() => handleRatioChange(currentRatio)}
            className="p-2 hover:bg-slate-700 rounded-md text-slate-300" 
            title="Reset Position"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div 
        ref={containerRef}
        className="relative w-full bg-slate-900 rounded-lg overflow-hidden shadow-2xl border border-slate-700 touch-none flex items-center justify-center"
        style={{ aspectRatio: `${canvasDims.width} / ${canvasDims.height}`, maxHeight: '60vh' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <canvas
          ref={canvasRef}
          width={canvasDims.width}
          height={canvasDims.height}
          className="max-w-full max-h-full object-contain cursor-move"
        />
        
        {/* Info Badge */}
        <div className="absolute bottom-4 left-4 pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
           <span className="bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
            {Math.round(canvasDims.width)} x {Math.round(canvasDims.height)} • {sliceMode === 'grid' ? '2x2' : '4x Stack'}
          </span>
        </div>
      </div>
      
      <p className="mt-3 text-slate-500 text-sm flex items-center gap-2">
        <Move className="w-4 h-4" /> Drag to adjust crop position
      </p>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8">
        <button
          onClick={onCancel}
          className="px-6 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-medium"
        >
          Change Image
        </button>
        <button
          onClick={() => onConfirm(offset, scale, canvasDims, sliceMode)}
          className="px-8 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2"
        >
          <Check className="w-5 h-5" />
          Slice It
        </button>
      </div>
    </div>
  );
};

export default ImageEditor;
