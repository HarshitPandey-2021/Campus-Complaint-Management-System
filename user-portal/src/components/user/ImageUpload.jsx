// src/components/user/ImageUpload.jsx
import React, { useRef } from 'react';
import { RiImageAddLine, RiCloseLine, RiImage2Line } from 'react-icons/ri';

const ImageUpload = ({ images, setImages }) => {
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate: max 3 images
    if (images.length + files.length > 3) {
      alert('Maximum 3 images allowed');
      return;
    }

    // Validate each file
    const validFiles = files.filter(file => {
      // Check type
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        alert(`${file.name} is not a valid image (only JPG/PNG allowed)`);
        return false;
      }
      // Check size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        alert(`${file.name} exceeds 2MB limit`);
        return false;
      }
      return true;
    });

    // Create previews
    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview); // Clean up
      newImages.splice(index, 1);
      return newImages;
    });
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        Upload Images (Optional)
      </label>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        Max 3 images • JPG/PNG only • 2MB per image
      </p>

      {/* Upload Button */}
      {images.length < 3 && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
        >
          <RiImageAddLine className="h-5 w-5" />
          <span className="text-sm font-semibold">Add Image ({images.length}/3)</span>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        multiple
        onChange={handleImageChange}
        className="hidden"
      />

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600"
            >
              <img
                src={image.preview}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <RiCloseLine className="h-4 w-4" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-white truncate">{image.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;