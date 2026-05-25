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
}

export function ImageUpload({ onAnalyze, isLoading }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorModal({
        isOpen: true,
        title: "Format Not Supported",
        message: `Our scanning engine only accepts image files (JPG, PNG, WebP). You tried to upload a "${file.type || 'unknown'}" file.`
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = (isDemo: boolean = false) => {
    if (isDemo) {
      onAnalyze(undefined, undefined, true);
      return;
    }

    // Check if title or description were typed but no image selected
    const hasText = title.trim() || description.trim();
    const hasImage = !!selectedImage;

    if (hasImage || hasText) {
      const combinedText = [title.trim(), description.trim()].filter(Boolean).join('\n\n');
      onAnalyze(
        selectedImage || undefined, 
        combinedText || undefined, 
        false
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Image Upload Area */}
        <div 
          className={cn(
            "glass-card aspect-[4/3] flex flex-col items-center justify-center p-8 border-dashed border-2 cursor-pointer transition-all relative group",
            dragActive ? "border-brand-accent bg-brand-accent/5" : "border-brand-border hover:border-brand-accent/30",
            selectedImage && "border-solid p-0"
          )}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => !selectedImage && fileInputRef.current?.click()}
        >
          {selectedImage ? (
            <div className="relative w-full h-full">
              <img src={selectedImage} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-brand-bg/80 backdrop-blur-md flex items-center justify-center hover:bg-brand-bg transition-colors border border-brand-border z-10"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Camera className="w-8 h-8 text-brand-accent" />
              </div>
              <h3 className="text-lg font-bold mb-2">Snap or drop a photo</h3>
              <p className="text-xs text-brand-text-muted px-4 mb-4">
                Photos help the AI detect condition, brand details, and authentic market value.
              </p>
              <span className="text-xs text-brand-accent font-semibold underline">Browse files</span>
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
        <div className="glass-card p-6 border-brand-border flex flex-col h-full bg-brand-bg/20">
          <div className="flex items-center gap-2 mb-8">
            <Type className="w-4 h-4 text-brand-accent shrink-0" />
            <input 
              type="text"
              placeholder="ADD A TITLE"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-sm font-bold uppercase tracking-widest text-white placeholder-brand-text-muted/40 focus:outline-none"
            />
          </div>

          <textarea
            placeholder="Add details like size, rare editions, or flaws that might not be visible in the photo..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex-grow w-full bg-transparent text-white placeholder-brand-text-muted/50 resize-none focus:outline-none text-base leading-relaxed p-0 min-h-[120px]"
          />
          <div className="mt-4 pt-4 border-t border-brand-border/50 text-[10px] text-brand-text-muted">
             <Zap className="w-3 h-3 inline mr-1 text-brand-accent" /> Combine photo & text for 40% more accurate pricing.
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 pt-4">
        <button
          onClick={() => handleAnalyze(false)}
          disabled={isLoading || (!selectedImage && !title.trim() && !description.trim())}
          className={cn(
            "w-full sm:w-80 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-3",
            (isLoading || (!selectedImage && !title.trim() && !description.trim())) 
              ? "bg-brand-border text-brand-text-muted cursor-not-allowed" 
              : "bg-brand-accent text-brand-bg hover:scale-[1.02] shadow-[0_10px_30px_-10px_var(--color-brand-accent-glow)]"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" /> Analyzing product...
            </>
          ) : (
            <>
              Scan Product <ArrowRight className="w-6 h-6" />
            </>
          )}
        </button>

        {!isLoading && (
          <button 
            onClick={() => handleAnalyze(true)}
            className="text-brand-text-muted hover:text-brand-accent transition-colors text-sm font-bold flex items-center gap-2 group"
          >
            <Zap className="w-4 h-4 text-brand-accent group-hover:fill-brand-accent/20 transition-all" /> 
            Try Sample Analysis (Demo Mode)
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
