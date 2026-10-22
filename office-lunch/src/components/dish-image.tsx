import Image, { type ImageLoader } from "next/image";

// Ảnh Unsplash: dùng CDN của Unsplash để cắt/resize, không qua máy chủ Next.
const unsplashLoader: ImageLoader = ({ src, width, quality }) =>
  `${src}?w=${width}&q=${quality ?? 70}&auto=format&fit=crop`;

export function DishImage({ src, alt, sizes, className = "", priority }: { src: string; alt: string; sizes: string; className?: string; priority?: boolean }) {
  return (
    <div className={`relative overflow-hidden bg-surface-2 ${className}`}>
      {src && <Image loader={unsplashLoader} src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />}
    </div>
  );
}
