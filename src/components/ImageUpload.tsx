/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Upload, Camera, Type, X, Loader2, Image as ImageIcon, ArrowRight, Zap, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { NotificationModal } from './NotificationModal';

interface ImageUploadProps {
  onAnalyze: (image?: string, description?: string, isDemo?: boolean) => void;
  isLoading: boolean;
  persistedImage: string | null;
  setPersistedImage: (img: string | null) => void;
  persistedTitle: string;
  setPersistedTitle: (title: string) => void;
  persistedDescription: string;
  setPersistedDescription: (desc: string) => void;
}

export function ImageUpload({ 
  onAnalyze, 
  isLoading,
  persistedImage,
  setPersistedImage,
  persistedTitle,
  setPersistedTitle,
  persistedDescription,
  setPersistedDescription
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const selectedImage = persistedImage;
  const setSelectedImage = setPersistedImage;
  const title = persistedTitle;
  const setTitle = setPersistedTitle;
  const description = persistedDescription;
  const setDescription = setPersistedDescription;
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string } | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resizeAndCompressImage = (fileOrBlob: File | Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(fileOrBlob);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(img.src);
          reject(new Error("Failed to get 2D canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(img.src);
        // Export as optimized JPEG for extreme compatibility and small payload
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl);
      };
      img.onerror = (err) => {
        URL.revokeObjectURL(img.src);
        reject(err);
      };
    });
  };

  const handleFile = async (file: File) => {
    if (!file) return;

    setIsProcessingImage(true);

    try {
      const fileName = file.name.toLowerCase();
      const isHEIC = fileName.endsWith('.heic') || fileName.endsWith('.heif') || file.type === 'image/heic' || file.type === 'image/heif';

      let blobToProcess: File | Blob = file;

      if (isHEIC) {
        try {
          const heic2anyModule = await import('heic2any');
          const heic2anyFn = (heic2anyModule.default || heic2anyModule) as any;
          const result = await heic2anyFn({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.8
          });
          blobToProcess = Array.isArray(result) ? result[0] : result;
        } catch (heicError) {
          console.error("HEIC conversion failed:", heicError);
        }
      }

      // Convert and compress to JPEG data URL
      const dataUrl = await resizeAndCompressImage(blobToProcess);
      setSelectedImage(dataUrl);
    } catch (err: any) {
      console.error("Image optimization error, falling back:", err);
      // Fallback to FileReader if canvas approach fails
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          setSelectedImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } catch (fallbackErr) {
        setErrorModal({
          isOpen: true,
          title: "Formatting Error",
          message: "We encountered an issue optimizing this image. Please try a different format or copy/paste a screenshot."
        });
      }
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleAnalyze = (isDemo: boolean = false) => {
    if (isDemo) {
      onAnalyze(undefined, undefined, true);
      return;
    }

    if (!selectedImage && !title.trim() && !description.trim()) {
      setErrorModal({
        isOpen: true,
        title: "Missing Input",
        message: "Please upload a photo or provide a text description to start the scan."
      });
      return;
    }

    const combinedText = [title.trim(), description.trim()].filter(Boolean).join('\n\n');
    onAnalyze(
      selectedImage || undefined, 
      combinedText || undefined, 
      false
    );
  };

  return (
    <div className="max-w-3xl mx-auto w-full space-y-4 md:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Left: Image Upload Area */}
        <div 
          className={cn(
            "glass-card aspect-[16/10] md:aspect-[4/3] flex flex-col items-center justify-center p-6 md:p-8 border-dashed border-2 cursor-pointer transition-all relative group",
            dragActive ? "border-brand-accent bg-brand-accent/5" : "border-brand-border hover:border-brand-accent/30",
            selectedImage && "border-solid p-0"
          )}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => !selectedImage && fileInputRef.current?.click()}
        >
          {isProcessingImage ? (
            <div className="text-center p-4">
              <Loader2 className="w-10 h-10 text-brand-accent animate-spin mx-auto mb-4" />
              <h3 className="text-sm font-bold text-brand-text">Optimizing image...</h3>
              <p className="text-[10px] text-brand-text-muted mt-1">Converting & compressing for instant high-speed analysis</p>
            </div>
          ) : selectedImage ? (
            <div className="relative w-full h-full animate-fade-in">
              <img src={selectedImage} alt="Preview" className="w-full h-full object-cover rounded-xl" />
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-brand-bg/80 backdrop-blur-md flex items-center justify-center hover:bg-brand-bg transition-colors border border-brand-border z-10"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6 md:w-8 md:h-8 text-brand-accent" />
              </div>
              <h3 className="text-base md:text-lg font-bold mb-1 md:mb-2">Snap or drop a photo</h3>
              <p className="text-[10px] md:text-xs text-brand-text-muted px-4 mb-3 md:mb-4">
                Photos help AI detect condition & market value.
              </p>
              <span className="text-[10px] md:text-xs text-brand-accent font-black uppercase tracking-widest underline underline-offset-4">Browse files</span>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} 
          />
        </div>

        {/* Right: Text Description Area */}
        <div className="glass-card p-4 md:p-6 border-brand-border flex flex-col h-full bg-brand-bg/20">
          <div className="flex items-center gap-2 mb-4 md:mb-8">
            <Type className="w-3.5 h-3.5 text-brand-accent shrink-0" />
            <input 
              type="text"
              placeholder="ADD A TITLE"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-xs md:text-sm font-black uppercase tracking-[0.15em] text-brand-text placeholder-brand-text-muted/30 focus:outline-none"
            />
          </div>

          <textarea
            placeholder="Add specific details, rare editions, or flaws..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex-grow w-full bg-transparent text-brand-text placeholder-brand-text-muted/50 resize-none focus:outline-none text-sm md:text-base leading-relaxed p-0 min-h-[80px] md:min-h-[120px]"
          />
          <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-brand-border/50 text-[9px] md:text-[10px] text-brand-text-muted">
             <Zap className="w-3 h-3 inline mr-1 text-brand-accent" /> Combine photo & text for precision pricing.
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 md:gap-6 pt-2 md:pt-4">
        <button
          onClick={() => handleAnalyze(false)}
          disabled={isLoading || (!selectedImage && !title.trim() && !description.trim())}
          className={cn(
            "w-full sm:w-80 py-3.5 md:py-4 rounded-xl md:rounded-full font-black text-sm md:text-lg transition-all flex items-center justify-center gap-3 active:scale-[0.98] duration-150 uppercase tracking-widest",
            (!selectedImage && !title.trim() && !description.trim())
              ? "bg-brand-border text-brand-text-muted cursor-not-allowed opacity-50" 
              : isLoading
                ? "bg-brand-accent/50 text-brand-bg cursor-wait"
                : "bg-brand-accent text-brand-bg hover:scale-[1.02] active:brightness-90 shadow-xl shadow-brand-accent/10"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Scanning...
            </>
          ) : (
            <>
              Scan Product <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        {!isLoading && (
          <button 
            onClick={() => handleAnalyze(true)}
            className="text-brand-text-muted/60 hover:text-brand-accent transition-colors text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-2 group"
          >
            <Zap className="w-3.5 h-3.5 text-brand-accent group-hover:fill-brand-accent/20 transition-all" /> 
            Try Sample Analysis
          </button>
        )}
      </div>

      <NotificationModal 
        isOpen={!!errorModal?.isOpen}
        onClose={() => setErrorModal(null)}
        title={errorModal?.title || ''}
        message={errorModal?.message || ''}
        type="error"
        actionLabel="Try Again"
        onAction={() => fileInputRef.current?.click()}
      />
    </div>
  );
}
