"use client";

import { useState } from "react";
import Image from "next/image";
import { WCImage } from "@/types/woocommerce";

interface ProductImageGalleryProps {
  images: WCImage[];
  productName: string;
}

export default function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex];

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gradient-to-br from-purple-50 to-gray-50 rounded-3xl flex items-center justify-center border border-purple-100/50">
        <svg className="w-24 h-24 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="lg:sticky lg:top-36">
      {/* Main image */}
      <div className="relative aspect-square bg-gradient-to-br from-purple-50/50 to-white rounded-3xl overflow-hidden border border-purple-100/50 shadow-sm">
        {selectedImage && (
          <Image
            src={selectedImage.src}
            alt={selectedImage.alt || productName}
            fill
            className="object-contain p-8 hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
          {images.map((img, index) => (
            <button
              key={img.id}
              onClick={() => setSelectedIndex(index)}
              className={`relative w-20 h-20 shrink-0 rounded-2xl overflow-hidden transition-all duration-300 ${
                index === selectedIndex
                  ? "border-2 border-purple-600 shadow-lg shadow-purple-600/20 scale-105"
                  : "border-2 border-purple-100/50 hover:border-purple-300 opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={img.src}
                alt={img.alt || `${productName} ${index + 1}`}
                fill
                className="object-contain p-1.5"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
