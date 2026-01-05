'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Navigation from '../components/Navigation/page'
import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
} from "@clerk/nextjs";

function ChannelCard({ title, poster, path }) {
  const router = useRouter()
  const [imgSrc, setImgSrc] = useState(poster || "/placeholder.jpg")
  const [triedFallback, setTriedFallback] = useState(false)

  const handleError = () => {
    if (!triedFallback) {
      setImgSrc("/placeholder.jpg")
      setTriedFallback(true)
    }
  }

  const goToChannel = () => {
    localStorage.setItem("channelData", JSON.stringify({ title, path }))
    router.push(path)
  }

  return (
    <div style={{"margin": "10px"}} className=" bg-stone-800 rounded-xl overflow-hidden shadow-lg hover:scale-105 transform transition duration-300 w-full sm:w-56 md:w-64 lg:w-72 cursor-pointer flex-shrink-0">
      <div className="relative w-full h-64" onClick={goToChannel}>
        <Image
          src={imgSrc}
          alt={title}
          fill
          className="object-cover"
          onError={handleError}
          sizes="(max-width: 768px) 100vw, 18rem"
        />
      </div>
      <div className="p-3">
        <h3
          className="text-lg font-semibold hover:text-amber-400 transition"
          onClick={goToChannel}
        >
          {title}
        </h3>
      </div>
    </div>
  )
}

export default function TVPage() {
  const channels = [
    ["Nickelodeon", "https://backend-channels-5al8.onrender.com/nickelodeon", "/nickelodeon.jpeg"],
    ["Tom and Jerry", "https://backend-channels-5al8.onrender.com/tomandjerry", "/tomjerry.jpg"],
    ["Bukedde TV 1", "/channels/BukeddeTV1", "/bukeddeTv1.png"],
    ["Bukedde TV 2", "/channels/BukeddeTV2", "/bukeddeTv2.png"],
    ["Mythbusters", "/channels/Mythbusters", "/mythbusters.jpeg"],
    ["Disney", "https://backend-channels-5al8.onrender.com/disney", "/disney.jpg"],
    ["FailArmy", "/channels/Failarmy", "/failarmy.jpeg"],
    ["NTV Uganda", "/channels/Ntvuganda", "/NTV.png"],
    ["Pokemon", "https://backend-channels-5al8.onrender.com/pokemontv", "/Pokemon-Logo.jpg"],
  ]

  return (
    <>
      <SignedIn>
        <Navigation />
        <main className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-center text-white px-6 py-8 relative">
          
          <h1 className="text-3xl font-bold mb-8 text-amber-500">TV Channels 📺</h1>

          <div className="flex flex-wrap justify-center">
            {channels.map(([title, path, poster], index) => (
              <ChannelCard
                key={index}
                title={title}
                path={path}
                poster={poster}
              />
            ))}
          </div>

          {/* Footer */}
          <footer className="absolute bottom-4 text-stone-400 text-sm">
            © {new Date().getFullYear()} GivethStation. All rights reserved.
          </footer>
        </main>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn redirectUrl="/" />
      </SignedOut>
    </>
  )
}
