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
        // Search by the detected label or title
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
  }, [product]);

  if (!product) return null;

  const displayTitle = wooProduct ? wooProduct.name : product.title;
  const displayPrice = wooProduct ? parseFloat(wooProduct.price) : product.price;
  const displayDesc = wooProduct ? wooProduct.short_description.replace(/(<([^>]+)>)/gi, "") : product.description;
  const displayImage = wooProduct && wooProduct.images && wooProduct.images.length > 0 ? wooProduct.images[0].src : product.image;
  const displayCategory = wooProduct && wooProduct.categories && wooProduct.categories.length > 0 ? wooProduct.categories[0].name : product.category;

  const buyUrl = wooProduct ? wooProduct.permalink : (product.shopUrl || `https://www.amazon.com/s?k=${encodeURIComponent(product.title)}`);

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: '360px',
      background: 'white', boxShadow: '-4px 0 30px rgba(0,0,0,0.15)',
      zIndex: 50, display: 'flex', flexDirection: 'column',
      overflowY: 'auto', padding: '24px',
      borderLeft: '1px solid #e5e7eb'
    }}>
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '22px', color: '#6b7280', lineHeight: 1
        }}
        aria-label="Close"
      >✕</button>

      {/* Object label badge */}
      {product.label && (
        <span style={{
          alignSelf: 'flex-start',
          background: '#dcfce7', color: '#15803d',
          fontSize: '11px', fontWeight: 700, padding: '3px 10px',
          borderRadius: '999px', textTransform: 'uppercase',
          letterSpacing: '0.08em', marginBottom: '16px', marginTop: '8px'
        }}>
          Detected: {product.label}
        </span>
      )}

      {/* Product image */}
      <div style={{
        display: 'flex', justifyContent: 'center', marginBottom: '20px',
        background: '#f9fafb', borderRadius: '12px', padding: '16px'
      }}>
        <img
          src={displayImage}
          alt={displayTitle}
          style={{ width: '180px', height: '180px', objectFit: 'contain' }}
          onError={e => { e.target.src = 'https://placehold.co/180x180?text=Product'; }}
        />
      </div>

      {/* Category */}
      <span style={{
        fontSize: '11px', fontWeight: 600, color: '#3b82f6',
        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px'
      }}>
        {displayCategory}
      </span>

      {/* Title */}
      <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#111827', marginBottom: '8px', lineHeight: 1.4 }}>
        {displayTitle}
      </h2>

      {/* Price */}
      <p style={{ fontSize: '26px', fontWeight: 800, color: '#16a34a', marginBottom: '12px' }}>
        ${displayPrice?.toFixed(2)}
      </p>

      {/* Description */}
      <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6, marginBottom: '24px', flexGrow: 1 }}>
        {loading ? "Loading..." : displayDesc}
      </p>

      {/* Buy button */}
      <a
        href={buyUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'block', textAlign: 'center',
          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
          color: 'white', fontWeight: 700, fontSize: '15px',
          padding: '14px', borderRadius: '10px', textDecoration: 'none',
          boxShadow: '0 4px 12px rgba(37,99,235,0.35)',
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        {wooProduct ? '🛒 Shop Now' : '🛒 Shop Now on Amazon'}
      </a>
    </div>
  );
};

export default ProductPanel;
