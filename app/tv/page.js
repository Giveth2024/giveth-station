'use client'

import { useState } from 'react'
import GivethTV from '../components/GivethTv'
import TheAppTV from '../components/TheAppTv'
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
            <div className="p-6 bg-stone-950 min-h-screen text-gray-100">
                {/* Back Button */}
                <button
                    onClick={() => router.push("/home")}
                    className="px-6 py-2 mb-4 bg-amber-400 text-stone-900 font-semibold rounded-lg shadow-md hover:bg-amber-500 hover:scale-105 transform transition"
                >
                    Back
                </button>
                <h1 className="text-3xl font-extrabold text-amber-400 mb-6">
                    Choose Your TV Source
                </h1>

                {/* Buttons to choose */}
                <div className="flex gap-4 mb-6">
                    <button
                    onClick={() => setActivePlayer('giveth')}
                    className={`px-6 py-3 rounded-lg font-bold transition ${
                        activePlayer === 'giveth'
                        ? 'bg-amber-500 text-black shadow-lg'
                        : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                    }`}
                    >
                    📺 Giveth TV
                    </button>

                    <button
                    onClick={() => setActivePlayer('theapp')}
                    className={`px-6 py-3 rounded-lg font-bold transition ${
                        activePlayer === 'theapp'
                        ? 'bg-amber-500 text-black shadow-lg'
                        : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                    }`}
                    >
                    🌍 TheApp TV
                    </button>
                </div>

                {/* Conditional rendering */}
                {activePlayer === 'giveth' && <GivethTV />}
                {activePlayer === 'theapp' && <TheAppTV />}
                {!activePlayer && (
                    <p className="text-gray-400 italic">
                    Select a player above to start watching.
                    </p>
                )}
            </div>
        </SignedIn>

        <SignedOut>
            <RedirectToSignIn redirectUrl="/" />
      </SignedOut>
    </>
  )
}
