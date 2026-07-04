import React, { useState, useEffect } from 'react';
import WooCommerce from '../utils/woocommerce';

const ProductPanel = ({ product, onClose }) => {
  const [wooProduct, setWooProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!product) return;
    
    const fetchWooProduct = async () => {
      setLoading(true);
      try {
        const response = await WooCommerce.get("products", {
          search: product.label || product.title,
          per_page: 1
        });
        if (response.data && response.data.length > 0) {
          setWooProduct(response.data[0]);
        } else {
          setWooProduct(null);
        }
      } catch (error) {
        console.error("Error fetching from WooCommerce:", error);
        setWooProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWooProduct();
    fetchWooProduct();
  }, [product]);

  const getAiSummary = (label, markdown) => {
    if (!markdown || !label) return null;
    const lines = markdown.split('\n');
    let capturing = false;
    let summary = "";
    
    for (const line of lines) {
      if (line.match(/^\d+\.\s+\*\*/)) {
         if (line.toLowerCase().includes(label.toLowerCase()) || label.toLowerCase().includes(line.replace(/^\d+\.\s+\*\*/, '').replace(/\*\*.*$/, '').toLowerCase().trim())) {
            capturing = true;
         } else {
            capturing = false;
         }
      } else if (capturing) {
         if (line.trim().length > 0) {
            summary += line.replace(/^\s*-\s+\*\*.*?\*\*:?\s*/g, '') + " ";
         }
      }
    }
    return summary.trim();
  };

  if (!product) return null;

  const displayTitle = wooProduct ? wooProduct.name : product.title || product.label;
  const displayPrice = wooProduct ? parseFloat(wooProduct.price) : (product?.price ? parseFloat(product.price) : 49.99);
  
  const aiSummary = getAiSummary(product.label, product.twelvelabs_analysis);
  const displayDesc = aiSummary || (wooProduct ? wooProduct.short_description.replace(/(<([^>]+)>)/gi, "") : product.description || `A highly advanced ${product.label} featuring next-gen specs.`);
  
  const displayImage = wooProduct && wooProduct.images && wooProduct.images.length > 0 ? wooProduct.images[0].src : product.image || `https://placehold.co/400x400/0f0f13/00f3ff?text=${product.label}`;
  const displayCategory = wooProduct && wooProduct.categories && wooProduct.categories.length > 0 ? wooProduct.categories[0].name : product.category || 'Gear';

  const handleAmazonClick = () => {
    if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
  }

  const buyUrl = wooProduct ? wooProduct.permalink : (product.shopUrl || `https://www.amazon.com/s?k=${encodeURIComponent(product.label)}`);

  return (
    <div 
      className={`fixed inset-y-0 right-0 w-[400px] max-w-full bg-[#030303]/95 backdrop-blur-2xl border-l border-white/5 transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-50 shadow-2xl flex flex-col ${
        product ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

      {/* Close button */}
      <div className="flex items-center justify-between p-6 pb-2">
        <h3 className="text-sm font-semibold text-[#f9fafb]">Analysis Panel</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-[#9ca3af] hover:text-[#f9fafb] transition-colors shrink-0"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-8 custom-scrollbar">
        {/* Object label badge */}
        {product.label && (
          <div className="flex mb-4 mt-2">
            <span className="bg-white/5 border border-white/10 text-[#f9fafb] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              Detected: {product.label}
            </span>
          </div>
        )}

        {/* Product image */}
        <div className="flex justify-center mb-6 bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
          <img
            src={displayImage}
            alt={displayTitle}
            className="w-48 h-48 object-contain z-10 transition-transform duration-500 group-hover:scale-110"
          />
        </div>

        {/* Category & Title */}
        <div className="mb-6">
          <span className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-widest mb-1 block">
            {displayCategory}
          </span>
          <h2 className="text-2xl font-bold text-[#f9fafb] mb-2 leading-tight">
            {displayTitle}
          </h2>
          <div className="flex items-center gap-2 mb-4">
             <span className="px-2 py-1 rounded border border-white/10 bg-white/5 text-[10px] text-[#9ca3af] font-mono">
               {product.twelvelabs_analysis ? 'Pegasus 1.5' : 'YOLOv8'}
             </span>
             <span className="text-xs font-medium text-[#f9fafb]">
               {aiSummary ? 'Deep Context Available' : 'Standard Context'}
             </span>
          </div>
          <p className="text-sm text-[#9ca3af] leading-relaxed">
            {loading ? "Decrypting product data..." : displayDesc}
          </p>
        </div>

        {/* Store Offers Card List */}
        <div className="mt-8">
          <h4 className="text-xs font-bold text-[#f9fafb] uppercase tracking-widest mb-4">Available Stores</h4>
          
          <div className="flex flex-col gap-3">
            {/* Amazon Card */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3 hover:bg-white/10 transition-colors group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🛒</span>
                  <span className="font-semibold text-sm text-[#f9fafb]">Amazon</span>
                </div>
                <div className="text-[10px] font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                  In Stock
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-xl font-bold text-[#f9fafb]">${displayPrice?.toFixed(2)}</div>
                  <div className="text-xs text-[#9ca3af] line-through">${(displayPrice * 1.2).toFixed(2)}</div>
                </div>
                <a
                  href={buyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleAmazonClick}
                  className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-fuchsia-500 via-purple-600 to-cyan-500 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity active:scale-95 shrink-0 shadow-lg shadow-purple-500/20"
                >
                  Shop Now
                </a>
              </div>
            </div>

            {/* Dummy Alternate Store Card */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3 hover:bg-white/10 transition-colors group opacity-60 grayscale hover:grayscale-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🛍</span>
                  <span className="font-semibold text-sm text-[#f9fafb]">WooCommerce</span>
                </div>
                <div className="text-[10px] font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                  Few Left
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-xl font-bold text-[#f9fafb]">${(displayPrice * 0.95).toFixed(2)}</div>
                  <div className="text-xs text-[#9ca3af]">Standard Delivery</div>
                </div>
                <button className="flex items-center justify-center gap-1.5 bg-white/10 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-white/20 transition-colors active:scale-95 shrink-0 cursor-not-allowed">
                  Order Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Full AI Scene Overview */}
        {product.twelvelabs_analysis && (
          <div className="mt-8 mb-4">
            <h4 className="text-xs font-bold text-[#f9fafb] uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 box-glow" />
              Pegasus 1.5 Scene Overview
            </h4>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-[#9ca3af] whitespace-pre-wrap font-mono leading-relaxed max-h-64 overflow-y-auto custom-scrollbar">
              {product.twelvelabs_analysis}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPanel;
