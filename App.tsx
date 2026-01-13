import React, { useState } from 'react';
import { Grid, Layers } from 'lucide-react';
import ImageUploader from './components/ImageUploader';
import ImageEditor from './components/ImageEditor';
import ResultsGrid from './components/ResultsGrid';
import { generateSlices } from './utils/imageProcessing';
import { Point, Dimensions, SliceMode } from './types';

type AppState = 'upload' | 'edit' | 'result';

const App: React.FC = () => {
  const [currentState, setCurrentState] = useState<AppState>('upload');
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [generatedSlices, setGeneratedSlices] = useState<string[]>([]);
  const [currentMode, setCurrentMode] = useState<SliceMode>('stack');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageSelect = (base64: string) => {
    setSourceImage(base64);
    setCurrentState('edit');
  };

  const handleEditorConfirm = async (offset: Point, scale: number, dimensions: Dimensions, mode: SliceMode) => {
    if (!sourceImage) return;
    
    setIsProcessing(true);
    setCurrentMode(mode);
    try {
      const slices = await generateSlices(sourceImage, offset, scale, dimensions, mode);
      setGeneratedSlices(slices);
      setCurrentState('result');
    } catch (error) {
      console.error("Failed to slice image", error);
      alert("Something went wrong processing the image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSourceImage(null);
    setGeneratedSlices([]);
    setCurrentState('upload');
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black flex flex-col">
      
      {/* Header */}
      <header className="w-full border-b border-white/5 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-500/20 cursor-pointer" onClick={handleReset}>
              <Grid className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white select-none cursor-pointer" onClick={handleReset}>
              X-Grid<span className="text-indigo-400">Splitter</span>
            </span>
          </div>
          <div className="text-slate-400 text-sm font-medium flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">Slice for X Threads or Grids</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col items-center justify-center p-4 sm:p-8">
        
        {currentState === 'upload' && (
          <div className="animate-in fade-in zoom-in duration-300 max-w-2xl w-full text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
                Slice images for <br/> X threads & grids.
              </h1>
              <p className="text-lg text-slate-400 max-w-lg mx-auto leading-relaxed">
                Upload your photo. We'll split it into 4 vertical stack slices (for threads) or a classic 2x2 grid.
              </p>
            </div>
            <ImageUploader onImageSelected={handleImageSelect} />
          </div>
        )}

        {currentState === 'edit' && sourceImage && (
          <ImageEditor 
            imageSrc={sourceImage}
            onConfirm={handleEditorConfirm}
            onCancel={handleReset}
          />
        )}

        {currentState === 'result' && (
          <ResultsGrid 
            slices={generatedSlices} 
            sliceMode={currentMode}
            onReset={handleReset} 
          />
        )}

        {isProcessing && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white font-medium animate-pulse">Processing...</p>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-6">
        <div className="text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} X-Grid Splitter
        </div>
      </footer>
    </div>
  );
};

export default App;
