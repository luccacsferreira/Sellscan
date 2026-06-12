import React from "react";
import { X } from "lucide-react";
import { ScanResult } from "../../types";
import { formatAmount } from "../../lib/utils";

const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: "£",
  USD: "$",
  EUR: "€",
  BRL: "R$",
};

export function PlatformMockup({
  platform,
  scan,
  onClose,
}: {
  platform: string;
  scan: ScanResult;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-brand-bg/90 backdrop-blur-2xl"
        onClick={onClose}
      />
      <div className="bg-brand-card border border-brand-border rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar relative z-10 flex flex-col">
        <div className="p-6 border-b border-brand-border flex items-center justify-between sticky top-0 bg-brand-bg/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-[10px] font-black uppercase text-brand-accent">
              Live Render: {platform}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-8">
          <div className="max-w-xl mx-auto space-y-10 pb-10">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-brand-card border border-brand-border group">
              <img
                src={scan.imageUrl}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              />
            </div>
            <div className="space-y-6">
              <h1 className="text-3xl font-black tracking-tight">
                {scan.analysis.suggestedTitle}
              </h1>
              <div className="flex items-center justify-between border-y border-brand-border/50 py-6">
                <span className="text-4xl font-black text-brand-accent">
                  {CURRENCY_SYMBOLS[scan.analysis.priceRange.currency] ||
                    scan.analysis.priceRange.currency}
                  {formatAmount(scan.analysis.priceRange.sweetSpot)}
                </span>
                <button className="px-8 py-3 rounded-2xl bg-brand-accent text-brand-bg font-black uppercase text-xs">
                  Buy Now
                </button>
              </div>
              <div className="prose prose-invert prose-sm">
                {scan.analysis.suggestedDescription}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
