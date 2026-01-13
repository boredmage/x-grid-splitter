import React, { useCallback, useState } from 'react';
import { Upload, ImageIcon, AlertCircle } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (base64: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file (JPG, PNG, WebP).');
        return;
      }

      setError(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageSelected(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    },
    [onImageSelected]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFile(e.dataTransfer.files[0]);
      }
    },
    [processFile]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ease-in-out cursor-pointer
          ${isDragging 
            ? 'border-indigo-400 bg-indigo-500/10 scale-[1.02]' 
            : 'border-slate-700 hover:border-slate-500 bg-slate-900/50'
          }
        `}
      >
        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileInput}
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={`p-4 rounded-full ${isDragging ? 'bg-indigo-500/20' : 'bg-slate-800'}`}>
            <Upload className={`w-10 h-10 ${isDragging ? 'text-indigo-400' : 'text-slate-400'}`} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-200">
              Upload your image
            </h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              Drag and drop or click to browse. We'll help you align it perfectly for the 4-panel grid.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-4 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
            <ImageIcon className="w-3 h-3 shrink-0" />
            <span>Recommended high resolution</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
