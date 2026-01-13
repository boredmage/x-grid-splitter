import React from "react";
import { Download, ArrowLeft, Share2 } from "lucide-react";
import { downloadImage } from "../utils/imageProcessing";
import type { SliceMode } from "../types";

interface ResultsGridProps {
  slices: string[];
  sliceMode: SliceMode;
  onReset: () => void;
}

const ResultsGrid: React.FC<ResultsGridProps> = ({
  slices,
  sliceMode,
  onReset,
}) => {
  const handleDownloadAll = () => {
    slices.forEach((slice, index) => {
      setTimeout(() => {
        downloadImage(slice, `x-grid-part-${index + 1}.png`);
      }, index * 200);
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-in slide-in-from-bottom-8 duration-500 flex flex-col items-center">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-100 mb-2">
          Ready to Post
        </h2>
        <p className="text-slate-400">
          {sliceMode === "grid"
            ? "Download these 4 images and upload them to X in one post (order: 1→4)."
            : "Download these slices. Post them as a Thread (reply to yourself) to create the stack effect."}
        </p>
      </div>

      {/* Grid vs Stack Display */}
      <div
        className={`
            gap-2 bg-black p-2 rounded-xl border border-slate-800 shadow-2xl mx-auto w-full
            ${
              sliceMode === "grid"
                ? "grid grid-cols-2 max-w-4xl"
                : "flex flex-col max-w-2xl"
            }
        `}
      >
        {slices.map((src, idx) => (
          <div
            key={idx}
            className="relative group overflow-hidden bg-slate-900 rounded-lg w-full"
          >
            <img
              src={src}
              alt={`Slice ${idx + 1}`}
              className="w-full h-auto block"
            />
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={() => downloadImage(src, `x-grid-part-${idx + 1}.png`)}
                name={`download-slice-${idx + 1}`}
                aria-label={`Download slice ${idx + 1}`}
                className="bg-white text-slate-900 px-3 py-1.5 rounded-full font-medium text-xs flex items-center gap-1.5 hover:scale-105 transition-transform shadow-lg"
              >
                <Download className="w-3 h-3" />
                Save #{idx + 1}
              </button>
            </div>
            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded pointer-events-none">
              #{idx + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 w-full">
        <button
          onClick={onReset}
          name="start-over"
          aria-label="Start over and upload a new image"
          className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-1.5 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Start Over
        </button>

        <button
          onClick={handleDownloadAll}
          name="download-all"
          aria-label="Download all generated slices"
          className="w-full sm:w-auto px-5 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-1.5 text-sm font-semibold"
        >
          <Share2 className="w-4 h-4" />
          Download All
        </button>
      </div>
    </div>
  );
};

export default ResultsGrid;
