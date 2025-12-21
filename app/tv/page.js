'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
} from "@clerk/nextjs";

export default function TVPage() {
  const [activePlayer, setActivePlayer] = useState(null) 
  const router = useRouter()
  // null = nothing, "giveth" = GivethTV, "theapp" = TheAppTV

  return (
    <>
        <SignedIn>
            <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-center text-white px-6 relative">
            
            {/* Main Content */}
            <section className="max-w-2xl">
                <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
                We’ll Be Back <span className="text-amber-400">Soon ⚡</span>
                </h1>

                <p className="text-lg md:text-xl text-stone-300 mb-8">
                GivethStation Live Tv is currently undergoing scheduled maintenance.
                We’re tuning the servers, polishing features, and making sure your
                next visit is even more entertaining.
                </p>

                <div className="bg-stone-800/60 border border-stone-700 rounded-2xl p-6 mb-8">
                <p className="text-amber-400 font-semibold mb-2">
                    What’s happening?
                </p>
                <ul className="text-stone-300 text-sm space-y-2">
                    <li>• System upgrades & performance improvements</li>
                    <li>• Server stability checks</li>
                    <li>• Preparing new content & features 🎬</li>
                </ul>
                </div>

                <p className="text-stone-400 text-sm">
                Thank you for your patience. This page will automatically be available
                once maintenance is complete.
                </p>

            </section>
                <Link
                  title="Giveth Station"
                  href="/home"
                  className="mt-2 px-5 py-2 rounded-xl bg-amber-400 text-stone-900 font-medium shadow hover:bg-amber-500 transition"
                >
                  Let&apos;s Go Home
                </Link>

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
