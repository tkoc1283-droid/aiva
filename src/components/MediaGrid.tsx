import React from "react";
import Image from "next/image";
import { MediaItem } from "../data/sectors";
import VideoPlayer from "./VideoPlayer";
import { imageUrl } from "../lib/media";

interface MediaGridProps {
  media: MediaItem[];
  locale: string;
  labels: {
    videos: string;
    images: string;
    empty: string;
  };
}

export default function MediaGrid({ media, locale, labels }: MediaGridProps) {
  const videos = media.filter((item) => item.type === "video");
  const images = media.filter((item) => item.type === "image");

  if (media.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-cream p-8 text-center">
        <p className="text-stone">{labels.empty}</p>
      </div>
    );
  }

  const getRatioClass = (ratio?: string) => {
    switch (ratio) {
      case "9:16":
        return "aspect-[9/16]";
      case "1:1":
        return "aspect-square";
      case "4:5":
        return "aspect-[4/5]";
      case "3:4":
        return "aspect-[3/4]";
      case "16:9":
        return "aspect-video";
      default:
        return "aspect-[3/4]";
    }
  };

  return (
    <div className="space-y-16">
      {/* Videos Section */}
      {videos.length > 0 && (
        <div className="space-y-6">
          <h3 className="eyebrow text-stone border-b border-line pb-2">{labels.videos}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
            {videos.map((item) => {
              const itemTitle = item.title?.[locale as "tr" | "en"] || "";
              return (
                <div key={item.id} className="group relative space-y-3">
                  <div className={`relative overflow-hidden rounded-2xl bg-cream border border-line ${getRatioClass(item.ratio)}`}>
                    <VideoPlayer
                      src={item.src}
                      poster={item.poster}
                      className="w-full h-full"
                    />
                  </div>
                  {itemTitle && (
                    <p className="text-sm font-medium text-ink/80 transition-colors group-hover:text-ink pl-1">
                      {itemTitle}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Images Section */}
      {images.length > 0 && (
        <div className="space-y-6">
          <h3 className="eyebrow text-stone border-b border-line pb-2">{labels.images}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
            {images.map((item) => {
              const itemTitle = item.title?.[locale as "tr" | "en"] || "";
              const optimizedSrc = imageUrl(item.src, 1000);
              return (
                <div key={item.id} className="group relative space-y-3">
                  <div className={`relative overflow-hidden rounded-2xl bg-cream border border-line ${getRatioClass(item.ratio)}`}>
                    <Image
                      src={optimizedSrc}
                      alt={itemTitle || "Aiva Studio Production"}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-102"
                      priority={false}
                    />
                    
                    {/* Editorial hover shade for details */}
                    <div className="absolute inset-0 bg-ink/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                  {itemTitle && (
                    <p className="text-sm font-medium text-ink/80 transition-colors group-hover:text-ink pl-1">
                      {itemTitle}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
