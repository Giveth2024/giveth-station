'use client'

import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import Hls from 'hls.js'
import { useUser } from '@clerk/nextjs'

export default function GivethTV() {
  const { user } = useUser()
  const [givethtv, setGiveThTv] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedChannel, setSelectedChannel] = useState(null)
  const [failedChannels, setFailedChannels] = useState([])

  const videoRef = useRef(null)
  const hlsRef = useRef(null)
  const apiBase = process.env.NEXT_PUBLIC_GIVETH_SERVER_API

  // fetch channels
  useEffect(() => {
    let cancelled = false
    async function fetchChannels() {
      setLoading(true)
      setError(null)

      try {
        const res = await axios.get(`${apiBase}/api/tv`, {
          headers: { "x-clerk-id": user?.id }
        })
        if (!cancelled) {
          setGiveThTv(res.data.givethtv || [])
        }
      } catch (err) {
        console.error(err)
        if (!cancelled) setError('Unable to load channel list')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (user) fetchChannels()
    return () => { cancelled = true }
  }, [apiBase, user])

  // handle hls setup when channel changes
  // handle hls setup when channel changes
  useEffect(() => {
    if (!selectedChannel) return

    // Stop previous hls if exists
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    // If NTV Uganda → iframe, do nothing here
    if (selectedChannel.name === "NTV Uganda") return

    const video = videoRef.current
    if (!video) return

    if (Hls.isSupported() && selectedChannel.url.endsWith('.m3u8')) {
      const hls = new Hls()
      hls.loadSource(selectedChannel.url)
      hls.attachMedia(video)
      
      // *** FIX IS HERE ***
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS error:", data);
        
        // Only treat the error as a "failed channel" if it's FATAL
        if (data.fatal) {
          console.error(`FATAL HLS error for ${selectedChannel.name}:`, data);
          // Add the channel to the failed list and destroy HLS instance
          setFailedChannels(prev => {
            if (!prev.find(c => c.name === selectedChannel.name)) {
              return [...prev, selectedChannel];
            }
            return prev;
          });
          hls.destroy(); // Stop trying to play the fatal stream
        } 
        // Non-fatal errors (like bufferStalledError) are handled internally by HLS.js
      });
      // *** END FIX ***
      
      hlsRef.current = hls
    } else {
      // If HLS not supported or not an M3U8 file, use native video playback
      video.src = selectedChannel.url
    }
    
    // Set the video to play automatically (important for HLS)
    if (video) {
        video.play().catch(e => console.warn("Autoplay was prevented:", e));
    }

  }, [selectedChannel]) // Dependencies remain the same
  return (
    <div className="p-4 md:p-8 bg-stone-950 min-h-screen text-stone-100">
      <h1 className="text-3xl font-extrabold text-amber-400 mb-6 drop-shadow-lg">
        Giveth TV Player
      </h1>

      {loading && (
        <div className="text-amber-400 text-lg">
          Loading channels...
        </div>
      )}
      {error && (
        <div className="text-red-500 text-lg bg-stone-900 p-4 rounded-lg border border-red-500">
          Error: {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player Section */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-xl overflow-hidden shadow-2xl border border-amber-500 mb-4">
              {/* Show iframe if NTV Uganda */}
              {selectedChannel?.name === "NTV Uganda" ? (
                <iframe
                  src={selectedChannel.url}
                  className="w-full h-[40vh] md:h-[60vh] lg:h-[70vh]" // Adjusted height for better player experience
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title="NTV Uganda"
                />
              ) : (
                <video
                  ref={videoRef}
                  controls
                  playsInline
                  className="w-full h-[40vh] md:h-[60vh] lg:h-[70vh] bg-black" // Adjusted height for better player experience
                />
              )}
            </div>

            {/* Channel Dropdown */}
            <div className="flex gap-2 mb-4">
              <select
                className="border border-amber-600 bg-stone-800 text-stone-100 p-3 rounded-lg flex-1 shadow-md focus:ring-amber-500 focus:border-amber-500 transition duration-200"
                onChange={(e) => {
                  const ch = givethtv.find((c) => c.name === e.target.value);
                  setSelectedChannel(ch);
                }}
                value={selectedChannel?.name || ""}
              >
                <option value="" disabled className="text-stone-400">
                  Select a channel
                </option>
                {givethtv.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Failed channels info */}
            {failedChannels.length > 0 && (
              <div className="text-red-400 mt-4 bg-stone-900 p-4 rounded-lg border border-red-600">
                <strong className="block mb-1 text-red-300">
                  Failed to play channels:
                </strong>
                <ul className="list-disc list-inside text-sm ml-2">
                  {failedChannels.map((c, i) => (
                    <li key={`${c.name}-${i}`}>{c.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar channel list */}
          <aside className="lg:col-span-1 bg-stone-900 p-4 rounded-xl shadow-lg border border-amber-600">
            <h2 className="text-xl font-bold text-amber-400 mb-4 border-b border-amber-700 pb-2">
              GivethTV Channels
            </h2>
            <ul className="text-sm max-h-[calc(70vh+4rem)] overflow-y-auto space-y-1 pr-1">
              {givethtv.map((c) => (
                <li
                  key={c.name}
                  className={`p-2 rounded cursor-pointer transition duration-150 ease-in-out ${
                    selectedChannel?.name === c.name
                      ? "bg-amber-500 text-stone-950 font-semibold shadow-inner"
                      : "text-stone-200 hover:bg-stone-800"
                  }`}
                  onClick={() => setSelectedChannel(c)}
                >
                  {c.name}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      )}
    </div>
  )
}
