import React, { useState } from "react";
import ImageUploader from "./components/ImageUploader";
import ImageEditor from "./components/ImageEditor";
import ResultsGrid from "./components/ResultsGrid";
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
        <div className="text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} X-Grid Splitter
        </div>
      </footer>
    </div>
  );
};

export default App;
