'use client'

import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import Hls from 'hls.js'
import { useUser } from '@clerk/nextjs'

export default function TheAppTV() {
  const { user } = useUser()
  const [channels, setChannels] = useState([]) 
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedChannel, setSelectedChannel] = useState(null)
  const [failedChannels, setFailedChannels] = useState([])

  const videoRef = useRef(null)
  const hlsRef = useRef(null)
  const apiBase = process.env.NEXT_PUBLIC_GIVETH_SERVER_API
  const proxyBase = "https://giveth-station-theapptv-proxy-server.onrender.com/api/proxy"

  // Fetch channels from your API
  useEffect(() => {
    let cancelled = false
    async function fetchChannels() {
      setLoading(true)
      setError(null)
      try {
        const res = await axios.get(`${apiBase}/api/tv`, {
          headers: { "x-clerk-id": user?.id }
        })
        if (!cancelled) setChannels(res.data.thetvapp || [])
      } catch (err) {
        console.error(err)
        if (!cancelled) setError('Unable to load TheTVApp channel list')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (user) fetchChannels()
    return () => { cancelled = true }
  }, [apiBase, user])

  // Auto-play selected channel using proxy
  useEffect(() => {
    if (!selectedChannel) return

    const video = videoRef.current
    if (!video) return

    // Destroy previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    // Special case: iframe embed for NTV Uganda
    if (selectedChannel.name === "NTV Uganda") return

    async function setupHLS() {
      try {
        // Fetch proxy URL from your Node server
        const res = await axios.get(proxyBase, {
          params: { url: selectedChannel.url }
        })

        const proxyUrl = res.data.proxyUrl
        console.log("🎯 Playing HLS via proxy:", proxyUrl)

        if (Hls.isSupported()) {
          const hls = new Hls()
          hls.loadSource(proxyUrl)
          hls.attachMedia(video)
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(e => console.warn("Autoplay prevented:", e))
          })
          hlsRef.current = hls
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = proxyUrl
          video.play().catch(e => console.warn("Autoplay prevented:", e))
        }
      } catch (err) {
        console.error("❌ HLS setup error:", err)
        setFailedChannels(prev => [...prev, selectedChannel])
      }
    }

    setupHLS()

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [selectedChannel])

  return (
    <div className="p-4 md:p-8 bg-stone-950 min-h-screen text-stone-100">
      <h1 className="text-3xl font-extrabold text-amber-400 mb-6 drop-shadow-lg">
        TheApp TV Player
      </h1>

      {loading && <div className="text-amber-400 text-lg">Loading channels...</div>}
      {error && (
        <div className="text-red-500 bg-stone-900 p-4 rounded-lg border border-red-500">
          Error: {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player Section */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-xl overflow-hidden shadow-2xl border border-amber-500 mb-4">
              {selectedChannel?.name === "NTV Uganda" ? (
                <iframe
                  src={selectedChannel.url}
                  className="w-full h-[40vh] md:h-[60vh] lg:h-[70vh]"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title="NTV Uganda"
                />
              ) : (
                <video
                  ref={videoRef}
                  controls
                  playsInline
                  className="w-full h-[40vh] md:h-[60vh] lg:h-[70vh] bg-black"
                />
              )}
            </div>

            {/* Channel Dropdown */}
            <div className="flex gap-2 mb-4">
              <select
                className="border border-amber-600 bg-stone-800 text-stone-100 p-3 rounded-lg flex-1 shadow-md focus:ring-amber-500 focus:border-amber-500 transition duration-200"
                onChange={(e) => {
                  const ch = channels.find((c) => c.name === e.target.value)
                  setSelectedChannel(ch)
                }}
                value={selectedChannel?.name || ""}
              >
                <option value="" disabled className="text-stone-400">Select a channel</option>
                {channels.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
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
              Channels
            </h2>
            <ul className="text-sm max-h-[calc(70vh+4rem)] overflow-y-auto space-y-1 pr-1">
              {channels.map((c) => (
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
