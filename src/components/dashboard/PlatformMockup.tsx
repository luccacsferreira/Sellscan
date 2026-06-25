import React from "react";
import { X, Copy, Check, ExternalLink } from "lucide-react";
import { ScanResult } from "../../types";
import { formatAmount, copyToClipboard, cn } from "../../lib/utils";

const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: "£",
  USD: "$",
  EUR: "€",
  BRL: "R$",
};

const PLATFORM_THEMES: Record<string, any> = {
  'eBay': {
    color: '#0064D2',
    bg: 'bg-white',
    text: 'text-[#333]',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg',
    button: 'bg-[#0064D2] text-white rounded-full',
    action: 'Buy It Now'
  },
  'Vinted': {
    color: '#09B1BA',
    bg: 'bg-white',
    text: 'text-[#111111]',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Vinted_logo.svg',
    button: 'bg-[#09B1BA] text-white rounded-md',
    action: 'Buy now'
  },
  'Mercado Livre': {
    color: '#FFE600',
    bg: 'bg-[#FFE600]',
    text: 'text-[#333]',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Mercado_Livre_logo.svg',
    button: 'bg-[#3483FA] text-white rounded-sm',
    action: 'Comprar agora'
  },
  'Enjoei': {
    color: '#F4007B',
    bg: 'bg-white',
    text: 'text-[#333]',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Enjoei_logo.svg', // Placeholder or simplified pink circle
    button: 'bg-[#F4007B] text-white rounded-full',
    action: 'Eu quero'
  },
  'Depop': {
    color: '#FF0000',
    bg: 'bg-white',
    text: 'text-black',
    logo: '',
    button: 'bg-black text-white rounded-none',
    action: 'Buy'
  }
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
  const [copiedField, setCopiedField] = React.useState<string | null>(null);
  const theme = PLATFORM_THEMES[platform] || {
    color: '#6366f1',
    bg: 'bg-white',
    text: 'text-gray-900',
    button: 'bg-indigo-600 text-white rounded-lg',
    action: 'Purchase'
  };

  const handleCopy = (field: string, text: string) => {
    copyToClipboard(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const currencySymbol = CURRENCY_SYMBOLS[scan.analysis.priceRange.currency] || scan.analysis.priceRange.currency;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-brand-bg/90 backdrop-blur-2xl"
        onClick={onClose}
      />
      <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-4xl max-h-[90vh] overflow-hidden relative z-10 flex flex-col text-black">
        {/* Platform Branded Header */}
        <div className={cn("p-4 flex items-center justify-between border-b", theme.bg)}>
          <div className="flex items-center gap-4">
            {theme.logo ? (
              <img src={theme.logo} alt={platform} className="h-8 max-w-[120px] object-contain" />
            ) : (
              <span className="font-black text-xl italic tracking-tighter uppercase">{platform}</span>
            )}
            <div className="h-8 w-[1px] bg-black/10 mx-2" />
            <div className="flex items-center gap-1 text-[10px] font-bold text-black/60 uppercase tracking-widest bg-black/5 px-2 py-1 rounded">
              <ExternalLink className="w-3 h-3" /> Live Meta-Render
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/5 rounded-full transition-colors text-black"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#f8f8f8]">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Image Section */}
            <div className="bg-white p-6 flex flex-col gap-4">
              <div className="aspect-square rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center group relative">
                <img
                  src={scan.imageUrl}
                  className="w-full h-full object-contain"
                  alt="Product"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className={cn("aspect-square rounded bg-gray-50 border border-gray-100 opacity-50", i === 1 && "border-blue-500 opacity-100")} />
                ))}
              </div>
            </div>

            {/* Info Section */}
            <div className="p-8 space-y-8 bg-white border-l border-gray-100">
              <div className="space-y-4">
                <div className="flex justify-between items-start group">
                  <h1 className="text-2xl font-bold leading-tight text-gray-900 group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => handleCopy('title', scan.analysis.suggestedTitle || '')}>
                    {scan.analysis.suggestedTitle}
                  </h1>
                  <button 
                    onClick={() => handleCopy('title', scan.analysis.suggestedTitle || '')}
                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all flex-shrink-0"
                  >
                    {copiedField === 'title' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {currencySymbol}{formatAmount(scan.analysis.priceRange.sweetSpot)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    {currencySymbol}{formatAmount(scan.analysis.priceRange.sweetSpot * 1.32)}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-bold uppercase tracking-wider">Condition</span>
                  <span className="text-gray-900 font-medium">{scan.analysis.productDetails.condition}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-bold uppercase tracking-wider">Category</span>
                  <span className="text-gray-900 font-medium">{scan.analysis.productDetails.category}</span>
                </div>
              </div>

              <button className={cn("w-full py-4 font-bold text-lg transition-all shadow-lg active:scale-[0.98]", theme.button)}>
                {theme.action}
              </button>

              <div className="space-y-4 border-t border-gray-100 pt-8 relative">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400">Description</h3>
                  <button 
                    onClick={() => handleCopy('desc', scan.analysis.suggestedDescription || '')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-lg text-xs font-bold transition-all border border-transparent hover:border-blue-100"
                  >
                    {copiedField === 'desc' ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy All</>}
                  </button>
                </div>
                <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap font-medium max-h-[200px] overflow-y-auto pr-2 custom-scrollbar-light">
                  {scan.analysis.suggestedDescription}
                </div>
              </div>

              {scan.analysis.tutorial && (
                <div className="space-y-4 border-t border-gray-100 pt-8 relative">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-500 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Listing Tutorial
                    </h3>
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap font-medium p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                    {scan.analysis.tutorial}
                  </div>
                </div>
              )}
              
              <div className="pt-4 flex items-center justify-center gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-1 border border-blue-100">AI</div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Generator</span>
                </div>
                <div className="h-6 w-[1px] bg-gray-100" />
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center font-bold mb-1 border border-green-100">100%</div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Optimized</span>
                </div>
              </div>

              {scan.analysis.researchedUrls && scan.analysis.researchedUrls.length > 0 && (
                <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-2 items-center justify-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-2">Researched via:</span>
                  {scan.analysis.researchedUrls.slice(0, 5).map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="w-6 h-6 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-gray-100 transition-colors" title={url}>
                      <img src={`https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`} alt="" className="w-3.5 h-3.5 object-contain" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
