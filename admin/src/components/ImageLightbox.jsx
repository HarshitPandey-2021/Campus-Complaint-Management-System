import { useState, useEffect } from 'react';
import { RiCloseLine, RiArrowLeftLine, RiArrowRightLine, RiDownloadLine } from 'react-icons/ri';

export default function ImageLightbox({ images, initialIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [currentIndex]);

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
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition z-10"
        aria-label="Close lightbox"
      >
        <RiCloseLine size={36} />
      </button>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="absolute top-4 right-16 text-white hover:text-gray-300 transition z-10"
        aria-label="Download image"
      >
        <RiDownloadLine size={28} />
      </button>

      {/* Image Counter */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-lg font-medium bg-black bg-opacity-50 px-4 py-2 rounded-full">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Previous Button */}
      {images.length > 1 && (
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition bg-black bg-opacity-50 p-3 rounded-full"
          aria-label="Previous image"
        >
          <RiArrowLeftLine size={32} />
        </button>
      )}

      {/* Main Image */}
      <div className="relative max-w-7xl max-h-screen px-4 md:px-16">
        <img
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          className="max-w-full max-h-screen object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()} // Prevent close on image click
        />
      </div>

      {/* Next Button */}
      {images.length > 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition bg-black bg-opacity-50 p-3 rounded-full"
          aria-label="Next image"
        >
          <RiArrowRightLine size={32} />
        </button>
      )}

      {/* Thumbnail Strip (Desktop only) */}
      {images.length > 1 && (
        <div className="hidden md:flex absolute bottom-4 left-1/2 transform -translate-x-1/2 space-x-2 bg-black bg-opacity-50 p-2 rounded-lg max-w-full overflow-x-auto">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 ${
                index === currentIndex
                  ? 'ring-2 ring-white scale-110'
                  : 'opacity-60 hover:opacity-100'
              } transition-all`}
            >
              <img
                src={img}
                alt={`Thumbnail ${index + 1}`}
                className="w-16 h-16 object-cover rounded"
              />
            </button>
          ))}
        </div>
      )}

      {/* Background Click to Close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
        aria-label="Close lightbox"
      />
    </div>
  );
}