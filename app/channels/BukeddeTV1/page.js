'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Hls from 'hls.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTv, faSignal } from '@fortawesome/free-solid-svg-icons';

// 1. IMPORT YOUR IMAGE MANUALLY
import bukeddeLogo from '../../../public/bukeddeTv1.png'; 

export default function BukeddePlayer() {
  const router = useRouter();
  const videoRef = useRef(null);
  
  // Mock Media Data for Bukedde TV 1
  const media = {
    Title: "Bukedde TV 1",
    Year: "LIVE",
    Genre: "News, Entertainment, Luganda",
    Plot: "Bukedde TV 1 is Uganda's leading Luganda station, providing the latest news (Agataliiko Fuufu), soaps, and local entertainment.",
    Language: "Luganda",
    Country: "Uganda",
    Quality: "576p"
  };

  const streamUrl = "https://stream.hydeinnovations.com/bukedde1flussonic/index.m3u8";
  const imgSrc = bukeddeLogo; // Example logo

  useEffect(() => {
    let hls;
    if (videoRef.current) {
      const video = videoRef.current;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native support (Safari)
        video.src = streamUrl;
      } else if (Hls.isSupported()) {
        // HLS.js support (Chrome, Firefox, etc)
        hls = new Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      }
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [streamUrl]);


  return (
    <div className="bg-stone-950 text-stone-100 min-h-screen p-4 md:p-6 font-sans">
      {/* Navigation */}
      <button
        onClick={() => router.push("/tv")}
        className="px-6 py-2 mb-6 bg-amber-400 text-stone-900 font-bold rounded-lg shadow-lg hover:bg-amber-500 hover:scale-105 transition-all duration-300 flex items-center gap-2"
      >
        ←
      </button>

      {/* Main Layout Container */}
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Info Section */}
        <div className="flex flex-col lg:flex-row gap-8 p-6 bg-stone-900/50 backdrop-blur-md rounded-3xl shadow-2xl border border-stone-800 hover:border-amber-500/50 transition-colors">
          
          {/* Channel Logo/Poster */}
          <div className="flex-shrink-0 mx-auto lg:mx-0 w-64 h-64 md:w-72 md:h-72 relative rounded-2xl shadow-[0_0_30px_rgba(251,191,36,0.1)] border-2 border-amber-500/30 overflow-hidden group">
            <Image
              src={imgSrc || "/placeholder.jpg"}
              alt={media.Title}
              fill
              className="object-contain p-4 group-hover:scale-110 transition-transform duration-700"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 to-transparent" />
            <div className="absolute bottom-3 left-3">
              <span className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white text-xs font-black rounded-full animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full" /> LIVE
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col justify-center gap-4">
            <div className="space-y-1">
              <h1 className="text-5xl md:text-6xl font-black text-amber-400 tracking-tight">
                {media.Title}
              </h1>
              <p className="text-stone-400 font-medium flex items-center gap-2">
                <FontAwesomeIcon icon={faTv} className="text-amber-500" /> {media.Genre}
              </p>
            </div>

            <p className="text-stone-300 text-lg leading-relaxed max-w-2xl border-l-4 border-amber-500 pl-4 bg-stone-800/30 py-2">
              {media.Plot}
            </p>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
              <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700">
                <p className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Quality</p>
                <p className="text-amber-400 font-mono">{media.Quality}</p>
              </div>
              <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700">
                <p className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Language</p>
                <p className="text-stone-200">{media.Language}</p>
              </div>
              <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700">
                <p className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Status</p>
                <p className="text-green-400 flex items-center gap-1">Online <FontAwesomeIcon icon={faSignal} className="text-[10px]" /></p>
              </div>
              <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700">
                <p className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Region</p>
                <p className="text-stone-200">{media.Country}</p>
              </div>
            </div>

          </div>
        </div>

        {/* Video Player Section */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl border border-stone-800 aspect-video lg:h-[70vh] mx-auto">
            <video
              ref={videoRef}
              controls
              className="w-full h-full"
              poster={imgSrc} // Optional poster
              autoPlay
              muted // Most browsers require muted for autoplay
            />
          </div>
        </div>
      </div>
    </div>
  );
}