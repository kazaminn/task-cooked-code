import type { ImageAttachment } from "../types/Note";

interface ImageGalleryProps {
  images: ImageAttachment[];
  onRemove: (imageId: string) => void;
}

export function ImageGallery({ images, onRemove }: ImageGalleryProps) {
  return (
    <div className="image-gallery">
      <h4 className="image-gallery-title">添付画像</h4>
      <div className="image-gallery-grid">
        {images.map((img) => (
          <div key={img.id} className="image-item">
            <img src={img.dataUrl} alt={img.name} />
            <button
              className="image-remove"
              onClick={() => onRemove(img.id)}
              title="削除"
            >
              ×
            </button>
            <span className="image-name">{img.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
