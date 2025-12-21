"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

export default function LiveTVPage() {
  const videoRef = useRef(null);

  const hlsUrl =
    "https://cfd-v4-service-channel-stitcher-use1-1.prd.pluto.tv/stitch/hls/channel/6675c7868768aa0008d7f1c7/master.m3u8?appName=web&appVersion=unknown&clientTime=0&deviceDNT=0&deviceId=d3595b5a-7553-4a6b-b9dd-c30951631395&deviceMake=Chrome&deviceModel=web&deviceType=web&deviceVersion=unknown&includeExtendedEvents=false&serverSideAds=false&sid=bc32713f-dc5f-45d9-8650-2b4e69506b23";

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    // Safari (native HLS)
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = hlsUrl;
    }
    // Other browsers
    else if (Hls.isSupported()) {
      const hls = new Hls({
        lowLatencyMode: true,
      });

      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      return () => {
        hls.destroy();
      };
    }
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-white px-4">
      
      <section className="w-full max-w-5xl">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-center">
          Live TV on <span className="text-amber-400">GivethStation ⚡</span>
        </h1>

        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-stone-700 bg-black">
          <video
            ref={videoRef}
            controls
            autoPlay
            playsInline
            className="w-full h-auto max-h-[70vh] bg-black"
          />
        </div>

        <p className="mt-4 text-center text-stone-400 text-sm">
          Streaming live content. Playback quality adapts to your internet speed.
        </p>
      </section>

        {/* <iframe src="https://pluto.tv/e7b2bfb6-57c8-4b86-998b-de7c18ae9a8b" className="h-[500px] w-full"></iframe> */}

      <footer className="mt-10 text-stone-400 text-sm">
        © {new Date().getFullYear()} GivethStation. All rights reserved.
      </footer>
    </main>
  );
}
