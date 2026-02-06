// src/components/user/ImageLightbox.jsx - FIXED VERSION

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { RiCloseLine, RiArrowLeftLine, RiArrowRightLine, RiDownloadLine } from 'react-icons/ri';

const ImageLightbox = ({ images, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = images[currentIndex];
    link.download = `complaint-image-${currentIndex + 1}.jpg`;
    link.click();
  };

  if (!images || images.length === 0) return null;

  // Use createPortal to render at document.body level (fixes z-index issues)
  return createPortal(
    <div 
      className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center animate-fadeIn"
      style={{ zIndex: 99999 }}
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:scale-110 z-10"
        aria-label="Close"
      >
        <RiCloseLine className="h-6 w-6" />
      </button>

      {/* Image Counter */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-full font-semibold text-sm z-10">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Previous Button */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrevious();
          }}
          className="fixed left-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:scale-110 z-10"
          aria-label="Previous"
        >
          <RiArrowLeftLine className="h-6 w-6" />
        </button>
      )}

      {/* Next Button */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="fixed right-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:scale-110 z-10"
          aria-label="Next"
        >
          <RiArrowRightLine className="h-6 w-6" />
        </button>
      )}

      {/* Image Container */}
      <div 
        className="relative w-full h-full flex items-center justify-center p-4 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          key={currentIndex} // Force re-render on index change
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-scaleIn"
          style={{ maxHeight: '90vh' }}
        />
        
        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="absolute bottom-4 right-4 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full transition-all hover:scale-110"
          aria-label="Download"
          title="Download Image"
        >
          <RiDownloadLine className="h-5 w-5" />
        </button>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-white/10 backdrop-blur-md rounded-full p-2 max-w-[90vw] overflow-x-auto">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? 'border-white scale-110 ring-2 ring-white/50'
                  : 'border-white/30 hover:border-white/60 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Thumb ${index + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body // ✅ Render at document.body level!
  );
};

export default ImageLightbox;