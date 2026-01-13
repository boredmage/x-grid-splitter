import React, { useState } from "react";
import { ExternalLink, BookOpen } from "lucide-react";
import ImageUploader from "./components/ImageUploader";
import ImageEditor from "./components/ImageEditor";
import ResultsGrid from "./components/ResultsGrid";
import XIcon from "./components/XIcon";
import { generateSlices } from "./utils/imageProcessing";
import type { Point, Dimensions, SliceMode } from "./types";

type AppState = "upload" | "edit" | "result";

const App: React.FC = () => {
  const [currentState, setCurrentState] = useState<AppState>("upload");
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [generatedSlices, setGeneratedSlices] = useState<string[]>([]);
  const [currentMode, setCurrentMode] = useState<SliceMode>("stack");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageSelect = (base64: string) => {
    setSourceImage(base64);
    setCurrentState("edit");
  };

  const handleEditorConfirm = async (
    offset: Point,
    scale: number,
    dimensions: Dimensions,
    mode: SliceMode
  ) => {
    if (!sourceImage) return;

    setIsProcessing(true);
    setCurrentMode(mode);
    try {
      const slices = await generateSlices(
        sourceImage,
        offset,
        scale,
        dimensions,
        mode
      );
      setGeneratedSlices(slices);
      setCurrentState("result");
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
    setCurrentState("upload");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Guide Header */}
      <header className="w-full bg-slate-900/50 border-b border-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5">
          <a
            href="https://x.com/overboredmage/status/2011037571527426138?s=20"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-300 hover:text-white transition-all group font-medium"
            aria-label="View guide on X (Twitter)"
          >
            <div className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/50 px-2.5 py-1 rounded-md backdrop-blur-sm group-hover:bg-slate-800/80 group-hover:border-indigo-500/30 transition-colors">
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-white" />
              <span>How to use this tool</span>
              <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col items-center justify-center p-4 sm:p-8">
        {currentState === "upload" && (
          <div className="animate-in fade-in zoom-in duration-300 max-w-2xl w-full text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-bold text-white">
                Slice images for <br /> X threads & grids.
              </h1>
              <p className="text-lg text-slate-400 max-w-lg mx-auto leading-relaxed">
                Upload your photo. We'll split it into 4 vertical stack slices
                (for threads) or a classic 2x2 grid.
              </p>
            </div>
            <ImageUploader onImageSelected={handleImageSelect} />
          </div>
        )}

        {currentState === "edit" && sourceImage && (
          <ImageEditor
            imageSrc={sourceImage}
            onConfirm={handleEditorConfirm}
            onCancel={handleReset}
          />
        )}

        {currentState === "result" && (
          <ResultsGrid
            slices={generatedSlices}
            sliceMode={currentMode}
            onReset={handleReset}
          />
        )}

        {isProcessing && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white font-medium animate-pulse">
              Processing...
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-6">
        <div className="text-center text-slate-500 text-sm flex items-center justify-center gap-4">
          <span>&copy; {new Date().getFullYear()} X-Grid Splitter</span>
          <a
            href="https://x.com/overboredmage"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow on X (Twitter)"
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <XIcon className="w-4 h-4" />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default App;
