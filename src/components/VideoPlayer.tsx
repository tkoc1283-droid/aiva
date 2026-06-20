"use client";

import React, { useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { videoUrl, videoPoster } from "../lib/media";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
}

export default function VideoPlayer({ src, poster, className = "" }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const finalSrc = videoUrl(src);
  const finalPoster = poster || videoPoster(src);

  return (
    <div
      className={`relative group overflow-hidden bg-ink/10 cursor-pointer ${className}`}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={finalSrc}
        poster={finalPoster}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
        loop
        muted={isMuted}
        playsInline
      />
      
      {/* Control Overlay */}
      <div className="absolute inset-0 bg-ink/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <button
          className="h-14 w-14 flex items-center justify-center rounded-full bg-cream text-ink shadow-kx transform transition-transform hover:scale-110 active:scale-95 duration-200"
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          aria-label={isPlaying ? "Duraklat" : "Oynat"}
        >
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current translate-x-0.5" />}
        </button>

        <button
          className="absolute bottom-4 right-4 h-9 w-9 flex items-center justify-center rounded-full bg-cream/80 text-ink backdrop-blur-sm shadow hover:bg-cream active:scale-95 duration-150"
          onClick={toggleMute}
          aria-label={isMuted ? "Sesi Aç" : "Sesi Kıs"}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Floating State Icons (Only visible when paused) */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-ink/5 pointer-events-none transition-opacity duration-300">
          <div className="h-16 w-16 flex items-center justify-center rounded-full bg-cream/90 text-ink shadow-kx backdrop-blur-sm">
            <Play className="h-7 w-7 fill-current translate-x-0.5" />
          </div>
        </div>
      )}
    </div>
  );
}
