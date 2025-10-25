import { useState } from 'react';
import { RiImageLine } from 'react-icons/ri';
import ImageLightbox from './ImageLightbox';

export default function ImageGallery({ images, compact = false }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-4 text-gray-400 dark:text-gray-600">
        <RiImageLine className="mx-auto text-4xl mb-2" />
        <p className="text-sm">No images attached</p>
      </div>
    );
  }

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Compact mode: Single thumbnail with count badge (for table)
  if (compact) {
    return (
      <div className="relative inline-block">
        <img
          src={images[0]}
          alt="Complaint"
          className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80 transition"
          onClick={() => openLightbox(0)}
        />
        {images.length > 1 && (
          <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {images.length}
          </span>
        )}
        {lightboxOpen && (
          <ImageLightbox
            images={images}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </div>
    );
  }

  // Full gallery mode (for modal)
  return (
    <div>
      <div className={`grid gap-2 ${
        images.length === 1 ? 'grid-cols-1' :
        images.length === 2 ? 'grid-cols-2' :
        'grid-cols-2 md:grid-cols-3'
      }`}>
        {images.map((image, index) => (
          <div
            key={index}
            className="relative group cursor-pointer overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700"
            onClick={() => openLightbox(index)}
          >
            <img
              src={image}
              alt={`Issue ${index + 1}`}
              className="w-full h-32 md:h-40 object-cover transition-transform group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
              <RiImageLine className="text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>

      {lightboxOpen && (
        <ImageLightbox
          images={images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}