'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTv, faSignal } from '@fortawesome/free-solid-svg-icons';

// 1. IMPORT YOUR IMAGE MANUALLY FROM PUBLIC FOLDER
import ntvLogo from '../../../public/NTV.png'; 

export default function NTVUgandaPlayer() {
  const router = useRouter();
  
  // Media Data for NTV Uganda
  const media = {
    Title: "NTV Uganda",
    Year: "LIVE",
    Genre: "News, General Entertainment, Current Affairs",
    Plot: "NTV Uganda is the leading English-language television station in Uganda, known for high-quality news (NTV Tonight), investigative reporting, and popular local shows like 'The Hostel' and 'NTV Akawungeezi'.",
    Language: "English / Luganda",
    Country: "Uganda",
    Quality: "HD"
  };

  // Embed URL provided
  const embedUrl = "https://player.restream.io/?token=7add7c1deb104b678beea4dfec142acc&vwrs=1";
  const imgSrc = ntvLogo;

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
                <p className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Provider</p>
                <p className="text-amber-400 font-mono">Restream</p>
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

        {/* Video Player Section (iFrame for Restream) */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl border border-stone-800 aspect-video lg:h-[70vh] mx-auto">
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allowFullScreen
              allow="autoplay; encrypted-media"
              title="NTV Uganda Live"
            />
          </div>
        </div>
      </div>
    </div>
  );
}